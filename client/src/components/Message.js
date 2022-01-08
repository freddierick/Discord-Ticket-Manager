//create new react class component named Message
import React from "react";

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    };
    render(){
        if (this.props.ownMessage) 
            return (
                <div className="message-container message-darker">
                    <img src={this.props.message.author.displayAvatarURL} alt="Avatar" class="right" />
                    <h6 class="right">{`${this.props.message.author.username}`}</h6>
                    <p>{this.props.message.content}</p>
                    <span class="message-time-left">{new Date(this.props.message.timestamp).toUTCString()}</span>
                </div>
                );
        else
            return (
                <div className="message-container">
                    <img src={this.props.message.author.displayAvatarURL} alt="Avatar" />
                    <h6>{`${this.props.message.author.username}`}</h6>
                    <p>{this.props.message.content}</p>
                    <span class="message-time-right">{new Date(this.props.message.timestamp).toUTCString()}</span>
                </div>
                );
    };
};

export default Message;