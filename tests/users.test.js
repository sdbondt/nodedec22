require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { OK }  = StatusCodes
const app = require('../app/app')
const { setupDatabase, userOneToken, userTwoID, userTwo } = require('./testData')

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('user tests', () => {
    it('should get users', async () => {
        const response = await request(app).get('/api/users')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send()
            .expect(OK)
        
        expect(response.body.users.length).toBe(3)
    })

    it('should get specific user', async () => {
        const response = await request(app).get(`/api/users/${userTwoID}`)
            .set('Authorization', `Bearer ${userOneToken}`)
            .send()
            .expect(OK)
        
        expect(response.body.user.email).toEqual(userTwo.email)
    })
})