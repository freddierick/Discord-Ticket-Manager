// Create a discord oauth2 login express route 
const route = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const checkAuthentication = require('../jwtCheck');

const rawRouteTicket = async (variables) => {
    const {db, keys, isUserAMod, discordClient, internalEvents} = variables;

    route.use(checkAuthentication(keys.public, true));
    

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
                state: element.state,
                name: element.name,
                owner: owner,
                name: element.name,
                created_at: element.created_at,
            });
        };

        res.json(arrayForUser);
    });

    route.put('/ticket/:UUID/:state', async (req, res) => {
        const { UUID, state } = req.params;
        if (!UUID || !state) return res.status(400).json({ error: 'Missing required fields' });

        const ticket = await db.getTicketById(UUID);
        if (!ticket.rows[0]) return res.status(404).json({ error: 'Ticket not found' });
        // const ticket = await db.closeTicket(UUID);
        
        await db.updateTicketState(UUID, state);

        internalEvents.emit('ticketStateChange', {
            ticketID: UUID,
            state: state
        });

        res.json();
    });
    
    route.post('/application', async (req, res) => {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Missing required fields' });
        crypto.randomBytes(48, async function(err, buffer) {
            const token = buffer.toString('hex');
            await db.crateApplication(req.user.id, name, token);
            res.json({token});
          });
    });

    route.get('/application', async (req, res) => {
        const applications = await db.getAllApplications();
        res.json(applications.rows);
    });

    route.put('/application/:uuid', async (req, res) => {
        const { uuid } = req.params;
        if (!uuid) return res.status(400).json({ error: 'Missing required fields' });

        crypto.randomBytes(48, async function(err, buffer) {
            const token = buffer.toString('hex');
            await db.refreshApplicationToken(uuid, token);
            res.json({token});
          });
    });

    route.delete('/application:uuid', async (req, res) => {
        const { uuid } = req.params;
        if (!uuid) return res.status(400).json({ error: 'Missing required fields' });
        const applicationData = await db.getApplicationByToken(uuid);
        if (!applicationData.rows[0]) return res.status(404).json({ error: 'Application not found' });
        await db.deleteApplication(uuid);
        res.json(applications);
    });

    return route;
};


module.exports = rawRouteTicket;