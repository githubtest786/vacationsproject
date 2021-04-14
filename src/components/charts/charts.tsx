import React, { Component } from "react";
import "./charts.css";
import { NavLink } from 'react-router-dom';
import {Bar} from 'react-chartjs-2';
import { store } from '../../redux/store';
import io from 'socket.io-client';
import { ChartInfo } from '../../models/ChartInfo';
import axiosService from '../../services/axiosService';
import { UserType } from '../../models/UserType';
import { ActionType } from '../../redux/action-type';


interface ChartTemplate {
    vacations: ChartInfo[];
    chartDetails: any;
}


export default class Charts extends Component<any, ChartTemplate>  {

    socket = io('http://localhost:3002');

    chartDetailsHelper = { // Required information for chartJS. Used to constantly update the state that the chart attempts to use.
        labels: [""],
        datasets: [
          {
            label: 'Followers',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: [0]
          }
        ]
      }

    public constructor(props: any) {
        super(props);
        this.state = {
            vacations: [],
            chartDetails: {
                labels: [],
                datasets: [
                  {
                    label: 'Followers',
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: []
                  }
                ]
              }
         };
    }

    private updateVacations = async() => { // Updates the vacations array.
        const response = await axiosService.get<ChartInfo[]>("/vacations/getallvacations");
        // console.log(response.data);
        this.setState({
            vacations: response.data
        });

        this.setLabelsAndData();
    }

    componentWillUnmount() {
        this.socket.close();
    }

    public async componentDidMount() { // Checks if the entering user is an admin. If no data is available due to refresh/the server going down, different methods will occure.
        if (localStorage.getItem("key") != null) {
            if (store.getState().userType === "admin") { // Checks if user is an admin. Also works as a countermeasurement for refreshes or the server going down and then up again.
                this.updateVacations();
    
                this.socket.on('changedvacations', (data : any) => {
        
                    this.updateVacations();
                })
            }
            else if (store.getState().userType === undefined) {
                console.log("Usertype isn't available. Attempting to get one from the server.");
                try {
                    const response = await axiosService.get<UserType>("/users/getuserrole");
                    console.log("Usertype received: " + response.data.userType);
        
                    if (response.data.userType === "admin") {
                        store.dispatch({ type: ActionType.userType, payload: response.data.userType});
        
                        this.updateVacations();
        
                        this.socket.on('changedvacations', (data : any) => {
                
                            this.updateVacations();
                        })
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

    private setLabelsAndData = () => { // Sets the labels for the chart.

        let labels = [];
        let followers = [];

        for (let i = 0; i < this.state.vacations.length; i++) {
            if (this.state.vacations[i].followers > 0) {
                labels.push(this.state.vacations[i].description);
                followers.push(this.state.vacations[i].followers);
            }
        }

        this.chartDetailsHelper.labels = labels;
        this.chartDetailsHelper.datasets[0].data = followers;

        this.setState({
            chartDetails : this.chartDetailsHelper
        })

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

    public render() {
        return (
            <div>
                <NavLink to ="/admin/controlpanel" exact><input type="button" value="Back" className="btn btn-outline-info btn-lg"></input></NavLink><br/>
                <div className="col-md-9 chart">
                    <Bar
                    data={this.state.chartDetails}
                        options={{
                            title:{
                                display:true,
                                text:'Followers per vacation',
                                fontSize:20
                            },
                            legend:{
                                display:true,
                                position:'right'
                            }
                        }}
                    />
                </div>
            </div>
        )
    }
}