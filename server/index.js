require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const session = require('express-session')
const massive = require('massive')

const app = express()
app.use(cors())
app.use(bodyParser.json())

massive(process.env.DB_CONNECTION).then(db => {
    app.set('db', db)
})

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}))
app.use(express.static(__dirname+ '/../build'))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK
}, function (accessToken, refreshToken, extraParams, profile, done) {
    
    /*  using : google; username, email img, auth id */ 
    const db = app.get('db')
    let userData = profile._json, 
        auth_id = userData.user_id.split('|')[1]
    db.find_user([auth_id]).then(user => {
        if (user[0]) {
            return done(null, user[0].id)
        } else {
            db.create_user([userData.name, userData.email, userData.picture, auth_id]).then( user =>
            {
                return done(null, user[0].id)
            })
        }
    })
}))

/* endpoints */
app.get('/auth', passport.authenticate('auth0'))
app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: process.env.FRONT_END_AUTH_SUCCESS,
    failureRedirect: process.env.FRONT_END_AUTH_FAILURE
}))

passport.serializeUser(function (ID, done) {
    done(null, ID)
})

passport.deserializeUser(function (user, done) {
    const db = app.get('db')
    db.find_user_by_session([user]).then ( user => {
        done(null, user[0])
    })
})
app.get('/auth/me', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('LOG IN REQUIRED')
    } else {
        res.status(200).send(req.user)
    }
})
app.get('/auth/logout', function (req, res, next) {
    req.logout()
    res.redirect(process.env.FRONT_END_AUTH_FAILURE)
})
/*                  \ ^ - ^ /                                             */
app.listen(process.env.SERVER_PORT, () => (console.log('\\ ^ o ^ / ')))