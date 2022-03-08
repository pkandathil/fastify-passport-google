require('dotenv').config()
const fastify = require('fastify')
const fastifyPassport = require('fastify-passport')
const fastifySecureSession = require ('fastify-secure-session')
const GoogleStrategy = require('passport-google-oauth')
const fs = require('fs')
const path = require('path')


const server = fastify({
  logger: true
})


server.register(fastifySecureSession, {
  key: fs.readFileSync(path.join(__dirname, 'secret-key')),
  cookie: {
    path: '/'
  }
})
server.register(fastifyPassport.initialize())
server.register(fastifyPassport.secureSession())

fastifyPassport.registerUserSerializer(
  async (user, request) => {
    console.log('registerUserSerializer', { user })
    const { id, displayName } = user
    const userForSession = { id, displayName }
    // User object sent it from Google. 
    // Here you want to call your DB and get the user info from there and store it in the session.
    // The session is encrypted but if you dont want to store all the user info in the session just store the DB id in the session
    return userForSession
  }
)

fastifyPassport.registerUserDeserializer(async (userFromSession, request) => {
  console.log('registerUserDeserializer', { userFromSession })
  // Here you decrypt the session object and read the user info from there.
  // If the whole user object is stored just return it. If only an ID is stored, look up the user in the DB using the ID and return that user
  return userFromSession
})

fastifyPassport.use('google', new GoogleStrategy.OAuth2Strategy({
  clientID: process.env['AUTH0_CLIENT_ID'],
  clientSecret: process.env['AUTH0_CLIENT_SECRET'],
  callbackURL: 'http://localhost:8080/api/auth/google/callback',
}, function (accessToken, refreshToken, profile, cb) {
  return cb(null, profile)
}
))


server.get(
  '/login',
  {
    preValidation: fastifyPassport.authenticate('google', { scope: [ 'profile', 'email'] })
  },
  async () => {
    console.log('GOOGLE API forward')
  }
)

server.get(
  '/api/auth/google/callback',
  {
    preValidation: fastifyPassport.authenticate('google', { scope: [ 'profile', 'email']})
  },
  function (req, res) {
    res.redirect('/');
  }
)

server.get('/',
  {
    preValidation: (req, res, done) => { 
      if (!req.user) {
        res.redirect('/login')
      }
      done()
    }
  },
  async (req, res) => {
    console.log(req.user)
    if (req.user) {
      res.send(`Hello ${req.user.displayName}!`)
    }
    else {
      res.send(`Hello World`)
    }
  }
)
server.get('/login-fail', (req, res) => {
  res.send('Login Failure')
})

server.listen(8080, (err, address) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
  server.log.info(`Server listening on ${address}`)
})
