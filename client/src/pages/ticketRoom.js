import React from "react";
import { v4 } from "uuid";
import jwt from 'jwt-decode';

import {
    Navigate,
    Link,
    useSearchParams,
    useParams
} from "react-router-dom";
import { admin, user, API_URL, WS_API_URL } from '../apiManager';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Message from '../components/Message';


function withParams(Component) {
    return props => <Room {...props} params={useParams()} />;
  }

class Room extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.ticketID = this.props.params.uuid;


        this.state = {
            loading: true,

            messages: [],
            messageMap: new Map(),

            ticket: {},
        };
        this.ws = null;

        this.userData = jwt(localStorage.getItem('Authentication'));

    };

    sendMessage(message) {
        this.ws.send(JSON.stringify({
            c: 'SEND_MESSAGE',
            p: {
                content: message,
            },
            j: v4()
        }));
    };

    async componentDidMount() {
        this.ws = new WebSocket(`ws://${WS_API_URL}/ws/ticket/${this.ticketID}?token=${localStorage.getItem('Authentication')}`);

        this.ws.onopen = () => { 
            console.log("Connected to websocket");
        };
        

        this.ws.onmessage = (data) => {
            const message = JSON.parse(data.data);
            console.log(message);
            this.state.messageMap.set(message.uuid, message);
            this.state.messages.push(message);
            this.setState({ messages: this.state.messages });
            document.getElementsByClassName('messages')[0].scrollTop = document.getElementsByClassName('messages')[0].scrollHeight;
        };


        this.ws.onclose = (data) => {
            console.log("Disconnected from websocket", data);
        };


        const ticketMetaData = await user.getTicketByID(this.ticketID);

        const ticketPastMessageData = await user.getTicketMessages(this.ticketID, 0);

        ticketPastMessageData.body.forEach(message => {
            this.state.messageMap.set(message.uuid, message);
            this.state.messages.push(message);
        });

        this.state.messages = this.state.messages.reverse();
        this.setState({ loading: false, ticket: ticketMetaData.body,  });
        //scroll to the bottom of the messages class 

        document.getElementsByClassName('messages')[0].scrollTop = document.getElementsByClassName('messages')[0].scrollHeight;
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
                <h2>Ticket: {this.state.ticket.name}</h2>

                <section className="messages">
                    {this.state.messages.map((message, index) => ( <Message ownMessage={this.userData.id === message.author.id} message={message}/> ))}
                </section>

                <br />
                <br />
                <br />

                <Form.Label htmlFor="TicketName">MSG</Form.Label>
                <Form.Control
                    type="text"
                    id="TicketName"
                    aria-describedby="TicketNameBlock"
                />
                <Form.Text value={this.state.ticketName} id="TicketNameBlock" muted>
                    Msg:
                </Form.Text>
                <br />
                <Button onClick={() => {this.sendMessage(document.getElementById('TicketName').value)}} variant="primary">Send!</Button>
            </>
        );

    };
};

export default withParams(Room);










// import WebSocket from 'ws';

// const ws = new WebSocket('ws://www.host.com/path');

// ws.on('open', function open() {
//   ws.send('something');
// });

// ws.on('message', function message(data) {
//   console.log('received: %s', data);
// });