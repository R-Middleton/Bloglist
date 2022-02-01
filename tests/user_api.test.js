const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)

describe('when there is initially one user in the db', () => {
  beforeEach(async () => {
    await User.deleteMany()

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({
      username: 'TomUsername',
      name: 'Tom',
      passwordHash,
    })

    await user.save()
  })

  test('creation succeeds with a fresh database', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'UserRoss',
      name: 'Ross',
      password: 'testPassword',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((user) => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and appropriate message when username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'TomUsername',
      name: 'Tom2',
      password: 'testPassword',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
