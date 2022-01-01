const express = require('express')
const userController = require('../controller/user')

const userRoute = express.Router()

//register endpoint
userRoute.post("/register", userController.register)
//login endpoint
userRoute.post("/login", userController.login)

module.exports = userRoute