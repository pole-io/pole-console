import request, { apiRequest, getAllList, getApiRequest, putApiRequest } from 'utils/request';
import { CheckVisibilityMode } from 'utils/visible';

export interface Namespace {
    name: string
    comment: string
    ctime: string
    mtime: string
    metadata: Record<string, string>
    total_service_count?: number
    total_health_instance_count?: number
    total_instance_count?: number
    service_export_to?: string[]
    editable: boolean
    deleteable: boolean
}

export interface NamespaceView {
    name: string
    comment: string
    ctime: string
    mtime: string
    editable: boolean
    deleteable: boolean
    metadata: Record<string, string>
    total_service_count?: number
    total_health_instance_count?: number
    total_instance_count?: number
    service_export_to?: string[]
    visibility_mode?: string
}


export interface DescribeNamespaceParams {
    limit: number
    offset: number
    name?: string
    owners?: string
}

export interface CreateNamespaceParams {
    name: string
    comment: string
    service_export_to?: string[]
    metadata: Record<string, string>
}

export interface CreateNamespaceResult {
    namespace: Namespace
}

export interface ModifyNamespaceParams {
    name: string
    comment?: string
    service_export_to?: string[]
    metadata: Record<string, string>
}

export interface ModifyNamespaceResult {
    size: number
}

export interface DeleteNamespaceParams {
    name: string
    token: string
}

export interface DeleteNamespaceResult {
    size: number
}

export interface DescribeNamespacesResult {
    amount: number
    size: number
    namespaces: Array<Namespace>
}


export async function describeComplicatedNamespaces(params: DescribeNamespaceParams) {
    const res = await getApiRequest<DescribeNamespacesResult>({
        action: '/core/v1/namespaces',
        data: params,
    })

    const ns = res.namespaces.map((item) => {
        return {
            ...item,
            visibility_mode: CheckVisibilityMode(item.service_export_to, item.name),
        }
    })

    return { ...res, namespaces: ns }
}

export async function describeAllNamespaces() {
    const { list: namespaceList } = await getAllList(describeComplicatedNamespaces, {
        listKey: 'namespaces',
        totalKey: 'amount',
    })({})

    const ns = namespaceList.map((item) => {
        return {
            ...item,
            visibility_mode: CheckVisibilityMode(item.service_export_to, item.name),
        }
    })

    return ns
}

export async function createNamespace(params: CreateNamespaceParams[]) {
    const res = await apiRequest<CreateNamespaceResult>({
        action: '/core/v1/namespaces',
        data: params,
    })

    return res
}

export async function modifyNamespace(params: ModifyNamespaceParams[]) {
    const res = await putApiRequest<ModifyNamespaceResult>({
        action: '/core/v1/namespaces',
        data: params,
    })

    return res
}

export async function deleteNamespace(params: DeleteNamespaceParams[]) {
    const res = await apiRequest<DeleteNamespaceResult>({
        action: '/core/v1/namespaces/delete',
        data: params,
    })

    return res
}
