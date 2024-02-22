/**
  * index - GET para listar vários registros.
  * show - GET para exibir um registro especifico.
  * create - POST para criarj um registro.
  * update - PUT para atualizar um registro.
  * delete - DELETE para tem over um registro.
  */
const AppError = require("../utils/AppError");

class UsersController {
  create(request, response) {
    const {
      name, 
      email, 
      password 
    } = request.body;

    if (!name) {
      throw new AppError("Nome é obrigatório");
    }
  
    response.status(201).json({
      name, 
      email, 
      password
    });
  }
}

module.exports = UsersController
