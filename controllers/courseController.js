const asyncHandler = require('../errorhandlers/asyncHandler')
const { StatusCodes } = require('http-status-codes')
const { OK, CREATED}  = StatusCodes
const Discipline = require('../models/Discipline')
const Course = require('../models/Course')

// POST api/disciplines/:disciplineSlug/courses
exports.createCourse = asyncHandler(async (req, res) => {
    const { disciplineSlug } = req.params
    const { name, cost } = req.body
    const course = await Course.createCourse(disciplineSlug, name, cost, req.user.id)
    res.status(CREATED).json({ course })
})

// PATCH api/courses/:slug
exports.updateCourse = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const { cost, name } = req.body
    
    const course = await Course.updateCourse(slug, name, cost)
    res.status(OK).json({ course })
})

// DELETE api/courses/:slug
exports.deleteCourse = asyncHandler(async (req, res) => {
    const { slug } = req.params
    await Course.deleteCourse(slug)
    res.status(OK).json({ msg: 'Course got deleted.'})
})

// GET api/courses/:slug
exports.getCourse = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const course = await Course.getCourse(slug)
    res.status(OK).json({ course, reviews: course.reviews })
})

// GET api/courses?name=name&cost[gt|lt..]=0-200&rating[gt|lt..]=0-10&sortBy=averageRating/cost/name/createdAt&page=1/2/...&limit=2/5/10...  GET api/disciplines/:disciplineSlug/courses
exports.getCourses = asyncHandler(async (req, res) => {
    const { disciplineSlug } = req.params
    if (disciplineSlug) {
        const discipline = await Discipline.getDiscipline(disciplineSlug)
        res.status(OK).json({ courses: discipline.courses })
    } 
    const { courses, page, limit} = await Course.searchCourses(req.query)
    res.status(OK).json({
        courses,
        page,
        limit,
    })
})