require('dotenv').config()
const request = require('supertest')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { UNAUTHORIZED, BAD_REQUEST, CREATED, OK }  = StatusCodes
const app = require('../app/app')
const { setupDatabase, adminToken, userOneToken, userTwoToken, reviewOne, reviewOneID, courseOne } = require('./testData')
const Review = require('../models/Review')
const Course = require('../models/Course')


beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('reviews test', () => {
    describe('if create review request is correct', () => {
        it('should create a review', async () => {
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 5,
                    comment: 'test'
                })
                .expect(CREATED)
            
            const review = await Review.findOne({ comment: 'test' })
            expect(review).not.toBeNull()
        })

        it('should update the courses average rating', async () => {
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 9,
                    comment: 'test'
                })
            
            const course = await Course.findOne({ name: courseOne.name })
            expect(course.averageRating).toBe(7)
        })
    })

    describe('if create review request is not correct', () => {
        it('should not create review if there is no logged in user', async () => {
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .send({
                    rating: 5,
                    comment: 'test'
                })
                .expect(UNAUTHORIZED)
        })

        it('should not create a review if comment or rating are missing', async () => {
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    comment: 'test'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 5
                })
                .expect(BAD_REQUEST)
        })

        it('should not create a review if comment or rating are not correct', async () => {
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 0,
                    comment: 'test'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 11,
                    comment: 'test'
                })
                .expect(BAD_REQUEST)
            
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 5.5,
                    comment: 'test'
                })
                .expect(BAD_REQUEST)
            
            const str = 'a'.repeat(2001)
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 5,
                    comment: str
                })
                .expect(BAD_REQUEST)
        })

        it('should not create a review when there is no course', async () => {
            await request(app).post(`/api/courses/123456/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    rating: 5,
                    comment: 'test'
                })
                .expect(BAD_REQUEST)
        })

        it('should not create another review if one already exists for this course', async () => {
            await request(app).post(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    rating: 5,
                    comment: 'test'
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if update review request is correct', () => {
        it('user should be able to update his review', async () => {
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    comment: 'update'
                })
                .expect(OK)
            
            const review = await Review.findOne({ comment: 'update' })
            expect(review).not.toBeNull()
        })

        it('admin should be able to update reviews', async () => {
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    comment: 'update'
                })
                .expect(OK)
            
            const review = await Review.findOne({ comment: 'update' })
            expect(review).not.toBeNull()
        })
    })

    describe('if update review request is not correct', () => {
        it('should not update if user is not the creator of the review or an admin', async () => {
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    comment: 'update',
                    rating: 5
                })
                .expect(UNAUTHORIZED)
            const review = await Review.findOne({ comment: 'update' })
            expect(review).toBeNull()
        })

        it('should not update if comment or rating are both missing', async () => {
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(BAD_REQUEST)
        })

        it('should not update if comment or rating are not correct', async () => {
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    rating: 0
                })
                .expect(BAD_REQUEST)
            
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    rating: 11
                })
                .expect(BAD_REQUEST)
            
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    rating: 5.55
                })
                .expect(BAD_REQUEST)
            
            const str = 'a'.repeat(2001)
            await request(app).patch(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    comment: str
                })
                .expect(BAD_REQUEST)
        })

        it('should not do anything if there is no review with that id', async () => {
            await request(app).patch(`/api/reviews/123456`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({
                    rating: 5.55
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('if delete review request is correct', () => {
        it('user should be able to delete his reviews', async () => {
            await request(app).delete(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(OK)
            const review = await Review.findOne({ comment: reviewOne.comment })
            expect(review).toBeNull()
        })

        it('admin should be able to delete reviews', async () => {
            await request(app).delete(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send()
                .expect(OK)
            const review = await Review.findOne({ comment: reviewOne.comment })
            expect(review).toBeNull()
        })
    })

    describe('if delete review request is not correct', () => {
        it('should not delete if user is not the creator of the review or an admin', async () => {
            await request(app).delete(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(UNAUTHORIZED)
            
            const review = await Review.findOne({ comment: reviewOne.comment })
            expect(review).not.toBeNull()
        })

        it('should not do anything if no review with that id exists', async () => {
            await request(app).delete(`/api/reviews/123456`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(BAD_REQUEST)
            
            const review = await Review.findOne({ comment: reviewOne.comment })
            expect(review).not.toBeNull()
        })
    })

    describe('if get a single review request is correct', () => {
        it('should return the review', async () => {
            await request(app).get(`/api/reviews/${reviewOneID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
        })
    })

    describe('if get a single review request is not correct', () => {
        it('should not return anything if no review exists', async () => {
            await request(app).get(`/api/reviews/123456`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if a request to get several reviews is correct', () => {
        it('should return a courses reviews', async () => {
            const response = await request(app).get(`/api/courses/${courseOne.name}/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(response.body.reviews.length).toBe(1) 
        })
    })

    describe('if a request to get several reviews is not correct', () => {
        it('should not do anything if there is no course with that id', async () => {
            const response = await request(app).get(`/api/courses/123456/reviews`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })
})