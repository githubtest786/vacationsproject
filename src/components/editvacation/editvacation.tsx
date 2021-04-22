// This component exists as opposed to be mixed with the addvacation component simply due to making the admin experience less confusing.
// Let's assume some kind of a vacations company owner would receive this website as some sort of a framework for his business.
// If he happens to click on the pencil button of one of the vacations, and he ends up clearing the entire already-stored information, he might end up thinking that he can
// just create an entirely new vacation, even though the new information will override the old one. It is also possible to just entirely alter the the DOM of the addvacations
// component depending on from which button said admin entered the component, but, I believe it'll make reading the component itself more confusing and more cluttered with information.

import React, { Component, ChangeEvent } from "react";
import "./editvacation.css";
import { VacationUpdate } from '../../models/VacationUpdate';
import axiosService from '../../services/axiosService';
import { SuccessfulVacationResponse } from '../../models/SuccessfulVacationResponse';
// import io from 'socket.io-client';
import { store } from '../../redux/store';
import { TakenDescriptions } from '../../models/TakenDescriptions';
import socket from '../../services/socketService';

// const socket = io('http://localhost:3002');

interface EditVacationTemplate {
    vacation_id: number,
    description: string,
    destination: string,
    dates: string,
    price: number,
    does_need_image: string,
    vacation_image: any,
    previous_description: string,
    takenDescriptions: TakenDescriptions[];
}

export default class EditVacation extends Component<any, EditVacationTemplate> {

    fileInput : any;

    public constructor(props: any) {
        super(props);
        this.state = { vacation_id: 0, description: "", destination: "", dates: "", price: 0, does_need_image: "no", vacation_image: null, previous_description: "", takenDescriptions: []};
    }

    private updateDescriptions = async() => { // Gets all already taken descriptions, as descriptions should be unique.
        const response = await axiosService.get<TakenDescriptions[]>("/vacations/getallvacationsdescriptions");
        // console.log(response.data);
        this.setState({
            takenDescriptions: response.data
        });
    }

    public async componentDidMount() { // Checks if the entering user is an admin. If no data is available due to refresh/the server going down, different methods will occure.

        if (localStorage.getItem("key") != null) { // Checks if a user is already logged in, ot
            if (store.getState().userType === "admin") { // Checks if user is an admin. Also works as a countermeasurement for refreshes or the server going down and then up again.
                this.updateDescriptions();

                this.setState({
                    vacation_id: store.getState().chosenVacation.vacation_id,
                    description: store.getState().chosenVacation.description,
                    destination: store.getState().chosenVacation.destination,
                    dates: store.getState().chosenVacation.dates,
                    price: store.getState().chosenVacation.price,
                    previous_description: store.getState().chosenVacation.description
                })
        
            }
            else {
                alert ("You have either refreshed the page or entered it directly through the url. Please enter through the control panel, assuming you are an admin.");
                this.props.history.push('/admin/controlpanel');
            }
        }
        else {
            alert ("You aren't even logged in.");
            this.props.history.push("/home");
        }
    }

    private setDescription = (args: ChangeEvent<HTMLInputElement>) => {
        const description = args.target.value;
        this.setState({description : description});
    }

    private setDestination = (args: ChangeEvent<HTMLInputElement>) => {
        const destination = args.target.value;
        this.setState({destination : destination});
    }

    private setDates = (args: ChangeEvent<HTMLInputElement>) => {
        const dates = args.target.value;
        this.setState({dates : dates});
    }

    private setPrice = (args: ChangeEvent<HTMLInputElement>) => {
        const price = args.target.value;
        this.setState({price : parseInt(price)});
    }

    private editVacation = async () => { // Edits a vacation assuming the input fits the required validations.

        let description = this.state.description;

        let previous_description = this.state.previous_description;

        let takenDescription = false;


        for (let i = 0; i < this.state.takenDescriptions.length; i++) {
            if ((description === this.state.takenDescriptions[i].description) && (description !== previous_description)) {
                takenDescription = true;
                i = this.state.takenDescriptions.length;
            }
        }

        if (this.state.description === "") {
            alert("A vacation must have a description!");
        }
        else if (takenDescription) {
            alert("Description is already used by another vacation. Please enter a different one and try again.")
        }
        else if (this.state.destination === "") {
            alert ("A vacation must have a destination!");
        }
        else if (this.state.dates === "") {
            alert ("A vacation must have dates!");
        }
        else if (this.state.price <= 0) {
            alert ("A vacation must have a price above 0!");
        }
        else {
            try {
                if (this.state.does_need_image === "yes") {
                    this.uploadVacation();
                }
                else {
                    let editVacation = new VacationUpdate(this.state.vacation_id, this.state.description, this.state.destination, this.state.dates, this.state.price);
                    await axiosService.patch<SuccessfulVacationResponse>("/vacations/updatevacation", editVacation);
                }
                socket.emit('editvacation', { description: this.state.description, destination: this.state.destination, dates : this.state.dates, price : this.state.price });
                this.props.history.push('/admin/controlpanel');
            }
            catch (err) {
                alert(err.message);
                console.log(err);
            }
        }
    }
    

    private goBack = () => {
        this.props.history.push('/admin/controlpanel');
    }

    imageSelectionHandler = (e : any) => {
        this.setState({
            vacation_image : e.target.files[0],
            does_need_image : "yes"
        })
    }

    private uploadVacation = async () => { // Uploads image assuming the admin decided to upload a new image to replace an old one.
        const fd = new FormData();
        fd.append('image', this.state.vacation_image, this.state.vacation_image.name);
        fd.append('vacation_id', ((this.state.vacation_id).toString()));
        fd.append('description', this.state.description);
        fd.append('destination', this.state.destination);
        fd.append('dates', this.state.dates);
        fd.append('price', ((this.state.price).toString()));
        await axiosService.patch<SuccessfulVacationResponse>("/vacations/updatevacation", fd);
    }

    public render() {
        return (
            <div>
                <input type="button" onClick={this.goBack} value="Back" className="btn btn-outline-info btn-lg"></input>
                <br/>
              <div className="addVacationForm">
                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon1">Description</span>
                        </div>
                        <input type="text" className="form-control" aria-label="description" aria-describedby="basic-addon1" placeholder="Description" name="description" value={this.state.description} onChange={this.setDescription} />
                    </div>

                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon2">Destination</span>
                        </div>
                        <input type="text" className="form-control" aria-label="destination" aria-describedby="basic-addon2" placeholder="Destination" name="destination" value={this.state.destination} onChange={this.setDestination} />
                    </div>

                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon3">Dates</span>
                        </div>
                        <input type="text" className="form-control" aria-label="dates" aria-describedby="basic-addon3" placeholder="Dates" name="dates" value={this.state.dates} onChange={this.setDates} />
                    </div>

                    <div className="input-group input-group-lg">
                        <div className="input-group-prepend">
                            <span className="input-group-text" id="basic-addon4">Price</span>
                        </div>
                        <input type="text" className="form-control" aria-label="price" aria-describedby="basic-addon4" placeholder="Price" name="price" value={this.state.price} onChange={this.setPrice} />
                    </div>
                    <input  style={{display: 'none'}} type="file" onChange={this.imageSelectionHandler} ref={fileInput => this.fileInput = fileInput }/>
                    <button onClick={() => this.fileInput.click()} className="btn btn-outline-info btn-lg">Pick vacation image</button>
                    <input type="button" className="btn btn-outline-primary btn-lg" onClick={this.editVacation} value="Submit"></input>
                </div>
            </div>
        )
    }
}