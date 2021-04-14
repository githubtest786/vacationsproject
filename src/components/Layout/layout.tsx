import React, { Component } from "react";
import './layout.css';
import Header from '../header/header';
import Footer from '../footer/footer';
import Login from '../login/login';
import SignUp from '../signup/signup';
import Vacations from '../vacations/vacations';
import Admin from '../admin/admin';
import Charts from '../charts/charts';
import AddVacation from '../addvacation/addvacation';
import EditVacation from '../editvacation/editvacation';
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";

export default class Layout extends Component {
    public render() {
        return (
            <BrowserRouter>
                <section className="layout">
                    <header>
                        <Header />
                    </header>
                    <main>
                        <Switch>
                        <Route path="/home" component={Login} exact />
                        <Route path="/signup" component={SignUp} exact />
                        <Route path="/vacations" component={Vacations} exact />
                        <Route path="/admin/controlpanel" component={Admin} exact />
                        <Route path="/admin/charts" component={Charts} exact />
                        <Route path="/admin/addvacation" component={AddVacation} exact />
                        <Route path="/admin/editvacation" component={EditVacation} exact />
                        <Redirect from="/" to="/home" exact />
                        </Switch>
                    </main>
                    <footer>
                        <Footer />
                    </footer>
            </section>
            </BrowserRouter>
        );
    }
}