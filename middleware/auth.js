const { StatusCodes } = require('http-status-codes')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, _, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new Error('Authentication invalid.', StatusCodes.UNAUTHORIZED)
    }

    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.userId).select('-password')
        if (!user) {
            throw new Error('Authentication invalid.', StatusCodes.UNAUTHORIZED)
        }
        req.user = user
        next()
    } catch (e) {
        throw new Error('Authentication invalid.', StatusCodes.UNAUTHORIZED)
    }
}

module.exports = auth