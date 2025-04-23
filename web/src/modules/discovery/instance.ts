
// State 和 Action 类型定义
export interface InstanceState {
    id: string;
    namespace: string;
    service: string;
    ip: string;
    port: number;
    weight: number;
    healthy: boolean;
    isolated: boolean;
    metadata: Record<string, string>;
}

const initialState: InstanceState = {
    id: '',
    namespace: '',
    service: '',
    ip: '',
    port: 0,
    weight: 0,
    healthy: false,
    isolated: false,
    metadata: {}
};
