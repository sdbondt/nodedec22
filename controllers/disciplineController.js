const asyncHandler = require('../errorhandlers/asyncHandler')
const { StatusCodes } = require('http-status-codes')
const { OK, CREATED, BAD_REQUEST } = StatusCodes
const CustomError = require('../errorhandlers/customError')
const Discipline = require('../models/Discipline')
const { validatePostDisciplineRequest, validatePatchDisciplineRequest } = require('../validators/disciplineValidator')

// POST /api/disciplines
exports.createDiscipline = asyncHandler(async (req, res) => {
    const { name } = req.body
    await validatePostDisciplineRequest(name)
    const imageUrl = !req.file ? null: req.file.path ? req.file.path: null
    const discipline = await Discipline.create({
        name,
        user: req.user,
        imageUrl
    })
    return res.status(StatusCodes.OK).json({ discipline })
})

// PATCH /api/disciplines/:slug
exports.updateDiscipline = asyncHandler(async (req, res) => {
    const { name } = req.body
    const { slug } = req.params
    const discipline = await validatePatchDisciplineRequest(req, slug, name)
    await discipline.save()
    res.status(OK).json({
        discipline
    })
})

// DELETE /api/disciplines/:slug
exports.deleteDiscipline = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const discipline = await Discipline.findOne({ slug })
    if (!discipline) {
        throw new CustomError('No discipline exists with that id.', BAD_REQUEST)
    }

    await discipline.remove()
    res.status(OK).json({
        msg: 'Discipline got deleted.'
    })
})

// GET /api/disciplines/:slug
exports.getDiscpline = asyncHandler(async (req, res) => {
    const { slug } = req.params
    const discipline = await Discipline.findOne({ slug })
    if (!discipline) {
        throw new CustomError('No discipline exists with that id.', BAD_REQUEST)
    }

    res.status(OK).json({
        discipline,
        courses: discipline
    })
})

// GET /api/disciplines
exports.getDisciplines = asyncHandler(async (req, res) => {
    const disciplines = await Discipline.find()
    res.status(OK).json({
        disciplines
    })
})