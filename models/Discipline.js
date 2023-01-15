const fs = require('fs')
const mongoose = require('mongoose')
const { Schema, model } = mongoose
const slugify = require('slugify')
const CustomError = require('../errorhandlers/customError')
const { StatusCodes } = require('http-status-codes')
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

DisciplineSchema.statics.createDiscipline = async function (userId, name, imageUrl) {
    try {
        if (!name) {
            throw new CustomError('You must add a name for your discipline.', BAD_REQUEST)
        }
    
        const nameAlreadyExists = await Discipline.findOne({ name })
        if (nameAlreadyExists) {
            throw new CustomError('The name for that discipline is already in use.', BAD_REQUEST)
        }

        const discipline = await this.create({
            name,
            user: userId,
            imageUrl
        })
        return discipline
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

DisciplineSchema.statics.updateDiscipline = async function (slug, name, imageUrl) {
    try {
        if (!name && !imageUrl) {
            throw new CustomError('Nothing to update.', BAD_REQUEST)
        }
    
        const nameAlreadyExists = await Discipline.findOne({ name })
        if (nameAlreadyExists) {
            throw new CustomError('The name for that discipline is already in use.', BAD_REQUEST)
        }
    
        const discipline = await this.findOne({ slug })
        if (!discipline) {
            throw new CustomError('No discipline exists with that id.', BAD_REQUEST)
        }
    
        if (name) {
            discipline.name = name
        }
    
        if (imageUrl) {
            if (discipline.imageUrl) {
                fs.unlink(discipline.imageUrl, (err) => {
                    if (err) {
                        throw new CustomError('Something went wrong while deleting a disciplines image.', BAD_REQUEST)
                    }
                })
            }
            discipline.imageUrl = imageUrl
        }

        await discipline.save()
        return discipline
    } catch (e) {
        throw new CustomError(e.message, e.statusCode)
    }
}

DisciplineSchema.statics.deleteDiscipline = async function (slug) {
    const discipline = await Discipline.findOne({ slug })
    if (!discipline) {
        throw new CustomError('No discipline exists with that id.', BAD_REQUEST)
    }
    if (discipline.imageUrl) {
        fs.unlink(discipline.imageUrl, (err) => {
            if (err) {
                throw new CustomError('Something went wrong while deleting a disciplines image.', BAD_REQUEST)
            }
        })
    }
    await discipline.remove()
}

DisciplineSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'discipline',
    justOne: false
})

function autoPopulate () {
    this.populate('courses')
}

DisciplineSchema.pre('findOne', autoPopulate)

DisciplineSchema.pre('remove', async function (next) {
    try {
        if (this.imageUrl) {
            fs.unlink(this.imageUrl, (err) => {
                if (err) {
                    throw new CustomError('Something went wrong while deleting a disciplines image.', BAD_REQUEST)
                }
            })
        }
        await this.model('Course').deleteMany({ discipline: this.id })
    } catch (e) {
        next(e)
    } 
})

DisciplineSchema.pre('deleteMany', async function (next) {
    try {
        const disciplines = await this.model.find(this.getQuery())
        disciplines.forEach(async function (discipline) {
            if (discipline.imageUrl) {
                fs.unlink(discipline.imageUrl, (err) => {
                    if (err) {
                        throw new CustomError('Something went wrong deleting the users image.', BAD_REQUEST)
                    }
                })
            }
        })
    } catch (e) {
        next(e)
    }
})

const Discipline = model('Discipline', DisciplineSchema)
module.exports = Discipline