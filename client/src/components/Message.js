//create new react class component named Message
import React from "react";
import Form from 'react-bootstrap/Form';
import { NotificationManager } from 'react-notifications';

import MessageOptions from './MessageOptions';


class Message extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        console.log(this.props.ticket)
        this.editMessage = this.editMessage.bind(this);
        this.copyMessageId = this.copyMessageId.bind(this);
        this.copyMessageLink = this.copyMessageLink.bind(this);

        this.state = {
            editing: false,
            newMessage: this.props.message.content
        };

        this.enterListener = null;

        this.timestamp = new Date(this.props.message.timestamp);
    };
    componentDidUpdate() {
        this.enterListener = document.getElementById(`CommentInput-${this.props.message.id}`);

    };

    copyText(text, title) {
        try {
            navigator.clipboard.writeText(text);
            NotificationManager.success(`${title} copied to clipboard!`);
        } catch (e) {
            NotificationManager.error(`This may because you have your api and app running on different origins!`, `Failed to copy ${text}`);
        };
    };

    textTimestamp(timestamp) {
        function make2(data) {
            const strData = data.toString();
            if (strData.length < 2) return '0' + strData;
            return strData;
        };
        return make2(timestamp.getHours()) + ":" + make2(timestamp.getMinutes());
    };

    //message 'settings' functions (edit, delete)
    editMessage() {
        this.setState({editing: true});
    };

    copyMessageId() {
        this.copyText(this.props.message.id, 'Message ID');
    };

    copyMessageLink() {
        this.copyText(`${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ``}/ticket/${this.props.ticket.ticketid}/${this.props.message.id}`, 'Message Link');
    };


    render() {
        if (this.props.ownMessage)
            return (
                <div className="chat-message-right pb-4">
                    <div>
                        <img src={this.props.message.author.displayAvatarURL} className="rounded-circle mr-1" alt={this.props.message.author.username + ' avatar'} width="40" height="40" />
                        <div className="text-muted small text-nowrap mt-2">{this.textTimestamp(this.timestamp)}</div>
                    </div>
                    <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                        <MessageOptions edit={this.editMessage} copyId={this.copyMessageId} copyLink={this.copyMessageLink} />
                        <div className="font-weight-bold mb-1">{this.props.message.author.username}</div>
                        <div className="message-content">
                            {this.state.editing ? 
                                <Form.Control
                                    type="text"
                                    id={`CommentInput-${this.props.message.id}`}
                                    aria-describedby="TicketNameBlock"
                                    onChange={(e) => this.setState({newMessage: e.target.value})}
                                    value={this.state.newMessage} 
                                />
                            :
                                this.props.message.content
                            }
                        </div>
                    </div>
                </div>
            );
        else
            return (
                <div className="chat-message-left pb-4">
                    <div>
                        <img src={this.props.message.author.displayAvatarURL} className="rounded-circle mr-1" alt={this.props.message.author.username + ' avatar'} width="40" height="40" />
                        <div className="text-muted small text-nowrap mt-2">{this.textTimestamp(this.timestamp)}</div>
                    </div>
                    <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                        <div className="font-weight-bold mb-1">{this.props.message.author.username}</div>
                        <div className="message-content">
                            {this.props.message.content}
                        </div>                    
                    </div>                    
                </div>

            );
    };
};


export default Message;