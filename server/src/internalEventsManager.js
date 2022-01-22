// const message = {
//     id: ''
//     author: {

//     },
//     content: "",
//     timestamp: "",
//     deleted: false,
//     edited: false
// };

const internalEventsManager = async (variables) => {
    const {db, keys, internalEvents, discordClient} = variables;
    const guild = await discordClient.guilds.fetch(process.env.DISCORD_GUILD);
    const role = await guild.roles.fetch(process.env.DISCORD_STAFF_ROLES);
    const staffMap = new Map();
    const staff = Array.from(role.members).map(member => { staffMap.set(member.id, member) ; return {status: 'offline', ...member} });

    internalEvents.on('newMessage', async (data) => {
        const { ticketID, payload, userID, jobID } = data;
        // Does payload have content?
        if (!payload.content) return;

        const dbResponse = await db.createNewComment(ticketID, userID, payload.content );
        const messageDb = dbResponse.rows[0];

        const author = await discordClient.getOrFetch(userID);

        console.log(messageDb);

        const message = {
            id: messageDb.commentid,
            author,
            content: payload.content,
            timestamp: messageDb.created_at,
            deleted: false,
            edited: false,
            jobID
        };

        internalEvents.emit('dispatchRoomMessage', { ticketID, payload: message });
        internalEvents.emit('newOrderRequest');

        internalEvents.emit('adminNotification', {
            type: 'info',
            message: payload.content,
            title: author.username,
            ttl: 3000,
            link: `/ticket/${ticketID}`
        });

    });

    internalEvents.on('newOrderRequest', async () => {
        const tickets = await db.getOrderedTickets();
        const arrayForUser = [];
        for (let index = 0; index < tickets.rows.length; index++) {
            const element = tickets.rows[index];
            console.log(element)
            const owner = await discordClient.getOrFetch(element.owner);
            console.log(element)
            arrayForUser.push({
                id: element.ticketid,
                state: element.state,
                owner,
                name: element.name,
                created_at: element.created_at,
            });
        };
        internalEvents.emit('newOrderResponse', arrayForUser);
    });
    

    internalEvents.on('staffStatusUpdate', (data) => {
        const { userID, status } = data;
        staffMap.set(userID, {status, ...staffMap.get(userID)});

        internalEvents.emit('dispatchStaffStatusUpdate', staff);
        console.log(staffMap);
    });

    internalEvents.on('roomStatusUpdate', (data) => {
        const { userID, status } = data;
        staffMap.set(userID, {status, ...staffMap.get(userID)});

        internalEvents.emit('dispatchStaffStatusUpdate', staff);
        console.log(staffMap);
    });
};


module.exports = internalEventsManager;