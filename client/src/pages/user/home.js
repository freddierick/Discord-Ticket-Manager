import React from "react";
import {
    Navigate
} from "react-router-dom";
import { BASE_URL, user } from '../../apiManager';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true,
            ticketName: '',
            redirect: null
        };
    };

    async componentDidMount() {
        console.log("Home component mounted");
        const ticketData = await user.getTicket();
        if (ticketData.statusCode === 200) {
            this.setState({ redirect: `/ticket/${ticketData.data.ticketid}` });
        } else if (ticketData.statusCode === 404) {
            this.setState({
                loading: false,
            });
        };
    };


    async openTicket(){
        const ticketName = document.getElementById('TicketName').value;
        console.log(ticketName, "TEST", JSON.stringify({title: ticketName}));
        const newTicketData = await user.createTicket(ticketName);
        this.setState({ redirect: `/ticket/${newTicketData.ticketid}` });
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
                <h1>Welcome to TicketMaster</h1>
                <h2>Please enter the title of the ticket you wish to open...</h2>
                <Form.Label htmlFor="TicketName">Ticket Name</Form.Label>
                <Form.Control
                    type="text"
                    id="TicketName"
                    aria-describedby="TicketNameBlock"
                />
                <Form.Text value={this.state.ticketName} id="TicketNameBlock" muted>
                    Enter a name for your ticket
                </Form.Text>
                <br />
                <Button onClick={() => {this.openTicket()}} variant="primary">Open!</Button>
            </>
        );

    };
};


export default Home;