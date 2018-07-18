require('dotenv').config();


const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const students = require('./students.json');

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}));
app.use( passport.initialize() );
app.use( passport.session() );

passport.use( new Auth0Strategy({
        domain: process.env.DOMAIN,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/login', 
        scope: 'openid email profile'
},

// => means i don't have to put function at the beginning and return before done.
(accessToken, refreshToken, extraParams, profile, done) => {
     done(null, profile);
}
));
// serialUser is what properties from the user we want back.
passport.serializeUser((user, done) => {
    done(null, { clientID: user.id, email: user._json.email, name: user._json.name });
});
// logic to be done with this new version of user.
passport.deserializeUser((obj, done) => {
    done( null, obj);
});

// endpoints
app.get('/login', 
passport.authenticate('auth0',
        {successRedirect: '/students',
        failreRedirect: '/login',
        connection: 'github'}
    )
);

function authenticated(req, res, next) {
    if( req.user ) {
      next()
    } else {
      res.sendStatus(401);
    }
  };



app.get('/students', (req, res, next) => {
    res.status(200).send(students);
});






const port = 3001;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );