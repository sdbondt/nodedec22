const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST, UNAUTHORIZED }  = StatusCodes
const CustomError = require('../errorhandlers/customError')
const User = require("../models/User")

exports.validateSignupRequest = async (email, name, password, confirmPassword) => {
    if (password !== confirmPassword) {
        throw new CustomError('Passwords should match.', BAD_REQUEST)
    }

    if (!email || !name) {
        throw new CustomError('You must provide an email and name.', BAD_REQUEST)
    }
    const userExists = await User.findOne({ email })
    if (userExists) {
        throw new CustomError('Email address is already in use.', BAD_REQUEST)
    }
}

exports.validateLoginRequest = async (email, password) => {
    if (!email || !password) {
        throw new CustomError('Please provide an email and password.', BAD_REQUEST)
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new CustomError('Invalid credentials.', UNAUTHORIZED)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
        throw new CustomError('Invalid credentials.', UNAUTHORIZED)
    }
    return user
}

exports.validateUpdateProfileRequest = async (req, email, name, password, confirmPassword) => {
    if (!email && !password && !name && !req.file) {
        throw new CustomError('There is nothing to update.', BAD_REQUEST)
    }

    if (email) {
        const userExists = await User.findOne({ email })
        if (userExists) {
            throw new CustomError('That email address is already in use', BAD_REQUEST)
        }
        req.user.email = email
    }

    if (name) {
        req.user.name = name
    }
    
    if (password) {
        if (password !== confirmPassword) {
            throw new CustomError('Passwords should match.', BAD_REQUEST)
        }
        req.user.password = password
    }

    if (req.file && req.file.path) {
        req.user.imageUrl = req.file.path
    }
    return req.user
}

exports.validateDeleteProfileRequest = async (req, userId) => {
    if (!userId) {
        throw new CustomError('Must choose a profile to delete.', BAD_REQUEST)   
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new CustomError('No such user exists.', BAD_REQUEST)
    }

    if (req.user.id !== user.id && req.user.role !== 'admin') {
        throw new CustomError('Not authorized to delete this profile.', UNAUTHORIZED)
    }

    return user
}