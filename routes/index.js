const express = require('express')
const database = require('../database/database')
const router = express.Router()

router.get('/', (req, res, next) => {
  return Promise.all([
    database.getPosts(),
    database.getParagraphs()
  ])
  .then(data => {
    res.render('index', {
      posts: data[0],
      paragraphs: data[1],
      latestPost: data[0][0]
    })
  })
  // catching the rejected promise this way will print it to the log
  // but your catchall error handler will never get invoked and the user will
  // see their browser hang since you never res.send() anything. To solve this
  // you need to invoke the "next" callback with the error, which you can do like this:
  .catch(next)
})

module.exports = router
