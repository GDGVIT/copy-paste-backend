require('dotenv').config()
const { join } = require('path')
const User = require(join(__dirname, '..', 'models', 'User.model'))
const sendEmail = require(join(__dirname, '..', 'workers', 'sendEmail.worker'))
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
    const user = await User.findOne({ email })
    if (user) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      })
    }
    if (password !== confirm) { return res.status(400).json({ message: 'Passwords do not match' }) }

    const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const newUser = new User({ email, password, hash })
    const salt = await bcrypt.genSalt(10)
    newUser.password = await bcrypt.hash(newUser.password, salt)
    const link = 'http://' + req.get('host') + '/api/v1/user/verify/' + newUser.id + '/' + hash
    await sendEmail(email, 'Verify Your Email', `Verify your email at ${link}`)
    await newUser.save()
    console.log(link)

    return res.status(200).json({ message: 'Check email for verification' })
  } catch (error) {
    console.log(error)
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

    return res.status(200).json({ message: 'Login Successful', token })
  } catch (error) {
    console.log(error)
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

    const hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    user.hash = hash
    await user.save()
    const link = 'http://' + req.get('host') + '/api/v1/' + 'user/verify/' + user.id + '/' + hash
    await sendEmail(user.email, 'Verify Email', link)
    console.log(link)
    return res.status(200).json({ message: 'Check email for verification' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Something went wrong' })
  }
}

/*
  @route   GET api/v1/user/verify/:id/:hash
  @desc    Verify email
  @access  Public
*/
exports.verify = async (req, res) => {
  const hash = req.params.hash
  try {
    const user = await User.findById(req.params.id)

    if (!user) { return res.status(400).send('Invalid link') }
    if (user.IsVerified) { return res.status(400).send('User already verified') }
    if (user.hash !== hash) { return res.status(401).json({ success: false, error: "Hash doesn't match" }) }
    user.IsVerified = true
    user.hash = ''
    await user.save()
    return res.status(200).send('Email verified')
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Something went wrong' })
  }
}

exports.addDevice = async (req, res) => {
  const { token, type, name } = req.body
  try {
    const user = await User.findById(req.user.id)
    if (!user) { return res.status(400).json({ message: 'User does not exist' }) }
    // check if device token already exists or name already exists
    const device = user.devices.find(device => {
      let condition = false
      if (device.token === token) {
        condition = true
      }
      if (device.name === name) {
        condition = true
      }
      return condition
    })
    if (device) { return res.status(400).json({ message: 'Device already exists' }) }
    user.devices.push({ token, type, name })
    await user.save()
    return res.status(200).json({ message: 'Device added' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

exports.removeDevice = async (req, res) => {
  const { token, name } = req.body
  try {
    const user = await User.findById(req.user.id)
    if (!user) { return res.status(400).json({ message: 'User does not exist' }) }
    // check if device token already exists or name already exists
    const device = user.devices.find(device => {
      let condition = false
      if (device.token === token) {
        condition = true
      }
      if (device.name === name) {
        condition = true
      }
      return condition
    })
    if (!device) { return res.status(400).json({ message: 'Device does not exist' }) }
    user.devices = user.devices.filter(device => {
      let condition = false
      if (device.token === token) {
        condition = true
      }
      if (device.name === name) {
        condition = true
      }
      return !condition
    })
    await user.save()
    return res.status(200).json({ message: 'Device removed' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}

exports.getDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) { return res.status(400).json({ message: 'User does not exist' }) }
    return res.status(200).json({ devices: user.devices })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Something went wrong' })
  }
}
