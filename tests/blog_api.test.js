const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const helper = require('./test_helper')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')

const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let auth = {}
beforeAll(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('test', 10)
  const user = new User({ username: 'test', passwordHash, name: 'test' })

  await user.save()

  await api
    .post('/api/login')
    .send({ username: 'test', password: 'test' })
    .then((res) => {
      auth = res.body
    })
})

beforeEach(async () => {
  await Blog.deleteMany({})

  const decodedToken = jwt.verify(auth.token, config.SECRET)
  const user = await User.findById(decodedToken.id)

  const blogObj = helper.initialBlogs
    .map(blog => new Blog({
      ...blog,
      user: user.id
    }))
  const promiseArray = blogObj.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when there is initially somes blog saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
})

describe('viewing a specific blog', () => {
  test('blogs should contain id in stead of _id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(processedBlogToView)
  })
})

describe('addition of new blogs', () => {
  test('a valid blog can be added', async() => {
    const newBlog = {
      _id: '5a422b891b54a676234d17fa',
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const title = blogsAtEnd.map(r => r.title)

    expect(title).toContain(
      'First class tests'
    )
  })
})

describe('deletion of a blog', () => {
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const title = blogsAtEnd.map(b => b.title)

    expect(title).not.toContain(blogToDelete.title)
  })
})

describe('when blog missing property values', () => {
  test('if like property is misssing set default value to 0', async () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    expect(blogsAtEnd[blogsAtEnd.length -1].likes).toBe(0)
  })

  test('blog without tilte and url return bad request', async () => {
    const newBlog = {
      author: 'test',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${auth.token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('updating blog', () => {
  test('update likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const updatingBlog = {
      ...blogsAtStart[0],
      likes: 20
    }

    const result = await api
      .put(`/api/blogs/${updatingBlog.id}`)
      .send(updatingBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body.likes).toEqual(20)
  })
})

afterAll(() => {
  mongoose.connection.close()
})