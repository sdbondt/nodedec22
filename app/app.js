const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const morgan = require('morgan')
const rateLimiter = require('express-rate-limit')

const app = express()
const notFoundHandler = require('../errorhandlers/notFoundHandler')
const errorHandler = require('../errorhandlers/errorHandler')
const authRouter = require('../routers/authRoutes')
const disciplineRouter = require('../routers/disciplineRoutes')
const courseRouter = require('../routers/courseRouter')
const reviewRouter = require('../routers/reviewRoutes')
const userRouter = require('../routers/userRouter')
const auth = require('../middleware/auth')

app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(morgan('dev'))
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100
}))

app.use('/api/auth', authRouter)
app.use('/api/disciplines', auth, disciplineRouter)
app.use('/api/courses', auth, courseRouter)
app.use('/api/reviews', auth, reviewRouter)
app.use('/api/users', auth, userRouter)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app