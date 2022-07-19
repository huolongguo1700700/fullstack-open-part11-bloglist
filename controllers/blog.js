const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogRouter.get('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)
    .populate('user', { username: 1, name: 1 })
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: request.user
  })

  const result = await blog.save()

  // Only save when the id not existed
  if (!request.user.blogs.includes(result.id)) {
    request.user.blogs = request.user.blogs.concat(result.id)
    await request.user.save()
  }

  response.status(201).json(result)
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === request.user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    return response.status(204).end()
  }

  response
    .status(401)
    .json({
      error: 'Unauthorized'
    })
})

blogRouter.put('/:id', async (request, response) => {
  const updatingBlog = {
    likes: request.body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, updatingBlog, { new: true })

  if (updatedBlog) {
    response.status(200).json(updatedBlog.toJSON())
  } else {
    response.status(400).end()
  }
})

module.exports = blogRouter