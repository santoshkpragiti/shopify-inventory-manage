import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

const initState = {
  inventory: null,
  all_inventory: null,
  message: ''
};

function reducer(state = initState, action) {
  switch (action.type) {
    case 'REQUEST_SUCCESS':
        return {
          ...state,
          message: action.payload.message
        };
    case 'GOT_ALL_INVENTORY':
        return {
          ...state,
          all_inventory: action.payload.all_inventory
        }
    default:
      return state;
  }
}

const middleware = applyMiddleware(thunkMiddleware, logger);

const store = createStore(reducer, middleware);

export default store;
