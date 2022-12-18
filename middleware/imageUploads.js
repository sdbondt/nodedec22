const multer = require("multer")
const { v4: uuidv4 } = require('uuid')

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
      } else {
        cb(null, false);
      }
}

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
      },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname)
    }
})

const imageUpload = multer({
    storage: fileStorage,
    fileFilter
})

module.exports = imageUpload