import React, { useEffect, useState } from 'react';
import { Link, Popup, Table, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData, Tabs, Tag, Dialog, Input, Loading, Popconfirm } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon, UserVisibleIcon } from 'tdesign-icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

import Search from 'components/Search';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import style from './index.module.less';
import { describeUsers, describeUserToken, USER_ROLE_MAP } from 'services/users';
import ShowToken from './ShowToken';
import UserEditor from './UserEditor';
import { editorUser, removeUsers, resetUser, viewUser } from 'modules/user/users';

interface IUsersProps {

}

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditUser: (row: TableRowData, op: 'view' | 'create' | 'edit' | 'delete', res: string) => void, redirect: (id: string, name: string) => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'id',
        title: 'ID',
        type: 'multiple',
        checkProps: ({ row }) => ({ disabled: row.editable === false || row.deleteable === false || row.user_type === 'main' }),
    },
    {
        colKey: 'name',
        title: '用户名',
        cell: ({ row: { name, id } }) => (
            <Link theme='primary' onClick={() => redirect(id, name)}>{name}</Link>
        ),
    },
    {
        colKey: 'user_type',
        title: '用户类型',
        cell: ({ row: { user_type } }: TableRowData) => (
            <Tag theme={USER_ROLE_MAP?.[user_type as keyof typeof USER_ROLE_MAP]?.theme as "success" | "danger" | "default" | "primary" | "warning"} variant="outline">{USER_ROLE_MAP?.[user_type as keyof typeof USER_ROLE_MAP]?.text ?? '-'}</Tag>
        ),

    },
    {
        colKey: 'commnet',
        title: '描述',
        ellipsis: true,
        cell: ({ row: { comment } }: TableRowData) => (<Text>{comment || '-'}</Text>),
    },
    {
        colKey: 'token_enable',
        title: 'Token状态',
        cell: ({ row: { token_enable } }: TableRowData) => (<Tag theme={token_enable ? 'success' : 'danger'} variant="outline">{token_enable ? '启用中' : '禁用中'}</Tag>),
    },
    {
        colKey: 'time',
        title: '操作时间',
        cell: ({ row: { ctime, mtime } }: TableRowData) => <Text>修改: {mtime}<br />创建: {ctime}</Text>,
    },
    {
        colKey: 'action',
        title: '操作',
        cell: ({ row }) => {
            return (
                <Space>
                    <Tooltip content={row.editable === false ? '无权限操作' : '查看 Token'}>
                        <Button
                            shape="square"
                            variant="text"
                            disabled={row.editable === false}
                            onClick={() => {
                                describeUserToken({ id: row.id }).then((res) => {
                                    if (res) {
                                        handleEditUser({ ...row, auth_token: res.user.auth_token }, 'view', 'user_token');
                                    }
                                });
                            }}>
                            <UserVisibleIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={row.editable === false ? '无权限操作' : '编辑'}>
                        <Button
                            shape="square"
                            variant="text"
                            disabled={row.editable === false}
                            onClick={() => handleEditUser({ ...row }, 'edit', 'user')}>
                            <EditIcon />
                        </Button>
                    </Tooltip>
                    {row.user_type !== 'main' && (
                        <Tooltip content={row.deleteable === false ? '无权限操作' : '删除'}>
                            <Popconfirm
                                content="确认删除吗"
                                destroyOnClose
                                placement="top"
                                showArrow
                                theme="default"
                                onConfirm={() => {
                                    handleEditUser(row, 'delete', 'user');
                                }}
                            >
                                <Button
                                    shape="square"
                                    variant="text"
                                    disabled={row.deleteable === false}
                                >
                                    <DeleteIcon />
                                </Button>
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            )
        },
    },
]

const UsersTable: React.FC<IUsersProps> = ({ }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);

    // 合并编辑相关状态
    const [searchState, setSearchState] = useState<{
        users: TableProps['data'];
        current: number;
        limit: number;
        previous: number;
        total: number;
        query: string;
        fetchError: boolean;
        isLoading: boolean;
    }>({ users: [], current: 1, limit: 10, previous: 0, total: 0, query: '', fetchError: false, isLoading: false });

    // 合并编辑相关状态
    const [editorState, setEditorState] = useState<{
        visible: boolean;
        resource: string;
        mode: 'create' | 'edit' | 'view' | 'delete';
        data?: TableRowData;
    }>({ visible: false, resource: '', mode: 'create', data: undefined });

    // 编辑、新建事件
    const handleEditUser = (row: TableRowData, mode: 'view' | 'create' | 'edit' | 'delete', res: string) => {
        if (mode === 'delete') {
            setSearchState(s => ({ ...s, isLoading: true }));
            dispatch(removeUsers({ ids: [row.id as string] }))
                .then((res) => {
                    openInfoNotification("删除用户成功", "删除用户成功");
                })
                .catch((err) => {
                    openErrNotification("删除用户失败", err);
                })
                .finally(() => {
                    setSearchState(s => ({ ...s, isLoading: false }));
                });
            return;
        }
        dispatch(editorUser({
            id: row.id as string,
            name: row.name as string,
            password: '',
            token_enable: row.token_enable as boolean,
            comment: row.comment as string,
            email: row.email as string,
            mobile: row.mobile as string,
            metadata: row.metadata as Record<string, string>
        }))

        setEditorState({
            visible: true,
            mode: mode,
            resource: res,
            data: { ...row },
        })
    }

    const handleCreateUser = () => {
        setEditorState({
            visible: true,
            mode: 'create',
            resource: 'user',
            data: undefined,
        });
    };

    // 模拟远程请求
    async function fetchData(pageInfo: PageInfo, searchParam?: string) {
        setSearchState(s => ({ ...s, current: pageInfo.current, limit: pageInfo.pageSize, previous: pageInfo.previous, fetchError: false, isLoading: true }));
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeUsers({
                limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
            });
            setSearchState(s => ({ ...s, users: response.content, total: response.totalCount, isLoading: false }));
        } catch (error: Error | any) {
            setSearchState(s => ({ ...s, fetchError: true, isLoading: false }));
            openErrNotification("获取数据失败", error);
        }
    }

    useEffect(() => {
        fetchData({ current: 1, pageSize: searchState.limit, previous: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshTables = () => {
        setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
        fetchData({ current: 1, pageSize: searchState.limit, previous: 0 }, searchState.query);
    }

    const table = (
        <>
            <Row justify='space-between' className={style.toolBar}>
                <Col>
                    <Row gutter={8} align='middle'>
                        <Col>
                            <Button onClick={handleCreateUser}>新建</Button>
                        </Col>
                        {selectedRowKeys.length > 0 && (
                            <>
                                <Col>
                                    <Button theme='danger'>批量删除</Button>
                                </Col>
                                <Col>
                                    <div>已选 {selectedRowKeys?.length || 0} 项</div>
                                </Col>
                            </>
                        )}

                    </Row>
                </Col>
                <Col>
                    <Space>
                        <Search
                            onChange={(value: string) => {
                                fetchData({ current: 1, pageSize: searchState.limit, previous: 0, }, value);
                            }}
                        />
                        <Tooltip content="刷新">
                            <RefreshIcon onClick={() => fetchData({ current: 1, pageSize: searchState.limit, previous: 0 })} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
            <ShowToken
                key={editorState.mode + editorState.data?.name + '_showtoken'}
                row={editorState.data || {} as TableRowData}
                visible={editorState.visible && editorState.resource === 'user_token'}
                close={() => {
                    setEditorState(s => ({ ...s, resource: 'user_token', visible: false }))
                }} />
            <UserEditor
                key={editorState.mode + (editorState.data?.name || 'new') + (editorState.visible ? '1' : '0')}
                modify={editorState.mode === 'edit'}
                visible={editorState.visible && editorState.resource === 'user'}
                refresh={refreshTables}
                closeDrawer={() => {
                    // 关闭后重置编辑器状态
                    dispatch(resetUser());
                    setEditorState(s => ({ ...s, visible: false }));
                }} op={editorState.mode} />
            <Table
                data={searchState.users}
                columns={columns(handleEditUser, (id: string, name: string) => {
                    navigate(`userdetail?id=${id}&name=${name}`);
                })}
                loading={searchState.isLoading}
                rowKey="id"
                size={"large"}
                tableLayout={'auto'}
                cellEmptyContent={'-'}
                pagination={{
                    current: searchState.current,
                    pageSize: searchState.limit,
                    total: searchState.total,
                    showJumper: true,
                    onChange(pageInfo) {
                        fetchData(pageInfo, searchState.query);
                    },
                }}
                onPageChange={(pageInfo) => {
                    fetchData(pageInfo, searchState.query);
                }}
                selectOnRowClick={false}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={(selected: Array<string | number>) => {
                    setSelectedRowKeys(selected);
                }}
            />
        </>
    )

    return (
        <>
            {searchState.fetchError ? (
                <ServerError />
            ) : (
                <Loading loading={searchState.isLoading}>
                    {table}
                </Loading>
            )}
        </>
    )
}

export default React.memo(UsersTable);