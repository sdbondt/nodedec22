const fs = require('fs')
const mongoose = require('mongoose')
const { Schema, model } = mongoose
const slugify = require('slugify')
const CustomError = require('../errorhandlers/customError')
const { StatusCodes } = require('http-status-codes')
const Course = require('./Course')
const { BAD_REQUEST }  = StatusCodes

const DisciplineSchema = new Schema({
    name: {
        type: String,
        required: [true, 'You must provide a name for your discipline.'],
        unique: true
    },
    slug: String,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Discipline must belong to a user.']
    },
    imageUrl: String
})

DisciplineSchema.pre('save', function () {
    this.slug = slugify(this.name, { lower: true})
})

function autoPopulate () {
    this.populate('courses')
}

DisciplineSchema.pre('findOne', autoPopulate)

DisciplineSchema.pre('remove', async function (next) {
    try {
        if (this.imageUrl) await this.removeImage()
        await this.model('Course').deleteMany({ discipline: this.id })
    } catch (e) {
        next(e)
    } 
})

DisciplineSchema.pre('deleteMany', async function (next) {
    try {
        const disciplines = await this.model.find(this.getQuery())
        disciplines.forEach(async function (discipline) {
            await discipline.removeImage()
            await Course.remove({ discipline: discipline._id })  
        })
    } catch (e) {
        next(e)
    }
})

DisciplineSchema.methods.removeImage = async function () {
    if (this.imageUrl) {
        fs.unlink(this.imageUrl, (err) => {
            if (err) {
                throw new CustomError('Something went wrong while deleting a disciplines image.', BAD_REQUEST)
            }
        })
    }
}

DisciplineSchema.statics.verifyName = async function (name) {
    const nameAlreadyExists = await this.findOne({ name })
    if (nameAlreadyExists) throw new CustomError('The name for that discipline is already in use.', BAD_REQUEST)
}

DisciplineSchema.statics.createDiscipline = async function (userId, name, imageUrl) {
    if (!name) throw new CustomError('You must add a name for your discipline.', BAD_REQUEST)
    await this.verifyName(name)
    return this.create({
        name,
        user: userId,
        imageUrl
    })
}

DisciplineSchema.statics.updateDiscipline = async function (slug, name, imageUrl) {
    if (!name && !imageUrl) throw new CustomError('Nothing to update.', BAD_REQUEST)   
    const discipline = await this.getDiscipline(slug)
    if (name) {
        await this.verifyName(name)  
        discipline.name = name
    }
    if (imageUrl) {
        await discipline.removeImage()
        discipline.imageUrl = imageUrl
    }
    return discipline.save()
}

DisciplineSchema.statics.deleteDiscipline = async function (slug) {
    const discipline = await this.getDiscipline(slug)
    await discipline.removeImage()
    await discipline.remove()
}

DisciplineSchema.statics.getDiscipline = async function (disciplineSlug) {
    const discipline = await this.findOne({ slug: disciplineSlug })
    if (!discipline) throw new CustomError('No discipline exists with that id.', BAD_REQUEST)
    return discipline
}

DisciplineSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'discipline',
    justOne: false
})

const Discipline = model('Discipline', DisciplineSchema)
module.exports = Discipline