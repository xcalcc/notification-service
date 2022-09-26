import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import reducer from './reducer';
import api from '../apis';

export default createStore(
    reducer,
    applyMiddleware(
        thunk.withExtraArgument(api),
        logger
    )
);

