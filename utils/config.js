require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

const SECRET = process.env.SECRET

const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD

module.exports = {
  MONGODB_URI,
  PORT,
  SECRET,
  TEST_USER_PASSWORD,
}
