const API_URL = 'http://192.168.0.27:3001/api';
const WS_API_URL = '192.168.0.27:3001/api';
const BASE_URL = 'http://192.168.0.27:3000';

// const API_URL = 'http://api.test.home.freddie.pw/api';
// const WS_API_URL = 'api.test.home.freddie.pw/api';
// const BASE_URL = 'http://app.test.home.freddie.pw';


async function request(URI, options = {}) {
    console.log({ headers: {authorization: 'Bearer ' + localStorage.getItem('Authentication'), 'Content-Type': 'application/json' }, ...options})
    const requestRes = await fetch(`${API_URL}${URI}`, { headers: {authorization: 'Bearer ' + localStorage.getItem('Authentication'), 'Content-Type': 'application/json'}, ...options});
    const response = await requestRes.json();
    return {
        statusCode: requestRes.status,
        statusText: requestRes.statusText,
        body: response
    };
};


const user = {
    getTicket: () => request(`/tickets`),
    getTicketByID: (uuid) => request(`/tickets/${uuid}`),
    createTicket: (ticketName) => request(`/tickets/new`, { method: 'POST', body: JSON.stringify({title: ticketName}) }),
    getTicketMessages: (ticketID, pageNumber = 0) => request(`/tickets/messages/${ticketID}/${pageNumber}`),
};

const admin = {
    getTickets: (page = 0) => request(`/admin/tickets/${page}`),

    getApplications: () => request(`/admin/application`),
    createApplication: (name) => request(`/admin/application`, { method: 'POST', body: JSON.stringify({name: name}) }),
    refreshApplicationToken: (uuid) => request(`/admin/application/${uuid}`, { method: 'PUT' }),
    deleteApplication: (uuid) => request(`/admin/application/${uuid}`, { method: 'DELETE' }),

    updateTicketState: (uuid, state) => request(`/admin/ticket/${uuid}/${state}`, { method: 'PUT' }),
}

module.exports = {
    API_URL,
    BASE_URL,
    WS_API_URL,
    user,
    admin
};