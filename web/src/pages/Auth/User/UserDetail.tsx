import React from "react";
import { Card, Form, Input, Link, Loading, Popup, Space, Table, Tag, TableProps, Breadcrumb, Descriptions, Tabs } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { DiscountIcon } from "tdesign-icons-react";
import { useNavigate, useLocation } from 'react-router-dom';

import LabelInput from "components/LabelInput";
import { useAppDispatch, useAppSelector } from 'modules/store';
import { enableUserToken, resetUserToken } from "modules/user/users";
import { describeUsers, describeUserToken, User } from "services/users";
import { openErrNotification, openInfoNotification } from "utils/notifition";

const { FormItem } = Form;
const { BreadcrumbItem } = Breadcrumb;
const { DescriptionsItem } = Descriptions;
const { TabPanel } = Tabs;

interface IUserDetailProps {

}

const UserDetailTable: React.FC<IUserDetailProps> = ({ }) => {
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
                <Descriptions column={2} tableLayout="auto" itemLayout="horizontal">
                    <DescriptionsItem label="用户ID">
                        {viewState.user?.id}
                    </DescriptionsItem>
                    <DescriptionsItem label="备注">
                        {viewState.user?.comment}
                    </DescriptionsItem>
                    <DescriptionsItem label="用户名">
                        {viewState.user?.name}
                    </DescriptionsItem>
                    <DescriptionsItem label="来源">
                        {viewState.user?.source}
                    </DescriptionsItem>
                    <DescriptionsItem label="邮箱">
                        {viewState.user?.email}
                    </DescriptionsItem>
                    <DescriptionsItem label="手机号">
                        {viewState.user?.mobile}
                    </DescriptionsItem>
                </Descriptions>
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
                    title={
                        <>
                            {`用户 ${username} 详情`}
                            <Tag icon={<DiscountIcon />} style={{marginLeft: 10}} theme="default">
                                {viewState.user?.user_type === 'main' ? '管理员' : '子用户'}
                            </Tag>
                        </>
                    }
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

                {viewState.user.user_type !== 'main' && (
                    <Card>
                        <Tabs>
                            <TabPanel value="user-group" label="用户组信息">
                            </TabPanel>
                            <TabPanel value="role" label="角色信息">
                            </TabPanel>
                            <TabPanel value="permission" label="权限信息">
                            </TabPanel>
                        </Tabs>
                    </Card>
                )}

            </Space>
        </>
    )
}

export default React.memo(UserDetailTable);