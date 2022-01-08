import React from "react";
import {
    Navigate
  } from "react-router-dom";
import { BASE_URL } from '../apiManager';

class Callback extends React.Component {
    async componentDidMount(){
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        localStorage.setItem('Authentication', params.jwt);
        await new Promise(res => setTimeout(res, 1000));
        document.location.href = `${BASE_URL}/`;
    };

    render() {
        return (
            <h1>Signing you in...</h1>
        );

    };
};


export default Callback;