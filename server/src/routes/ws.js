// Create a discord oauth2 login express route 
const route = require('express').Router();
const { WebSocketManager } = require('discord.js');
const jwt = require('jsonwebtoken');

const checkAuthentication = require('../jwtCheck');

const rawRouteWs = async (variables) => {
    const {db, keys, isUserAMod, internalEvents} = variables;

    route.use((req, res, next) => {
        console.log("Here!1")
        next();
    });

    route.use(checkAuthentication(keys.public, false, true));
    
    route.use((req, res, next) => {
        console.log("Here!2")
        next();
    });
    
    route.ws('/ticket/:UUID', async (ws, req) => {
        console.log('WS request')
        ws.on('upgrade', (req, socket) => {
            console.log('new client');
            // const responseHeaders = [ 'HTTP/1.1 101 Web Socket Protocol Handshake', 'Upgrade: WebSocket', 'Connection: Upgrade', `Access-Control-Allow-Origin: *` ]; 

            // socket.write(responseHeaders.join('\r\n') + '\r\n\r\n')
        });

        const { UUID } = req.params;
        const ticket = await db.getTicketById(UUID);
        console.log(req.user.id, ticket.rows[0])
        if ((ticket.rows[0] && ticket.rows[0].owner != req.user.id) && !req.user.isMod) ws.close(4000, 'You are not allowed to access this ticket');

        ws.on('message', async (message) => {
            const { c, p, j } = JSON.parse(message);
            if (c == 'SEND_MESSAGE') internalEvents.emit('newMessage', { ticketID: UUID, payload: p, userID: req.user.id, jobID: j });
            if (c == 'EDIT_MESSAGE') internalEvents.emit('editMessage', { ticketID: UUID, payload: p, userID: req.user.id, jobID: j });
            if (c == 'USER_STATE_UPDATE') internalEvents.emit('userStateUpdate', { payload: p, userID: req.user.id, jobID: j });
        });

        internalEvents.on('dispatchRoomMessage', (data) => {
            if (data.ticketID != UUID) return;
            ws.send(JSON.stringify(data.payload));
        });
        internalEvents.on('dispatchGlobalMessage', (data) => {
            ws.send(JSON.stringify(data.payload));
        });

    });

    return route;
};


module.exports = rawRouteWs;