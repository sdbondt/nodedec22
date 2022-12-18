const mongoose = require('mongoose')
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