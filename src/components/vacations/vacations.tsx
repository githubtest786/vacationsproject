import React, { Component } from "react";
import axiosService from '../../services/axiosService';
import "./vacations.css";
import { Vacations } from '../../models/Vacations';
import { VacationFollow } from '../../models/VacationFollow';
import { SendFollowedVacationDescription } from '../../models/SendFollowedVacationDescription';
import { VacationsFollows } from '../../models/VacationsFollows';
import { store } from '../../redux/store';
import { UserType } from '../../models/UserType';

import io from 'socket.io-client';

const socket = io('http://localhost:3002');



interface VacationsTemplate {
    vacations: Vacations[];
    isChecked: any;
    checkedLength: number;
    vacationsStorage: Vacations[];
}

export default class SignUp extends Component <any, VacationsTemplate> {

    public constructor (props: any) {
        super(props);
        this.state = { vacations: [], isChecked : [], checkedLength : 0, vacationsStorage: [] };
    }

    startProcessingInformation = async () => { // Gets the information regarding the vacations from the server. Its stored in a storage that would later on get edited before being displayed.
        const response = await axiosService.get<Vacations[]>("/vacations/getallvacations");
        // console.log(response.data);

        this.setState({
            vacationsStorage : response.data
        })


        this.setArrayUp();

        socket.on('changedvacations', (data : any) => {
            // console.log(data);

            this.setState({
                vacationsStorage : data
            })
    
    
            this.setArrayUp();
        })
    }

    public async componentDidMount() { // Checks if the entering user is logged in. If no data is available due to refresh/the server going down, different methods will occure.

        if (localStorage.getItem("key") != null) {
            if (store.getState().userType !== undefined) { // Works as a countermeasurement for the server going down and then up again.
                this.startProcessingInformation();
            }
            else {
                console.log("Usertype isn't available. Attempting to get one from the server.");
                try {
                    const response = await axiosService.get<UserType>("/users/getuserrole");
                    console.log("Usertype received: " + response.data.userType);
        
                    if (response.data.userType !== undefined) {
                        this.startProcessingInformation();
                    }
                    else {
                        this.backToLogin();
                    }
                }
                catch (err) {
                    alert(err.response.data.Error);
                    this.backToLogin();
                }
            }
        }
        else {
            alert ("You aren't even logged in.");
            this.props.history.push("/home");
        }
    }

    private backToLogin = () => {
        localStorage.removeItem("key");
        this.props.history.push('/home');
    }

    updateVacations = async () => { // Updates the vacations array assuming something new changed in the DB (socket)
        const response = await axiosService.get<Vacations[]>("/vacations/getallvacations");
        // console.log(response.data);

        this.setState({
            vacationsStorage : response.data
        })


        this.setArrayUp();
    }

    setArrayUp = () => { // Processes the information and arranges it differently, in order to get it ready for the desired sorting.
        let followedArray = [];

        let response = this.state.vacationsStorage;

        for (let i = 0; i < response.length; i++) {
            let followCell = {
                vacation_id: response[i].vacation_id,
                description: response[i].description,
                destination: response[i].destination,
                image: response[i].image,
                dates: response[i].dates,
                price: response[i].price,
                followers: response[i].followers,
                followed: 0
            }
            followedArray.push(followCell);
        }

        this.setState({
            vacationsStorage : followedArray
        })

        let follows = new Array(response.length);
        let isVacationPicked = [];
        for (let i = 0; i < follows.length; i ++) {
            follows[i] = {
                vacation_id : response[i].vacation_id,
                description : response[i].description,
                followed: false,
                sorting: 0
            };
            isVacationPicked[i] = false; 
        }

        this.setState({
            isChecked : follows
        })

        this.sortArray();
    }

    sortArray = async () => { // Sorts the array and updates the vacation array that displays everything.

        const response2 = await axiosService.get<VacationsFollows[]>("/vacations/getallvacationsfollows");

        let length = response2.data.length;

        let follows = this.state.isChecked;

        this.setState({
            checkedLength : length
        })

        let followersArray = this.state.vacationsStorage;
        let followedArray = this.state.vacationsStorage;

        for (let i = 0; i < response2.data.length; i++) {
            for (let j = 0; j < follows.length; j++) {
                if (follows[j].description === response2.data[i].description){
                    follows[j].followed = true;
                    follows[j].sorting = 1;
                }
            }
        }

        for (let i = 0; i < response2.data.length; i++) {
            for (let j = 0; j < followersArray.length; j++) {
                if (followersArray[j].vacation_id === response2.data[i].vacation_id) {
                    followedArray[j].followed = 1;
                }
            }
        }

        this.setState({
            vacationsStorage: followersArray,
            isChecked : follows
        })

        let sortVacations = this.state.vacationsStorage.sort(this.orderMethodVacations);

        let sortChecked = this.state.isChecked.sort(this.orderMethodFollowers);

        this.setState({
            vacations : sortVacations,
            isChecked : sortChecked
        })

        this.updateCheckbox();

    }

    updateCheckbox = () => { // A function that occurs the moment a user follows/unfollows a vacation. Updates the checkboxes when a user presses one of them.

        for (let i = 0; i < this.state.vacationsStorage.length; i++) {
            let follow = document.getElementById(this.state.vacationsStorage[i].description) as HTMLInputElement;
            follow.checked = false;
        }

        for (let i = 0; i < this.state.checkedLength; i++) {
            let follow = document.getElementById(this.state.vacationsStorage[i].description) as HTMLInputElement;
            follow.checked = true;
        }
    }

    orderMethodVacations = (a : any, b : any) => { // Orders the vacations by whether said user follows them or not.

        let result = 0;

        let followA = a.followed;
        let followB = b.followed;

        followA > followB ? result = -1 : result = 1;

        return result;
    }

    orderMethodFollowers = (a : any, b : any) => { // Orders the vacations in terms of followers - important for dynamically changing the display methods of the checkboxes and the divs in the right order.

        let result = 0;

        let followA = a.sorting;
        let followB = b.sorting;

        followA > followB ? result = -1 : result = 1;

        return result;
    }

    toggleCheckBox = async (e : any) => { // Happens when a user toggles one of the checkboxes. The information regarding following/unfollowing is saved in the server.

        // console.log(e.target.id);

        let target = e.target.id;

        let targetLocation;

        for (let i = 0; i < this.state.vacationsStorage.length; i++) {
            if (target === this.state.isChecked[i].description) {
                this.state.isChecked[i].followed = !this.state.isChecked[i].followed;
                targetLocation = i;
            }
        }

        let vacationDescription = new SendFollowedVacationDescription(target);

        if (this.state.isChecked[targetLocation].followed) {
            await axiosService.post<VacationFollow>("/vacations/followvacation", vacationDescription);
        }
        else {
            await axiosService.post<VacationFollow>("/vacations/unfollowvacation", vacationDescription);
        }

        socket.emit('editvacation', { followed_or_unfollowed : "" });

        const response2 = await axiosService.get<Vacations[]>("/vacations/getallvacations");
        this.setState({
            vacationsStorage : response2.data
        })

        this.setArrayUp();
 
    }

    public render() {
        return (
            <div className="vacations">
                {this.state.vacations.map((vacations, index) => <div key = {index} className="vacationBox">
                    <span className="checkBox">
                        <input type="checkbox" id={vacations.description} onChange={this.toggleCheckBox}></input>
                    </span>
                    <div className="vacationBoxDetails">
                        <div className="vacationDescription">
                        Description: {vacations.description}<br />
                        </div>
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