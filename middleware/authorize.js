const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errorhandlers/customError')

const authorize = (req, _, next) => {
    if (req.user.role !== 'admin') {
        throw new CustomError('You must be an admin to do this.', StatusCodes.UNAUTHORIZED)
    }
    next()
}

module.exports = authorize