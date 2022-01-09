// Create a discord oauth2 login express route 
const route = require('express').Router();
const { WebSocketManager } = require('discord.js');
const jwt = require('jsonwebtoken');

const checkAuthentication = require('../jwtCheck');

const rawRouteExternalApplication = async (variables) => {
    const {db, keys, isUserAMod, internalEvents} = variables;

    // route.use(checkAuthentication(keys.public, false, true));
    
    route.ws('/gateway', async (ws, req) => {
        const connectionWelcome = {
            e: "READY",
            v: "1",
            session_id: "",
            d: {
                tokenName: req.user.name
            }
        }
        ws.send(JSON.stringify(connectionWelcome));
    });


    return route;
};


module.exports = rawRouteExternalApplication;