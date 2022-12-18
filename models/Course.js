const mongoose = require('mongoose')
const { Schema, model } = mongoose
const slugify = require('slugify')
const Review = require('./Review')

const CourseSchema = new Schema({
    name: {
        type: String,
        required: [true, 'You must provide a name for your discipline.'],
        unique: true
    },
    slug: String,
    discipline: {
        type: mongoose.Schema.ObjectId,
        ref: 'Discipline',
        required: [true, 'Course must belong to a discipline.'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Course must belong to a user.']
    },
    cost: {
        type: Number,
        min: [1, 'Cost must be at least 1.'],
        max: [200, 'Cost must be maximum 200.']
    },
    averageRating: {
        type: Number,
    }
})

CourseSchema.index({
    name: 'name',
    description: 'text'
})

CourseSchema.pre('save', function () {
    this.slug = slugify(this.name, { lower: true})
})

CourseSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'course',
    justOne: false
})

CourseSchema.pre('findOne', function () {
    this.populate('discipline', 'name').populate('reviews')
})

CourseSchema.pre('remove', async function (next) {
    try {
        await this.model('Review').deleteMany({ course: this.id })
    } catch (e) {
        next(e)
    } 
})

CourseSchema.pre('deleteMany', { document: false, query: true} , async function (next) {
    try {
        const courses = await this.model.find(this.getQuery())
        courses.forEach(async function (course) {
            await Review.deleteMany({ course: course._id })
        })
    } catch (e) {
        next(e)
    }
})

const Course = model('Course', CourseSchema)
module.exports = Course