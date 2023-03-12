const asyncHandler = require('../errorhandlers/asyncHandler')
const { StatusCodes } = require('http-status-codes')
const { OK, CREATED, BAD_REQUEST } = StatusCodes
const Discipline = require('../models/Discipline')

// POST /api/disciplines
exports.createDiscipline = asyncHandler(async (req, res) => {
    const { name } = req.body
    const imageUrl = !req.file ? null: req.file.path ? req.file.path: null
    const discipline = await Discipline.createDiscipline(req.user.id, name, imageUrl)
    return res.status(CREATED).json({ discipline })
})

// PATCH /api/disciplines/:slug
exports.updateDiscipline = asyncHandler(async (req, res) => {
    const { name } = req.body
    const { slug } = req.params
    const imageUrl = !req.file ? null: req.file.path ? req.file.path: null
    const discipline = await Discipline.updateDiscipline(slug, name, imageUrl)
    res.status(OK).json({ discipline })
})

// DELETE /api/disciplines/:slug
exports.deleteDiscipline = asyncHandler(async (req, res) => {
    const { slug } = req.params
    await Discipline.deleteDiscipline(slug)
    res.status(OK).json({ msg: 'Discipline got deleted.' })
})

// GET /api/disciplines/:slug
exports.getDiscpline = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const discipline = await Discipline.getDiscipline(slug)
    res.status(OK).json({
        discipline,
        courses: discipline
    })
})

// GET /api/disciplines
exports.getDisciplines = asyncHandler(async (req, res) => {
    const disciplines = await Discipline.find()
    res.status(OK).json({ disciplines })
})