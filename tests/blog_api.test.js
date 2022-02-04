const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const User = require('../models/user')
const Blog = require('../models/blog')
const { deleteOne } = require('../models/user')
const config = require('../utils/config')

const globals = {}

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

  const testUser = {
    username: 'TestUser',
    id: '61f9c39539c0478dabd5613d',
  }

  const token = await jwt.sign(testUser, config.SECRET, { expiresIn: 60 * 60 })
  globals.token = token
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map((r) => r.title)
    expect(titles).toContain('React patterns')
  })
})

describe('viewing a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogsToView = blogsAtStart[0]
    const resultBlog = await api
      .get(`/api/blogs/${blogsToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogsToView))

    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const fakeBlogID = await helper.nonExistingId()

    console.log(fakeBlogID)

    await api.get(`/api/blogs/${fakeBlogID}`).expect(404)
  })

  test('fails with statuscode 400 id is invald', async () => {
    const blogWithInvalidID = '5a34d233avs54'

    await api.get(`/api/blogs/${blogWithInvalidID}`).expect(400)
  })
})

describe('addition of a new blog', () => {
  let headers

  beforeEach(async () => {
    const newUser = {
      username: 'root',
      name: 'root',
      password: 'password',
    }

    await api.post('/api/users').send(newUser)

    const result = await api.post('/api/login').send(newUser)

    headers = {
      Authorization: `bearer ${result.body.token}`,
    }
  })

  test('succeeds with new blog saved to db', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Ross as test',
      url: 'www.google.com',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .set(headers)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((b) => b.title)
    expect(titles).toContain('Test Blog')
  })

  test('fails with status code 400 if data invalid', async () => {
    const newBlog = {
      author: 'Ross',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .set(headers)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without likes is added with 0 likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const newBlog = {
      title: 'Test blog for 0 likes',
      author: 'Test blogger',
      url: 'https://google.com',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .set(headers)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const newestBlog = blogsAtEnd[blogsAtStart.length]

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(newestBlog.likes).toEqual(0)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((b) => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('update the amount of likes a blog has', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 1,
    }

    await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const blogAfterUpdate = blogsAtEnd[0]
    expect(blogAfterUpdate.likes).toEqual(blogToUpdate.likes + 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
