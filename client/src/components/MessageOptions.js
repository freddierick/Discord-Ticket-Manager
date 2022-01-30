//create new react class component named Message
import React from "react";

class MessageOptions extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    };

    editMessage() {
        this.props.edit();
    };

    copyId() {
        this.props.copyId();
    };

    copyLink() {
        this.props.copyLink();
    };

    render() {
        return (
            <div class="dropdown">
                <div class="dropbtn"></div>
                <div class="dropdown-content">
                    <a onClick={() => this.editMessage()}>Edit</a>
                    <a onClick={() => this.copyId()}>Copy Id</a>
                    <a onClick={() => this.copyLink()}>Copy Message Link</a>
                </div>
            </div>
            );
    };
};

export default MessageOptions;