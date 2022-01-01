const { User } = require('../models/user')
const cryptojs = require('crypto-js')
const Cookies = require('cookies')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const saltRounds = 10

//register api
const register = (req, res) => {
  //get body content
  const { firstName, lastName, email, password } = req.body
  //generate salt
  bcrypt.genSalt(saltRounds, function (err, salt) {
    //generate hash
    bcrypt.hash(password, salt, function (err, hash) {
      User.findOne({ email: email }, function (err, user) {
        //if email alredy exists
        if (user) {
          return res.status(400).json({ message: 'Email Already Exists!' })
        } else {
          //else create user
          const user = new User({
            firstName,
            lastName,
            email,
            //encrypt password
            password: cryptojs.AES.encrypt(hash, process.env.SECRET).toString(),
          })
          //save user to DB
          user
            .save()
            .then(() => res.status(200).json({ message: 'User Created' }))
            .catch(() =>
              res
                .status(400)
                .json({ message: 'Could Not Register. Please Try Again!' }),
            )
        }
      })
    })
  })
}

//login api
const login = (req, res) => {
  //get body content
  const { email, password } = req.body

  User.findOne({ email: email })
    .then((user) => {
      //if account exists
      const _id = user._id
      //decrypt password
      const matchingHash = cryptojs.AES.decrypt(user.password, process.env.SECRET).toString(cryptojs.enc.Utf8)
      //compare entered password to saved password
      bcrypt.compare(password, matchingHash).then((isMatch) => {
        if (isMatch) {
          //if passwords match, generate token
          const token = jwt.sign(
            {
              _id: user._id,
            },
            process.env.SECRET,
            {
              expiresIn: '1h', //token valid for 7 days
            },
          )
          //create cookie
          const cookieContent = {
            token: token,
            _id
          }
          //encrypt cookie
          const cryptedCookie = cryptojs.AES.encrypt(JSON.stringify(cookieContent), process.env.SECRET).toString();
          //set cookie
          new Cookies(req, res).set('snToken', cryptedCookie, {
            httpOnly: true,
            maxAge: 3600000  // cookie pendant 1 heure (en millisecondes)
          })
          
          return res.status(200).json({ message: "User Connected!", userId: _id, cryptedCookie })
        } else {
          //if passwords do not match
          return res.status(400).send({ message: 'Wrong Email Or Password!' })
        }
      })
    })
    //if email does not exist
    .catch((err) => res.status(404).json({ message: 'Account Does Not Exist!' }))
}

module.exports = { register, login }