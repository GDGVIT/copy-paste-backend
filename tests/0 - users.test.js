/* global before, describe, it */
/* eslint handle-callback-err: "warn" */

process.env.NODE_ENV = 'test'

const User = require('../src/api/models/User.model')

// dev deps
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../src/index')
const path = require('path')

chai.should()
chai.use(chaiHttp)

before(done => {
  // Drop the users collection at the start of this
  // test suite to ensure that we start with a clean slate
  User.deleteMany({}, err => {
    if (err) {
      console.log(err.stack)
    }
    done()
  })
})

describe('/POST /api/v1/user/signup', () => {
    it('email not send in body', (done) => {
      const user = {
        password: 'test',
        confirm: 'test'
      }
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('error')
          res.body.should.have.property('success')
          res.body.error.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(false)
          res.body.error.should.equal('"email" is required')
          done()
        })
    })
    it('password not send in body', (done) => {
      const user = {
        email: 'test@test.com',
        confirm: 'test'
      }
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('error')
          res.body.should.have.property('success')
          res.body.error.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(false)
          res.body.error.should.equal('"password" is required')
          done()
        })
    })
    it('confirm not send in body', (done) => {
      const user = {
        email: 'test@test.com',
        password: 'test'
      }
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('error')
          res.body.should.have.property('success')
          res.body.error.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(false)
          res.body.error.should.equal('"confirm" is required')
          done()
        })
    })
    it('confirm is not equal to password', (done) => {
      const user = {
        email: 'test@test.com',
        password: 'test',
        confirm: 'test2'
      }
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('error')
          res.body.should.have.property('success')
          res.body.error.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(false)
          res.body.error.should.equal('Passwords do not match')
          done()
        })
    })
    it('email format is wrong', (done) => {
      const user = {
        name: 'test',
        email: 'test',
        regno: '21BBS0162',
        major: 'csbs',
        password: 'test',
        confirm: 'test'
      }
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(422)
          res.body.should.be.a('object')
          res.body.should.have.property('error')
          res.body.should.have.property('success')
          res.body.error.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(false)
          res.body.error.should.equal('"email" must be a valid email')
          done()
        })
    })
    it('Signup Successful', (done) => {
      const user = {
        email: 'gdscvit@gmail.com',
        password: 'test',
        confirm: 'test'
      }
      const user2 = {
        email: 'gdscvit2@gmail.com',
        password: 'test',
        confirm: 'test'
      }
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user2)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message')
          res.body.should.have.property('success')
          res.body.message.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(true)
          res.body.message.should.equal('Check email for verification')
        })
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message')
          res.body.should.have.property('success')
          res.body.message.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(true)
          res.body.message.should.equal('Check email for verification')
          done()
        })
    })
    it('email already exists', (done) => {
      const user = {
        email: 'gdscvit@gmail.com',
        password: 'test2',
        confirm: 'test2'
      }
      chai.request(server)
        .post('/api/v1/user/signup')
        .send(user)
        .end((err, res) => {
          if (err) {
            console.log(err.stack)
          }
          res.should.have.status(409)
          res.body.should.be.a('object')
          res.body.should.have.property('error')
          res.body.should.have.property('success')
          res.body.error.should.be.a('string')
          res.body.success.should.be.a('boolean')
          res.body.success.should.equal(false)
          res.body.error.should.equal('Email already exists')
          done()
        })
    })
})
