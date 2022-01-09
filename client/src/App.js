import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NotificationContainer } from 'react-notifications';

import { API_URL } from './apiManager';
import jwt from 'jwt-decode';

import Callback from './pages/callback';

import UserHome from './pages/user/home';

import AdminHome from './pages/admin/home';
import AdminTicketRoom from './pages/admin/ticketRoom';
import AdminNotificationManager from './components/AdminNotificationManager';

import TicketRoom from './pages/ticketRoom';

class SendToLogin extends React.Component {
  componentDidMount() {
    console.log('Redirecting you to login...');
    document.location.href = `${API_URL}/authentication/create`;
  };
  render() {
    return <h1>Redirecting you to login...</h1>
  }
};

class LogOut extends React.Component {
  componentDidMount() {
    localStorage.removeItem('Authentication');
    console.log('Redirecting you to login...');
    document.location.href = `${API_URL}/authentication/create`;
  };
  render() {
    return <h1>Redirecting you to login...</h1>
  }
};

class App extends React.Component {
  render() {
    console.log(localStorage.getItem('Authentication'))
    if (localStorage.getItem('Authentication') == null)
      return (
        <div className="App">
          <NotificationContainer /> 
          <Router>
            <Routes>
              <Route path="/callback" element={<Callback />} />
              {/* <Route component={SendToLogin} /> */}
              <Route path="/*" element={<SendToLogin />} />
            </Routes>
          </Router>
        </div>
      );

    console.log("RENDERING AUTHENTICATED APP");
    const { isMod } = jwt(localStorage.getItem('Authentication'));
    if (isMod) //Render admin pages 
      return (
        <div className="App">
        <NotificationContainer />
        <AdminNotificationManager />
          <Router>
            <Routes>
              <Route path="/about" element={<h1>HE</h1>} />
              <Route path="/logout" element={<LogOut />} />
              <Route path="/ticket/:uuid" element={<AdminTicketRoom />} />
              <Route path="/*" element={<AdminHome />} />
            </Routes>
          </Router>
        </div>
      );
    else //Render user pages 
    return (
      <div className="App">
        <NotificationContainer />
        <Router>
          <Routes>
            <Route path="/about" element={<h1>HE</h1>} />
            <Route path="/ticket/:uuid" element={<TicketRoom />} />
            <Route path="/*" element={<UserHome />} />
          </Routes>
        </Router>
      </div>
    );
  }
};

export default App;
