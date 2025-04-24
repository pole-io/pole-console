import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { modifyNamespace, createNamespace } from '../../services/namespace'

// State 和 Action 类型定义
export interface NamespaceState {
    name: string;
    comment: string;
    service_export_to: string[];
    metadata: Record<string, string>;
    visibility_mode?: string;
}

const initialState: NamespaceState = {
    name: '',
    comment: '',
    service_export_to: [],
    metadata: { '': '' },
    visibility_mode: '',
    // callback: undefined,
};

export const saveNamespace = createAsyncThunk(`namespace/create`, async ({ state }: { state: NamespaceState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await createNamespace([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        console.log('error', error);
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

export const updateNamespace = createAsyncThunk(`namespace/update`, async ({ state }: { state: NamespaceState }, { fulfillWithValue, rejectWithValue }) => {
    try {
        const res = await modifyNamespace([state]);
        return fulfillWithValue(res); // 返回 token
    } catch (error) {
        console.log('error', error);
        return rejectWithValue((error as Error).message); // 捕获错误并返回
    }
});

const namespaceReducer = createSlice({
    name: 'namespace/edit',
    initialState,
    reducers: {
        editorNamespace: (state, action: PayloadAction<NamespaceState>) => {
            console.log('editorNamespace', action.payload);
            const { name, comment, service_export_to, metadata, visibility_mode } = action.payload;
            state = {
                ...state,
                name,
                comment,
                service_export_to,
                metadata,
                visibility_mode,
            };
            return state;
        },
    },
    extraReducers: () => { },
});

export const selectNamespace = (state: RootState) => state.namespace;

export const {
    editorNamespace,
} = namespaceReducer.actions;

export default namespaceReducer.reducer;
