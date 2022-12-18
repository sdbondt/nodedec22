const asyncHandler = require('../errorhandlers/asyncHandler')
const Course = require('../models/Course')
const Discipline = require('../models/Discipline')
const Review = require('../models/Review')
const User = require('../models/User')
const users = require('../seedData/users.json')

const seedDB = asyncHandler(async (req, res) => {
    // await User.create(users)
    const admin = await User.create({
        role: 'admin',
        name: 'sam',
        email: 'sam@hotmail.com',
        password: '123TESTtest'
    })

    const an = await User.create({
        name: 'an',
        email: 'an@hotmail.com',
        password: '123TESTtest'
    })

    const jan = await User.create({
        name: 'jan',
        email: 'jan@hotmail.com',
        password: '123TESTtest'
    })

    const jo = await User.create({
        name: 'jo',
        email: 'jo@hotmail.com',
        password: '123TESTtest'
    })

    const tom = await User.create({
        name: 'tom',
        email: 'tom@hotmail.com',
        password: '123TESTtest'
    })

    const physics = await Discipline.create({
        user: admin.id,
        name: 'physics'
    })

    const computerSciences = await Discipline.create({
        user: admin.id,
        name: 'computer sciences'
    })

    const mathematics = await Discipline.create({
        user: admin.id,
        name: 'mathematics'
    })

    const mondernLanguages = await Discipline.create({
        user: admin.id,
        name: 'modern languages'
    })

    const history = await Discipline.create({
        user: admin.id,
        name: 'history'
    })

    const physicsOne = await Course.create({
        name: 'physics 1',
        user: admin,
        discipline: physics,
        cost: 100
    })

    await Review.create({
        comment: 'comment',
        rating: 5,
        course: physicsOne,
        user: an
    })

    await Review.create({
        comment: 'comment',
        rating: 7,
        course: physicsOne,
        user: jo
    })

    const physicsTwo = await Course.create({
        name: 'physics 2',
        user: admin,
        discipline: physics,
        cost: 90
    })

    await Review.create({
        comment: 'comment',
        rating: 2,
        course: physicsTwo,
        user: jan
    })

    await Review.create({
        comment: 'comment',
        rating: 9,
        course: physicsTwo,
        user: tom
    })

    await Review.create({
        comment: 'comment',
        rating: 6,
        course: physicsTwo,
        user: an
    })

    await Review.create({
        comment: 'comment',
        rating: 7,
        course: physicsTwo,
        user: jo
    })

     const calculus = await Course.create({
        name: 'calculus',
        user: admin,
        discipline: mathematics,
        cost: 99.99
     })
    
    await Review.create({
        comment: 'comment',
        rating: 7,
        course: calculus,
        user: jo
    })

    await Review.create({
        comment: 'comment',
        rating: 5,
        course: calculus,
        user: jan
    })

    await Review.create({
        comment: 'comment',
        rating: 5,
        course: calculus,
        user: an
    })

    const geometry = await Course.create({
        name: 'geometry',
        user: admin,
        discipline: mathematics,
        cost: 50
    })

    await Review.create({
        comment: 'comment',
        rating: 7,
        course: geometry,
        user: jo
    })

    await Review.create({
        comment: 'comment',
        rating: 10,
        course: geometry,
        user: jan
    })

    const differentialEquations = await Course.create({
        name: 'differential equations',
        user: admin,
        discipline: mathematics,
        cost: 60
    })

    await Review.create({
        comment: 'comment',
        rating: 4,
        user: jan,
        course: differentialEquations
    })

    await Review.create({
        comment: 'comment',
        rating: 8,
        course: differentialEquations,
        user: an
    })

    const algebra = await Course.create({
        name: 'algebra',
        user: admin,
        discipline: mathematics,
        cost: 110
    })
    
    await Review.create({
        comment: 'comment',
        rating: 5,
        course: algebra,
        user: jan
    })

    await Review.create({
        comment: 'comment',
        rating: 8,
        course: algebra,
        user: an
    })

    const wwOne = await Course.create({
        name: 'WW1',
        user: admin,
        discipline: history,
        cost: 99.99
    })

    await Review.create({
        comment: 'comment',
        rating: 5,
        course: wwOne,
        user: tom
    })

    await Review.create({
        comment: 'comment',
        rating: 5,
        course: wwOne,
        user: jo
    })

    const wwTwo = await Course.create({
        name: 'WW2',
        user: admin,
        discipline: history,
        cost: 89.5
    })

    await Review.create({
        comment: 'comment',
        rating: 5,
        course: wwTwo,
        user: tom
    })

    await Course.create({
        name: 'acient times',
        user: admin,
        discipline: history,
        cost: 45.45
    })

    await Course.create({
        name: 'middle ages',
        user: admin,
        discipline: history,
        cost: 51
    })

    await Course.create({
        name: 'English',
        user: admin,
        discipline: mondernLanguages,
        cost: 20
    })

    await Course.create({
        name: 'French',
        user: admin,
        discipline: mondernLanguages,
        cost: 15
    })

    await Course.create({
        name: 'Spanish',
        user: admin,
        discipline: mondernLanguages,
        cost: 21
    })

    await Course.create({
        name: 'German',
        user: admin,
        discipline: mondernLanguages,
        cost: 19
    })

    await Course.create({
        name: 'laravel & php',
        user: admin,
        discipline: computerSciences,
        cost: 13
    })

    await Course.create({
        name: 'javascript es6',
        user: admin,
        discipline: computerSciences,
        cost: 18
    })

    await Course.create({
        name: 'node introduction',
        user: admin,
        discipline: computerSciences,
        cost: 13
    })

    await Course.create({
        name: 'front-end with vue',
        user: admin,
        discipline: computerSciences,
        cost: 25
    })
})

module.exports = seedDB