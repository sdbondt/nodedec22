const asyncHandler = require('../errorhandlers/asyncHandler')
const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST, OK, CREATED}  = StatusCodes
const CustomError = require('../errorhandlers/customError')
const { validatePostReviewRequest, validatePatchReviewRequest, validateDeleteReviewRequest, validateGetReviewsRequest } = require('../validators/reviewValidator')
const Review = require('../models/Review')

// POST api/courses/:slug/reviews
exports.createReview = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const { comment, rating } = req.body
    const course = await validatePostReviewRequest(req, comment, rating, slug)
    const review = await Review.create({
        comment,
        rating,
        course,
        user: req.user
    })
    return res.status(CREATED).json({ review })
})

// PATCH api/reviews/:reviewId
exports.updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params
    const { rating, comment } = req.body
    const review = await validatePatchReviewRequest(req, rating, comment, reviewId)
    await review.save()
    res.status(OK).json({ review })
})

// DELETE api/reviews/:reviewId
exports.deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params
    const review = await validateDeleteReviewRequest(req, reviewId)
    await review.remove()
    res.status(OK).json({ msg: 'Review got deleted.'})
})

// GET api/reviews/:reviewId
exports.getReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review) {
        throw new CustomError('No review found for your request.', BAD_REQUEST)
    }
    res.status(OK).json({ review })
})

// GET api/courses/:slug/reviews
exports.getReviews = asyncHandler(async (req, res) => {
    const { slug } = req.params
    let { direction, page, limit } = req.query
    direction = direction === 'desc' ? '-' : ''
    const sortBy = direction + 'createdAt'
    page = page || 1
    limit = limit || 20
    skip = ( page -1) * limit
    const course = await validateGetReviewsRequest(slug)
    const reviews = await Review.find({ course: course.id }).sort(sortBy).skip(skip).limit(limit)
    res.status(OK).json({
        reviews,
        page,
        limit
    })
})