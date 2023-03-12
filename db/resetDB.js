const Course = require("../models/Course")
const Discipline = require("../models/Discipline")
const Review = require("../models/Review")
const User = require("../models/User")

const resetDB = async () => {
    try {
        await User.deleteMany({})
        await Discipline.deleteMany({})
        await Course.deleteMany({})
        await Review.deleteMany({})
    } catch (e) {
        console.log(e)
    }
    
}

module.exports = resetDB