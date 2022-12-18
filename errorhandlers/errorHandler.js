const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes

const errorHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  }
  
  if (err.name == 'ValidationError') {
    customError.statusCode = BAD_REQUEST
    customError.msg = 'Mongoose validation error.'
  }

  if (err.name == 'CastError') {
    customError.msg = 'Nothing found for your request in the database.'
    customError.statusCode = NOT_FOUND
  }
  return res.status(customError.statusCode).json({ msg: customError.msg })
}

module.exports = errorHandler