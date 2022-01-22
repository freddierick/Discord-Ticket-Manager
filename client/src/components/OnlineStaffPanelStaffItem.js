//create new react class component named Message
import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

import { Link } from "react-router-dom";

import { admin } from "../apiManager";

import { WS_API_URL } from '../apiManager';


class OnlineStaffPanelStaffItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            props
        };
    };

    render(){
        return (
            <>
                <Card className="onlineStaffItem">
                    <Card.Body className="onlineStaffItemInner">
                        <Card.Text>
                            {this.state.props.staff.user.username}
                            <img className="profile-picture-small" src={this.state.props.staff.user.avatarURL} alt="Avatar" />
                            
                        </Card.Text>
                    </Card.Body>
                </Card>
            </>
        ) 
    };
};

export default OnlineStaffPanelStaffItem;