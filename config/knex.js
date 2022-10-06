const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'root',
      password : '',
      database : 'chat_socket',
      charset  : 'utf8mb4'
    }
  });

module.exports = knex;