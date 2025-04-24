import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { doLogin } from '../../services/login'

const namespace = 'user';
export const PolarisTokenKey = 'polaris_token'
export const LoginRoleKey = 'login-role'
export const LoginUserIdKey = 'login-user-id'
export const LoginUserOwnerIdKey = 'login-owner-id'
export const LoginUserNameKey = 'login-name'

const initialState = {
  isLogin: !!sessionStorage.getItem(PolarisTokenKey), // 是否登录
  currentUser: {
    name: sessionStorage.getItem(LoginUserNameKey) || '', // 用户名
    role: sessionStorage.getItem(LoginRoleKey) || '', // 角色
    user_id: sessionStorage.getItem(LoginUserIdKey) || '', // 用户ID
    owner_id: sessionStorage.getItem(LoginUserOwnerIdKey) || '', // 所属ID
  }
};

// login
export const login = createAsyncThunk(`${namespace}/login`, async ({ username, password }: { username: string; password: string }, { fulfillWithValue, rejectWithValue }) => {
  try {
    const res = await doLogin({ name: username, password: password });
    sessionStorage.setItem(PolarisTokenKey, res.token);
    sessionStorage.setItem(LoginUserNameKey, res.name);
    sessionStorage.setItem(LoginRoleKey, res.role);
    sessionStorage.setItem(LoginUserIdKey, res.user_id);
    sessionStorage.setItem(LoginUserOwnerIdKey, res.owner_id);
    return fulfillWithValue(res); // 返回 token
  } catch (error) {
    return rejectWithValue((error as Error).message); // 捕获错误并返回
  }
});

const loginReducer = createSlice({
  name: namespace,
  initialState,
  reducers: {
    logout: (state) => {
      sessionStorage.removeItem(PolarisTokenKey);
      sessionStorage.removeItem(LoginUserNameKey);
      sessionStorage.removeItem(LoginRoleKey);
      sessionStorage.removeItem(LoginUserIdKey);
      sessionStorage.removeItem(LoginUserOwnerIdKey);
      // 清空当前用户信息
      state.isLogin = false;
      state.currentUser = {
        name: '',
        role: '',
        user_id: '',
        owner_id: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.isLogin = true;
        state.currentUser = {
          name: action.payload.name,
          role: action.payload.role,
          user_id: action.payload.user_id,
          owner_id: action.payload.owner_id,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.isLogin = false;
      });
  },
});

export const { logout } = loginReducer.actions;
export default loginReducer.reducer;
