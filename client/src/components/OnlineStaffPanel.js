//create new react class component named Message
import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import OnlineStaffPanelStaffItem from "./OnlineStaffPanelStaffItem";

import { admin } from "../apiManager";

import { WS_API_URL } from '../apiManager';


class OnlineStaffPanel extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            showModal: false,
            staff: []
        }
    };

    componentDidMount() {
        this.ws = new WebSocket(`ws://${WS_API_URL}/ws/user/status?token=${localStorage.getItem('Authentication')}`);

        this.ws.onopen = async () => { 
            console.log("Connected to status websocket");
            this.ws.send('ping');
        };
        

        this.ws.onmessage = (data) => {
            const message = JSON.parse(data.data);
            this.setState({ staff: message });
        };

        this.ws.onclose = (data) => {
            console.log("Disconnected from staff websocket", data);
        };
    }


    render(){
        return (
            <>
                <div className="onlineStaffButton">
                    <Button onClick={() => {this.setState({showModal: !this.state.showModal})}}>Staff</Button>
                </div>

                <div className="onlineStaffPanel">
                    <Modal
                        show={this.state.showModal}
                        onHide={() => this.setState({ showModal: false })}
                        aria-labelledby="example-modal-sizes-title-lg"
                    >
                        <Modal.Header closeButton>
                        <Modal.Title id="example-modal-sizes-title-lg">
                            Staff
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Online:
                            {this.state.staff.filter(staff => staff.status === "online").map((staff) => <OnlineStaffPanelStaffItem staff={staff}/>)}
                            Offline:
                            {this.state.staff.filter(staff => staff.status === "offline").map((staff) => <OnlineStaffPanelStaffItem staff={staff}/>)}
                        </Modal.Body>
                    </Modal>
                </div>
            </>
        ) 
    };
};

export default OnlineStaffPanel;