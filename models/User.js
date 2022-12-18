const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const mongoose = require('mongoose')
const { Schema, model } = mongoose

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

UserSchema.methods.getPasswordResetData = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.resetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')
    
    this.resetTokenExpiration = Date.now() + 10 * 60 * 1000
    const resetURL = process.env.RESET_URL + resetToken
    return { resetURL, resetToken }
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
        await this.model('Review').deleteMany({ user: this.id })
    } catch (e) {
        next(e)
    }
})

const User = model('User', UserSchema)
module.exports = User