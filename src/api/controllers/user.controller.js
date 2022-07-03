require('dotenv').config()
const { join } = require('path')
const User = require(join(__dirname, '..', 'models', 'User.model'))
const Token = require(join(__dirname, '..', 'models', 'Token.model'))
const sendEmail = require(join(__dirname, '..', 'workers', 'sendEmail.worker'))
const crypto = require('crypto')
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
  const { email, password, confirm } = req.body
  try {
    let user = await User.findOne({ email })
    if (user) { return res.status(400).json({ message: 'User Already Exists' }) }
    if (password !== confirm) { return res.status(400).json({ message: 'Passwords do not match' }) }

    user = new User({ email, password })
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(user.password, salt)

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex')
    }).save()

    const link = 'http://' + req.get('host') + '/api/v1/' + 'user/verify/' + user.id + '/' + token.token
    await sendEmail(user.email, 'Verify Email', link)
    await user.save()
    console.log(link)

    return res.status(200).json({ message: 'Check email for verification' })
  } catch (error) {
    return res.status(400).json({ message: 'Something went wrong' })
  }
}

/*
  @route   POST api/v1/user/login
  @desc    Login a user
  @access  Public
*/
exports.login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) { return res.status(400).json({ message: 'User does not exist' }) }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) { return res.status(401).json({ message: 'Incorrect Password' }) }
    if (!user.IsVerified) { return res.status(400).json({ message: 'Please verify your email' }) }

    const payload = {
      id: user._id,
      email: user.email
    }
    const token = await createToken(payload)

    return res.header('Authentication', token).json({ message: 'Login Successful' })
  } catch (error) {
    return res.status(400).json({ message: 'Something went wrong' })
  }
}

/*
  @route   POST api/v1/user/resend
  @desc    Resend verification email
  @access  Public
*/
exports.resendEmail = async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) { return res.status(400).json({ message: 'User does not exist' }) }
    if (user.IsVerified) { return res.status(400).json({ message: 'User already verified' }) }

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex')
    }).save()
    const link = 'http://' + req.get('host') + '/api/v1/' + 'user/verify/' + user.id + '/' + token.token
    // await sendEmail(user.email, 'Verify Email', link)
    console.log(link)
    return res.status(200).json({ message: 'Check email for verification' })
  } catch (error) {
    return res.status(400).json({ message: 'Something went wrong' })
  }
}

/*
  @route   GET api/v1/user/verify/:id/:token
  @desc    Verify email
  @access  Public
*/
exports.verify = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })

    if (!user) { return res.status(400).send('Invalid link') }

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token
    })

    if (!token) { return res.status(400).send('Invalid link') }

    await User.findOneAndUpdate({ _id: req.params.id }, { IsVerified: true })
    await Token.findByIdAndRemove(token._id)

    return res.status(200).send('Email verified')
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Something went wrong' })
  }
}
