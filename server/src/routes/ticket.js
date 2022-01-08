// Create a discord oauth2 login express route 
const route = require('express').Router();
const jwt = require('jsonwebtoken');

const checkAuthentication = require('../jwtCheck');

const rawRouteTicket = async (variables) => {
    const {db, keys, isUserAMod, internalEvents} = variables;

    route.use(checkAuthentication(keys.public, false));
    
    route.post('/new', async (req, res) => {
        const { title } = req.body;
        console.log(req.body);
        if (!title) return res.status(400).json({ error: 'Missing required fields' });

        const userID = req.user.id;

        const userOpenTickets = await db.getOpenTicketByOwner(req.user.id);
        if (userOpenTickets.rows.length > 0) return res.status(400).json({ error: 'You already have an open ticket' });

        const ticket = await db.createNewTicket(userID, title);
        res.json({UUID: ticket.rows[0], title, userID});
    });

    route.get('/:UUID', async (req, res) => {
        const { UUID } = req.params;
        const ticket = await db.getTicketByUUID(UUID);
        if (!ticket.rows[0] || ticket.rows[0].owner != req.user.id) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket.rows[0]);
    });

    route.get('/', async (req, res) => {
        const ticket = await db.getOpenTicketByOwner(req.user.id);
        if (!ticket.rows[0] || ticket.rows[0].owner != req.user.id) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket.rows[0]);
    });

    route.ws('/:UUID/ws', async (ws, req) => {
        const { UUID } = req.params;
        const ticket = await db.getTicketByUUID(UUID);
        if (!(ticket.rows[0] && (ticket.rows[0].owner != req.user.id || req.user.isMod))) ws.close(4000, 'You are not allowed to access this ticket');

        ws.on('message', async (message) => {
            const { message: msg } = JSON.parse(message);
            const { c, p } = JSON.parse(msg);
            if (c == 'SEND_MESSAGE') internalEvents.emit('newMessage', { ticketID: UUID, payload: p, userID: req.user.id });
            if (c == 'EDIT_MESSAGE') internalEvents.emit('editMessage', { ticketID: UUID, payload: p, userID: req.user.id });
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


module.exports = rawRouteTicket;