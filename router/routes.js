const express = require('express')
const UsersController = require('../controller/UsersController')
const router = express.Router()
// ADMIN REGISTER
router.post('/api/adminregister', UsersController.adminRegister)
//ADMIN LOGIN
router.post('/api/adminlogin', UsersController.adminLogin)
module.exports = router