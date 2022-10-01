const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const server = require('http').createServer(express);
const web = require('./routes/web');
const { fdatasync } = require('fs');
const knex = require('./config/knex');
const SearchController = require('./core/controllers/SearchController')
const { PeerServer } = require('peer');

app = express();

app.set('view engine', 'ejs');
app.set('views', './public/views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(session({ secret: 'a19d923dd703679bff26313269c0566c04a4b0ba' }));

app.use('/', web)

const a = app.listen(3000);
const io = require('socket.io')(a);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  socket.on('login', async data => {
    const update = await knex('tb_users').where('id', data.id).update({ is_online: 1 })
    socket.broadcast.emit('onlineUser', {
      id: data.id,
      username: data.username,
    });

    socket.on('send message', async data => {
      const search = await knex('tb_users').select('username', 'id').where('id', data.id_author)
      const search_historic = await knex('tb_historic_user_message')
        .select('id')
        .where('user_id', data.id_author)
        .andWhere('connection_user_id', data.id_send)
        .count('id')

      const countHistoric = Object.values(JSON.parse(JSON.stringify(search_historic)))[0];

      console.log('countHistoric')
      console.log(countHistoric)

      if (countHistoric.id == null) { await knex('tb_historic_user_message').insert({ user_id: data.id_author, connection_user_id: data.id_send }) }

      const save = await knex('tb_chat').insert({
        user_id: data.id_author,
        send_user_id: data.id_send,
        message: data.message,
        visualized: 1
      });

      const result = Object.values(JSON.parse(JSON.stringify(search)))[0];

      socket.broadcast.emit("chat_" + data.id_send, {
        data: result,
        message: data.message
      })
    })

    socket.on('initCallVideo', (data) => {
      console.log('initCall')
      console.log(data)
      socket.broadcast.emit('initCallVideo_' + data.id, {
        id: data.id,
        authorCall: data.author,
        username: data.username,
        username_author: data.username_author
      })
    })

    socket.on('logout', async (data) => {
      const update = await knex('tb_users').where('id', data.id).update({ is_online: 0 })
      console.log('Usuário: ' + data.username + ' se desconectou');
    });

    socket.on('disconnect', async () => {
      const update = await knex('tb_users').where('id', data.id).update({ is_online: 0 })
      socket.broadcast.emit('offlineUser', {
        id: data.id,
        username: data.username,
      });
      console.log('Usuário: ' + data.username + ' se desconectou');
    });
  });

  socket.on('join-room', (roomId, userId) => {
    console.log('join-room')
    console.log(roomId)
    console.log('userId')
    console.log(userId)
    socket.join(roomId)
    //entrou na sala
    //socket.to(roomId).broadcast.emit('user-connected', userId)
    //saiu da sala
    socket.on('disconnect', () => {
      console.log('disconnect usuário')
      console.log(userId)
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })

});