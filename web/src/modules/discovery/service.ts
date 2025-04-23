import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { modifyServices, createService } from '../../services/service'


// State 和 Action 类型定义
export interface ServiceState {
    id: string;
    namespace: string;
    name: string;
    ports: string;
    owners: string;
    comment: string;
    department: string
    business: string
    service_export_to: string[];
    metadata: Record<string, string>;
    visibility_mode?: string;
}

const initialState: ServiceState = {
    id: '',
    namespace: '',
    name: '',
    comment: '',
    department: '',
    business: '',
    service_export_to: [],
    metadata: { '': '' },
    visibility_mode: '',
    ports: '',
    owners: ''
};


export const saveServices = createAsyncThunk(`service/create`, async ({ state }: { state: ServiceState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await createService([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const updateServices = createAsyncThunk(`service/update`, async ({ state }: { state: ServiceState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyServices([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});


const serviceEditorSlice = createSlice({
    name: 'service/edit',
    initialState,
    reducers: {
        editorService: (state, action: PayloadAction<ServiceState>) => {
            const { id, namespace, name, comment, department, business, service_export_to, metadata, visibility_mode } = action.payload;
            state = {
                ...state,
                id,
                namespace,
                name,
                comment,
                department,
                business,
                service_export_to,
                metadata,
                visibility_mode,
            };
            return state;
        },
        resetService: (state) => {
            state = {
                id: '',
                namespace: '',
                name: '',
                comment: '',
                department: '',
                business: '',
                service_export_to: [],
                metadata: { '': '' },
                visibility_mode: '',
                ports: '',
                owners: ''
            };
            return state;
        }
    },
    extraReducers: () => { },
})

export const {
    editorService,
    resetService,
} = serviceEditorSlice.actions;
export const selectService = (state: RootState) => state.discoveryService;


export default serviceEditorSlice.reducer;