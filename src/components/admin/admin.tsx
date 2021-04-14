import React, { Component } from "react";
import "./admin.css";
import { Vacations } from '../../models/Vacations';
import axiosService from '../../services/axiosService';
import { NavLink } from 'react-router-dom';
import { store } from '../../redux/store';
import { ActionType } from '../../redux/action-type';
import { SuccessfulVacationResponse } from '../../models/SuccessfulVacationResponse';
import io from 'socket.io-client';
import { UserType } from '../../models/UserType';

interface AdminTemplate {
    vacations: Vacations[];
}

export default class Admin extends Component<any, AdminTemplate> {

    socket = io('http://localhost:3002');

    public constructor(props: any) {
        super(props);
        this.state = { vacations: [] };
    }

    private updateVacations = async() => { // Updates the vacations array.
        const response = await axiosService.get<Vacations[]>("/vacations/getallvacations");
        // console.log(response.data);
        this.setState({
            vacations: response.data
        });
    }

    componentWillUnmount() {
        this.socket.close();
    }

    public async componentDidMount() { // Checks if the entering user is an admin. If no data is available due to refresh/the server going down, different methods will occure.


        if (localStorage.getItem("key") != null) {
            if (store.getState().userType === "admin") { // Checks if user is an admin. Also works as a countermeasurement for refreshes or the server going down and then up again.
                this.updateVacations();
                this.socket.on('changedvacations', (data : any) => {
                    this.setState({
                        vacations : data
                    })
                });
            }
            else if (store.getState().userType === undefined) {
                // console.log("Usertype isn't available. Attempting to get one from the server.");
                try {
                    const response = await axiosService.get<UserType>("/users/getuserrole");
                    // console.log("Usertype received: " + response.data.userType);
        
                    if (response.data.userType === "admin") {
                        store.dispatch({ type: ActionType.userType, payload: response.data.userType});
        
                        this.updateVacations();
                        this.socket.on('changedvacations', (data : any) => {
                            this.setState({
                                vacations : data
                            })
                        });
                    }
                    else {
                        this.userDoesntBelong();
                    }
                }
                catch (err) {
                    alert(err.response.data);
                    this.backToLogin();
                }
            }
            else {
                this.userDoesntBelong();
            }
        }
        else {
            alert ("You aren't even logged in.");
            this.props.history.push("/home");
        }
    }

    private userDoesntBelong = () => {
        alert("You don't belong here, sorry.");
        localStorage.removeItem("key");
        this.props.history.push('/home');
    }

    private backToLogin = () => {
        localStorage.removeItem("key");
        this.props.history.push('/home');
    }

    private editVacation = (e : any) => { // Updates the redux store and sends the admin to the edit vacation component with the right details.

        let pickedTarget = e.target.id;

        let pickedVacation;

        for (let i = 0; i < this.state.vacations.length; i++) {
            if (pickedTarget === this.state.vacations[i].description) {
                pickedVacation = this.state.vacations[i];
                i = this.state.vacations.length;
            }
        }

        store.dispatch({ type: ActionType.editChosenVacation, payload: pickedVacation});

        this.props.history.push('/admin/editvacation');
    }

    private deleteVacation = async (e: any) => { // Deletes chosen vacation.

        let vacation_id = parseInt(e.target.id);

        console.log(vacation_id);

        try {
            await axiosService.delete<SuccessfulVacationResponse>("/vacations/deletevacation/" + vacation_id);
            this.socket.emit('deletevacation', { vacation_id: vacation_id });

            this.updateVacations();
        }
        catch (err) {
            alert(err.message);
            console.log(err);
        }
    }

    public render() {
        return (
            <div className="vacations">
                <NavLink to="/admin/charts" exact><input type="button" value="Charts" className="btn btn-outline-info btn-lg"></input></NavLink>
                <NavLink to="/admin/addvacation" exact><input type="button" value="Add new vacation" className="btn btn-outline-primary btn-lg"></input></NavLink>    
                <br/>
                {this.state.vacations.map(vacations => <div key={vacations.vacation_id} className="vacationBox">
                <div className="edit">
                            <button type="submit" onClick={this.editVacation.bind(this)} id={vacations.description}><span className="glyphicon glyphicon-pencil" id={vacations.description}></span></button>
                        </div>
                        <div className="delete">
                            <button type="submit" onClick={this.deleteVacation.bind(this)} id={vacations.vacation_id.toString()}><span className="glyphicon glyphicon-remove" id={vacations.vacation_id.toString()}></span></button>
                        </div>
                    <div className="vacationBoxDetails">
                        Description: {vacations.description}<br />
                        Destination: {vacations.destination}<br />
                        Dates: {vacations.dates}<br />
                        Price: {vacations.price}<br />
                        <img src={vacations.image}  width="40%" height="40%" alt=""/><br/>
                        Following: {vacations.followers}<br />
                    </div>
                </div>)}

            </div>
        )
    }
}