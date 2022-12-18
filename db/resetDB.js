const asyncHandler = require("../errorhandlers/asyncHandler")
const Course = require("../models/Course")
const Discipline = require("../models/Discipline")
const Review = require("../models/Review")
const User = require("../models/User")

const resetDB = asyncHandler(async (req, res) => {
    await User.deleteMany({})
    await Discipline.deleteMany({})
    await Course.deleteMany({})
    await Review.deleteMany({})
})

module.exports = resetDB