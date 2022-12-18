const express = require('express')
const { createReview, updateReview, deleteReview, getReview, getReviews } = require('../controllers/reviewController')
const router = express.Router({ mergeParams: true })

router.post('/', createReview)
router.patch('/:reviewId', updateReview)
router.delete('/:reviewId', deleteReview)
router.get('/:reviewId', getReview)
router.get('/', getReviews)


module.exports = router