require('dotenv').config()
const connectToDB = require('./db/connectToDB')
const seedDB = require('./db/seedDB')

connectToDB(process.env.MONGO_URI)
seedDB()
console.log('Database got seeded.')