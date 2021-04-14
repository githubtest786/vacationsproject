import React, { Component, ChangeEvent } from "react";
import "./addvacation.css";
// import { VacationDetails } from '../../models/VacationDetails';
import axiosService from '../../services/axiosService';
import { SuccessfulVacationResponse } from '../../models/SuccessfulVacationResponse';
import io from 'socket.io-client';
import { TakenDescriptions } from '../../models/TakenDescriptions';
import { store } from '../../redux/store';

const socket = io('http://localhost:3002');

interface AddVacationTemplate {
    description: string,
    destination: string,
    dates: string,
    price: number,
    vacation_image: any,
    takenDescriptions: TakenDescriptions[];
}

export default class AddVacation extends Component<any, AddVacationTemplate> {

    fileInput : any;

    public constructor(props: any) {
        super(props);
        this.state = { description: "", destination: "", dates: "", price: 0, vacation_image: null, takenDescriptions: []};
    }

    private updateDescriptions = async() => { // Gets all already taken descriptions, as descriptions should be unique.
        const response = await axiosService.get<TakenDescriptions[]>("/vacations/getallvacationsdescriptions");
        // console.log(response.data);
        this.setState({
            takenDescriptions: response.data
        });
    }

    public async componentDidMount() { // Checks if the entering user is an admin. If no data is available due to refresh/the server going down, different methods will occure.
        if (localStorage.getItem("key") != null) {
            if (store.getState().userType === "admin") { // Checks if user is an admin. Also works as a countermeasurement for refreshes or the server going down and then up again.
                this.updateDescriptions();
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

    private addVacation = async () => { // Adds a vacation assuming it fits the validations.

        let description = this.state.description;

        let takenDescription = false;

        for (let i = 0; i < this.state.takenDescriptions.length; i++) {
            if (description === this.state.takenDescriptions[i].description) {
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
        else if (this.state.vacation_image === null) {
            alert ("A vacation must have an image!");
        }
        else {
            try {
                // let newVacation = new VacationDetails(this.state.description, this.state.destination, this.state.dates, this.state.price);
                // await axiosService.post<SuccessfulVacationResponse>("/vacations/addnewvacation", newVacation);
                this.uploadVacation();
                socket.emit('addvacation', { description: this.state.description, destination: this.state.destination, dates : this.state.dates, price : this.state.price });
                this.props.history.push('/admin/controlpanel');
            }
            catch (err) {
                alert(err.message);
                console.log(err);
            }
        }
    }

    private goBack = () => { // Goes back to the control panel.
        this.props.history.push('/admin/controlpanel');
    }

    imageSelectionHandler = (e : any) => {
        this.setState({
            vacation_image : e.target.files[0]
        })
    }

    private uploadVacation = async () => { // Uploads a selected image.

        const fd = new FormData();
        fd.append('image', this.state.vacation_image, this.state.vacation_image.name);
        fd.append('description', this.state.description);
        fd.append('destination', this.state.destination);
        fd.append('dates', this.state.dates);
        fd.append('price', ((this.state.price).toString()));
        await axiosService.post<SuccessfulVacationResponse>("/vacations/addnewvacation", fd);
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
                    <input type="button" onClick={() => this.fileInput.click()} className="btn btn-outline-info btn-lg" value="Pick vacation image"/>
                    <br/>
                    <input type="button" className="btn btn-outline-primary btn-lg" onClick={this.addVacation} value="Submit"></input>
                </div>
            </div>
        )
    }
}