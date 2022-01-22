//create new react class component named Message
import React from "react";
import { Navigate, useParams } from "react-router-dom";

import TicketRoom from "../ticketRoom";
import Button from 'react-bootstrap/Button';
import TicketOptions from '../../components/TicketOptions';

function withParams(Component) {
    return props => <AdminTicketRoom {...props} params={useParams()} />;
};

class AdminTicketRoom extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        console.log(this.props, "props");
        this.state = {
            redirect: null,
            showOptions: document.location.href.includes("manage")
        };

        this.openOptionsModal = this.openOptionsModal.bind(this);
    };

    goHome() {
        this.setState({ redirect: "/" });
    };

    openOptionsModal() {
        this.setState(state => ({
            showOptions: true
          }));
    };


    render() {
        if (this.state.redirect) 
            return <Navigate to={this.state.redirect} />;

        return (
            <>
                <TicketOptions show={this.state.showOptions} />
                <Button variant="danger" onClick={() => this.goHome()}>Back</Button>
                <Button variant="danger" onClick={() => this.openOptionsModal()}>showOptions</Button>
                <TicketRoom {...this.props} />
            </>
        )
    };
};

export default withParams(AdminTicketRoom);