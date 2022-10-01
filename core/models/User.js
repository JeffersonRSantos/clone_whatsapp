const knex = require("../../config/knex")
const bcrypt = require('bcrypt');

Users = {
    async createUser(data) {
        try {            
            const { username, password } = data
        
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    insert = knex('tb_users')
                    .insert({username: username, password:hash})
                    .returning('id')
                    .then(id =>{
                        console.log('Último registro inserido: '+id)
                        return true;
                    }).catch(resp => {
                        console.log(resp)
                        return resp.sqlMessage;
                    })
                });
            });
        } catch (error) {
            return error
        }
        
    },
    async findUserById(id){
        select = await knex('tb_users')
        .where({
            id: id
        }).then((resp)=>{
            return resp
        })
    }    
}

module.exports = Users;