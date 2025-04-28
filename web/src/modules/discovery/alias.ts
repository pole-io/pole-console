import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { modifyServiceAlias, createServiceAlias } from '../../services/alias'


// State 和 Action 类型定义
export interface ServiceAliasState {
    id?: string
    alias: string
    alias_namespace: string
    service: string
    namespace: string
    comment?: string
}

const initialState: ServiceAliasState = {
    id: '',
    alias: '',
    alias_namespace: '',
    service: '',
    namespace: '',
    comment: ''
};


export const saveServiceAliass = createAsyncThunk(`service/create`, async ({ state }: { state: ServiceAliasState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await createServiceAlias(state);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const updateServiceAliass = createAsyncThunk(`service/update`, async ({ state }: { state: ServiceAliasState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyServiceAlias(state);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});


const serviceAliasReducer = createSlice({
    name: 'service/edit',
    initialState,
    reducers: {
        editorServiceAlias: (state, action: PayloadAction<ServiceAliasState>) => {
            state = {
                ...state,
                ...action.payload
            };
            return state;
        },
        resetServiceAlias: (state) => {
            state = {
                id: '',
                alias: '',
                alias_namespace: '',
                service: '',
                namespace: '',
                comment: ''
            };
            return state;
        }
    },
    extraReducers: () => { },
})

export const {
    editorServiceAlias,
    resetServiceAlias,
} = serviceAliasReducer.actions;
export const selectServiceAlias = (state: RootState) => state.discoveryServiceAlais;


export default serviceAliasReducer.reducer;