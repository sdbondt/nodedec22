const express = require('express')
const { signup, login, forgotPassword, resetPassword, updateProfile, deleteProfile, getProfile } = require('../controllers/authController')
const auth = require('../middleware/auth')
const imageUpload = require('../middleware/imageUploads')
const router = express.Router()

router.post('/signup', imageUpload.single('image'), signup)
router.post('/login', login)
router.post('/forgot', forgotPassword)
router.patch('/reset/:token', resetPassword)
router.get('/profile', auth, getProfile)
router.patch('/profile', auth, imageUpload.single('image'), updateProfile)
router.delete('/:userId', auth, deleteProfile)

module.exports = router