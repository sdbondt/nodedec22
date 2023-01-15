const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const mongoose = require('mongoose')
const { Schema, model } = mongoose
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errorhandlers/customError')
const { BAD_REQUEST, UNAUTHORIZED } = StatusCodes
const transporter = require('../utils/nodemailer')

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a name."],
        maxlength: [50, "Name cannot be more than 50 characters."],
        minlength: [2, "Name must be at least 2 characters."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        match: [
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          "Please provide a valid email.",
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [6, "Password must be at least 6 charachters long."],
        maxlength: [100, "Password cannot be longer than 100 characters."],
        match: [
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
          "Password must be 6 characters long, contain a lower and uppercase letter and a number",
        ],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    resetToken: String,
    resetTokenExpiration: Date,
    imageUrl: String,
})

UserSchema.pre("save", async function () {
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
    }
})

UserSchema.methods.getJWT = function () {
    return jwt.sign(
        { userId: this._id },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    )
}

UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

UserSchema.statics.sendResetPasswordMail = (email, url) => {
    return transporter.sendMail({
        to: email,
        from: process.env.EMAIL,
        subject: 'Password reset token',
        text: `You are receiving this email because you (or someone else) has requested the reset of a password. You can do this at: \n\n ${url}`
    })
}

UserSchema.statics.processPasswordResetRequest = async function (email) {
    try {
        if (!email) {
            throw new CustomError('You must supply an email.', BAD_REQUEST)
        }
        const user = await this.findOne({ email })
        if (!user) {
            throw new CustomError('There is no user with that email.', BAD_REQUEST)
        }
        const resetToken = crypto.randomBytes(32).toString('hex')
    
        user.resetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex')
        
        user.resetTokenExpiration = Date.now() + 10 * 60 * 1000
        const resetURL = process.env.RESET_URL + resetToken
        await user.save({ validateBeforeSave: false })
        this.sendResetPasswordMail(email, resetURL)
        return resetToken 
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

UserSchema.statics.resetPassword = async function (token, password, confirmPassword) {
    try {
        if (!token || !password) {
            throw new CustomError('Invalid request.', BAD_REQUEST)
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
        if (password !== confirmPassword) {
            throw new CustomError('Passwords should match.', BAD_REQUEST)
        }
        if (!passwordRegex.test(password)) {
            throw new CustomError('Passwords must contain at least 6 characters and should contain an uppercase, lowercase and numeric value.', BAD_REQUEST)
        }
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')
        
        const user = await this.findOne({ resetToken: resetPasswordToken, resetTokenExpiration: { $gt: Date.now() } })
        if (!user) {
            throw new CustomError('Invalid request.', UNAUTHORIZED)
        }
        user.password = password
        user.resetToken = undefined
        user.resetTokenExpiration = undefined
        await user.save()
        const jwtToken = await user.getJWT()
        return jwtToken
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

UserSchema.statics.loginUser = async function (email, password) {
    try {
        if (!email || !password) {
            throw new CustomError('Please provide an email and password.', BAD_REQUEST)
        }
    
        const user = await this.findOne({ email })
        if (!user) {
            throw new CustomError('Invalid credentials.', BAD_REQUEST)
        }
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            throw new CustomError('Invalid credentials.', BAD_REQUEST)
        }
        return user.getJWT()
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

UserSchema.statics.createUser = async function(email, name, password, confirmPassword, imageUrl = null) {
    try {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (password !== confirmPassword) {
            throw new CustomError('Passwords should match.', BAD_REQUEST)
        }

        if (!email || !name) {
            throw new CustomError('You must provide an email and name.', BAD_REQUEST)
        }

        if (!emailRegex.test(email)) {
            throw new CustomError('Must submit a valid email address.', BAD_REQUEST)   
        }

        if (!passwordRegex.test(password)) {
            throw new CustomError('Passwords must contain at least 6 characters and should contain an uppercase, lowercase and numeric value.', BAD_REQUEST)
        }

        const userExists = await this.findOne({ email })
        if (userExists) {
            throw new CustomError('Email address is already in use.', BAD_REQUEST)
        }

        const user = await this.create({
            name,
            password,
            email,
            imageUrl
        })
        const token = user.getJWT()
        return token
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
    
}

UserSchema.statics.deleteUser = async function (loggedInUser, userId) {
    try {
        if (!mongoose.isValidObjectId(userId)) {
            throw new CustomError('No such user exists.', BAD_REQUEST)
        }
        const user = await User.findById(userId)
        if (!user) {
            throw new CustomError('No such user exists.', BAD_REQUEST)
        }
        
        if (loggedInUser.id !== user.id && loggedInUser.role !== 'admin') {
            throw new CustomError('Not authorized to delete this profile.', UNAUTHORIZED)
        }

        if (user.imageUrl) {
            fs.unlink(user.imageUrl, (err) => {
                if (err) {
                    throw new CustomError('Something went wrong deleting the users image.', BAD_REQUEST)
                }
            })
        }
        await user.remove()
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

UserSchema.statics.updateProfile = async function (user, email, name, password, confirmPassword, imageUrl) {
    try {
        if (!email && !password && !name && !imageUrl) {
            throw new CustomError('There is nothing to update.', BAD_REQUEST)
        }

        if (email) {
            const userExists = await User.findOne({ email })
            if (userExists) {
                throw new CustomError('That email address is already in use', BAD_REQUEST)
            }
            user.email = email
        }

        if (name) {
            user.name = name
        }
    
        if (password) {
            if (password !== confirmPassword) {
                throw new CustomError('Passwords should match.', BAD_REQUEST)
            }
            user.password = password
        }

        if (imageUrl) {
            if (user.imageUrl) {
                fs.unlink(user.imageUrl, (err) => {
                    if (err) {
                        throw new CustomError('Something went wrong deleting the users image.', BAD_REQUEST)
                    }
                })
            }
            user.imageUrl = imageUrl
        }
        await user.save({ validateBeforeSave: false })
        return user

    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

UserSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'user',
    justOne: false
})

UserSchema.pre('findOne', function () {
    this.populate('reviews', 'rating comment course')
})

UserSchema.pre('remove', async function (next) {
    try {
        if (this.imageUrl) {
            fs.unlink(this.imageUrl, (err) => {
                if (err) {
                    throw new CustomError('Something went wrong deleting the users image.', BAD_REQUEST)
                }
            })
        }
        await this.model('Review').deleteMany({ user: this.id })
    } catch (e) {
        next(e)
    }
})

UserSchema.pre('deleteMany', async function (next) {
    try {
        const users = await this.model.find(this.getQuery())
        users.forEach(async function (user) {
            if (user.imageUrl) {
                fs.unlink(user.imageUrl, (err) => {
                    if (err) {
                        throw new CustomError('Something went wrong deleting the users image.', BAD_REQUEST)
                    }
                })
            }
        })
    } catch (e) {
        next(e)
    }
})

const User = model('User', UserSchema)
module.exports = User