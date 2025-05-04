import request, { apiRequest, ApiResponse, getAllList, getApiRequest, putApiRequest } from 'utils/request';
import { SuccessCode } from './const';

// 配置分组
export interface ConfigFileGroup {
    id: number
    name: string
    namespace: string
    comment: string
    fileCount: number
    editable: boolean
    deleteable: boolean
    department?: string
    business?: string
    metadata?: Record<string, string>
    createTime: string
    createBy: string
    modifyTime: string
    modifyBy: string
}

// 查询配置分组列表
export interface DescribeConfigFileGroupRequest {
    offset: number
    limit: number
    namespace?: string
    group?: string
    file_name?: string
}

export interface DescribegroupsResponse {
    total: number
    configFileGroups: Array<ConfigFileGroup>
}

export async function describeConfigFileGroups(params: DescribeConfigFileGroupRequest) {
    const res = await getApiRequest<DescribegroupsResponse>({
        action: '/config/v1/groups',
        data: params,
    })
    return {
        list: res.configFileGroups,
        totalCount: res.total,
    }
}

// 创建配置分组
export interface CreateConfigFileGroupRequest {
    name: string
    namespace: string
    comment?: string
    department?: string
    business?: string
    metadata?: Record<string, string>
}

export interface CreateConfigFileGroupResponse {
    configFileGroup: ConfigFileGroup
}

export async function createConfigFileGroups(params: CreateConfigFileGroupRequest[]) {
    const res = await apiRequest<CreateConfigFileGroupResponse>({
        action: '/config/v1/groups',
        data: params,
    })
    return res
}

// 修改配置分组
export interface ModifyConfigFileGroupRequest {
    id: number
    name: string
    namespace: string
    comment?: string
    department?: string
    business?: string
    metadata?: Record<string, string>
}

export interface ModifyConfigFileGroupResponse {
    configFileGroup: ConfigFileGroup
}

export async function modifyConfigFileGroups(params: ModifyConfigFileGroupRequest[]) {
    const res = await putApiRequest<ModifyConfigFileGroupResponse>({
        action: '/config/v1/groups',
        data: params,
    })
    return res
}

export interface DeleteConfigFileGroupRequest {
    id: number,
    namespace?: string
    group?: string
}

export type DeleteConfigFileGroupResponse = {}

export async function deleteConfigFileGroups(params: DeleteConfigFileGroupRequest[]) {
    const res = await apiRequest<DeleteConfigFileGroupResponse>({
        action: '/config/v1/groups/delete',
        data: params,
    })
    return res
}