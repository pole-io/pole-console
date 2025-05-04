import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { createConfigFiles, deleteConfigFiles, Label, modifyConfigFiles } from 'services/config_files';

// State 和 Action 类型定义
export interface FileState {
    id?: number,
    namespace: string
    group: string
    name: string
    content: string
    format: string
    comment: string
    tags: Array<Label>
    encrypted: boolean
    encryptAlgo: string
}

const initialState: FileState = {
    id: 0,
    name: '',
    namespace: '',
    group: '',
    comment: '',
    content: '',
    format: '',
    tags: [],
    encrypted: false,
    encryptAlgo: '',
};

export const saveConfigFiles = createAsyncThunk(`config_file/create`, async ({ state }: { state: FileState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await createConfigFiles([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const updateConfigFiles = createAsyncThunk(`config_file/update`, async ({ state }: { state: FileState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyConfigFiles([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const removeConfigFeils = createAsyncThunk(`config_file/delete`, async ({ state }: { state: FileState[] }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await deleteConfigFiles(state);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});


const configFileReducer = createSlice({
    name: 'config_file/edit',
    initialState,
    reducers: {
        editorConfigFile: (state, action: PayloadAction<FileState>) => {
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
} = configFileReducer.actions;
export const selectConfigFile = (state: RootState) => state.configFile;


export default configFileReducer.reducer;
