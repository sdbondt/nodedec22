const asyncHandler = require('../errorhandlers/asyncHandler')
const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST, OK } = StatusCodes
const CustomError = require('../errorhandlers/customError')
const User = require('../models/User')

// GET api/users/:userId
exports.getUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) {
        throw new CustomError('No user found for your request.', BAD_REQUEST)
    }
    res.status(OK).json({
        user,
        reviews: user.reviews
    })
})


// GET /api/users
exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
    res.status(OK).json({
        users
    })
})