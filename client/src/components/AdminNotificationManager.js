//create new react class component named Message
import React from "react";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Navigate } from 'react-router-dom';
import 'react-notifications/lib/notifications.css';

import { WS_API_URL } from '../apiManager';

class AdminNotificationManager extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            redirect: null
        }
    };

    componentDidMount() {
        this.ws = new WebSocket(`ws://${WS_API_URL}/ws/admin/notifications?token=${localStorage.getItem('Authentication')}`);

        this.ws.onopen = async () => { 
            console.log("Connected to websocket");
        };
        

        this.ws.onmessage = (data) => {
            const message = JSON.parse(data.data);
            let functionClick = () => {};
            if (message.link) functionClick = () => { this.setState({ redirect: message.link }) };
            NotificationManager[message.type](message.message, message.title, message.ttl, functionClick);
        };


        this.ws.onclose = (data) => {
            console.log("Disconnected from websocket", data);
        };
    };
    componentDidUpdate(){
        if (this.state.redirect) this.setState({ redirect: null });
    };

    render(){
        if (this.state.redirect) 
            return <Navigate to={this.state.redirect} />;
        return (
            <> </>
        );
    };
};

export default AdminNotificationManager;