const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// TODO: ex4.16 - username and password must be at least 3 characters long + tests
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  name: String,
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJson', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the password hash should not be revealed
    delete returnedObject.passwordHash
  },
})

module.exports = mongoose.model('User', userSchema)
