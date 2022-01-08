// Create a discord oauth2 login express route 
const route = require('express').Router();
const jwt = require('jsonwebtoken');

const checkAuthentication = require('../jwtCheck');

const rawRouteTicket = async (variables) => {
    const {db, keys, isUserAMod, discordClient, internalEvents} = variables;

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
        
        const tickets = await db.getOrderedTicketsByCreatedAtPageNumber(page, 50);

        const arrayForUser = [];
        for (let index = 0; index < tickets.rows.length; index++) {
            const element = tickets.rows[index];
            const owner = await discordClient.getOrFetch(element.owner);

            arrayForUser.push({
                id: element.ticketid,
                owner: owner,
                name: element.name,
                created_at: element.created_at,
            });
        };

        res.json(arrayForUser);
    });

    route.put('/:UUID/:state', async (req, res) => {
        const { UUID, state } = req.params;
        if (!UUID || !state) return res.status(400).json({ error: 'Missing required fields' });

        const ticket = await db.getTicketByUUID(UUID);
        if (!ticket.rows[0]) return res.status(404).json({ error: 'Ticket not found' });
        // const ticket = await db.closeTicket(UUID);
        
        await db.updateTicketState(UUID, state);

        internalEvents.emit('ticketStateChange', {
            ticketID: UUID,
            state: state
        });

        res.json();
    });
    

    return route;
};


module.exports = rawRouteTicket;