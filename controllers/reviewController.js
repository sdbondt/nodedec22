const asyncHandler = require('../errorhandlers/asyncHandler')
const { StatusCodes } = require('http-status-codes')
const { OK, CREATED}  = StatusCodes
const Review = require('../models/Review')

// POST api/courses/:slug/reviews
exports.createReview = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const { comment, rating } = req.body
    const review = await Review.createReview(slug, comment, rating, req.user.id)
    return res.status(CREATED).json({ review })
})

// PATCH api/reviews/:reviewId
exports.updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params
    const { rating, comment } = req.body
    const review = await Review.updateReview(comment, rating, reviewId, req.user)
    res.status(OK).json({ review })
})

// DELETE api/reviews/:reviewId
exports.deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params
    await Review.deleteReview(reviewId, req.user)
    res.status(OK).json({ msg: 'Review got deleted.'})
})

// GET api/reviews/:reviewId
exports.getReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params
    const review = await Review.getReview(reviewId)
    res.status(OK).json({ review })
})

// GET api/courses/:slug/reviews
exports.getReviews = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const { reviews, page, limit } = await Review.getReviews(req.query, slug)
    res.status(OK).json({
        reviews,
        page,
        limit
    })
})