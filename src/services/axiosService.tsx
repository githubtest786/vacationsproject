// axiosService. Used in order to have a form of an interceptor like the one we have in Angular.

import axios from 'axios';

const instance = axios.create({
    baseURL: "https://vacationsappapi.herokuapp.com/api"
});

let token = localStorage.getItem("key");

instance.defaults.headers.common['Authorization'] = "Bearer " + token;

// console.log(instance.defaults.headers.common['Authorization']);

axios.interceptors.request.use(request => {
    // console.log(request);
    return request;
}, error => {
    // console.log(error);
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    // console.log(response);
    return response;
}, error => {
    // console.log(error);
    return Promise.reject(error);
});

export function setAxiousHeaders () {
    let token = localStorage.getItem("key");

    instance.defaults.headers.common['Authorization'] = "Bearer " + token;
}

export default instance;
