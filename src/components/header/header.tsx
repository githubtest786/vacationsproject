import React, { Component } from "react";
import "./header.css";

export default class Header extends Component {
    public render() {
        return (
            <div>
                <div id = "title">
                    <h1><span className="brand">Global</span> tours</h1>
                </div>
            </div>
        )
    }
}