require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { UNAUTHORIZED, BAD_REQUEST, CREATED, OK }  = StatusCodes
const app = require('../app/app')
const Course = require('../models/Course')
const { setupDatabase, adminToken, userOneToken, disciplineOne, courseOne } = require('./testData')

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('course tests', () => {
    describe('if course creation request is ok', () => {
        it('should create a course', async () => {
            await request(app).post(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'test',
                    cost: 10
                })
                .expect(CREATED)
            
            const course = await Course.findOne({ name: 'test' })
            expect(course).not.toBeNull()
        })
    })

    describe('if course creation request is not ok', () => {
        it('should not create a course if user is not an admin', async () => {
            await request(app).post(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    name: 'test',
                    cost: 10
                })
                .expect(UNAUTHORIZED)
        })

        it('should not create a course if cost or name or not provided', async () => {
            await request(app).post(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    cost: 10
                })
                .expect(BAD_REQUEST)
            
            await request(app).post(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'test'
                })
                .expect(BAD_REQUEST)
        })

        it('should not create a course if cost is invalid', async () => {
            await request(app).post(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'test',
                    cost: 0.99
                })
                .expect(BAD_REQUEST)
            
            await request(app).post(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'test',
                    cost: 201
                })
                .expect(BAD_REQUEST)
        })

        it('should not create a course if name is already in use', async () => {
            await request(app).post(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: courseOne.name,
                    cost: 0.99
                })
                .expect(BAD_REQUEST)
        })

        it('should not create a course if no discipline is found', async () => {
            await request(app).post(`/api/disciplines/123456/courses`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'test',
                    cost: 10
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if update course request is correct', () => {
        it('should update the course', async () => {
            await request(app).patch(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'update'
                })
                .expect(OK)
        
            const course = await Course.findOne({ name: 'update', _id: courseOne._id })
            expect(course).not.toBeNull()
        })
    })

    describe('if update course request is not correct', () => {
        it('should not update if user is not an admin', async () => {
            await request(app).patch(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    name: 'update'
                })
                .expect(UNAUTHORIZED)
            
            const course = await Course.findOne({ name: 'update' })
            expect(course).toBeNull()
        })

        it('should not update if user there is no data passed', async () => {
            await request(app).patch(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(BAD_REQUEST)
            
        })

        it('should not update if cost is invalid', async () => {
            await request(app).patch(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    cost: 0.99
                })
                .expect(BAD_REQUEST)
            
            await request(app).patch(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    cost: 201
                })
                .expect(BAD_REQUEST)
        })

        it('should not update if name is already being used', async () => {
            await request(app).patch(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: courseOne.name
                })
                .expect(BAD_REQUEST)
        })

        it('should not do anything if course does not exist', async () => {
            await request(app).patch(`/api/courses/12346`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    cost: 50
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if delete course requeste is correct', () => {
        it('should delete the course', async () => {
            await request(app).delete(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(OK)
            
            const course = await Course.findOne({ name: courseOne.name })
            expect(course).toBeNull()
        })
    })

    describe('if delete course request is not correct', () => {
        it('should not delete course if user is not an admin', async () => {
            await request(app).delete(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(UNAUTHORIZED)
            
            const course = await Course.findOne({ name: courseOne.name })
            expect(course).not.toBeNull()
        })

        it('should not do anything if no course exists', async () => {
            await request(app).delete(`/api/courses/12346`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if get single course request is correct', () => {
        it('should return a single course', async () => {
            const response = await request(app).get(`/api/courses/${courseOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(response.body.course.name).toEqual(courseOne.name)
        }) 
    })

    describe('if get single course request is not correct', () => {
        it('should not do anything if course doesnt exist', async () => {
            await request(app).get(`/api/courses/12346`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if get courses request is correct', () => {
        it('should return courses', async () => {
            const response = await request(app).get('/api/courses')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(response.body.courses.length).toBe(1)
        })

        it('should be able to get a disciplines courses', async () => {
            const response = await request(app).get(`/api/disciplines/${disciplineOne.name}/courses`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(response.body.courses.length).toBe(1)
        })

        it('should be be able to search for courses', async () => {
            const response = await request(app).get(`/api/courses?name=${courseOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(response.body.courses.length).toBe(1)
        })
    })
})