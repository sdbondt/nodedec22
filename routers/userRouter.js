const express = require('express')
const { getUser, getUsers } = require('../controllers/userController')
const router = express.Router()

router.get('/:userId', getUser)
router.get('/', getUsers)

module.exports = router