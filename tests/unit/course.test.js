require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('../../models/Course')
const Discipline = require('../../models/Discipline')
const Review = require('../../models/Review')
const User = require('../../models/User')
const { setupDatabase, adminID, disciplineOne, userOneID, courseOne, courseOneID } = require('../testData')

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('course unit tests', () => {
    it('can create a course', async () => {
        await Course.createCourse(disciplineOne.name, 'test', 50, userOneID)
        const course = await Course.findOne({ name: 'test', cost: 50 })
        expect(course).not.toBeNull()
    })

    it('can update a course', async () => {
        await Course.updateCourse(courseOne.name, 'test', null)
        const updatedCourse = await Course.findOne({ name: 'test' })
        expect(updatedCourse).not.toBeNull()
        const oldCourse = await Course.findOne({ name: courseOne.name })
        expect(oldCourse).toBeNull()
    })

    it('can delete a course', async () => {
        await Course.deleteCourse(courseOne.name)
        const course = await Course.findOne({ name: courseOne.name })
        expect(course).toBeNull()
    })

    it('can search a course', async () => {
        const { courses } = await Course.searchCourses({ name: courseOne.name })
        expect(courses.length).toBe(1)
    })

    it('course should belong to a discipline', async () => {
        const course = await Course.findOne({ name: courseOne.name })
        expect(course.discipline instanceof Discipline).toBe(true)
    })

    it('should belong to a user', async () => {
        const course = await Course.findOne({ name: courseOne.name }).populate('user')
        expect(course.user instanceof User).toBe(true)
    })

    it('can have reviews', async () => {
        const course = await Course.findOne({ name: courseOne.name })
        expect(course.reviews[0] instanceof Review).toBe(true)
        expect(course.reviews.length).toBe(1)
    })

    it('removes all related reviews if course get\'s deleted', async () => {
        const course = await Course.findById(courseOneID)
        await course.remove()
        const reviews = await Course.find({ course: course.id })
        expect(reviews.length).toBe(0)
    })

    it('removes all reviews when all courses get deleted', async () => {
        await Course.deleteMany()
        const reviews = await Review.find()
        expect(reviews.length).toBe(0)
    })
})