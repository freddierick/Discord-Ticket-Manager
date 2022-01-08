//create new react class component named Message
import React from "react";
import { Navigate } from "react-router-dom";

import TicketRoom from "../ticketRoom";
import Button from 'react-bootstrap/Button';

class AdminTicketRoom extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            redirect: null
        }
    };

    goHome() {
        this.setState({ redirect: "/" });
    };

    render() {
        if (this.state.redirect) 
            return <Navigate to={this.state.redirect} />;

        return (
            <>
                <Button variant="danger" onClick={() => this.goHome()}>Back</Button>
                <TicketRoom />
            </>
        )
    };
};

export default AdminTicketRoom;