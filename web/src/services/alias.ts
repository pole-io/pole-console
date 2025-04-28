import request, { apiRequest, getAllList, getApiRequest, putApiRequest } from 'utils/request';

export interface DescribeServiceAliasParams {
    /** 服务别名所指向的服务名。 */
    service?: string

    /** 服务别名所指向的命名空间名。 */
    namespace?: string

    /** 服务别名。 */
    alias?: string

    /** 服务别名命名空间。 */
    alias_namespace?: string

    /** 服务别名描述。 */
    comment?: string

    /** 偏移量，默认为0。 */
    offset?: number

    /** 返回数量，默认为20，最大值为100。 */
    limit?: number
}

export interface DescribeServiceAliasResult {
    /** 服务别名总数量。 */
    amount: number
    /** 服务别名列表。 */
    aliases: ServiceAlias[]
}

export interface ServiceAlias {
    /** 服务别名 */
    alias: string
    /** 服务别名命名空间 */
    alias_namespace: string
    /** 服务别名指向的服务名 */
    service: string
    /** 服务别名指向的服务命名空间 */
    namespace: string
    /** 服务别名的描述信息 */
    comment?: string
    /** 服务别名创建时间 */
    ctime?: string
    /** 服务别名修改时间 */
    mtime?: string
    /** 服务别名是否可编辑 */
    editable?: boolean
    /** 服务别名是否可删除 */
    deleteable?: boolean
}

export interface CreateServiceAliasParams {
    /** 服务别名 */
    alias: string

    /** 服务别名命名空间 */
    alias_namespace: string

    /** 服务别名所指向的服务名 */
    service: string

    /** 服务别名所指向的命名空间 */
    namespace: string

    /** 服务别名描述 */
    comment?: string
}

export interface CreateServiceAliasResult {
    /** 创建是否成功。 */
    result: boolean
}

export interface ModifyServiceAliasParams {
    /** 服务别名 */
    alias: string

    /** 服务别名命名空间 */
    alias_namespace: string

    /** 服务别名所指向的服务名 */
    service: string

    /** 服务别名所指向的命名空间 */
    namespace: string

    /** 服务别名描述 */
    comment?: string
}

export interface ModifyServiceAliasResult {
    /** 创建是否成功。 */
    result: boolean
}

export type DeleteServiceAliasParams = { alias: string; alias_namespace: string }[]

export interface DeleteServiceAliasResult {
    /** 创建是否成功。 */
    result: boolean
}

export async function describeServiceAlias(params: DescribeServiceAliasParams) {
    const result = await getApiRequest<DescribeServiceAliasResult>({
        action: '/naming/v1/service/aliases',
        data: params,
    })
    return {
        totalCount: result.amount,
        content: result.aliases ? result.aliases : [],
    }
}

export function createServiceAlias(params: CreateServiceAliasParams) {
    return apiRequest<CreateServiceAliasResult>({ action: '/naming/v1/service/alias', data: params })
}

export function deleteServiceAlias(params: DeleteServiceAliasParams) {
    return apiRequest<DeleteServiceAliasResult>({ action: '/naming/v1/service/aliases/delete', data: params })
}

export function modifyServiceAlias(params: ModifyServiceAliasParams) {
    return putApiRequest<ModifyServiceAliasResult>({ action: '/naming/v1/service/alias', data: params })
}