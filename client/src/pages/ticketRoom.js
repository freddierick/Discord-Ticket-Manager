import React from "react";
import { v4 } from "uuid";
import jwt from 'jwt-decode';
import { BrowserView, MobileView } from 'react-device-detect';
import cloneDeep from 'lodash/cloneDeep';

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
import BreakForDay from '../components/BreakForDay';


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

            messagePageRequested: 0,
            loadingMoreMessages: false,
            messagePageNoMoreFound: false,
        };

        this.ws = null;

        this.keyTracker = new Map();

        this.userData = jwt(localStorage.getItem('Authentication'));

    };

    sendMessage(message) {
        document.getElementById('CommentInput').value = '';
        this.ws.send(JSON.stringify({
            c: 'SEND_MESSAGE',
            p: {
                content: message,
            },
            j: v4()
        }));
    };

    //A function that calculates where breaks should be placed in the messages
    insertDayBreaks(messages) {
        const newMessages = [];
        let lastDay = null;
        for (let index = 0; index < messages.length; index++) {
            const message = messages[index];
            const timestamp = new Date(message.timestamp);
            const day = timestamp.getDate();
            if (lastDay !== day) {
                newMessages.push({
                    breakForDay: true,
                    timestamp: timestamp,
                });
            }
            newMessages.push(message);
            lastDay = day;
        };
        return newMessages;
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
            document.getElementsByClassName('messagesContainerInner')[0].scrollTop = document.getElementsByClassName('messagesContainerInner')[0].scrollHeight;
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

        

        document.onkeydown = (e) => {
            this.keyTracker.set(e.key, true);
            const message = document.getElementById('CommentInput').value;
            if (e.key === "Enter" && this.keyTracker.get('Shift')) {
                document.getElementById('CommentInput').value = message + '\n';
            } else if (e.key === "Enter" && !this.keyTracker.get('Shift')) {
                this.sendMessage(message);
            };
            console.log(document.getElementById('CommentInput').value)
            console.log(this.keyTracker)
        };
        document.onkeyup = (e) => {
            this.keyTracker.set(e.key, false);
        };

        document.getElementsByClassName('messagesContainerInner')[0].scrollTop = document.getElementsByClassName('messagesContainerInner')[0].scrollHeight;

        const externalThis = this;

        document.getElementsByClassName('messagesContainerInner')[0].addEventListener('scroll', async function(e) {
            if (e.target.scrollTop === 0 && externalThis.state.messagePageNoMoreFound === false && externalThis.state.loadingMoreMessages === false) {
                externalThis.setState({ loadingMoreMessages: true });
                const anchorMessage = externalThis.state.messages[0];

                const moreTicketPastMessageData = await user.getTicketMessages(externalThis.ticketID, externalThis.state.messagePageRequested + 1);

                if (moreTicketPastMessageData.body.length > 0) {

                    moreTicketPastMessageData.body.forEach(message => {
                        externalThis.state.messageMap.set(message.uuid, message);
                    });
            
                    externalThis.setState({ messagePageRequested: externalThis.state.messagePageRequested + 1, loadingMoreMessages: false,  messages: [...moreTicketPastMessageData.body.reverse(), ...externalThis.state.messages]});
                    document.getElementById(`message-${anchorMessage.id}`).scrollIntoView();
                } else {
                    externalThis.setState({ messagePageNoMoreFound: true, loadingMoreMessages: false });
                };
            };
          });
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

        const messages = this.insertDayBreaks(this.state.messages);

        return (
            <>
                <h1>Welcome to TicketMaster</h1>
                <h2>Ticket: {this.state.ticket.name}</h2>

                <div className="chat-container">
					<div className="chat-messages p-4 messagesContainerInner">
                        { this.state.loadingMoreMessages ? <div className="lds-facebook" /> : <div /> }
                        {messages.map((message, index) => 
                            // Displays message or a break for day
                            message.breakForDay ? 
                                <BreakForDay timestamp={message.timestamp}/>
                            : 
                                <Message ownMessage={this.userData.id === message.author.id} message={message} ticket={this.state.ticket}/> 
                            )
                        }
                    </div>

                    <BrowserView>
                        <div className="messageSendInput">
                            <Form.Control
                                type="text"
                                id="CommentInput"
                                aria-describedby="TicketNameBlock"
                                placeholder={`Message #${this.state.ticket.name}`}
                            />
                        </div>
                    </BrowserView>
                    <MobileView>
                    <div className="messageSendInputMobile">
                    <div class="input-group">
                        <Form.Control
                                    type="text"
                                    id="CommentInput"
                                    aria-describedby="TicketNameBlock"
                                    placeholder={`Message #${this.state.ticket.name}`}
                                />
                        <Button onClick={() => this.sendMessage(document.getElementById('CommentInput').value)}>Send</Button>
                    </div>
                            
                        </div>
                    </MobileView>
                    
                    <br />

                    </div>
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