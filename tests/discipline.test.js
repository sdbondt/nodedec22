require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { UNAUTHORIZED, BAD_REQUEST, CREATED, OK }  = StatusCodes
const app = require('../app/app')
const Discipline = require('../models/Discipline')
const { setupDatabase, adminToken, userOneToken, disciplineOne, } = require('./testData')

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('discipline tests', () => {
    describe('if discipline creation request is ok', () => {
        it('should create a new discipline', async () => {
            await request(app).post('/api/disciplines')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'test'
                })
                .expect(CREATED)
            
            
            const discipline = await Discipline.findOne({ name: 'test' })
            expect(discipline).not.toBeNull()
        })

        it('can add an image', async () => {
            await request(app).post('/api/disciplines')
                .set('Authorization', `Bearer ${adminToken}`)
                .field('name', 'test')
                .attach('image', 'tests/testImages/testImage.png')
                .expect(CREATED)
            
            
            const discipline = await Discipline.findOne({ name: 'test' })
            expect(discipline).not.toBeNull()
            expect(discipline.imageUrl).not.toBeNull()
        })
    })

    describe('if discipline creation request is not ok', () => {
        it('should not create a new discipline if user is not an admin', async () => {
            await request(app).post('/api/disciplines')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    name: 'test'
                })
                .expect(UNAUTHORIZED)
        })

        it('should not create a new discipline if no name is give', async () => {
            await request(app).post('/api/disciplines')
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(BAD_REQUEST)
        })

        it('should not create a new discipline if name is already used', async () => {
             await request(app).post('/api/disciplines')
                .set('Authorization', `Bearer ${adminToken}`)
                 .send({
                    name: disciplineOne.name
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if update discipline request is correct', () => {
        it('should update discipline', async () => {
            await request(app).patch(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'update'
                })
                .expect(OK)
            
            const discipline = await Discipline.findOne({ slug: 'update' })
            expect(discipline).not.toBeNull()
        })

        it('can add an image', async () => {
            await request(app).patch(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('image', 'tests/testImages/testImage.png')
                .expect(OK)
            
            const discipline = await Discipline.findOne({ name: disciplineOne.name })
            expect(discipline).not.toBeNull()
            expect(discipline.imageUrl).not.toBeNull()
        })
    })

    describe('if update discipline request is not correct', () => {
        it('should not update if user is not an admin', async () => {
            await request(app).patch(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    name: 'update'
                })
                .expect(UNAUTHORIZED)
        })

        it('should not update if there is no data passed', async () => {
            await request(app).patch(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(BAD_REQUEST)
        })

        it('should not update if name is already in use', async () => {
            await request(app).patch(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: disciplineOne.name
                })
                .expect(BAD_REQUEST)
        })

        it('should not update if discipline doesnt exist', async () => {
            await request(app).patch('/api/disciplines/123456')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'update'
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if delete discipline request is correct', () => {
        it('should delete the discipline', async () => {
            await request(app).delete(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                
            const discipline = await Discipline.findOne({ name: 'discipline' })
            expect(discipline).toBeNull()
        })
    })

    describe('if delete discipline request is not correct', () => {
        it('should not delete if user is not an admin', async () => {
            await request(app).delete(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(UNAUTHORIZED)
            const discipline = await Discipline.findOne({ name: 'discipline' })
            expect(discipline).not.toBeNull()
        })

        it('should not do anything if there is not discipline with that slug', async () => {
            await request(app).delete('/api/disciplines/123456')
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(BAD_REQUEST)
        })  
    })

    describe('if get request is correct', () => {
        it('should show all disciplines', async () => {
            const response = await request(app).get('/api/disciplines')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(response.body.disciplines.length).toBe(1)
        })
    })

    describe('if get single discipline request is correct', () => {
        it('should show a single discipline', async () => {
            const response = await request(app).get(`/api/disciplines/${disciplineOne.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(response.body.discipline.name).toBe('discipline')
        })
    })
})