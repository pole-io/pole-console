import LabelInput from "components/LabelInput";
import React from "react";
import { Card, Form, Input, Link, Loading, Popup, Space, Table, Tag, TableProps, Collapse, Row, Col, Breadcrumb } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'modules/store';
import { enableUserToken, resetUserToken } from "modules/user/users";
import { describeUsers, describeUserToken, User } from "services/users";
import { openErrNotification, openInfoNotification } from "utils/notifition";
import namespace from "modules/namespace";
import { redirect } from "react-router-dom";

const { FormItem } = Form;
const { BreadcrumbItem } = Breadcrumb;

interface IGroupDetailProps {

}

const GroupDetailTable: React.FC<IGroupDetailProps> = ({ }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const username = urlParams.get('name');

    const [viewState, setViewState] = React.useState<{
        loading: boolean;
        user: User;
        data: TableProps['data'];
        fetchError: boolean;
    }>({ loading: false, user: {} as User, data: [], fetchError: false });

    async function fetchData() {
        setViewState({ ...viewState, loading: true, user: {} as User, fetchError: false });
        const tokenRet = await describeUserToken({ id: userId as string })
        if (tokenRet?.user) {
            const ret = await describeUsers({ id: userId as string })
            if (ret?.content.length > 0) {
                const expectUser = ret.content[0];
                expectUser.auth_token = tokenRet.user.auth_token;
                setViewState({
                    loading: false, user: expectUser, data: [
                        { token: expectUser.auth_token, status: expectUser.token_enable }
                    ], fetchError: false
                });
                form.setFieldsValue({
                    id: expectUser.id,
                    name: expectUser.name,
                    comment: expectUser.comment,
                    source: expectUser.source,
                    email: expectUser.email,
                    mobile: expectUser.mobile,
                    user_labels: expectUser.metadata ? Object.entries(expectUser.metadata).map(([key, value]) => ({ key, value })) : [],
                });
            } else {
                setViewState({ ...viewState, loading: false, fetchError: true });
            }
        } else {
            setViewState({ ...viewState, loading: false, fetchError: true });
        }
    }

    React.useEffect(() => {
        fetchData();
    }, [userId]);

    const handleChangePassword = () => {

    }

    const onSubmit: FormProps['onSubmit'] = async (e) => { }

    const userForm = (
        <Form
            form={form}
            layout="vertical"
            labelWidth={120}
            labelAlign={'left'}
            onSubmit={onSubmit}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Row>
                    <Col span={6}>
                        <FormItem label={'ID'} name={'id'} shouldUpdate={true}>
                            <Input borderless={true} readonly defaultValue={viewState.user?.id} placeholder="" />
                        </FormItem>
                    </Col>
                    <Col span={6}>
                        <FormItem label={'用户名'} name={'name'} shouldUpdate={true}>
                            <Input borderless={true} readonly defaultValue={viewState.user?.name} placeholder="" />
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <FormItem label={'备注'} name={'comment'} shouldUpdate={true}>
                            <Input borderless={true} readonly defaultValue={viewState.user?.comment} placeholder="" />
                        </FormItem>
                    </Col>
                    <Col span={6}>
                        <FormItem label={'来源'} name={'source'} shouldUpdate={true}>
                            <Input borderless={true} readonly defaultValue={viewState.user?.source} placeholder="" />
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <FormItem label={'邮箱'} name={'email'} shouldUpdate={true}>
                            <Input borderless={true} readonly defaultValue={viewState.user?.email} placeholder="" />
                        </FormItem>
                    </Col>
                    <Col span={6}>
                        <FormItem label={'手机号'} name={'mobile'} shouldUpdate={true}>
                            <Input borderless={true} readonly defaultValue={viewState.user?.mobile} placeholder="" />
                        </FormItem>
                    </Col>
                </Row>
                <FormItem label="资源访问凭据" name="token_enable" shouldUpdate={true}>
                    <Table
                        rowKey="id"
                        size={"large"}
                        tableLayout={'auto'}
                        cellEmptyContent={'-'}
                        columns={[
                            {
                                colKey: 'token',
                                title: 'Token',
                                cell: ({ row: { token } }) => {
                                    return (
                                        <Popup content="已复制" trigger="click">
                                            <Input size="large" borderless={true} type="password" value={token} readonly onClick={() => {
                                                navigator.clipboard.writeText(token as string)
                                            }} />
                                        </Popup>
                                    )
                                }
                            },
                            {
                                colKey: 'status',
                                title: '状态',
                                cell: ({ row: { status } }) => {
                                    return (
                                        <Tag theme={status ? 'success' : 'danger'}>{status ? '启用' : '禁用'}</Tag>
                                    )
                                }
                            },
                            {
                                colKey: 'op',
                                title: '操作',
                                cell: () => {
                                    const enabled = viewState.user.token_enable
                                    return (
                                        <Space>
                                            <Link theme="primary" onClick={() => {
                                                dispatch(resetUserToken({ id: userId as string }))
                                                    .then((res) => {
                                                        if (res.meta.requestStatus !== 'fulfilled') {
                                                            openErrNotification('请求错误', "资源访问凭据重置失败");
                                                        } else {
                                                            openInfoNotification('请求成功', "资源访问凭据重置成功");
                                                            // 由于底层缓存设计的问题，这里需要延迟1s
                                                            setViewState({ ...viewState, loading: true })
                                                            setTimeout(() => fetchData(), 1000)
                                                        }
                                                    });
                                            }}>重置</Link>
                                            <Link theme={enabled ? 'danger' : 'success'} onClick={() => {
                                                dispatch(enableUserToken({ id: userId as string, token_enable: !enabled }))
                                                    .then((res) => {
                                                        if (res.meta.requestStatus !== 'fulfilled') {
                                                            openErrNotification('请求错误', `资源访问凭据${enabled ? '禁用' : '启用'}失败`);
                                                        } else {
                                                            openInfoNotification('请求成功', `资源访问凭据${enabled ? '禁用' : '启用'}成功`);
                                                            setViewState({ ...viewState, loading: true })
                                                            setTimeout(() => fetchData(), 1000)
                                                        }
                                                    });;
                                            }}>{enabled ? '禁用' : '启用'}</Link>
                                        </Space>
                                    )
                                }
                            },
                        ]}
                        data={viewState.data}
                    />
                </FormItem>
                <LabelInput form={form} label='用户标签' name='user_labels' disabled={true} />
            </Space>
        </Form>
    )

    return (
        <>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Breadcrumb maxItemWidth="200px">
                    <BreadcrumbItem onClick={() => {
                        navigate(-1);
                    }}>用户</BreadcrumbItem>
                    <BreadcrumbItem>{username}</BreadcrumbItem>
                </Breadcrumb>
                <Card
                    title={`用户 ${username} 详情`}
                    actions={
                        <Link theme="primary" onClick={handleChangePassword} style={{ cursor: 'pointer' }}>
                            修改密码
                        </Link>
                    }
                    hoverShadow
                >
                    <Loading
                        indicator
                        loading={viewState.loading}
                        preventScrollThrough
                        showOverlay
                    >
                        {userForm}
                    </Loading>
                </Card>
            </Space>
        </>
    )
}

export default React.memo(GroupDetailTable);