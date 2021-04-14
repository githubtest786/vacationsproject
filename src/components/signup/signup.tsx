import React, { Component, ChangeEvent } from "react";
import axios from 'axios';
import "./signup.css";
import { SuccessfulSignUpResponse } from '../../models/SuccessfulSignUpResponse';
import { SignUpUserDetails } from '../../models/SignUpUserDetails';
import { UserNames } from '../../models/UserNames';
import { NavLink } from 'react-router-dom';
import axiosService from '../../services/axiosService';

interface SignUpUser {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    takenUsernames : UserNames[];
}

export default class SignUp extends Component <any, SignUpUser> {

    public constructor (props: any) {
        super(props);
        this.state = {username: "", password: "", first_name: "", last_name: "", takenUsernames: []};
    }

    public async componentDidMount() {
        const response = await axiosService.get<UserNames[]>("/users/allusernames");

        this.setState({
            takenUsernames : response.data
        })
    }

    private setUsername = (args: ChangeEvent<HTMLInputElement>) => {
        const username = args.target.value;
        this.setState({username : username});
    }

    private setPassword = (args: ChangeEvent<HTMLInputElement>) => {
        const password = args.target.value;
        this.setState({password : password});
    }

    private setFirstName = (args: ChangeEvent<HTMLInputElement>) => {
        const first_name = args.target.value;
        this.setState({first_name : first_name});
    }

    private setLastName = (args: ChangeEvent<HTMLInputElement>) => {
        const last_name = args.target.value;
        this.setState({last_name : last_name});
    }

    private signUp = async () => { // Sign up function. Checks if entered username already exists in the database.

        let currentUsername = this.state.username;

        let takenUserName = false;

        for (let i = 0; i < this.state.takenUsernames.length; i++) {
            if (currentUsername === this.state.takenUsernames[i].username) {
                takenUserName = true;
                i = this.state.takenUsernames.length;
            }
        }

        if ((this.state.username === "") || (this.state.username.length < 3 ) || (this.state.username.length > 20)) {
            alert("Username cannot be empty! A username must be between 3 to 20 chars!");
        }
        else if (takenUserName) {
            alert ("Username already taken! Please try another one!");
        }
        else if ((this.state.password === "") || (this.state.password.length < 3) || (this.state.password.length > 20)) {
            alert ("Password cannot be empty! A password must be between 3 to 20 chars!");
        }
        else if ((this.state.first_name === "") || this.onlyLetters(this.state.first_name) === null) {
            alert ("Firstname cannot be empty! The first name may only consist letters!");
        }
        else if ((this.state.last_name === "") || this.onlyLetters(this.state.last_name) === null) {
            alert ("Lastname cannot be empty! The first name may only consist letters!");
        }
        else {
            try {
                let userDetails = new SignUpUserDetails(this.state.username, this.state.password, this.state.first_name, this.state.last_name);
                await axios.post<SuccessfulSignUpResponse>("http://localhost:3001/api/users/signup", userDetails);
                alert("Registered successfully! Please login before using our services."); 
                this.props.history.push('/home');
                // In the project description, its mentioned that once a user is registered, they can automatically enter the system and start using it, but, this sort of
                // method can be problematic to some users - if they don't happen to use the details in order to login for the very first time, they might end up getting
                // confused on future uses regarding what was their usename or password.
                // That's why I am not sending them straight to the vacations page and send back a JWT to store in the localStorage.
            }
            catch (err) {
                alert (err.message);
                console.log(err);
            }
        }
    }

    private onlyLetters(str: string) { // Checks if the input is of only letters.
        return str.match("^[A-Za-z]+$");
    }

    public render() {
        return (
            <div className="signup">
                <NavLink to ="/home" exact><input type="button" className="btn btn-outline-info btn-lg" value="Back"></input></NavLink>
                <div className="signUpForm">
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

                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon3">Firstname</span>
                        </div>
                        <input type="text" className="form-control" aria-label="firstname" aria-describedby="basic-addon3" placeholder="Firstname" name="firstname" value={this.state.first_name} onChange={this.setFirstName}/><br/>
                    </div>

                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon4">Lastname</span>
                        </div>
                        <input type="text" className="form-control" aria-label="lastname" aria-describedby="basic-addon4" placeholder="Lastname" name="lastname" value={this.state.last_name} onChange={this.setLastName}/><br/>
                    </div>
                    <input type="button" className="btn btn-outline-primary btn-lg" value="Submit" onClick={this.signUp}/>
                </div>
            </div>
        )
    }
}