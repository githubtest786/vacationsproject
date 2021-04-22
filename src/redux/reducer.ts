import { AppState } from './app-state';
import { ActionType } from './action-type';
import { Action } from './action';

// This function is not called directly by you

export function reduce(oldAppState: AppState, action: Action): AppState {
    // Cloning the oldState (creating a copy)
    const newAppState = { ...oldAppState };

    switch (action.type) {
        case ActionType.editChosenVacation:
            newAppState.chosenVacation = action.payload;
            break;
        case ActionType.userType:
            newAppState.userType = action.payload;
            break;
        case ActionType.updateVacations:
            newAppState.updateVacations = action.payload;
            break;
    }

    //After returning the new state, it's being published to all subscribers.
    // Each component will render itself based on the new state.
    return newAppState;
}