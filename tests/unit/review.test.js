require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('../../models/Course')
const Review = require('../../models/Review')
const User = require('../../models/User')
const { setupDatabase, adminID, reviewOne, reviewOneID, disciplineOne, userOneID, courseOne, userTwo, userTwoID } = require('../testData')

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('review unit tests', () => {
    it('can create reviews', async () => {
        await Review.createReview(courseOne.name, 'test', 5, userOneID)
        const review = await Review.findOne({ comment: 'test', rating: 5 })
        expect(review).not.toBeNull()
    })

    it('can update reviews', async () => {
        const reviewUser = await User.findOne({ _id: userTwoID })
        await Review.updateReview('update', null, reviewOneID, reviewUser)
        const review = await Review.findOne({ comment: 'update', rating: reviewOne.rating })
        expect(review).not.toBeNull()
    })

    it('can delete review', async () => {
        const reviewUser = await User.findOne({ _id: userTwoID })
        await Review.deleteReview(reviewOneID, reviewUser)
        const review = await Review.findOne({ comment: reviewOne.comment, rating: reviewOne.rating })
        expect(review).toBeNull()
    })

    it('can get a review', async () => {
        const review = await Review.getReview(reviewOneID)
        expect(review.comment).toBe(reviewOne.comment)
    })

    it('can get courses reviews', async () => {
        const { reviews } = await Review.getReviews({}, courseOne.name)
        expect(reviews.length).toBe(1)
    })

    it('must belong to a user', async () => {
        const review = await Review.findOne({ comment: reviewOne.comment })
        expect(review.user instanceof User).toBe(true)
    })

    it('must belong to a course', async () => {
        const review = await Review.findOne({ comment: reviewOne.comment })
        expect(review.course instanceof Course).toBe(true)
    })
})