import request, { apiRequest, ApiResponse, getAllList, getApiRequest, putApiRequest } from 'utils/request';
import { SuccessCode } from './const';
import { MatcheLabel } from './types';
import { Label } from './config_files';

export interface ConfigFileRelease {
    name: string
    namespace: string
    group: string
    fileName: string
    content: string
    comment: string
    md5: string
    version: string
    tags: Label[]
    createTime: string
    createBy: string
    modifyTime: string
    modifyBy: string
    releaseDescription?: string
    releaseStatus?: string
    active: string
    releaseType?: string
    format: string
    betaLabels: MatcheLabel[]
    id: string
}

export interface ConfigFileReleaseHistory {
    id: string
    name: string
    namespace: string
    group: string
    fileName: string
    content: string
    format: string
    comment: string
    md5: string
    type: string
    status: string
    tags: Label[]
    createTime: string
    createBy: string
    modifyTime: string
    modifyBy: string
    releaseDescription?: string
    releaseStatus?: string
    releaseReason?: string
}


/** 配置发布版本信息 */
export interface ReleaseVersion {
    // 名称
    name?: string
    // 是否生效
    active?: boolean
}

// 发布配置文件
export interface ReleaseConfigFilePequest {
    namespace: string
    group: string
    fileName: string
    name?: string
    releaseDescription?: string
    betaLabels?: MatcheLabel[]
    releaseType?: string
}

export interface ReleaseConfigFileResponse {
    configFileRelease: ConfigFileRelease
}

export async function releaseConfigFile(params: ReleaseConfigFilePequest) {
    const res = await apiRequest<ReleaseConfigFileResponse>({
        action: '/config/v1/files/release',
        data: params,
    })
    return res
}

// 查询配置文件发布详情
export interface DescribeOneFileReleaseRequest {
    // 命名空间名称
    namespace: string
    // 配置分组名称
    group: string
    // 配置文件名称
    file_name: string
    // 配置文件版本
    release_name?: string
}

export interface DescribeOneFileReleaseResponse {
    /** 配置文件发布详情 */
    configFileRelease: ConfigFileRelease
}

export async function describeOneFileRelease(params: DescribeOneFileReleaseRequest) {
    const res = await getApiRequest<DescribeOneFileReleaseResponse>({
        action: '/config/v1/files/release',
        data: params,
    })
    return res
}

// 查询配置文件发布历史
export interface DescribeConfigFileReleasesRequest {
    // 命名空间
    namespace?: string
    // 配置分组
    group?: string
    // 文件名称
    file_name?: string
    // 只保护处于使用状态
    only_use?: boolean
    // 发布名称
    release_name?: string
    // 条数
    limit: number
    // 偏移量
    offset: number
}

export interface DescribeConfigFileReleasesResponse {
    configFileReleases: ConfigFileRelease[]
    total: number
}

export async function describeFileReleases(params: DescribeConfigFileReleasesRequest) {
    const res = await getApiRequest<DescribeConfigFileReleasesResponse>({
        action: '/config/v1/files/releases',
        data: params,
    })
    return res
}

// 查询某个配置文件的发布的版本记录
export interface DescribeFileReleaseVersionsRequest {
    // 命名空间
    namespace?: string
    // 配置分组
    group?: string
    // 文件名称
    file_name?: string
}

export interface DescribeFileReleaseVersionsResponse {
    // 版本信息
    configFileReleases?: ReleaseVersion[]
}

export async function describeFileReleaseVersions(params: DescribeFileReleaseVersionsRequest) {
    const res = await getApiRequest<DescribeFileReleaseVersionsResponse>({
        action: '/config/v1/files/release/versions',
        data: params,
    })
    return res
}

// 回滚配置发布
export interface RollbackFileReleasesResquest {
    namespace: string
    group: string
    fileName: string
    name: string
}

export interface RollbackFileReleasesResponse {
    code: number
    info: string
}

export async function rollbackFileReleases(params: RollbackFileReleasesResquest[]) {
    const res = await putApiRequest<RollbackFileReleasesResponse>({
        action: '/config/v1/files/releases/rollback',
        data: params,
    })
    return res
}

// 删除已发布的配置
export interface DeleteFileReleaseRequest {
    // 命名空间
    namespace?: string
    // 配置分组
    group?: string
    // 文件名称
    fileName?: string
    // 发布名称
    name?: string
}

export interface DeleteConfigFileReleasesResponse {
    /** 删除配置发布结果 */
    result?: boolean
}

export async function deleteFileReleases(params: DeleteFileReleaseRequest[]) {
    const res = await apiRequest<DeleteConfigFileReleasesResponse>({
        action: '/config/v1/files/releases/delete',
        data: params,
    })
    return res
}

