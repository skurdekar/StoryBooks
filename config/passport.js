const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

// Load User model
require('../models/User');
const User = mongoose.model('users');

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback',
        proxy: true
    }, (accessToken, refreshToken, profile, done) => {
        // check for existing user
        User.findOne({
                googleID: profile.id
            })
            .then(user => {
                if (user) {
                    console.log("user already registered");
                    done(null, user); // return user
                } else {
                    const value = profile.photos[0].value;
                    const image = value.substring(0, value.indexOf('?'));
                    console.log(image);
                    const newUser = { // create new user
                        googleID: profile.id,
                        email: profile.emails[0].value,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        image: image
                    }
                    console.log(newUser);
                    new User(newUser)
                        .save()
                        .then(user => { done(null, user); })
                        .catch(err => {
                            console.log(err);
                            return;
                        });
                }
            });

    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
        });
        
    passport.deserializeUser((id, done) => {
        User.findById(id).then( (user) => done(null, user) );
    });
}