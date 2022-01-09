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
    });

    internalEvents.on('newOrderRequest', async () => {
        const tickets = await db.getOrderedTickets();
        const arrayForUser = [];
        for (let index = 0; index < tickets.rows.length; index++) {
            const element = tickets.rows[index];
            console.log(element)
            const owner = await discordClient.getOrFetch(element.owner);

            arrayForUser.push({
                id: element.ticketid,
                owner,
                name: element.name,
                created_at: element.created_at,
            });
        };
        internalEvents.emit('newOrderResponse', arrayForUser);
    });
    
};


module.exports = internalEventsManager;