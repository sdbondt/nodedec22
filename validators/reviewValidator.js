const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST, UNAUTHORIZED }  = StatusCodes
const CustomError = require('../errorhandlers/customError')
const Course = require('../models/Course')
const Review = require('../models/Review')

exports.validatePostReviewRequest = async (req, comment, rating, slug) => {
    if (!comment || !rating || !slug) {
        throw new CustomError('Your review must have a comment and rating and belong to a course.', BAD_REQUEST)
    }

    if (comment.length > 2000) {
        throw new CustomError('Your comment can\'t be longer than 2000 characters.', BAD_REQUEST)
    }

    if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
        throw new CustomError('Your rating must be a whole number from 1 to 10.', BAD_REQUEST)
    }

    const course = await Course.findOne({ slug })
    if (!course) {
        throw new CustomError('Your review must belong to a course.', BAD_REQUEST)
    }
    const review = await Review.findOne({
        user: req.user,
        course: course.id
    })

    if (review) {
        throw new CustomError('You can only add one review per user.', BAD_REQUEST)
    }
    return course
}

exports.validatePatchReviewRequest = async (req, rating, comment, reviewId) => {
    if (!comment && !rating) {
        throw new CustomError('Nothing to update.', BAD_REQUEST)
    }

    if (comment && comment.length > 2000) {
        throw new CustomError('Your comment can\'t be longer than 2000 characters.', BAD_REQUEST)
    }

    if (rating && (rating < 1 || rating > 10 || !Number.isInteger(rating))) {
        throw new CustomError('Your rating must be a whole number from 1 to 10.', BAD_REQUEST)
    }

    const review = await Review.findById(reviewId)
    if (!review) {
        throw new CustomError('No review found for your request.', BAD_REQUEST)
    }
    
    if (req.user.id !== review.user.id && req.user.role !== 'admin') {
        throw new CustomError('You\'re not authorized to perform this action.', UNAUTHORIZED)
    }

    if (comment) {
        review.comment = comment
    }

    if (rating) {
        review.rating = rating
    }

    return review
}

exports.validateDeleteReviewRequest = async (req, reviewId) => {
    const review = await Review.findById(reviewId)
    if (!review) {
        throw new CustomError('No review found for your request', BAD_REQUEST)
    }
    
    if (req.user.id !== review.user.id && req.user.role !== 'admin') {
        throw new CustomError('You\'re not authorized to perform this action.', UNAUTHORIZED)
    }
    return review
}

exports.validateGetReviewsRequest = async (slug) => {
    if (!slug) {
        throw new CustomError('You must give a valid course to search for its reviews.', BAD_REQUEST)
    }

    const course = await Course.findOne({ slug })
    if (!course) {
        throw new CustomError('You must give a valid course to search for its reviews.', BAD_REQUEST)
    }
    return course
}