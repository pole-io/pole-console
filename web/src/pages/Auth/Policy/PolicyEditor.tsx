import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Space, Button, Radio, Steps, Tree, Transfer, RadioGroup, Row, Col } from "tdesign-react";
import type { FormProps } from 'tdesign-react';

import style from './index.module.less';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import LabelInput from 'components/LabelInput';
import { savePolicyRules, selectPolicyRule, updatePolicyRules } from 'modules/auth/policy';
import { describeAllUsers } from 'services/users';
import { describeAllUserGroups } from 'services/user_group';
import { describeAllRoles } from 'services/role';
import { describeAllAuthPolicies, describeServerFunctions, getServerFunctionDesc, ServerFunction, ServerFunctionGroup } from 'services/auth_policy';
import { describeAllNamespaces } from 'services/namespace';
import { describeAllServices } from 'services/service';
import { describeAllConfigGroups } from 'services/config_group';
import { v4 as uuidv4 } from 'uuid';

const { FormItem } = Form;
const { StepItem } = Steps;

const resourceTree = [
    { label: '命名空间', value: 'Namespace' },
    { label: '服务', value: 'Service' },
    { label: '配置组', value: 'ConfigGroup' },
    { label: '路由规则', value: 'RouteRule' },
    { label: '限流规则', value: 'RateLimitRule' },
    { label: '熔断规则', value: 'CircuitBreakerRule' },
    { label: '探测规则', value: 'FaultDetectRule' },
    { label: '用户', value: 'User' },
    { label: '用户组', value: 'UserGroup' },
    { label: '角色', value: 'Role' },
    { label: '鉴权策略', value: 'AuthPolicy' },
];

const principalTree = [
    { label: '用户', value: 'User' },
    { label: '用户组', value: 'UserGroup' },
    { label: '角色', value: 'Role' },
]

const serverFunctionTree = [
    { label: "客户端", value: "Client" },
    { label: "命名空间", value: "Namespace" },
    { label: "服务", value: "Service|ServiceContract" },
    { label: "实例", value: "Instance" },
    { label: "治理规则", value: "RouteRule|RateLimitRule|CircuitBreakerRule|FaultDetectRule" },
    { label: "配置分组", value: "ConfigGroup" },
    { label: "配置文件", value: "ConfigFile|ConfigRelease" },
    { label: "用户", value: "User" },
    { label: "用户组", value: "UserGroup" },
    { label: "鉴权策略", value: "AuthPolicy" },
];

interface IPolicyEditorProps {
    op: 'create' | 'edit' | 'view' | 'delete';
    closeDrawer: () => void;
    visible: boolean;
}

const PolicyEditor: React.FC<IPolicyEditorProps> = ({ visible, op, closeDrawer }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const currentPolicy = useAppSelector(selectPolicyRule);

    // 下拉/Transfer数据
    const [state, setState] = React.useState<{
        principalOptions: { [key: string]: { value: string; label: string }[] };
        resourceOptions: { [key: string]: { value: string; label: string }[] };
        viewFunctionOptions: { value: string; label: string }[];
        functionOptions: ServerFunctionGroup[];
        loading: boolean;
        step: number;
        activePrincipalNode: string;
        activeFuncNode: string;
        activeResNode: string;
        selectResources: { [key: string]: { all: boolean; ids: string[] } };
        selectFunctions: { [key: string]: { group: string; functions: string[] } };
        selectPrincipals: { [key: string]: { all: boolean; ids: string[] } };
        useAllFunc: boolean;
        formValues: any; // 新增字段
        version: string;
    }>({
        functionOptions: [],
        viewFunctionOptions: [],
        principalOptions: {} as { [key: string]: { value: string; label: string }[] },
        resourceOptions: {} as { [key: string]: { value: string; label: string }[] },
        loading: false,
        step: 1,
        activePrincipalNode: 'User',
        activeFuncNode: 'Namespace',
        activeResNode: 'Namespace',
        selectResources: {},
        selectFunctions: {} as { [key: string]: { group: string; functions: string[] } },
        selectPrincipals: {} as { [key: string]: { all: boolean; ids: string[] } },
        useAllFunc: false,
        formValues: {}, // 新增字段
        version: uuidv4(),
    });

    // Helper functions to update individual state properties
    const setLoading = (loading: boolean) => setState(prev => ({ ...prev, loading }));
    // Destructure state for easier access in the component
    const { loading } = state;

    // 拉取所有下拉选项的异步函数
    async function loadOptions() {
        try {
            const users = await describeAllUsers();
            const groups = await describeAllUserGroups();
            const rolesRes = await describeAllRoles();
            const serverFnRes = await describeServerFunctions();
            const functionList: { value: string; label: string }[] = filterFunctionOptions(state.activeFuncNode, serverFnRes.list)?.map((item) => ({
                value: item.id,
                label: item.desc,
            }));

            setState(prev => ({
                ...prev,
                principalOptions: {
                    User: users.map((u: any) => ({ value: u.id, label: u.name })),
                    UserGroup: groups.map((g: any) => ({ value: g.id, label: g.name })),
                    Role: rolesRes.map((r: any) => ({ value: r.id, label: r.name })),
                },
                functionOptions: serverFnRes.list,
                viewFunctionOptions: functionList,
            }));
        } catch (err) {
            setLoading(false);
            openErrNotification('请求错误', String(err));
        }
    }

    // 表单初始化（支持create/edit/view）
    React.useEffect(() => {
        if (!visible) return;
        loadOptions();
        if ((op === 'edit' || op === 'view') && currentPolicy) {
            form.setFieldsValue({
                name: currentPolicy.name,
                action: (currentPolicy.action || '').toUpperCase(),
                comment: currentPolicy.comment,
                users: currentPolicy.principals?.users?.map(u => u.id) || [],
                groups: currentPolicy.principals?.groups?.map(g => g.id) || [],
                roles: currentPolicy.principals?.roles?.map(r => r.id) || [],
                functions: currentPolicy.functions || [],
                policy_labels: currentPolicy.metadata ? Object.entries(currentPolicy.metadata).map(([key, value]) => ({ key, value })) : [],
            });
        }
    }, [visible, currentPolicy, op]);

    const filterFunctionOptions = (keyword: string, funcGroup: ServerFunctionGroup[]): ServerFunction[] => {
        const targetGroup = funcGroup.filter(item => {
            for (const searchKey of keyword.split("|")) {
                if (searchKey === "" || searchKey === undefined) {
                    continue
                }
                if (searchKey === item.name) {
                    return true
                }
            }
            return false
        })

        if (targetGroup.length === 0) {
            return [];
        }

        const functionList: ServerFunction[] = [];
        for (const group of targetGroup) {
            functionList.push(...group.functions.map(item => ({
                id: item,
                name: item,
                desc: getServerFunctionDesc(group.name, item)
            })))
        }
        return functionList;
    }

    const handleTreeNodeClick = async (label: 'principal' | 'function' | 'resource', value: string) => {
        switch (label) {
            case 'function':
                const functionList: { value: string; label: string }[] = filterFunctionOptions(value, state.functionOptions)?.map((item) => ({
                    value: item.id,
                    label: item.desc,
                }));
                setState(prev => ({
                    ...prev,
                    activeFuncNode: value,
                    viewFunctionOptions: functionList,
                }));
                break;
            case 'principal':
                setState(prev => ({
                    ...prev,
                    activePrincipalNode: value,
                }));
                break;
            case 'resource':
                if (state.resourceOptions[value]) {
                    setState(prev => ({
                        ...prev,
                        activeResNode: value,
                    }));
                    return;
                }

                console.log("load resource", value);
                let resources: { value: string; label: string }[] = [];
                try {
                    let data;
                    switch (value) {
                        case 'Namespace':
                            data = await describeAllNamespaces();
                            resources = data?.map((item: any) => ({ value: item.id, label: item.name })) || [];
                            break;
                        case 'Service':
                            data = await describeAllServices();
                            resources = data?.list?.map((item: any) => ({ value: item.id, label: item.name })) || [];
                            break;
                        case 'ConfigGroup':
                            data = await describeAllConfigGroups();
                            resources = data?.list?.map((item: any) => ({ value: item.id, label: item.name })) || [];
                            break;
                        case 'User':
                            data = await describeAllUsers();
                            resources = data?.map((item: any) => ({ value: item.id, label: item.name })) || [];
                            break;
                        case 'UserGroup':
                            data = await describeAllUserGroups();
                            resources = data?.map((item: any) => ({ value: item.id, label: item.name })) || [];
                            break;
                        case 'Role':
                            data = await describeAllRoles();
                            resources = data?.map((item: any) => ({ value: item.id, label: item.name })) || [];
                            break;
                        case 'AuthPolicy':
                            data = await describeAllAuthPolicies();
                            resources = data?.content?.map((item: any) => ({ value: item.id, label: item.name })) || [];
                            break;
                        case 'RouteRule':
                            break;
                        case 'RateLimitRule':
                            break;
                        case 'CircuitBreakerRule':
                            break;
                        case 'FaultDetectRule':
                            break;
                        case 'LaneRule':
                            break;
                        default:
                            break;
                    }

                    console.log("resources", resources);
                    setState(prev => ({
                        ...prev,
                        activeResNode: value,
                        resourceOptions: { ...prev.resourceOptions, [value]: resources },
                    }));
                } catch (error) {
                    openErrNotification('获取资源列表失败', String(error));
                }
                break;
            default:
                break;
        }
    }

    // 步骤切换时保存/恢复表单数据
    const handleStepChange = async (nextStep: number) => {
        // 保存当前表单数据
        if (state.step === 1) {
            const values = await form.getFieldsValue(true);
            console.log("save", values);
            setState(prev => ({ ...prev, formValues: values, step: nextStep }));
        } else if (nextStep === 1) {
            console.log("restore", state.formValues);
            // 恢复表单数据
            form.setFieldsValue(state.formValues);
            setState(prev => ({ ...prev, step: nextStep, version: uuidv4() }));
        } else {
            // 其他步骤直接切换
            setState(prev => ({ ...prev, step: nextStep }));
        }
    };

    // 表单提交
    const onSubmit: FormProps['onSubmit'] = async (e) => {
        if (e.validateResult !== true) {
            return
        };
        setLoading(true);
        const labels = (form.getFieldValue('policy_labels') || []) as { key: string, value: string }[];

        const newData = {
            id: op === 'edit' ? currentPolicy.id : undefined,
            name: String(form.getFieldValue('name') || ''),
            action: String(form.getFieldValue('action') || '').toUpperCase(),
            comment: String(form.getFieldValue('comment') || ''),
            principals: {
                users: state.selectPrincipals['User']?.all ? [{ id: "*" }] : state.selectPrincipals['User']?.ids.map((id) => ({ id })) || [],
                groups: state.selectPrincipals['UserGroup']?.all ? [{ id: "*" }] : state.selectPrincipals['UserGroup']?.ids.map((id) => ({ id })) || [],
                roles: state.selectPrincipals['Role']?.all ? [{ id: "*" }] : state.selectPrincipals['Role']?.ids.map((id) => ({ id })) || [],
            },
            resources: {
                namespaces: state.selectResources['Namespace']?.all ? [{ id: "*" }] : state.selectResources['Namespace']?.ids.map((id) => ({ id })) || [],
                services: state.selectResources['Service']?.all ? [{ id: "*" }] : state.selectResources['Service']?.ids.map((id) => ({ id })) || [],
                config_groups: state.selectResources['ConfigGroup']?.all ? [{ id: "*" }] : state.selectResources['ConfigGroup']?.ids.map((id) => ({ id })) || [],
                users: state.selectResources['User']?.all ? [{ id: "*" }] : state.selectResources['User']?.ids.map((id) => ({ id })) || [],
                user_groups: state.selectResources['UserGroup']?.all ? [{ id: "*" }] : state.selectResources['UserGroup']?.ids.map((id) => ({ id })) || [],
                roles: state.selectResources['Role']?.all ? [{ id: "*" }] : state.selectResources['Role']?.ids.map((id) => ({ id })) || [],
            },
            functions: state.useAllFunc ? ['*'] : Object.values(state.selectFunctions).reduce((acc: string[], cur) => {
                if (cur.functions.length > 0) {
                    acc.push(...cur.functions);
                }
                return acc;
            }, []),
            metadata: labels.reduce((acc: any, cur: any) => { acc[cur.key] = cur.value; return acc; }, {}),
        };

        console.log(newData);
        let result;
        try {
            if (op === 'edit') {
                result = await dispatch(updatePolicyRules({ state: newData }));
            } else {
                result = await dispatch(savePolicyRules({ state: newData }));
            }
        } catch (err) {
            setLoading(false);
            openErrNotification('请求错误', String(err));
            return;
        }
        setLoading(false);
        if (result.meta.requestStatus === 'fulfilled') {
            openInfoNotification('操作成功', op === 'edit' ? '修改策略规则成功' : '新建策略规则成功');
            closeDrawer();
        } else {
            openErrNotification('请求错误', result.payload as string || '未知错误');
        }
    };

    return (
        <Drawer
            visible={visible}
            onClose={() => {
                form.reset();
                closeDrawer();
            }}
            header={`${op === 'edit' ? '编辑' : '新建'}策略规则`}
            size='60%'
            footer={
                <Space>
                    {state.step > 1 && (
                        <Button theme="default" onClick={() => handleStepChange(state.step - 1)}>
                            上一步
                        </Button>
                    )}
                    {state.step < 4 && (
                        <Button theme="default" onClick={() => handleStepChange(state.step + 1)}>
                            下一步
                        </Button>
                    )}
                    {state.step === 4 && (
                        <>
                            <Button
                                theme="primary"
                                onClick={() => form.submit()}
                                loading={loading}
                                disabled={op === 'view'}
                            >
                                提交
                            </Button>
                        </>
                    )}
                </Space>
            }
        >
            <Steps current={state.step}>
                <StepItem value={1} title="基本信息" />
                <StepItem value={2} title="成员信息" />
                <StepItem value={3} title="资源信息" />
                <StepItem value={4} title="接口信息" />
            </Steps>

            <Form
                form={form}
                labelWidth={120}
                onSubmit={onSubmit}
                style={{ padding: '24px 0' }}
            >
                {/* Step 1: Basic Information */}
                {state.step === 1 && (
                    <>
                        <FormItem
                            label="策略名称"
                            name="name"
                            initialData={currentPolicy.name}
                            rules={[{ required: true, message: '策略名称不能为空' }, { max: 64, message: '长度不超过64个字符' }]}
                        >
                            <Input placeholder="请输入策略名称" disabled={op !== 'create'} />
                        </FormItem>
                        <FormItem
                            label="策略动作"
                            name="action"
                            initialData={currentPolicy.action === '' ? 'ALLOW' : currentPolicy.action}
                            rules={[{ required: true, message: '策略动作不能为空' }]}
                        >
                            <RadioGroup theme='button' variant='primary-filled' disabled={op === 'view'}>
                                <Radio.Button value="ALLOW">允许</Radio.Button>
                                <Radio.Button value="DENY">拒绝</Radio.Button>
                            </RadioGroup>
                        </FormItem>
                        <FormItem
                            label="描述"
                            name="comment"
                            initialData={currentPolicy.comment}
                            rules={[{ max: 255, message: '长度不超过255个字符' }]}
                        >
                            <Input placeholder="请输入策略描述" />
                        </FormItem>
                        <LabelInput
                            form={form}
                            label='策略标签'
                            name='policy_labels'
                            disabled={false}
                        />
                    </>
                )}

                {/* Step 2: Member Information */}
                {state.step === 2 && (
                    <>
                        <Space>
                            <div className={style.treeContent}>
                                <Tree
                                    data={principalTree}
                                    activable
                                    hover
                                    lazy
                                    transition
                                    valueMode={"onlyLeaf"}
                                    defaultActived={[state.activePrincipalNode]}
                                    actived={[state.activePrincipalNode]}
                                    onClick={({ node }) => handleTreeNodeClick('principal', node.value as string)}
                                />
                            </div>
                            <Space direction='vertical'>
                                <RadioGroup
                                    theme='button'
                                    variant='primary-filled'
                                    value={state.selectPrincipals[state.activePrincipalNode]?.all ? 'all' : 'custom'}
                                    onChange={(value) => {
                                        setState(prev => ({
                                            ...prev,
                                            selectPrincipals: {
                                                ...prev.selectPrincipals,
                                                [prev.activePrincipalNode]: {
                                                    ...prev.selectPrincipals[prev.activePrincipalNode],
                                                    all: value === 'all',
                                                },
                                            },
                                        }));
                                    }}
                                >
                                    <Radio.Button value="custom">部分（自定义）</Radio.Button>
                                    <Radio.Button value="all">全部（包括新增）</Radio.Button>
                                </RadioGroup>
                                {!state.selectPrincipals[state.activePrincipalNode]?.all && (
                                    <Transfer
                                        key={state.activePrincipalNode}
                                        search={true}
                                        data={state.principalOptions[state.activePrincipalNode]}
                                        value={state.selectPrincipals[state.activePrincipalNode]?.ids}
                                        onChange={(target, ctx) => {
                                            const newSelectPrincipals = { ...state.selectPrincipals };
                                            if (!newSelectPrincipals[state.activePrincipalNode]) {
                                                newSelectPrincipals[state.activePrincipalNode] = { all: false, ids: [] };
                                            }
                                            switch (ctx.type) {
                                                case 'source':
                                                    const newIds = target as string[];
                                                    const addedIds = newIds.filter(id => !newSelectPrincipals[state.activePrincipalNode].ids.includes(id));
                                                    if (addedIds.length > 0) {
                                                        newSelectPrincipals[state.activePrincipalNode].ids.push(...addedIds);
                                                    }
                                                    setState(prev => ({ ...prev, selectPrincipals: newSelectPrincipals }));
                                                    break;
                                                case 'target':
                                                    const removedIds = target as string[];
                                                    const finalIds = newSelectPrincipals[state.activePrincipalNode].ids.filter(id => !removedIds.includes(id));
                                                    if (removedIds.length > 0) {
                                                        newSelectPrincipals[state.activePrincipalNode].ids = finalIds;
                                                    }
                                                    setState(prev => ({ ...prev, selectPrincipals: newSelectPrincipals }));
                                                    break;
                                            }
                                        }}
                                    />
                                )}
                            </Space>
                        </Space>
                    </>
                )}
                {/* Step 3: Resource Information */}
                {state.step === 3 && (
                    <>
                        <Space>
                            <div className={style.treeContent}>
                                <Tree
                                    data={resourceTree}
                                    activable
                                    hover
                                    lazy
                                    transition
                                    valueMode={"onlyLeaf"}
                                    defaultActived={[state.activeResNode]}
                                    actived={[state.activeResNode]}
                                    onClick={({ node }) => handleTreeNodeClick('resource', node.value as string)}
                                />
                            </div>
                            <Space direction='vertical'>
                                <RadioGroup
                                    theme='button'
                                    variant='primary-filled'
                                    value={state.selectResources[state.activeResNode]?.all ? 'all' : 'custom'}
                                    onChange={(value) => {
                                        setState(prev => ({
                                            ...prev,
                                            selectResources: {
                                                ...prev.selectResources,
                                                [prev.activeResNode]: {
                                                    ...prev.selectResources[prev.activeResNode],
                                                    all: value === 'all',
                                                },
                                            },
                                        }));
                                    }}
                                >
                                    <Radio.Button value="custom">部分（自定义）</Radio.Button>
                                    <Radio.Button value="all">全部（包括新增）</Radio.Button>
                                </RadioGroup>
                                {!state.selectResources[state.activeResNode]?.all && (
                                    <Transfer
                                        key={state.activeResNode}
                                        search={true}
                                        data={state.resourceOptions[state.activeResNode]}
                                        value={state.selectResources[state.activeResNode]?.ids}
                                        onChange={(target, ctx) => {
                                            const newSelectResources = { ...state.selectResources };
                                            if (!newSelectResources[state.activeResNode]) {
                                                newSelectResources[state.activeResNode] = { all: false, ids: [] };
                                            }
                                            const oldIds = newSelectResources[state.activeResNode].ids;
                                            switch (ctx.type) {
                                                case 'source':
                                                    setState(prev => {
                                                        const newIds = target as string[];
                                                        const addedIds = newIds.filter(id => !oldIds.includes(id));
                                                        if (addedIds.length > 0) {
                                                            newSelectResources[prev.activeResNode].ids.push(...addedIds);
                                                        }
                                                        return { ...prev, selectResources: newSelectResources };
                                                    })
                                                    break;
                                                case 'target':
                                                    setState(prev => {
                                                        const removedIds = target as string[];
                                                        const finalIds = oldIds.filter(id => !removedIds.includes(id));
                                                        if (removedIds.length > 0) {
                                                            newSelectResources[prev.activeResNode].ids = finalIds;
                                                        }
                                                        return { ...prev, selectResources: newSelectResources };
                                                    })
                                                    break;
                                            }
                                        }}
                                    />
                                )}
                            </Space>
                        </Space>
                    </>
                )}
                {state.step === 4 && (
                    <>
                        <Row>
                            <RadioGroup
                                theme='button'
                                variant='primary-filled'
                                value={state.useAllFunc ? 'all' : 'custom'}
                                onChange={(value) => {
                                    setState(prev => ({
                                        ...prev,
                                        useAllFunc: value === 'all',
                                    }));
                                }}
                            >
                                <Radio.Button value="custom">部分（自定义）</Radio.Button>
                                <Radio.Button value="all">全部（包括新增）</Radio.Button>
                            </RadioGroup>
                        </Row>
                        {!state.useAllFunc && (
                            <Row>
                                <Space style={{ marginTop: 20 }}>
                                    <div className={style.treeContent}>
                                        <Tree
                                            data={serverFunctionTree}
                                            activable
                                            hover
                                            lazy
                                            transition
                                            valueMode={"onlyLeaf"}
                                            defaultActived={[state.activeFuncNode]}
                                            actived={[state.activeFuncNode]}
                                            onClick={({ node }) => handleTreeNodeClick("function", node.value as string)}
                                        />
                                    </div>
                                    <Transfer
                                        key={state.activeFuncNode}
                                        search={true}
                                        data={state.viewFunctionOptions}
                                        value={state.selectFunctions[state.activeFuncNode]?.functions}
                                        onChange={(target, ctx) => {
                                            const newSelectFunctions = { ...state.selectFunctions };
                                            if (!newSelectFunctions[state.activeFuncNode]) {
                                                newSelectFunctions[state.activeFuncNode] = { group: state.activeFuncNode, functions: [] };
                                            }
                                            const oldFunctions = newSelectFunctions[state.activeFuncNode].functions;
                                            switch (ctx.type) {
                                                case 'source':
                                                    setState(prev => {
                                                        const newFunctions = target as string[];
                                                        const addedFunctions = newFunctions.filter(fn => !oldFunctions.includes(fn));
                                                        if (addedFunctions.length > 0) {
                                                            newSelectFunctions[prev.activeFuncNode].functions.push(...addedFunctions);
                                                        }
                                                        return { ...prev, selectFunctions: newSelectFunctions };
                                                    })
                                                    break;
                                                case 'target':
                                                    setState(prev => {
                                                        const removedFunctions = target as string[];
                                                        const finalFunctions = oldFunctions.filter(fn => !removedFunctions.includes(fn));
                                                        if (removedFunctions.length > 0) {
                                                            newSelectFunctions[prev.activeFuncNode].functions = finalFunctions;
                                                        }
                                                        return { ...prev, selectFunctions: newSelectFunctions };
                                                    })
                                                    break;
                                            }
                                        }}
                                    />
                                </Space>
                            </Row>
                        )}
                    </>
                )}
            </Form>
        </Drawer>
    );
};

export default PolicyEditor;