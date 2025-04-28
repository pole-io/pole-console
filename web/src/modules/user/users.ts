import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { createUsers, deleteUsers, modifyUsers, modifyUserToken, refreshUserToken } from 'services/users';

// State 和 Action 类型定义
export interface UserState {
    // 用户ID
    id: string
    // 用户名称
    name: string
    // 用户密码
    password: string
    // 用户来源
    source: string
    // 用户鉴权Token
    auth_token?: string
    // 该token是否被禁用
    token_enable: boolean
    // 该账户的简单描述
    comment: string
    // 账户对应邮箱
    email: string
    // 账户对应手机号
    mobile: string
    // 用户标签
    metadata: Record<string, string>
}

const initialState: UserState = {
    id: '',
    name: '',
    password: '',
    source: '',
    auth_token: '',
    token_enable: false,
    comment: '',
    email: '',
    mobile: '',
    metadata: {}
};

export const saveUsers = createAsyncThunk(`user/create`, async ({ state }: { state: UserState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await createUsers([state]);
        return fulfillWithValue(state);
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const updateUsers = createAsyncThunk(`user/update`, async ({ state }: { state: UserState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyUsers([state]);
        return fulfillWithValue(state);
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const enableUserToken = createAsyncThunk(`user/token/enable`, async ({ id, token_enable }: { id: string, token_enable: boolean }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyUserToken({ id: id, token_enable: token_enable });
        if (res) {
            return fulfillWithValue(res);
        }
        return rejectWithValue("fail");
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const resetUserToken = createAsyncThunk(`user/token/refresh`, async ({ id }: { id: string }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await refreshUserToken({ id });
        if (res) {
            return fulfillWithValue("ok");
        }
        return rejectWithValue("fail");
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const removeUsers = createAsyncThunk(`user/delete`, async ({ ids }: { ids: string[] }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await deleteUsers(ids.map(id => ({ id })));
        if (res) {
            // 删除成功
            return fulfillWithValue(ids); // 返回删除的用户ID
        }
        // 删除失败
        return rejectWithValue('删除用户失败');
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

const userReducer = createSlice({
    name: 'user/edit',
    initialState,
    reducers: {
        editorUser: (state, action: PayloadAction<UserState>) => {
            state = {
                ...state,
                ...action.payload,
            };
            return state;
        },
        resetUser: (state) => {
            return initialState;
        },
        viewUser: (state, action: PayloadAction<UserState>) => {
            state = {
                ...state,
                ...action.payload,
            };
            return state;
        }
    }
});

export const {
    editorUser,
    resetUser,
    viewUser,
} = userReducer.actions;
export default userReducer.reducer;
export const selectUser = (state: RootState) => state.userUsers;
