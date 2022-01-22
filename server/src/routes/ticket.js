// Create a discord oauth2 login express route 
const route = require('express').Router();
const { WebSocketManager } = require('discord.js');
const jwt = require('jsonwebtoken');

const checkAuthentication = require('../jwtCheck');

const rawRouteTicket = async (variables) => {
    const {db, keys, isUserAMod, internalEvents, discordClient} = variables;

    route.use(checkAuthentication(keys.public, false));
    
    route.post('/new', async (req, res) => {
        const { title } = req.body;
        console.log(req.body);
        if (!title) return res.status(400).json({ error: 'Missing required fields' });

        const userID = req.user.id;


        const userOpenTickets = await db.getOpenTicketByOwner(req.user.id);
        if (userOpenTickets.rows.length > 0) return res.status(400).json({ error: 'You already have an open ticket' });

        const ticket = await db.createNewTicket(userID, title);
        res.json({UUID: ticket.rows[0].ticketid, title, userID});
        internalEvents.emit('newOrderRequest');
    });

    route.get('/:UUID', async (req, res) => {
        const { UUID } = req.params;
        const ticket = await db.getTicketById(UUID);
        if (!ticket.rows[0] || (ticket.rows[0].owner != req.user.id && !req.user.isMod)) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket.rows[0]);
    });

    route.get('/', async (req, res) => {
        const ticket = await db.getOpenTicketByOwner(req.user.id);
        if (!ticket.rows[0] || ticket.rows[0].owner != req.user.id) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket.rows[0]);
    });


    route.get('/messages/:UUID/:page', async (req, res) => {
        const { page, UUID } = req.params;
        if (!page || !UUID) return res.status(400).json({ error: 'Missing required fields' });
        
        const messages = await db.getOrderedCommentsByCreatedAtPageNumber(UUID, page, 50);

        const arrayForUser = [];
        for (let index = 0; index < messages.rows.length; index++) {
            const element = messages.rows[index];
            const author = await discordClient.getOrFetch(element.author);

            arrayForUser.push({
                id: element.ticketID,
                content: element.comment,
                timestamp: element.created_at,
                author,
                deleted: element.deleted,
                edited: element.edited
            });
        };

        res.json(arrayForUser);
    });


    return route;
};


module.exports = rawRouteTicket;