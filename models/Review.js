const mongoose = require('mongoose')
const CustomError = require('../errorhandlers/customError')
const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST, UNAUTHORIZED }  = StatusCodes
const { Schema, model } = mongoose

const ReviewSchema = new Schema({
    comment: {
        type: String,
        min: [0, 'You can\'t write an empty review.'],
        max: [2000, 'Your review can be maximum 2000 characters long.']
    },
    rating: {
        type: Number,
        validate: {
            validator: function (val) {
                if (Number.isInteger(val) && val < 11 && val > 0) {
                    return true
                }
                return false
            },
            message: 'Rating must be a whole number from 1 to 10.'
        },
        required: [true, 'You must add a rating to your review.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Reviews must belong to a user.']
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: [true, 'Reviews must belong to a course.']
    }
},
    { timestamps: true }
)

ReviewSchema.statics.createReview = async function (courseSlug, comment, rating, userId) {
    try {
        if (!comment || !rating || !courseSlug) {
            throw new CustomError('Your review must have a comment and rating and belong to a course.', BAD_REQUEST)
        }
    
        if (comment.length > 2000) {
            throw new CustomError('Your comment can\'t be longer than 2000 characters.', BAD_REQUEST)
        }
    
        if (rating < 1 || rating > 10 || !Number.isInteger(rating)) {
            throw new CustomError('Your rating must be a whole number from 1 to 10.', BAD_REQUEST)
        }
    
        const course = await this.model('Course').findOne({ slug: courseSlug })
        if (!course) {
            throw new CustomError('Your review must belong to a course.', BAD_REQUEST)
        }
        const reviewExists = await this.findOne({
            user: userId,
            course: course.id
        })
    
        if (reviewExists) {
            throw new CustomError('You can only add one review per user.', BAD_REQUEST)
        }
        const review = await this.create({
            comment,
            rating,
            course,
            user: userId
        })
        return review
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

ReviewSchema.statics.updateReview = async function (comment, rating, reviewId, user) {
    try {
        if (!comment && !rating) {
            throw new CustomError('Nothing to update.', BAD_REQUEST)
        }
    
        if (comment && comment.length > 2000) {
            throw new CustomError('Your comment can\'t be longer than 2000 characters.', BAD_REQUEST)
        }
    
        if (rating && (rating < 1 || rating > 10 || !Number.isInteger(rating))) {
            throw new CustomError('Your rating must be a whole number from 1 to 10.', BAD_REQUEST)
        }
    
        if (!mongoose.isValidObjectId(reviewId)) {
            throw new CustomError('No review found for your request.', BAD_REQUEST)
        }
        const review = await this.findById(reviewId)
        if (!review) {
            throw new CustomError('No review found for your request.', BAD_REQUEST)
        }
        
        if (user.id !== review.user.id && user.role !== 'admin') {
            throw new CustomError('You\'re not authorized to perform this action.', UNAUTHORIZED)
        }
    
        if (comment) {
            review.comment = comment
        }
    
        if (rating) {
            review.rating = rating
        }
        await review.save()
        return review
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

ReviewSchema.statics.deleteReview = async function (reviewId, user) {
    try {
        if (!mongoose.isValidObjectId(reviewId)) {
            throw new CustomError('No review found for your request.', BAD_REQUEST)
        }
        const review = await this.findById(reviewId)
        if (!review) {
            throw new CustomError('No review found for your request', BAD_REQUEST)
        }
        
        if (user.id !== review.user.id && user.role !== 'admin') {
            throw new CustomError('You\'re not authorized to perform this action.', UNAUTHORIZED)
        }
        await review.remove()
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

ReviewSchema.statics.getReview = async function (reviewId) {
    try {
        if (!mongoose.isValidObjectId(reviewId)) {
            throw new CustomError('No review found for your request.', BAD_REQUEST)
        }
        const review = await this.findById(reviewId)
        if (!review) {
            throw new CustomError('No review found for your request', BAD_REQUEST)
        }
        return review
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }  
}

ReviewSchema.statics.getReviews = async function (query, courseSlug) {
    try {
        let { direction, page, limit } = query
        direction = direction === 'desc' ? '-' : ''
        const sortBy = direction + 'createdAt'
        page = page || 1
        limit = limit || 20
        skip = ( page -1) * limit
        const course = await this.model('Course').findOne({ slug: courseSlug })
        if (!course) {
            throw new CustomError('You must give a valid course to search for its reviews.', BAD_REQUEST)
        }
        const reviews = await this.find({ course: course.id }).sort(sortBy).skip(skip).limit(limit)
        return {
            reviews,
            page,
            limit
    }
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }   
}

ReviewSchema.statics.setAverageCourseRating = async function (courseId) {
    const obj = await this.aggregate([
        {
            $match: { course: courseId}
        },
        {
            $group: {
                _id: '$course',
                averageRating: { $avg: '$rating' }
            }
        }
    ])
    
    try {
        if (!obj[0]) {
            await this.model('Course').findByIdAndUpdate(courseId, {
                averageRating: null
            })
        } else {
            await this.model('Course').findByIdAndUpdate(courseId, {
                averageRating: Number((obj[0].averageRating).toFixed(2))
            })
        }
    } catch (e) {
        throw new Error(e)
    }
}

ReviewSchema.index({ course: 1 , user: 1}, { unique: true})

ReviewSchema.post('save', async function () {
    await this.constructor.setAverageCourseRating(this.course._id)
})

ReviewSchema.post('remove', async function () {
    await this.constructor.setAverageCourseRating(this.course._id)
})

ReviewSchema.pre('find', function () {
    this.populate({ path: 'user', select: 'name' })
})

ReviewSchema.pre('findOne', function () {
    this.populate({ path: 'user', select: 'name' })
        .populate({ path: 'course', select: 'name'})
})

const Review = model('Review', ReviewSchema)
module.exports = Review