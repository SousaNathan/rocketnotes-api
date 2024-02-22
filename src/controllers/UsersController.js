/**
  * index - GET para listar vários registros.
  * show - GET para exibir um registro especifico.
  * create - POST para criarj um registro.
  * update - PUT para atualizar um registro.
  * delete - DELETE para tem over um registro.
  */
const  { hash } = require("bcryptjs");

const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite")

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
}

module.exports = UsersController
