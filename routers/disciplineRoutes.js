const express = require('express')
const { createDiscipline, updateDiscipline, deleteDiscipline, getDiscpline, getDisciplines } = require('../controllers/disciplineController')
const authorize = require('../middleware/authorize')
const imageUpload = require('../middleware/imageUploads')
const router = express.Router()
const courseRouter = require('./courseRouter')

router.use('/:disciplineSlug/courses', courseRouter)

router.post('/', authorize, imageUpload.single('image'), createDiscipline)
router.patch('/:slug', authorize, imageUpload.single('image'), updateDiscipline)
router.delete('/:slug', authorize, deleteDiscipline)
router.get('/:slug', getDiscpline)
router.get('/', getDisciplines)

module.exports = router