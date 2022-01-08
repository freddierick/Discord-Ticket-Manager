require('dotenv').config();
const discord = require('discord.js');
const express = require('express');
const expressWs = require('express-ws');
const Events = require('events');

const databaseInstigate = require('./database/interface');
const getOrCreateKeys = require('./keyManager');

const rawRouteAuthentication = require('./routes/authentication');
const rawRouteTickets = require('./routes/ticket');
const rawRouteAdmin = require('./routes/admin');

const app = express();
expressWs(app);

const main = async () => {
    const internalEvents = new Events();

    const discordClient = new discord.Client();
    discordClient.login(process.env.DISCORD_TOKEN);
    discordClient.on('ready', () => { 
        console.log(`Discord client logged in as ${discordClient.user.tag}`);
    });
    const isUserAMod = async (userID) => {
        const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD);
        const member = await guild.members.fetch(userID);
        return member.roles.cache.has(process.env.DISCORD_STAFF_ROLES);
    };

    const db = await databaseInstigate();

    const tickets = await db.getTickets();

    console.log(`Loaded ${tickets.rows.length} tickets`);

    const keys = await getOrCreateKeys();
    
    // console.log(keys);
    const api = express.Router();
    
    const routeAuthentication = await rawRouteAuthentication({db, keys, isUserAMod});
    api.use('/authentication', routeAuthentication);

    const routeTickets = await rawRouteTickets({db, keys, isUserAMod, internalEvents});
    api.use('/tickets', routeTickets);

    const routeAdmin = await rawRouteAdmin({db, keys, isUserAMod, internalEvents});
    api.use('/tickets', routeAdmin);

    app.use('/api', api);

    app.listen(process.env.API_PORT, () => 
        console.log(`API listening on port ${process.env.API_PORT}`)
    );
};

main();

// http://192.168.0.27:3001/api/authentication/create