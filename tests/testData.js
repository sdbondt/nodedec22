const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const connectToDB = require('../db/connectToDB')
const Discipline = require('../models/Discipline')
const Course = require('../models/Course')
const Review = require('../models/Review')

const userOneID = new mongoose.Types.ObjectId()
const userOneToken = jwt.sign(
    { userId: userOneID },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
)

const userOne = {
    _id: userOneID,
    email: process.env.USERONE_EMAIL,
    name: process.env.USERONE_NAME,
    password: process.env.USERONE_PASSWORD
}

const userTwoID = new mongoose.Types.ObjectId()
const userTwoToken = jwt.sign(
    { userId: userTwoID },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
)

const userTwo = {
    _id: userTwoID,
    email: process.env.USERTWO_EMAIL,
    name: process.env.USERTWO_NAME,
    password: process.env.USERTWO_PASSWORD
}

const adminID = new mongoose.Types.ObjectId()
const adminToken = jwt.sign(
    { userId: adminID },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
)
const admin = {
    _id: adminID,
    email: process.env.ADMIN_EMAIL,
    name: process.env.ADMIN_NAME,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin'
}

const disciplineOneID = new mongoose.Types.ObjectId()
const disciplineOne = {
    _id: disciplineOneID,
    name: 'discipline',
    user: adminID
}

const courseOneID = new mongoose.Types.ObjectId()
const courseOne = {
    _id: courseOneID,
    name: 'course',
    user: adminID,
    discipline: disciplineOneID
}

const reviewOneID = new mongoose.Types.ObjectId()
const reviewOne = {
    _id: reviewOneID,
    comment: 'comment',
    rating: 5,
    user: userTwoID,
    course: courseOneID
}

const setupDatabase = async () => {
    try {
        await connectToDB(process.env.MONGO_TEST_URI)
        await User.deleteMany({})
        await Discipline.deleteMany({})
        await Course.deleteMany({})
        await Review.deleteMany({})
        await User.create(userOne)
        await User.create(userTwo)
        await User.create(admin)
        await Discipline.create(disciplineOne)
        await Course.create(courseOne)
        await Review.create(reviewOne)
    } catch (e) {
        console.log(e)
    } 
}

module.exports = {
    setupDatabase,
    userOne,
    userOneID,
    userOneToken,
    userTwo,
    userTwoToken,
    userTwoID,
    adminToken,
    admin,
    adminID,
    disciplineOne,
    disciplineOneID,
    courseOne,
    courseOneID,
    reviewOneID,
    reviewOne
}