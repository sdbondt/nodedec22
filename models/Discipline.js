const mongoose = require('mongoose')
const { Schema, model } = mongoose
const slugify = require('slugify')

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
        await this.model('Course').deleteMany({ discipline: this.id })
    } catch (e) {
        next(e)
    } 
})

const Discipline = model('Discipline', DisciplineSchema)
module.exports = Discipline