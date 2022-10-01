const knex = require("../../config/knex")

const { filterTable } = require("../helpers/tools")

SearchController = {
    async findByUsername(req, res, next){
        try {
            const search = await knex('tb_users')
            .distinct('tb_users.id')
            .select('tb_users.username', 'tb_users.id')
            .where('tb_users.id', "!=", req.body.id);
            
            res.json({status: 200, data: search})
        } catch (error) {
            return next(error)
        }
    },
    async getContactsUser(req, res, next){
        try {
            // const search = await knex.raw(`
            // SELECT u.username, u.id, h.user_id, h.friend, chat.message, u.is_online, chat.visualized FROM tb_historic_user_message as h
            // LEFT JOIN tb_chat as chat ON h.user_id IN (h.user_id, h.connection_user_id)
            // LEFT JOIN tb_users as u ON h.user_id = u.id
            // WHERE h.user_id != ?`, [req.body.id])
            // .then((resp)=>{
            //     return resp[0].reduce((result, row) => {
            //         result[row.id] = result[row.id] || {
            //           id: row.id,
            //           friend: row.friend,
            //           is_online: row.is_online,
            //           username: row.username,
            //           messages: [],
            //         };
                
            //         result[row.id].messages.push({ message: row.message, visualized: row.visualized });
            //         return result;
            //       }, {})
            // })
            const search = await knex.raw(`
            SELECT u.id, u.username, u.is_online, h.friend, chat.message, chat.visualized, h.connection_user_id, chat.user_id, chat.send_user_id 
            FROM tb_historic_user_message as h
            LEFT JOIN tb_chat as chat ON chat.user_id IN ( h.user_id, h.connection_user_id )
            LEFT JOIN tb_users as u ON u.id IN (h.user_id, h.connection_user_id)
            WHERE h.user_id = ?`, [req.body.id])
            .then((resp)=>{
                return resp[0].reduce((result, row) => {
                    if(req.body.id != row.id){
                        result[row.id] = result[row.id] || {
                            id: row.id,
                            friend: row.friend,
                            is_online: row.is_online,
                            username: row.username,
                            messages: [],
                        };
    
                        if(row.id == row.send_user_id || row.id == row.user_id ){
                            result[row.id].messages.push({ 
                                message: row.message, 
                                visualized: row.visualized,
                                id: row.user_id,
                                send_user_id: row.send_user_id
                            });
                        }
                    }

                    return result;
                  }, {})
            })
            
            res.json({status: 200, data: search})
        } catch (error) {
            return next(error)
        }
    },
    async getMessagesUser(req, res, next){
        try {
            const search = await knex('tb_chat')
            .select('user_id as author', 'send_user_id as friend', 'message', 'created_at')
            .whereIn('tb_chat.user_id', [req.body.id, req.body.send_user_id])
            .whereIn('tb_chat.send_user_id', [req.body.id, req.body.send_user_id])
            .orderBy('id', 'desc')
                        
            res.json({status: 200, data: search})
        } catch (error) {
            return next(error)
        }
    },
    async checkMessagesVisualized(req, res, next){
        try {
            const update = await knex('tb_chat')
            .where('user_id', req.body.id)
            .update({
                visualized: 0
            })
                        
            res.json({status: 200, data: update})
        } catch (error) {
            return next(error)
        }
    }
}

module.exports = SearchController;