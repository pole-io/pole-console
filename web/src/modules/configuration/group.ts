import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { createConfigFileGroups, deleteConfigFileGroups, modifyConfigFileGroups } from 'services/config_group';


// State 和 Action 类型定义
export interface ConfigGroupState {
    id: number
    name: string
    namespace: string
    comment: string
    department?: string
    business?: string
    metadata?: Record<string, string>
    editable?: boolean
    deleteable?: boolean
}

const initialState: ConfigGroupState = {
    id: 0,
    name: '',
    namespace: '',
    comment: '',
    department: '',
    business: '',
    metadata: {},
    editable: true,
    deleteable: true
};


export const saveConfigGroups = createAsyncThunk(`config_group/create`, async ({ state }: { state: ConfigGroupState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await createConfigFileGroups([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const updateConfigGroups = createAsyncThunk(`config_group/update`, async ({ state }: { state: ConfigGroupState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyConfigFileGroups([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const removeConfigGroups = createAsyncThunk(`config_group/delete`, async ({ state }: { state: ConfigGroupState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await deleteConfigFileGroups([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});


const configgroupReducer = createSlice({
    name: 'config_group/edit',
    initialState,
    reducers: {
        viewConfigGroup: (state, action: PayloadAction<ConfigGroupState>) => {
            state = {
                ...state,
                ...action.payload
            };
            return state;
        },
        editorConfigGroup: (state, action: PayloadAction<ConfigGroupState>) => {
            state = {
                ...state,
                ...action.payload
            };
            return state;
        },
        resetConfigGroup: (state) => {
            state = initialState;
            return state;
        }
    },
    extraReducers: () => { },
})

export const {
    viewConfigGroup,
    editorConfigGroup,
    resetConfigGroup,
} = configgroupReducer.actions;
export const selectConfigGroup = (state: RootState) => state.configGroup;


export default configgroupReducer.reducer;