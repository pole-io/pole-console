import request, { apiRequest, getAllList, getApiRequest, putApiRequest } from 'utils/request';

export interface InstanceLocation {
    region: string
    zone: string
    campus: string
}

export interface Instance {
    ctime: string
    enableHealthCheck: boolean
    healthy: string
    host: string
    id: string
    isolate: string
    logic_set: string
    mtime: string
    namespace: string
    port: number
    protocol: string
    revision: string
    service: string
    version: string
    vpc_id: string
    weight: number
    editable: boolean
    deleteable: boolean
    location: InstanceLocation
}

export interface HEALTH_CHECK_STRUCT {
    type: number
    heartbeat: {
        ttl: number
    }
}


export enum HEALTH_STATUS {
    HEALTH = 'true',
    ABNORMAL = 'false',
    METRIC_HEALTH = 'health',
    METRIC_ABNORMAL = 'unhealth',
    METRIC_OFFLINE = 'offline',
}

export enum ISOLATE_STATUS {
    ISOLATE = 'true',
    UNISOLATED = 'false',
}

export enum HEALTH_CHECK_METHOD {
    HEARTBEAT = 'HEARTBEAT',
}

export const HEALTH_CHECK_METHOD_MAP = {
    [HEALTH_CHECK_METHOD.HEARTBEAT]: {
        text: '心跳上报',
    },
}

export const HEALTH_STATUS_MAP = {
    [HEALTH_STATUS.HEALTH]: {
        text: '健康',
        theme: 'success',
    },
    [HEALTH_STATUS.ABNORMAL]: {
        text: '异常',
        theme: 'danger',
    },
    [HEALTH_STATUS.METRIC_HEALTH]: {
        text: '健康',
        theme: 'success',
    },
    [HEALTH_STATUS.METRIC_ABNORMAL]: {
        text: '异常',
        theme: 'danger',
    },
    [HEALTH_STATUS.METRIC_OFFLINE]: {
        text: '下线',
        theme: 'danger',
    },
}

export const HEALTH_STATUS_OPTIONS = [
    {
        text: HEALTH_STATUS_MAP[HEALTH_STATUS.HEALTH].text,
        value: HEALTH_STATUS.HEALTH,
    },
    {
        text: HEALTH_STATUS_MAP[HEALTH_STATUS.ABNORMAL].text,
        value: HEALTH_STATUS.ABNORMAL,
    },
]

export const HEALTH_CHECK_METHOD_OPTIONS = [
    {
        text: HEALTH_CHECK_METHOD_MAP[HEALTH_CHECK_METHOD.HEARTBEAT].text,
        value: HEALTH_CHECK_METHOD.HEARTBEAT,
    },
]

export const ISOLATE_STATUS_MAP = {
    [ISOLATE_STATUS.ISOLATE]: {
        text: '隔离',
        theme: 'danger',
    },
    [ISOLATE_STATUS.UNISOLATED]: {
        text: '不隔离',
        theme: 'success',
    },
}

export interface DescribeInstancesParams {
    offset: number
    limit: number
    service: string
    namespace: string
    host?: string
    port?: number
    weight?: number
    protocol?: string
    version?: string
    keys?: string
    values?: string
    healthy?: boolean
    isolate?: boolean
}

export interface DescribeInstancesResult {
    amount: number
    size: number
    instances: Array<Instance>
}
export interface OperateInstancesResult {
    amount: number
    size: number
    responses: Array<InstanceResponse>
}
export interface InstanceResponse {
    code: number
    info: string
    instance: {
        host: string
        id: string
        namespace: string
        port: number
        service: string
    }
}

export interface DescribeInstanceLabelsParams {
    namespace: string
    service: string
}
export interface DescribeInstanceLabelsResult {
    instanceLabels: {
        labels: Record<string, { values: string[] }>
    }
}
export interface CreateInstanceParams {
    enable_health_check: boolean
    health_check?: HEALTH_CHECK_STRUCT
    healthy: boolean
    host: string
    isolate: boolean
    metadata: Record<string, string>
    namespace: string
    port: number
    protocol: string
    service: string
    version: string
    weight: number
    location: InstanceLocation
}

export interface ModifyInstanceParams {
    enable_health_check: boolean
    health_check?: HEALTH_CHECK_STRUCT
    healthy: boolean
    isolate: boolean
    metadata: Record<string, string>
    namespace: string
    protocol: string
    service: string
    version: string
    weight: number
    location: InstanceLocation
    id: string
}
export interface DeleteInstancesParams {
    id: string
}
export async function describeInstances(params: DescribeInstancesParams) {
    const res = await getApiRequest<DescribeInstancesResult>({
        action: '/naming/v1/instances',
        data: params,
    })
    return {
        list: res.instances,
        totalCount: res.amount,
    }
}

export async function createInstances(params: CreateInstanceParams[]) {
    const res = await apiRequest<OperateInstancesResult>({
        action: '/naming/v1/instances',
        data: params,
    })

    return res
}

export async function modifyInstances(params: ModifyInstanceParams[]) {
    const res = await putApiRequest<OperateInstancesResult>({
        action: '/naming/v1/instances',
        data: params,
    })

    return res
}
export async function deleteInstances(params: DeleteInstancesParams[]) {
    const res = await apiRequest<void>({
        action: '/naming/v1/instances/delete',
        data: params,
    })

    return res
}

export async function describeInstanceLabels(params: DescribeInstanceLabelsParams) {
    const res = await getApiRequest<DescribeInstanceLabelsResult>({
        action: '/naming/v1/instances/labels',
        data: params,
    })
    return res.instanceLabels.labels
}
