const asyncHandler = require('../errorhandlers/asyncHandler')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { OK, CREATED, UNAUTHORIZED, BAD_REQUEST } = StatusCodes
const CustomError = require('../errorhandlers/customError')
const crypto = require('crypto')
const sendResetPasswordMail = require('../utils/sendResetPasswordMail')
const { validateSignupRequest, validateLoginRequest, validateUpdateProfileRequest, validateDeleteProfileRequest } = require('../validators/authValidator')

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await validateLoginRequest(email, password)    
    const token = user.getJWT()
    res.status(OK).json({
        token           
    })   
})

// POST /api/auth/signup
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, confirmPassword, password } = req.body
    await validateSignupRequest(email, name, password, confirmPassword)
    const imageUrl = !req.file ? null: req.file.path ? req.file.path: null
    const user = await User.create({
        name,
        password,
        email,
        imageUrl
    })
    const token = user.getJWT()
    res.status(CREATED).json({
        token
    })    
})

// POST /api/auth/forgot
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw new CustomError('There is no user with that email.', BAD_REQUEST)
    }
    const { resetToken, resetURL } = await user.getPasswordResetData()
    await user.save({ validateBeforeSave: false })

    // UITGESCHAKELD, EMAIL ADRES TERUG AANPASSEN OM TE DOEN WERKEN
    sendResetPasswordMail(email, resetURL)
    return res.status(OK).json({ resetToken })
})

// PATCH /api/auth/reset/:token
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')
    
    const user = await User.findOne({ resetToken: resetPasswordToken, resetTokenExpiration: { $gt: Date.now()} })
    if (!user) {
        throw new CustomError('Invalid request.', UNAUTHORIZED)
    }
    user.password = password
    user.resetToken = undefined
    user.resetTokenExpiration = undefined
    await user.save()
    const jwtToken = user.getJWT()
    res.status(OK).json({
        token: jwtToken           
    })
})

// PATCH /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
    const { email, name, password, confirmPassword } = req.body
    const user = await validateUpdateProfileRequest(req, email, name, password, confirmPassword)
    await user.save()
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
    const user = await validateDeleteProfileRequest(req, userId)
    await user.remove()
    res.status(OK).json({ msg: 'Profile got deleted.'})
})