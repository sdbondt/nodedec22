const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST }  = StatusCodes
const CustomError = require('../errorhandlers/customError')
const Course = require('../models/Course')
const Discipline = require('../models/Discipline')

exports.validatePostCourseRequest = async (name, cost, disciplineSlug) => {
    if (!name) {
        throw new CustomError('You must provide name for your course.', BAD_REQUEST)
    }

    if (!cost || cost < 1 || cost > 200) {
        throw new CustomError('You must add a cost for your course and it must be over 1 and under 200.', BAD_REQUEST)
    }

    if (!disciplineSlug) {
        throw new CustomError('Your course must belong to a discipline.', BAD_REQUEST)
    }

    const discipline = await Discipline.findOne({ slug: disciplineSlug })
    if (!discipline) {
        throw new CustomError('No discipline found.', BAD_REQUEST)
    }

    const nameAlreadyExists = await Course.findOne({ name })
    if (nameAlreadyExists) {
        throw new CustomError('The name for your course is already in use.', BAD_REQUEST)
    }
    return discipline
}

exports.validatePatchCourseRequest = async (cost, name, slug) => {
    if (!cost && !name) {
        throw new CustomError('Nothing to update.', BAD_REQUEST)
    }

    const course = await Course.findOne({ slug })
    if (!course) {
        throw new CustomError('No course found for your request.', BAD_REQUEST)
    }

    if (name) {
        const nameAlreadyExists = await Course.findOne({ name })
        if (nameAlreadyExists) {
            throw new CustomError('The name for that course is already in use.', BAD_REQUEST)
        }
        course.name = name
    }

    if (cost) {
        if (cost < 1 || cost > 200) {
            throw new CustomError('The cost must be over 1 and under 200.', BAD_REQUEST)
        }
        course.cost = cost
    }
    return course
}