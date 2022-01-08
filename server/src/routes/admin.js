// Create a discord oauth2 login express route 
const route = require('express').Router();
const jwt = require('jsonwebtoken');

const checkAuthentication = require('../jwtCheck');

const rawRouteTicket = async (variables) => {
    const {db, keys, isUserAMod} = variables;

    route.use(checkAuthentication(keys.public, true));
    
    route.get('/:UUID', async (req, res) => {
        const { UUID } = req.params;
        const ticket = await db.getTicketByUUID(UUID);
        if (!ticket.rows[0]) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket.rows[0]);
    });

    route.ws('/:UUID/ws', async (ws, req) => {
        const { UUID } = req.params;

    });

    route.get('/tickets/:page', async (req, res) => {
        const { page } = req.params;
        if (!page) return res.status(400).json({ error: 'Missing required fields' });
        
        const tickets = await db.getOrderedTicketsByCreatedAtPageNumber(page);
        res.json(tickets.rows);
    })

    return route;
};


module.exports = rawRouteTicket;