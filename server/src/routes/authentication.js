// Create a discord oauth2 login express route 
const route = require('express').Router();
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const jwt = require('jsonwebtoken');

const scopes = ['identify'];

const rawRouteAuthentication = async (variables) => {
    const {db, keys, isUserAMod} = variables;

    passport.use(new DiscordStrategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.BASE_URL + process.env.DISCORD_CALLBACK_URL,
        scope: scopes
    },
    function(accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    route.get('/create', passport.authenticate('discord', {
        scope: scopes
    }));
    
    route.get('/callback', passport.authenticate('discord', {
        failureRedirect: '/'
        }), async (req, res) => {
            console.log(req.user);
            const isMod = await isUserAMod(req.user.id); 
            const token = jwt.sign({ id: req.user.id, isMod }, keys.private, { algorithm: 'RS256', expiresIn: '1h', issuer: 'Freddie' });

            res.redirect(`/callback?jwt=${token}`);
    });

    return route;
};


module.exports = rawRouteAuthentication;