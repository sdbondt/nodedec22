const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST }  = StatusCodes
const { Schema, model } = mongoose
const slugify = require('slugify')
const CustomError = require('../errorhandlers/customError')
const Review = require('./Review')

const CourseSchema = new Schema({
    name: {
        type: String,
        required: [true, 'You must provide a name for your discipline.'],
        unique: true,
        text: true
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
        for (const course of courses) {
            await Review.deleteMany({ course: course._id })
        }
    } catch (e) {
        next(e)
    }
})

CourseSchema.statics.verifyName = async function (name) {
    const nameAlreadyExists = await this.findOne({ name })
    if (nameAlreadyExists) throw new CustomError('The name for your course is already in use.', BAD_REQUEST)
}

CourseSchema.statics.createCourse = async function (disciplineSlug, name, cost, userId) {
    if (!name) throw new CustomError('You must provide name for your course.', BAD_REQUEST)
    if (!cost || cost < 1 || cost > 200) throw new CustomError('You must add a cost for your course and it must be over 1 and under 200.', BAD_REQUEST)
    await this.verifyName(name)
    const discipline = await this.model('Discipline').getDiscipline(disciplineSlug)
    return this.create({
        name,
        cost,
        user: userId,
        discipline
    })
}

CourseSchema.statics.updateCourse = async function (courseSlug, name, cost) {
    if (!cost && !name) throw new CustomError('Nothing to update.', BAD_REQUEST)
    const course = await this.getCourse(courseSlug)
    if (name) {
        await this.verifyName(name)
        course.name = name
    }
    if (cost && (cost < 1 || cost > 200)) throw new CustomError('The cost must be over 1 and under 200.', BAD_REQUEST)
    if (cost) course.cost = cost
    return course.save()
}

CourseSchema.statics.deleteCourse = async function (courseSlug) {
    const course = await this.getCourse(courseSlug)
    await course.remove()
}

CourseSchema.statics.getCourse = async function (courseSlug) {
    const course = await this.findOne({ slug: courseSlug })
    if (!course) throw new CustomError('No course found for your request.', BAD_REQUEST)
    return course
}

CourseSchema.statics.searchCourses = async function (query) {
    let { name, cost, rating, sortBy, direction, page, limit } = query
    direction = direction !== 'asc' ? '-': ''
    sortBy = sortBy === 'createdAt' ? 'createdAt' : sortBy === 'name' ? 'name' : sortBy === 'cost' ? 'cost': 'averageRating'
    sortBy = `${direction}${sortBy}`
    page = Number(page) || 1
    limit = Number(limit) || 5
    const queryObj = {}
    if (name) {
        // queryObj.name = { $regex: name, $options: 'i' }
        queryObj.$text = { $search: name }
        queryObj.score = { $meta: 'text score'}
    }
    if (cost) queryObj.cost = JSON.parse(JSON.stringify(cost).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`))
    if (rating) queryObj.averageRating = JSON.parse(JSON.stringify(rating).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`))
    const totalItems = await this.countDocuments(queryObj)
    const maxPage = Math.ceil(totalItems / limit)
    if (page > maxPage) page = maxPage
    const skip = ( page - 1) * limit
    const courses = await this.find(queryObj).sort(sortBy).skip(skip).limit(limit)
    return {
        courses,
        page,
        limit
    }
}

CourseSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'course',
    justOne: false
})

const Course = model('Course', CourseSchema)
module.exports = Course