require('dotenv').config()
const app = require('./app/app')
const connectToDB = require('./db/connectToDB')
const PORT = process.env.PORT || 8000

const start = async () => {
    try {
        await connectToDB(process.env.MONGO_URI)
        app.listen(PORT, () =>
          console.log(`Server is listening on port ${PORT}...`)
        );
      } catch (e) {
          console.log("Connection error.")
          console.log(e.message)
      }
}

start()