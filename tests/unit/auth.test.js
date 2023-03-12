require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../../models/User')
const { setupDatabase, userOne, userOneID, adminID, userTwo, userTwoID } = require('../testData')
const crypto = require('crypto')
const Review = require('../../models/Review')

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('authentication unit tests', () => {
    it('can signup users', async () => {
        const token = await User.createUser(
            process.env.TESTUSER_EMAIL,
            process.env.TESTUSER_NAME,
            process.env.TESTUSER_PASSWORD,
            process.env.TESTUSER_PASSWORD)
        
        const user = await User.findOne({ email: process.env.TESTUSER_EMAIL })
        expect(user).not.toBeNull()
        expect(token).toEqual(expect.any(String))
    })

    it('can login user', async () => {
        const token = await User.loginUser(userOne.email, userOne.password)
        expect(token).toEqual(expect.any(String))
    })

    it('can delete user', async () => {
        const user = await User.findById(userOneID)
        await User.deleteUser(user, userOneID)
        const checkUser = await User.findById(userOneID)
        expect(checkUser).toBeNull()
    })

    it('admin can delete users', async () => {
        const admin = await User.findById(adminID)
        await User.deleteUser(admin, userOneID)
        const checkUser = await User.findById(userOneID)
        expect(checkUser).toBeNull()
    })

    it('can update users', async () => {
        const user = await User.findById(userOneID)
        await User.updateProfile(user, null, 'update_name')
        const updateUser = await User.findOne({
            _id: userOneID,
            name: 'update_name'
        })
        expect(updateUser).not.toBeNull()
    })

    it('can handle a password reset request', async () => {
        const mockSendResetPasswordMail = jest.fn()
        User.sendResetPasswordMail = mockSendResetPasswordMail
        const resetToken = await User.processPasswordResetRequest(userOne.email)
        const resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex')
        const updatedUser = await User.findOne({ email: userOne.email, resetToken: resetPasswordToken })
        expect(updatedUser).not.toBeNull()
        expect(mockSendResetPasswordMail).toHaveBeenCalled()
    })

    it('can reset a password', async () => {
        const mockSendResetPasswordMail = jest.fn()
        User.sendResetPasswordMail = mockSendResetPasswordMail
        const resetToken = await User.processPasswordResetRequest(userOne.email)
        const jwtToken = await User.resetPassword(resetToken, process.env.UPDATE_PASSWORD, process.env.UPDATE_PASSWORD)
        expect(jwtToken).not.toBeNull()
    })

    it('can have reviews', async () => {
        const user = await User.findById(userTwoID)
        expect(user.reviews[0] instanceof Review).toBe(true)
        expect(user.reviews.length).toBe(1)
    })

    it('removes all users reviews when user get\'s deleted', async () => {
        const user = await User.findById(userTwoID)
        await user.remove()
        const reviews = await Review.find({ user: user.id })
        expect(reviews.length).toBe(0)
    })

    it('removes all reviews when all users get deleted', async () => {
        await User.deleteMany()
        const reviews = await Review.find()
        expect(reviews.length).toBe(0)
    })
})