const express = require("express");
const knex = require("../config/knex");
route = express.Router();

AuthController = require('../core/controllers/AuthController');
UserController = require('../core/controllers/UserController');
HomeController = require('../core/controllers/HomeController');
SearchController = require('../core/controllers/SearchController');

route.get("/", UserController.index)
route.get("/chat", HomeController.index)
route.post("/login", AuthController.login)
route.get("/logout", AuthController.logout)
route.get("/register_new_account", UserController.create)
route.post("/register_new_account", UserController.store)
route.post("/clear_message", UserController.clearMessage)
route.post("/add_contact", UserController.addContact)
route.post("/remove_contact", UserController.removeContact)
route.post("/searchByUsername", SearchController.findByUsername)
route.post("/getContactsUser", SearchController.getContactsUser)
route.post("/getMessagesUser", SearchController.getMessagesUser)
route.post("/checkMessagesVisualized", SearchController.checkMessagesVisualized)

module.exports = route;