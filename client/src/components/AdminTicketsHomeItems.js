//create new react class component named Message
import React from "react";
import {Link } from "react-router-dom";

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            props,
        };
    };

    componentWillReceiveProps(nextProps) {
        this.setState({ props: nextProps });
    };

    render(){
        console.log(this.state.props.ticket, "props");
        return (
        <>
            <Card className="ticketListItem">
                <Card.Body className={`ticketListItemInner ${this.state.props.ticket.state === "closed" ? 'boarderRed' : ''}`}>
                    <Card.Title>{this.state.props.ticket.owner.tag}</Card.Title>
                    
                    <Card.Subtitle> <img className="profile-picture" src={this.state.props.ticket.owner.displayAvatarURL} alt="Avatar" /> </Card.Subtitle>
                    <Card.Text> 
                        <Card.Subtitle className="mb-2 text-muted">{new Date(this.state.props.ticket.created_at).toUTCString()}</Card.Subtitle>
                        {this.state.props.ticket.name}
                    </Card.Text>
                    <Card.Link><Link to={`/ticket/${this.state.props.ticket.id}`}><Button variant="success">Open</Button></Link></Card.Link>
                    <Card.Link><Link to={`/ticket/${this.state.props.ticket.id}#manage`}><Button variant="info">Manage</Button></Link></Card.Link>

                </Card.Body>
            </Card>
        </>
        )
    };
};

export default Message;