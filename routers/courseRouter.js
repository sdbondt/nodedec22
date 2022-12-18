const express = require('express')
const { createCourse, updateCourse, deleteCourse, getCourse, getCourses } = require('../controllers/courseController')
const authorize = require('../middleware/authorize')
const router = express.Router({ mergeParams: true })
const reviewRouter = require('./reviewRoutes')

router.use('/:slug/reviews', reviewRouter)

router.post('/', authorize, createCourse)
router.patch('/:slug', authorize, updateCourse)
router.delete('/:slug', authorize, deleteCourse)
router.get('/:slug', getCourse)
router.get('/', getCourses)


module.exports = router