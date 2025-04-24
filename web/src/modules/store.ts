import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

import global from './global';
import userLogin from './user/login';
import namespace from './namespace';
import discoveryService from './discovery/service';
import discoveryInstance from './discovery/instance';

const reducer = combineReducers({
  global,
  userLogin,
  namespace,
  discoveryService,
  discoveryInstance,
});

export const store = configureStore({
  reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
