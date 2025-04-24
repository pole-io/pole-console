import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { InstanceLocation } from 'services/instance';

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
    location: {
        region: '',
        zone: '',
        campus: ''
    }
};

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