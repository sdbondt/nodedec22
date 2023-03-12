const { StatusCodes } = require('http-status-codes')
const {UNAUTHORIZED} = StatusCodes
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const asyncHandler = require('../errorhandlers/asyncHandler')
const CustomError = require('../errorhandlers/customError')
const User = require('../models/User')

const auth = asyncHandler(async (req, _, next) => { 
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) throw new CustomError('Authentication invalid.', UNAUTHORIZED)
    const token = authHeader.split(' ')[1]
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        throw new CustomError('Invalid token.', UNAUTHORIZED)
    }
    if(!mongoose.isValidObjectId(payload.userId)) throw new CustomError('No user with that token.', UNAUTHORIZED)
    const user = await User.findById(payload.userId).select('-password')
    if (!user) throw new CustomError('Authentication invalid.', UNAUTHORIZED)
    req.user = user
    next()
})

module.exports = auth