import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { HEALTH_CHECK_STRUCT, InstanceLocation, createInstances, modifyInstances } from 'services/instance';

// State 和 Action 类型定义
export interface InstanceState {
    id: string;
    namespace: string;
    service: string;
    host: string;
    port: number;
    protocol: string;
    version: string;
    weight: number;
    healthy: boolean;
    isolate: boolean;
    metadata: Record<string, string>;
    enable_health_check: boolean;
    health_check?: HEALTH_CHECK_STRUCT;
    location: InstanceLocation;
}

const initialState: InstanceState = {
    id: '',
    namespace: '',
    service: '',
    host: '',
    port: 0,
    protocol: '',
    version: '',
    weight: 0,
    healthy: false,
    isolate: false,
    metadata: {},
    enable_health_check: false,
    health_check: {
        type: 1,
        heartbeat: {
            ttl: 5,
        }
    },
    location: {
        region: '',
        zone: '',
        campus: ''
    }
};


export const saveInstances = createAsyncThunk(`instance/create`, async ({ state }: { state: InstanceState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await createInstances([{...state }])
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const updateInstances = createAsyncThunk(`instance/update`, async ({ state }: { state: InstanceState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyInstances([{...state, id: state.id }]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});


const instanceReducer = createSlice({
    name: 'instance',
    initialState,
    reducers: {
        editorInstance: (state, action: PayloadAction<InstanceState>) => {
            const { id, namespace, service, host, port, weight, healthy, isolate, metadata, protocol, version } = action.payload;
            state = {
                ...state,
                ...action.payload,
            };
            return state;
        },
        resetInstance: (state) => {
            state = {
                id: '',
                namespace: '',
                service: '',
                host: '',
                port: 0,
                protocol: '',
                version: '',
                weight: 0,
                healthy: false,
                isolate: false,
                metadata: {},
                enable_health_check: false,
                health_check: {
                    type: 1,
                    heartbeat: {
                        ttl: 5,
                    }
                },
                location: {
                    region: '',
                    zone: '',
                    campus: ''
                }
            };
            return state;
        }
    }
})


export const {
    editorInstance,
    resetInstance
} = instanceReducer.actions;
export const selectInstance = (state: RootState) => state.discoveryInstance;


export default instanceReducer.reducer;