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
    });
};


module.exports = internalEventsManager;