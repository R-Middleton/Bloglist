const Blog = require('../models/blog')
const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blog) => {
  return blog[0].likes
}

const favoriteBlog = (blogs) => {
  const favoriteBlog = blogs.reduce((favoriteBlog, currentBlog) => {
    return currentBlog.likes > favoriteBlog.likes ? currentBlog : favoriteBlog
  })
  return favoriteBlog
}

const mostBlogs = (blogs) => {
  const groupedBlogs = _.groupBy(blogs, 'author')
  const mapValues = _.mapValues(groupedBlogs, (o) => o.length)
  var mostBlogsAuthor = Object.keys(mapValues).reduce((a, b) => {
    return mapValues[a] > mapValues[b] ? a : b
  })

  return {
    author: mostBlogsAuthor,
    blogs: mapValues[mostBlogsAuthor],
  }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }
