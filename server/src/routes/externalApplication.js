// Create a discord oauth2 login express route 
const route = require('express').Router();
const { WebSocketManager } = require('discord.js');
const jwt = require('jsonwebtoken');
const tokenCache = new Map();

const checkExternalAuthentication = require('../jwtCheck');

const rawRouteExternalApplication = async (variables) => {
    const {db, keys, isUserAMod, internalEvents} = variables;
    
    route.use( async (req, res, next) => {
        console.log(`New External Connection: ${req.connection.remoteAddress}`);
        if (!req.query.token) return res.status(403).json({ error: 'Missing required fields' });
        let cachedToken = tokenCache.get(req.query.token);
        if (cachedToken) {
            const isValid = Date.now() < (cachedToken.created_at  + 1000 * 60);
            if (isValid && cachedToken.valid) {
                req.user = cachedToken.user;
                return next();
            } else if (isValid) 
                return res.status(403).json({ error: 'Invalid token' });
        };
        const fetchedToken = await db.getApplicationByToken(req.query.token);
        const token = fetchedToken.rows[0];
        if (!token) {
            tokenCache.set(req.query.token, {valid: false, created_at: Date.now()});
            return res.status(403).json({ error: 'Invalid token' });
        };
        req.user = token.user;
        tokenCache.set(req.query.token, {
            user: token,
            created_at: Date.now(),
            valid: true
        });
        next();
    });
    
    route.ws('/gateway', async (ws, req) => {
        const connectionWelcome = {
            e: "READY",
            v: "1",
            session_id: "",
            d: {
                tokenName: req.user
            }
        }
        ws.send(JSON.stringify(connectionWelcome));

        internalEvents.on('dispatchRoomMessage', (data) => {
            ws.send(JSON.stringify({
                e: "MESSAGE_CREATE",
                v: "1",
                session_id: "",
                d: data
                }));
        });
        
    });


    return route;
};


module.exports = rawRouteExternalApplication;