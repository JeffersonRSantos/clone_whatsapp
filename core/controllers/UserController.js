const Users = require("../models/User");
const knex = require("../../config/knex")
const bcrypt = require('bcrypt');

UserController = {
    async index(req, res, next){
        return res.render('login', {session: req.session});
    },
    async create(req, res, next){
        return res.render('register_user', {session: req.session});
    },
    async store(req, res, next){
        try {
            const { username, password } = req.body
        
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    insert = knex('tb_users')
                    .insert({username: username, password:hash})
                    .returning('id')
                    .then(id =>{
                        console.log('Último registro inserido: '+id)
                        return res.redirect('/');
                    }).catch(resp => {
                        return res.json({status: "400", message: resp.sqlMessage});
                    })
                });
            });
        } catch (e) {
            return next(e)
        }
    }
}

module.exports = UserController;