const { Pool } = require('pg');
const fs = require('fs');

const instigate = async () => {
    const pool = new Pool({
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_DATABASE || process.env.PG_USER,
        password: process.env.PG_PASSWORD || null,
        port: process.env.PG_PORT || 5432,
    });

    const query = async (text, params = []) => {
        try {
            const res = await pool.query(text, params);
            return res;
        } catch (e) {
            console.error("DB ERROR", e);
            return { rows: [] };
        };
    }

    const sqlTemplate = await fs.readFileSync(__dirname + '/sqlTemplate.sql', 'utf8');
    const createTables = await query(sqlTemplate);

    return {
        getTickets: () => query('SELECT * FROM tickets'),
        getOrderedTicketsByCreatedAtPageNumber: (pageNumber, count = 10) => query('SELECT * FROM tickets ORDER BY created_at DESC LIMIT $1 OFFSET $2', [count, pageNumber * count]),

        getTicketById: id => query('SELECT * FROM tickets WHERE ticketID = $1', [id]),
        getTicketByOwner: owner => query('SELECT * FROM tickets WHERE owner = $1', [owner]),
        getTicketByState : state => query('SELECT * FROM tickets WHERE state = $1', [state]),

        getOpenTicketByOwner: owner => query('SELECT * FROM tickets WHERE owner = $1 AND state = $2', [owner, 'open']),
        getClosedTicketsByOwner: owner => query('SELECT * FROM tickets WHERE owner = $1 AND state = $2', [owner, 'closed']),

        getCommentsByTicketId: id => query('SELECT * FROM ticket_comments WHERE ticketID = $1', [id]),
        getOrderedCommentsByTicketId: id => query('SELECT * FROM ticket_comments WHERE ticketID = $1 ORDER BY created_at DESC', [id]),
        getOrderedCommentsByCreatedAtPageNumber: (id, page, count = 10) => query('SELECT * FROM ticket_comments WHERE ticketID = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3', [id, page * count, count]),

        createNewTicket: (owner, title) => query('INSERT INTO tickets (owner, name, state) VALUES ($1, $2, $3) RETURNING ticketID', [owner, title, 'open']),
        updateTicket: (id, title, description, state) => query('UPDATE tickets SET title = $1, description = $2, state = $3 WHERE ticketID = $4', [title, description, state, id]),

        closeTicketById: id => query('UPDATE tickets SET state = $1 WHERE ticketID = $2', ['closed', id]),
        closeTicketByOwner: owner => query('UPDATE tickets SET state = $1 WHERE owner = $2', ['closed', owner]),

        createNewComment: (ticketId, author, comment) => query('INSERT INTO ticket_comments (ticketID, author, comment) VALUES ($1, $2, $3) RETURNING commentID, created_at', [ticketId, author, comment]),

        updateTicketState: (id, state) => query('UPDATE tickets SET state = $1 WHERE ticketID = $2', [state, id]),

        getOrderedTickets: () => query('SELECT MAX(ticket_comments.created_at) AS newest, tickets.ticketID, tickets.owner, tickets.state, tickets.name, tickets.created_at FROM tickets LEFT JOIN ticket_comments ON tickets.ticketID = ticket_comments.ticketID GROUP BY tickets.ticketID ORDER BY newest DESC;', []),
    
        crateApplication: (owner, name, token) => query('INSERT INTO applications (owner, name, token) VALUES ($1, $2, $3) RETURNING applicationID', [owner, name, token]),
        refreshApplicationToken: (id, token) => query('UPDATE applications SET token = $1 WHERE applicationID = $2', [token, id]),
        deleteApplication: id => query('DELETE FROM applications WHERE applicationID = $1', [id]),
        getApplicationByToken: token => query('SELECT * FROM applications WHERE token = $1', [token]),
        getAllApplications: () => query('SELECT * FROM applications'),

        createNewApplicationTool: (applicationId, toolName, inputType) => query('INSERT INTO application_tools (applicationID, name, input_type) VALUES ($1, $2, $3) RETURNING toolID', [applicationId, toolName, inputType]),
        deleteApplicationTool: (id) => query('DELETE FROM application_tools WHERE toolID = $1', [id]),
    };
};
// 
// LEFT JOIN ticket_comments
// ON tickets.ticketID = ticket_comments.ticketID
// GROUP BY tickets.ticketID
// ORDER BY newest DESC;



module.exports = instigate;