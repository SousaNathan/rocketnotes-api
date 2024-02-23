/**
  * index - GET para listar vários registros.
  * show - GET para exibir um registro especifico.
  * create - POST para criarj um registro.
  * update - PUT para atualizar um registro.
  * delete - DELETE para tem over um registro.
  */
const  { 
  hash, 
  compare 
} = require("bcryptjs");

const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");
const { application } = require("express");

class UsersController {
  async create(request, response) {
    const database = await sqliteConnection();

    const {
      name, 
      email, 
      password 
    } = request.body;

    const checkUserExists = 
      await database.get(
        `
          select * from users
           where email = (?)
        `, 
        [email]
      );

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso.")
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      `
        insert into users
        (name, email, password)
        values
        (?, ?, ?)
      `,
      [ name, email, hashedPassword ]);

    return response.status(201).json();
  }

  async update(request, response) {
    const database = await sqliteConnection();
    
    const { name, email, password, old_password } = request.body;
    const { id } = request.params;

    const user = await database.get(
      `
        select * 
          from users
        where id = (?)
     `,
     [ id ]
    );

    if (!user) {
      throw new AppError("Usuário não encontrado!");
    }

    const userWithUpdatedEmail =  await database.get(
      `
        select *
          from users
         where email = (?)
      `,
      [ email ]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este email já está cadastrado!");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password){
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha!")
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere!")
      }

      user.password = await hash(password, 8);
    }

    await database.run(
      `
        update users set 
               name = ?,
               email = ?,
               password = ?,
               updated_at = datetime('now')
         where id = ?
      `, 
      [ user.name, user.email, user.password, user.id ]
    );

    return response.status(200).json();
  }
}

module.exports = UsersController
