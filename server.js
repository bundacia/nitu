require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const childProcess = require('child_process')
const database = require('./database/database')
const index = require('./routes/index')
const admin = require('./routes/admin')
const port = process.env.PORT || 3000

const app = express()

app.set(path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY, process.env.SECRET_KEY_2],
  maxAge: 2 * 60 * 60 * 1000 // expires in 2 hours
}))
app.use('/', index)
app.use('/admin', admin)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status('500').send('There was an ERROR: ', err)
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
  childProcess.exec(`open "http://localhost:${port}"`)
})
