require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('../../models/Course')
require('../../models/Course')
const Discipline = require('../../models/Discipline')
const User = require('../../models/User')
const { setupDatabase, adminID, disciplineOne } = require('../testData')

beforeEach(setupDatabase)
afterEach(async () => {
    await mongoose.connection.close()
})

describe('discipline unit tests', () => {
    it('can create disciplines', async () => {
        await Discipline.createDiscipline(adminID, 'unittest', null)
        const discipline = await Discipline.findOne({ name: 'unittest'})
        expect(discipline).not.toBeNull()
    })

    it('can update disciplines', async () => {
        await Discipline.updateDiscipline(disciplineOne.name, 'update', null)
        const discipline = await Discipline.findOne({ name: 'update' })
        expect(discipline).not.toBeNull()
    })

    it('can delete disciplines', async () => {
        await Discipline.deleteDiscipline(disciplineOne.name)
        const discipline = await Discipline.findOne({ name: disciplineOne.name })
        expect(discipline).toBeNull()
    })

    it('disciplines can have courses', async () => {
        const discipline = await Discipline.findOne({ name: disciplineOne.name })
        expect(discipline.courses[0] instanceof Course).toBe(true)
    })

    it('belongs to a user', async () => {
        const discipline = await Discipline.findOne({ name: disciplineOne.name }).populate('user')
        expect(discipline.user instanceof User).toBe(true)
    })
})