import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';

import global from './global';
import userLogin from './user/login';
import userUsers from './user/users';
import userGroups from './user/groups';
import namespace from './namespace';
import discoveryService from './discovery/service';
import discoveryServiceAlais from './discovery/alias';
import discoveryInstance from './discovery/instance';
import authPolicyRules from './auth/policy';

const reducer = combineReducers({
  global,
  userLogin,
  userUsers,
  userGroups,
  namespace,
  discoveryService,
  discoveryServiceAlais,
  discoveryInstance,
  authPolicyRules,
});

export const store = configureStore({
  reducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
