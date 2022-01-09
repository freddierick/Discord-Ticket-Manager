require('dotenv').config();
const discord = require('discord.js');
const express = require('express');
const expressWs = require('express-ws');
const Events = require('events');
const cors = require('cors');
const bodyParser = require('body-parser')
const databaseInstigate = require('./database/interface');
const getOrCreateKeys = require('./keyManager');

const rawRouteAuthentication = require('./routes/authentication');
const rawRouteTickets = require('./routes/ticket');
const rawRouteAdmin = require('./routes/admin');
const rawRouteWs = require('./routes/ws');
const rawRouteExternalApplication = require('./routes/externalApplication');

const rawInternalEventsManager = require('./internalEventsManager');

const app = express();
expressWs(app);

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

const main = async () => {
    const internalEvents = new Events();

    const discordClient = new discord.Client();
    discordClient.login(process.env.DISCORD_TOKEN);
    discordClient.on('ready', () => { 
        console.log(`Discord client logged in as ${discordClient.user.tag}`);
    });
    discordClient.getOrFetch = async (userID) => { 
        let user = discordClient.users.cache.get(userID);
        if (!user) 
            user = await discordClient.users.fetch(userID);
        return user;
    };
    const isUserAMod = async (userID) => {
        if (userID == "692374412703432804") return false;
        const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD);
        const member = await guild.members.fetch(userID);
        return member.roles.cache.has(process.env.DISCORD_STAFF_ROLES);
    };

    const db = await databaseInstigate();

    const tickets = await db.getTickets();

    console.log(`Loaded ${tickets.rows.length} tickets`);

    const keys = await getOrCreateKeys();
    
    // Create event manager
    await rawInternalEventsManager({db, keys, internalEvents, discordClient});

    // console.log(keys);
    const api = express.Router();
    
    const routeAuthentication = await rawRouteAuthentication({db, keys, isUserAMod});
    api.use('/authentication', routeAuthentication);

    const routeTickets = await rawRouteTickets({db, keys, isUserAMod, internalEvents, discordClient});
    api.use('/tickets', routeTickets);

    const routeAdmin = await rawRouteAdmin({db, keys, isUserAMod, internalEvents, discordClient});
    api.use('/admin', routeAdmin);

    const routeWs = await rawRouteWs({db, keys, isUserAMod, internalEvents});
    api.use('/ws', routeWs);

    const routeExternalApplication = await rawRouteExternalApplication({db, keys, isUserAMod, internalEvents});
    api.use('/external', routeExternalApplication);

    app.use('/api', api);

    app.listen(process.env.API_PORT, () => 
        console.log(`API listening on port ${process.env.API_PORT}`)
    );
};

main();

// http://192.168.0.27:3001/api/authentication/create