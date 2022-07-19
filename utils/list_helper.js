const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, item) => sum + item.likes, 0)
}

const favouriteBlog = (blogs) => {
  let max = 0
  let mostLikeBlog = blogs[0]
  blogs.forEach(blog => {
    if (blog.likes < max) return

    max = blog.likes
    mostLikeBlog = blog
  })

  return mostLikeBlog
}

const mostBlogs = (blogs) => {
  const result = _(blogs)
    .countBy('author')
    .entries()
    .maxBy(_.last)

  return ({
    author: result[0],
    blogs: result[1]
  })
}

// Return the author, whose blog posts have the largest amount of likes
const mostLikes = (blogs) => {
  const grouping = _(blogs)
    .groupBy('author')
    .map((blog, author) => ({
      author: author,
      likes: _.sumBy(blog, 'likes')
    }))
    .value()

  return _.maxBy(grouping, (g) => g.likes)
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes
}