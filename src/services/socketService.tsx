import io from 'socket.io-client';
// import { ActionType } from '../redux/action-type';
// import { store } from '../redux/store';

const socket = io("https://vacationsappapi.herokuapp.com");

export default socket;