require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { UNAUTHORIZED, BAD_REQUEST, CREATED, OK }  = StatusCodes
const app = require('../app/app')
const User = require('../models/User')
const { setupDatabase, userOne, userOneToken, userOneID, userTwoToken, adminToken, userTwo } = require('./testData')
const crypto = require('crypto')

const testUser = {
    email: process.env.TESTUSER_EMAIL,
    password: process.env.TESTUSER_PASSWORD,
    confirmPassword: process.env.TESTUSER_PASSWORD,
    name: process.env.TESTUSER_NAME
}

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('authentication tests', () => {
    describe('if signup request is ok', () => {
        it('should return a token and signup the user in the database', async () => {
            const response = await request(app).post('/api/auth/signup')
                .send(testUser)
                .expect(CREATED)
            
            const user = await User.findOne({ email: testUser.email })
            expect(user).not.toBeNull()
            
            expect(response.body.token).toEqual(expect.any(String))
        })

        it('should save hashed password', async () => {
            const response = await request(app).post('/api/auth/signup')
                .send(testUser)
                .expect(CREATED)
            const user = await User.findOne({ email: testUser.email })
            expect(user.password).not.toEqual(testUser.password)
        })

        it('can upload a profile image', async () => {
            await request(app).post('/api/auth/signup')
                .field('email', testUser.email)
                .field('password', testUser.password)
                .field('confirmPassword', testUser.confirmPassword)
                .field('name', testUser.name)
                .attach('image', 'tests/testImages/testImage.png')
                .expect(CREATED)
            
            const user = await User.findOne({ email: testUser.email })
            expect(user.imageUrl).not.toBeNull()
        })
    })

    describe('if signup request is not ok', () => {
        it('should not signup if passwords don\'t match', async () => {
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    confirmPassword: '123testTESt'
                })
                .expect(BAD_REQUEST)
        })

        it('should not signup if email already exists', async () => {
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    email: userOne.email
                })
                .expect(BAD_REQUEST)
        })

        it('should not signup without a valid email address', async () => {
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    email: '123456'
                })
                .expect(BAD_REQUEST)
        })

        it('should not signup if password doesn\'t match pattern', async () => {
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    password: '123456789',
                    confirmPassword: '123456789'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    password: 'ABCDEFGH',
                    confirmPassword: 'ABCDEFGH'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    password: 'abcdefgh',
                    confirmPassword: 'abcdefgh'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    password: 'aZ1',
                    confirmPassword: 'aZ1'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    name: ''
                })
                .expect(BAD_REQUEST)
            
            await request(app).post('/api/auth/signup')
                .send({
                    ...testUser,
                    email: ''
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if login request is ok', () => {
        it('should return a token', async () => {
            const response = await request(app).post('/api/auth/login')
                .send({
                    email: userOne.email,
                    password: userOne.password
                })
                .expect(OK)
            
            expect(response.body.token).toEqual(expect.any(String))
        })
    })

    describe('if login request is not ok', () => {
        it('should not login if email doesn\t exist', async () => {
            await request(app).post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: userOne.password
                })
                .expect(BAD_REQUEST)
        })

        it('should not login if password is not correct', async () => {
            await request(app).post('/api/auth/login')
                .send({
                    email: userOne.email,
                    password: 'userOne.password'
                })
                .expect(BAD_REQUEST)
        })

        it('should not login if password or email are not provided', async () => {
            await request(app).post('/api/auth/login')
                .send({
                    email: '',
                    password: 'userOne.password'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post('/api/auth/login')
                .send({
                    email: userOne.email,
                    password: ''
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if delete request is correct', () => {
        it('deletes user from database', async () => {
            await request(app).delete(`/api/auth/${userOneID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            const user = await User.findById(userOneID)
            expect(user).toBeNull()
        })

        it('should allow admins to delete other users', async () => {
            await request(app).delete(`/api/auth/${userOneID}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(OK)
            
                const user = await User.findById(userOneID)
                expect(user).toBeNull()
        })
    })

    describe('if delete request is not correct', () => {
        it('should not delete when other user tries to delete', async () => {
            await request(app).delete(`/api/auth/${userOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(UNAUTHORIZED)
            
                const user = await User.findById(userOneID)
                expect(user).not.toBeNull()
        })

        it('should not delete when user doesn\'t exist', async () => {
            await request(app).delete(`/api/auth/12456`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if profile update request is correct', () => {
        it('should update the profile', async () => {
            await request(app).patch('/api/auth/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    name: 'update'
                })
                .expect(OK)
            const user = await User.findOne({
                _id: userOneID,
                name: 'update'
            })
            expect(user).not.toBeNull()
        })

        it('can update the profile image', async () => {
            await request(app).patch('/api/auth/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .attach('image', 'tests/testImages/testImage.png')
                .expect(OK)
            
            const user = await User.findOne({ email: userOne.email })
            expect(user.imageUrl).not.toBeNull()
        })
    })

    describe('if profile update request is not correct', () => {
        it('does not update when there is nothing to update', async () => {
            await request(app).patch('/api/auth/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })

        it('does not update when email address is already in use', async () => {
            await request(app).patch('/api/auth/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    email: userTwo.email
                })
                .expect(BAD_REQUEST)
        })

        it('should not update if passwords dont match', async () => {
            await request(app).patch('/api/auth/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    password: '123ABCabc',
                    confirmPassword: '123ABCab'
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('viewing user profile', () => {
        it('should show profile if there is an authenticated user', async () => {
            await request(app).get('/api/auth/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
        })

        it('should not show anything when there is no authenticated user', async () => {
            await request(app).get('/api/auth/profile')
                .send()
                .expect(UNAUTHORIZED)
        })
    })

    describe('asking for a password reset correctly', () => {
        it('should set the reset token, expiration and send an email with this information to the user', async () => {
            const mockSendResetPasswordMail = jest.fn()
            User.sendResetPasswordMail = mockSendResetPasswordMail
            const response = await request(app).post('/api/auth/forgot')
                .send({
                    email: userOne.email
                })
                .expect(OK)
            const { resetToken } = response.body
            const resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex')
            
            const user = await User.findOne({ _id: userOne._id, resetToken: resetPasswordToken })
            expect(user).not.toBeNull()
            expect(mockSendResetPasswordMail).toHaveBeenCalled()
        })
    })

    describe('not asking for a password reset correctly', () => {
        it('should not do anything if there is no email', async () => {
            await request(app).post('/api/auth/forgot')
                .send()
                .expect(BAD_REQUEST)
        })

        it('should not do anything if no user exists with that email', async () => {
            await request(app).post('/api/auth/forgot')
                .send({
                    email: '12346@gmail.com'
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('resetting password correctly', () => {
        it('should reset the password', async () => {
            const resetToken = await User.processPasswordResetRequest(userOne.email)
            await request(app).patch(`/api/auth/reset/${resetToken}`)
                .send({
                    password: process.env.UPDATE_PASSWORD,
                    confirmPassword: process.env.UPDATE_PASSWORD
                })
                .expect(OK)
            
            await request(app).post('/api/auth/login')
                .send({
                    password: process.env.UPDATE_PASSWORD,
                    email: userOne.email
                })
                .expect(OK)
        })
    })

    describe('resetting password incorrectly', () => {
        it('passwords should match', async () => {
            const { resetToken } = await User.processPasswordResetRequest(userOne.email)
            await request(app).patch(`/api/auth/reset/${resetToken}`)
                .send({
                    password: process.env.USERTWO_PASSWORD,
                    confirmPassword: process.env.UPDATE_PASSWORD
                })
                .expect(BAD_REQUEST)
        })

        it('should send a password', async () => {
            const { resetToken } = await User.processPasswordResetRequest(userOne.email)
            await request(app).patch(`/api/auth/reset/${resetToken}`)
                .send({
                    confirmPassword: process.env.UPDATE_PASSWORD
                })
                .expect(BAD_REQUEST)
        })
    })
})

