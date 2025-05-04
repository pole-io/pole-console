// MatchString 匹配方式
// type: 'EXACT' | 'REGEX' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'RANGE'
// value_type: 'TEXT' | 'PARAMETER' | 'VARIABLE'
export enum MatchType {
    EXACT = 'EXACT',
    REGEX = 'REGEX',
    NOT_EQUALS = 'NOT_EQUALS',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    RANGE = 'RANGE',
}

export const MatchTypeMap = {
    'EXACT': '完全匹配',
    'REGEX': '正则匹配',
    'NOT_EQUALS': '不匹配',
    'IN': '包含',
    'NOT_IN': '不包含',
    'RANGE': '范围匹配',
}


export const MatchTypeOption = [
    {
        label: MatchTypeMap[MatchType.EXACT],
        value: MatchType.EXACT,
    },
    {
        label: MatchTypeMap[MatchType.REGEX],
        value: MatchType.REGEX,
    },
    {
        label: MatchTypeMap[MatchType.NOT_EQUALS],
        value: MatchType.NOT_EQUALS,
    },
    {
        label: MatchTypeMap[MatchType.IN],
        value: MatchType.IN,
    },
    {
        label: MatchTypeMap[MatchType.NOT_IN],
        value: MatchType.NOT_IN,
    },
    {
        label: MatchTypeMap[MatchType.RANGE],
        value: MatchType.RANGE,
    },
]

export enum MatchValueType {
    TEXT = 'TEXT',
    PARAMETER = 'PARAMETER',
    VARIABLE = 'VARIABLE',
}

export const MatchValueTypeMap = {
    'TEXT': '文本',
    'PARAMETER': '参数',
    'VARIABLE': '变量',
}

export const MatchValueTypeOption = [
    {
        label: MatchValueTypeMap[MatchValueType.TEXT],
        value: MatchValueType.TEXT,
    },
    {
        label: MatchValueTypeMap[MatchValueType.PARAMETER],
        value: MatchValueType.PARAMETER,
    },
    {
        label: MatchValueTypeMap[MatchValueType.VARIABLE],
        value: MatchValueType.VARIABLE,
    },
]

export interface MatchString {
    type: string
    value: string
    value_type: string
}

export interface MatcheLabel {
    key: string
    value: MatchString
}

// 匹配规则类型
export enum ClientLabelType {
    CLIENT_ID = 'CLIENT_ID',
    CLIENT_LANGUAGE = 'CLIENT_LANGUAGE',
    CLIENT_IP = 'CLIENT_IP',
    CUSTOM = 'CUSTOM',
}

export const ClientLabelTypeOption = [
    {
        value: ClientLabelType.CLIENT_IP,
        label: '客户端IP',
    },
    {
        value: ClientLabelType.CLIENT_ID,
        label: '客户端ID',
    },
    {
        value: ClientLabelType.CLIENT_LANGUAGE,
        label: '客户端语言',
    },
    // {
    //     value: ClientLabelType.CUSTOM,
    //     label: '自定义',
    // },
]

export const ClientLabelTypeMap = {
    CLIENT_ID: '客户端ID',
    CLIENT_IP: '客户端IP',
    CUSTOM: '自定义',
}