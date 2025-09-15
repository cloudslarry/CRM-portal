const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let app
let server
let mongo

const Admin = require('../models/Admin')
const Faculty = require('../models/Faculty')
const Student = require('../models/Student')
const Book = require('../models/Book')
const jwt = require('jsonwebtoken')
const keys = require('../config/key')

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  process.env.MONGO_URI = uri
  jest.resetModules()
  app = require('express')()

  // initialize the full server to mount routes as production does
  const srv = require('../server')
})

afterAll(async () => {
  await mongoose.connection.close()
  if (mongo) await mongo.stop()
})

const signToken = async (user, modelName) => {
  // Align with app's token expectations: payload contains { id }
  const token = jwt.sign({ id: user._id.toString() }, keys.secretOrKey)
  return `Bearer ${token}`
}

describe('Books API', () => {
  let faculty, student, admin

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase()
    admin = await Admin.create({ name: 'Admin', email: 'a@a.com', password: 'hash' })
    faculty = await Faculty.create({ name: 'Fac', email: 'f@f.com', password: 'hash' })
    student = await Student.create({ name: 'Stu', email: 's@s.com', password: 'hash', registrationNumber: 'R1' })
  })

  test('list books requires auth', async () => {
    const res = await request('http://localhost:5000').get('/api/books').send()
    expect(res.statusCode).toBe(401)
  })

  test('faculty can upload a book, student cannot', async () => {
    const facToken = await signToken(faculty, 'Faculty')
    const stuToken = await signToken(student, 'Student')

    const resStu = await request('http://localhost:5000')
      .post('/api/books')
      .set('Authorization', stuToken)
      .field('title', 'Clean Code')
      .field('authors', 'Robert C. Martin')
      .field('copiesTotal', '1')
      .field('copiesAvailable', '1')
    expect(resStu.statusCode).toBe(403)

    const resFac = await request('http://localhost:5000')
      .post('/api/books')
      .set('Authorization', facToken)
      .field('title', 'Clean Code')
      .field('authors', 'Robert C. Martin')
      .field('copiesTotal', '1')
      .field('copiesAvailable', '1')
    expect(resFac.statusCode).toBe(201)
    expect(resFac.body.success).toBe(true)
    expect(resFac.body.data.title).toBe('Clean Code')
  })

  test('download returns 404 when file missing', async () => {
    const facToken = await signToken(faculty, 'Faculty')
    const stuToken = await signToken(student, 'Student')

    const created = await request('http://localhost:5000')
      .post('/api/books')
      .set('Authorization', facToken)
      .field('title', 'Without File')
      .field('authors', 'Someone')
      .field('copiesTotal', '1')
      .field('copiesAvailable', '1')
    const id = created.body.data._id

    const res = await request('http://localhost:5000')
      .get(`/api/books/${id}/download`)
      .set('Authorization', stuToken)
    expect(res.statusCode).toBe(404)
  })

  test('faculty can edit and delete, student forbidden', async () => {
    const facToken = await signToken(faculty, 'Faculty')
    const stuToken = await signToken(student, 'Student')

    const created = await request('http://localhost:5000')
      .post('/api/books')
      .set('Authorization', facToken)
      .field('title', 'Book')
      .field('authors', 'A')
      .field('copiesTotal', '2')
      .field('copiesAvailable', '2')
    const id = created.body.data._id

    const resStuUpdate = await request('http://localhost:5000')
      .put(`/api/books/${id}`)
      .set('Authorization', stuToken)
      .field('title', 'X')
    expect(resStuUpdate.statusCode).toBe(403)

    const resFacUpdate = await request('http://localhost:5000')
      .put(`/api/books/${id}`)
      .set('Authorization', facToken)
      .field('title', 'New Title')
    expect(resFacUpdate.statusCode).toBe(200)
    expect(resFacUpdate.body.data.title).toBe('New Title')

    const resStuDel = await request('http://localhost:5000')
      .delete(`/api/books/${id}`)
      .set('Authorization', stuToken)
    expect(resStuDel.statusCode).toBe(403)

    const resFacDel = await request('http://localhost:5000')
      .delete(`/api/books/${id}`)
      .set('Authorization', facToken)
    expect(resFacDel.statusCode).toBe(200)
  })
})


