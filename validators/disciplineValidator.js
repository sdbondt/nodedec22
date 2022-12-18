
const { StatusCodes } = require('http-status-codes')
const { BAD_REQUEST }  = StatusCodes
const CustomError = require('../errorhandlers/customError')
const Discipline = require('../models/Discipline')

exports.validatePostDisciplineRequest = async (name) => {
    if (!name) {
        throw new CustomError('You must add a name for your discipline.', BAD_REQUEST)
    }

    const nameAlreadyExists = await Discipline.findOne({ name })
    if (nameAlreadyExists) {
        throw new CustomError('The name for that discipline is already in use.', BAD_REQUEST)
    }
}

exports.validatePatchDisciplineRequest = async (req, slug, name) => {
    if (!name && !req.file) {
        throw new CustomError('Nothing to update.', BAD_REQUEST)
    }

    const nameAlreadyExists = await Discipline.findOne({ name })
    if (nameAlreadyExists) {
        throw new CustomError('The name for that discipline is already in use.', BAD_REQUEST)
    }

    const discipline = await Discipline.findOne({ slug })
    if (!discipline) {
        throw new CustomError('No discipline exists with that id.', BAD_REQUEST)
    }

    if (name) {
        discipline.name = name
    }

    if (req.file && req.file.path) {
        discipline.imageUrl = req.file.path
    }
    return discipline
}