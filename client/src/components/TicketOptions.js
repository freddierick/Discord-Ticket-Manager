//create new react class component named Message
import React from "react";
import Modal from "react-bootstrap/Modal";

class TicketOptions extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            showModal: this.props.show,
        }
    };

    componentWillReceiveProps(nextProps) {
        this.setState({ showModal: nextProps.show });
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
                        Ticket Options
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Ticket options go here
                    </Modal.Body>
                </Modal>
            </div>
        ) 
    };
};

export default TicketOptions;