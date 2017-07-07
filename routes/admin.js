const express = require('express')
const bcrypt = require('bcrypt')
const database = require('../database/database')

const router = express.Router()

// verifies admin session
// should this live in a diff file?
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    res.redirect('/admin/login')
  }
  else {
    next()
  }
}

// Having two functions named isLoggedIn and loggedIn is a little confusing.
// They sound the same but do different things. Maybe isLoggedIn should be
// renamed `requireLoggedInUser` and loggedIn should be called
// `redirectLoggedInUser` or something like that.

// avoids rendering login page if already logged in
// this is only used for /login, should it live there?
const loggedIn = (req, res, next) => {
  if (!req.session.user) {
    next()
  }
  else {
    res.redirect('/admin')
  }
}

router.get('/', isLoggedIn, (req, res) => {
  res.render('admin/admin')
})

router.get('/posts', isLoggedIn, (req, res) => {
  database.getPosts()
    .then(posts => {
      res.render('admin/posts', { posts: posts })
    })
    .catch(error => {
      console.error('error retrieving posts:', error)
      // you could also just call next(error) here to hit your catch-all error handler
      res.redirect('/admin')
    })
})

router.get('/new', isLoggedIn, (req, res) => {
  res.render('admin/new')
})

router.post('/new', (req, res) => {
  const { title, videoUrl, content } = req.body

  database.createPost(title, videoUrl, content)
    .then(result => {
      res.redirect('/admin/posts')
    })
    .catch(error => {
      console.error('error creating post:', error)
      res.redirect('/admin')
    })
})

router.get('/login', loggedIn, (req, res) => {
  res.render('admin/login')
})

router.post('/login', (req, res) => {
  const { email, password } = req.body

  database.verifyEmail(email)
    .then(adminSalt => {
      const hashedPassword = bcrypt.hashSync(password, adminSalt.salt)

      return database.verifyPassword(email, hashedPassword)
    })
    .then(admin => {
      req.session.user = admin.id
      console.log('logging user in -before redirect-', req.session.user)
      res.redirect('/admin')
    })
    .catch(error => {
      console.error('error logging in', error)
      res.redirect('/admin/login')
    })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  res.redirect('/')
})

module.exports = router
