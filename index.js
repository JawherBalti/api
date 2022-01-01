const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const mongoose = require('mongoose')
const userRoute = require('./routes/user')

dotenv.config()
//get env variables
const port = process.env.PORT || 5000
const dbUri = process.env.DB_URI

//create express application
const app = express()

//middlewares
app.use(cors())
app.use(express.json())

//route
app.use('/api/user', userRoute)

//DB connection
mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  mongoose.connection.once('open', () => {
    console.log('Connection to database established')
  })

//start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})