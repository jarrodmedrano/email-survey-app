const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
const keys = require('../config/keys.js');
const User = mongoose.model('users');

//pass user id inside cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//pull user id out of cookie
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});

passport.use(new GoogleStrategy(
  {
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleId: profile.id })
      .then((existingUser) => {
        if(existingUser) {
          //we already have a record with the given profile ID
          done(null, existingUser);
        } else {
          //we don't have a user record
          new User({ googleId: profile.id })
            .save()
            .then(user => done(null, user));
        }
      })
  }));