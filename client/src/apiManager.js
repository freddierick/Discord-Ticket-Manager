const API_URL = 'http://192.168.0.27:3001/api';
const BASE_URL = 'http://192.168.0.27:3000';

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
    createTicket: (ticketName) => request(`/tickets/new`, { method: 'POST', body: JSON.stringify({title: ticketName}) }),
};

const admin = {

}

module.exports = {
    API_URL,
    BASE_URL,
    user,
    admin
};