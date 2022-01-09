//create new react class component named Message
import React from "react";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import jwt from 'jwt-decode';
import { NotificationManager } from 'react-notifications';

import { admin } from "../apiManager";

class TicketOptions extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            showModal: this.props.show,
            applications: []
        }
    };

    componentWillReceiveProps(nextProps) {
        this.setState({ showModal: nextProps.show });
    };

    copyText(text, title) {
        try {
            navigator.clipboard.writeText(text);
            NotificationManager.success(`${title} copied to clipboard!`);
        } catch (e) {
            NotificationManager.error(`This may because you have your api and app running on different origins!`, 'Failed to copy');
        };
    };
    
    async componentDidMount() {
        const applications = await admin.getApplications();
        console.log(applications.body);
        this.setState({ applications: applications.body });
    };

    async createNewApplication() {
        const object = document.getElementById('inputName');
        const name = object.value;
        if (!name) return NotificationManager.error('Please enter a name for the application!');
        const token = await admin.createApplication(name);
        const { id } = jwt(localStorage.getItem('Authentication'));
        object.value = "";
        this.state.applications.push({
            token: token.body.token,
            name: name,
            owner: id,
            applicationid: token.body.applicationid
        });

        console.log(this.state.applications);
        this.setState({ applications: this.state.applications });
    };

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
                        Application Options
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Applications allow you to create functions that can be used in the tickets by admins to execute commands.
                        <br />
                        <Form.Label htmlFor="inputName">Create new application</Form.Label>
                        <Form.Control type="text" id="inputName" aria-describedby="inputNameBox" />
                        <br />
                        <Button onClick={() => {this.createNewApplication()}} variant="primary">Create</Button>
                        <br />

                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Copy Token</th>
                                    <th>Owner</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.state.applications.map(application => 
                            <tr>
                                <td>{application.name}</td>
                                <td><Button onClick={() => {this.copyText(application.token, `${application.name}'s Token`)}} variant="success">Copy Token</Button></td>
                                <td>{application.owner}</td>
                                <td><Button onClick={() => {}} variant="danger">Delete</Button></td>
                            </tr>
                            )}
                            </tbody>
                        
                            </Table>
                    </Modal.Body>
                </Modal>
            </div>
        ) 
    };
};

export default TicketOptions;