const Blog = require('../models/blog')

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

module.exports = { dummy, totalLikes, favoriteBlog }
