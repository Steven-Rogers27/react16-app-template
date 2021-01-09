import { combineReducers, } from '@reduxjs/toolkit';
import counterSlice from '../examples/counter/counterSlice';

export default combineReducers({
  counter: counterSlice,
});