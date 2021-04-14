import React, { Component, ChangeEvent } from "react";
import axios from 'axios';
import "./login.css";
import { LoginUserDetails } from '../../models/LoginUserDetails';
import { SuccessfulLoginResponse } from '../../models/SuccessfulLoginResponse';
import { NavLink } from 'react-router-dom';
import { setAxiousHeaders } from '../../services/axiosService';
// import { UserType } from '../../models/UserType';
// import axiosService from '../../services/axiosService';
import { store } from '../../redux/store';
import { ActionType } from '../../redux/action-type';

interface LoginUser {
    username: string;
    password: string;
}

export default class Login extends Component <any, LoginUser> {

    public constructor (props: any) {
        super(props);
        this.state = {username: "", password: ""};
    }

    public async componentDidMount() { // Sends a user to the vacations component, assuming they already logged in.

        if (localStorage.getItem("key") != null) {
            // const response = await axiosService.get<UserType>("http://localhost:3001/api/users/checkifuserincache");
            // if (response.data.userType != null) {
            //     if (response.data.userType === "admin") {
            //         this.props.history.push('/admin/controlpanel');
            //     }
            //     else {
            //         this.props.history.push('/vacations');
            //     }
            // }
            this.props.history.push('/vacations');
        }
    }

    private setUsername = (args: ChangeEvent<HTMLInputElement>) => {
        const username = args.target.value;
        this.setState({username : username});
    }

    private setPassword = (args: ChangeEvent<HTMLInputElement>) => {
        const password = args.target.value;
        this.setState({password : password});
    }

    private loginUser = async () => { // Login function.
        try {
            let userDetails = new LoginUserDetails(this.state.username, this.state.password);
            const response = await axios.post<SuccessfulLoginResponse>("http://localhost:3001/api/users/login", userDetails);
            localStorage.setItem("key", response.data.token);
            store.dispatch({ type: ActionType.userType, payload: response.data.userType});
            setAxiousHeaders();
            if (response.data.userType === "admin") {
                this.props.history.push('/admin/controlpanel');
            }
            else {
                this.props.history.push('/vacations');
            }
        }
        catch (err) {
            alert ("Incorrect details, please try again with different ones!");
            console.log(err);
        }
    }

    public render() {
        return (
            <div className="login">
                <div className="loginForm">
                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon1">Username</span>
                        </div>
                        <input type="text" className="form-control" aria-label="username" aria-describedby="basic-addon1" placeholder="Username" name="username" value={this.state.username} onChange={this.setUsername}/>
                    </div>

                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon2">Password</span>
                        </div>
                        <input type="password" className="form-control" aria-label="password" aria-describedby="basic-addon2" placeholder="Password" name="password" value={this.state.password} onChange={this.setPassword}/><br/>
                    </div>
                </div>
                <input type="button" className="btn btn-outline-primary btn-lg" value="Login" onClick={this.loginUser}/>
                <NavLink to ="/signup" exact><input type="button" className="btn btn-outline-info btn-lg" value="Not registered? Sign up here!"></input></NavLink>
            </div>
        )
    }
}