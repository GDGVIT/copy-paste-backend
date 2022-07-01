require('dotenv').config()
const { join } = require('path')
const User = require(join(__dirname, '..', 'models', 'User.model'))
const paseto = require('paseto') // Token Auth
const bcrypt = require('bcryptjs')
const { V4 } = paseto

const key = process.env.PASERK_SECRET

// To create a Key for Paseto

// V4.generateKey('public', { format: 'paserk'}).then(key => {
//     console.log(key.publicKey)
//     console.log(key.secretKey)
// })

const createToken = async (payload) => {
  const token = await V4.sign(payload, key, { expiresIn: '7 days' })
  return token
}

/*
  @route   POST api/v1/user/signup
  @desc    Register a new user
  @access  Public
*/
exports.signup = async (req, res) => {
  let { username, password, confirm } = req.body
  try {
    username = username.toLowerCase()
    let user = await User.findOne({ username })
    if (user) { return res.status(400).json({ message: 'User Already Exists' }) }
    if (password !== confirm) { return res.status(400).json({ message: 'Passwords do not match' }) }

    user = new User({ username, password })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    await user.save()

    return res.status(200).json({ message: 'User Created' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

/*
  @route   POST api/v1/user/login
  @desc    Login a user
  @access  Public
*/
exports.login = async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    if (!user) { return res.status(400).json({ message: 'User does not exist' }) }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) { return res.status(401).json({ message: 'Incorrect Password' }) }

    const payload = {
      id: user._id,
      username: user.username
    }
    const token = await createToken(payload)

    return res.header('Authentication', token).json({ message: 'Login Successful' })
  } catch (error) {
    return res.status(400).json({ message: 'Something went wrong' })
  }
}
