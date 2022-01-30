//create new react class component named Message
import React from "react";

class BreakForDay extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    };
    render() {
        return (
                <div className="chat-message-center pb-4">
                    <div class="separator">{`${this.props.timestamp.getDate()} ${this.month[this.props.timestamp.getMonth()]} ${this.props.timestamp.getFullYear()}`}</div>
                </div>
            );
    };
};

export default BreakForDay;