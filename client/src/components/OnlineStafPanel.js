//create new react class component named Message
import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { admin } from "../apiManager";


class OnlineStaffPanel extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        console.log(this.props, "props2");
        this.state = {
            showModal: this.props.show,
            ticketID: this.props.params.uuid
        }
    };

    componentWillReceiveProps(nextProps) {
        this.setState({ showModal: nextProps.show });
    };

    async closeTicket() {
        await admin.updateTicketState(this.props.params.uuid, 'closed');
    }

    render(){
        return (
            <div className="message-container">
                <Modal
                    size="lg"
                    show={this.state.showModal}
                    onHide={() => this.setState({ showModal: false })}
                    aria-labelledby="example-modal-sizes-title-lg"
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        Ticket Options
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Ticket options go here
                        <Button onClick={() => {this.closeTicket()}} variant="danger">Lock</Button>
                        <Button onClick={() => {this.closeTicket()}} variant="danger">Close</Button>

                    </Modal.Body>
                </Modal>
            </div>
        ) 
    };
};

export default OnlineStaffPanel;