import React from "react";
import {
    Navigate,
    Link
} from "react-router-dom";
import { admin, WS_API_URL } from '../../apiManager';

import Table from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import ApplicationManagement from '../../components/ApplicationManagement';

class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            tickets: '',
            redirect: null,
            showApplicationManagementPanel: false
        };
    };

    async componentDidMount() {
        // console.log("Home component mounted");
        // const ticketData = await admin.getTickets(0);
        // if (ticketData.statusCode === 200) {
        //     console.log(ticketData, "TICKET DATA");
        //     this.setState({ tickets: ticketData.body, loading: false });
        // };

        this.ws = new WebSocket(`ws://${WS_API_URL}/ws/admin/home?token=${localStorage.getItem('Authentication')}`);

        this.ws.onopen = async () => { 
            console.log("Connected to websocket");
            this.ws.send('Requesting tickets');
        };
        

        this.ws.onmessage = (data) => {
            const message = JSON.parse(data.data);
            this.setState({ tickets: message, loading: false });
        };


        this.ws.onclose = (data) => {
            console.log("Disconnected from websocket", data);
        };
    };


    async openTicket(ID){
        // const ticketName = document.getElementById('TicketName').value;
        // console.log(ticketName, "TEST", JSON.stringify({title: ticketName}));
        // const newTicketData = await user.createTicket(ticketName);
        // this.setState({ redirect: `/ticket/${newTicketData.ticketid}` });
    };

    render() {
        if (this.state.redirect) 
            return <Navigate to={this.state.redirect} />;

        if (this.state.loading)
            return (
                <>
                    <h1>Loading...</h1>
                </>
            );

        return (
            <>
                <ApplicationManagement show={this.state.showApplicationManagementPanel} />

                <h1>Welcome to TicketMaster Staff Panel</h1>
                <h2>Open tickets</h2>
                <Button variant="danger" onClick={() => this.setState({ showApplicationManagementPanel: true})}>Application Manager</Button>
                
                {/* Center this table */}
                {/* <Table className="mx-auto" striped bordered hover> */}
                <Table className="center-table" responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <td>Owner</td>
                            <td>#</td>
                            <td>Open</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.tickets.map((ticket, index) => (
                            <tr key={index}>
                                <td>{ticket.id}</td>
                                <td>{ticket.name}</td>
                                <img className="profile-picture" src={ticket.owner.displayAvatarURL} alt="Avatar" />
                                <td>{`${ticket.owner.username}#${ticket.owner.discriminator}`}</td>
                                <td><Link to={`/ticket/${ticket.id}`}><Button>Open</Button></Link></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>



            </>
        );

    };
};


export default Home;