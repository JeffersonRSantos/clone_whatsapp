const knex = require("../../config/knex");
const bcrypt = require("bcrypt");

AuthController = {
    async login(req, res, next) {
        try {
            const user_exists = await knex('tb_users').where({
                username: req.body.username
            })

            const result = Object.values(JSON.parse(JSON.stringify(user_exists)));

            if(result.length > 0){
                verify_hash = bcrypt.compareSync(req.body.password, result[0].password);
                if(verify_hash == true){
                    req.session.data = result[0];
                    res.json({status: 200})
                }else{
                    res.json({status: 404, message: 'Usuário ou senha inválido.'})
                }
            }else{
                res.json({status: 404, message: 'Usuário ou senha inválido.'})
            }
            
        } catch (error) {
            return next(error)
        }
    },
    async logout(req, res, next){
        try {
            req.session.destroy();
            return res.redirect('/');
        } catch (error) {
            return next(error)
        }
    }
}

module.exports = AuthController