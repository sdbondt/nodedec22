const asyncHandler = require('../errorhandlers/asyncHandler')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { OK, CREATED } = StatusCodes


// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const token = await User.loginUser(email, password)    
    res.status(OK).json({
        token           
    })   
})

// POST /api/auth/signup
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, confirmPassword, password } = req.body
    const imageUrl = !req.file ? null: req.file.path ? req.file.path: null
    const token = await User.createUser(email, name, password, confirmPassword, imageUrl)
    res.status(CREATED).json({
        token
    })    
})

// POST /api/auth/forgot
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    const resetToken  = await User.processPasswordResetRequest(email)
    return res.status(OK).json({ resetToken })
})

// PATCH /api/auth/reset/:token
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params
    const { password, confirmPassword } = req.body
    const jwtToken =  await User.resetPassword(token, password, confirmPassword)
    res.status(OK).json({
        token: jwtToken           
    })
})

// PATCH /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
    const { email, name, password, confirmPassword } = req.body
    const imageUrl = !req.file ? null: req.file.path ? req.file.path: null
    const user = await User.updateProfile(req.user, email, name, password, confirmPassword, imageUrl)
    return res.status(OK).json({ user })
})

// GET /api/auth/profile
exports.getProfile = asyncHandler(async (req, res) => {
    return res.status(OK).json({
        user: req.user,
        reviews: req.user.reviews
    })
})

// DELETE /api/auth/:userId
exports.deleteProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params
    await User.deleteUser(req.user, userId)
    res.status(OK).json({ msg: 'Profile got deleted.'})
})