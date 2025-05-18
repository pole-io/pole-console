import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { MatcheLabel } from 'services/types';
import { deleteFileReleases, releaseConfigFile, rollbackFileReleases } from 'services/config_release';

// State 和 Action 类型定义
export interface FileReleaseState {
    id?: number,
    namespace: string
    group: string
    fileName: string
    name: string
    releaseDescription: string
    version?: number
    releaseType: 'normal' | 'gray'
    betaLabels: MatcheLabel[]
    active?: boolean
}

const initialState: FileReleaseState = {
    id: 0,
    namespace: '',
    group: '',
    fileName: '',
    name: '',
    releaseDescription: '',
    version: 0,
    releaseType: 'normal',
    betaLabels: [],
    active: true,
};


export const publishConfigFiles = createAsyncThunk(`config_release/create`, async ({ state }: { state: FileReleaseState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await releaseConfigFile(state);
        return fulfillWithValue("ok"); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const releaseRollback = createAsyncThunk(`config_release/rollback`, async ({ state }: { state: { namespace: string, group: string, fileName: string, name: string } }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await rollbackFileReleases([state]);
        return fulfillWithValue("ok"); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const releasesRemove = createAsyncThunk(`config_release/delete`, async ({ state }: { state: { namespace: string, group: string, fileName: string, name: string }[] }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await deleteFileReleases(state);
        return fulfillWithValue("ok"); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});


const fileReleaseReducer = createSlice({
    name: 'service/edit',
    initialState,
    reducers: {
        editorConfigFile: (state, action: PayloadAction<FileReleaseState>) => {
            state = {
                ...state,
                ...action.payload
            };
            return state;
        },
        viewConfigFile: (state, action: PayloadAction<{id?: number, namespace: string, group: string, name: string}>) => {
            state = {
                ...state,
                ...action.payload
            };
            return state;
        },
        resetConfigFile: (state) => {
            state = initialState;
            return state;
        }
    },
    extraReducers: () => { },
})

export const {
    editorConfigFile,
    resetConfigFile,
    viewConfigFile,
} = fileReleaseReducer.actions;
export const selectConfigFile = (state: RootState) => state.configFile;


export default fileReleaseReducer.reducer;
