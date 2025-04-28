import React, { useEffect, useState } from 'react';
import { Link, Popup, Table, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData, Tabs, Tag } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon, CreditcardIcon } from 'tdesign-icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

import Search from 'components/Search';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification } from 'utils/notifition';
import style from './index.module.less';
import { describeUsers } from 'services/users';
import { describeUserGroups } from 'services/user_group';

interface IUsersProps {

}

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditUser: (row: TableRowData) => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'id',
        title: 'ID',
        type: 'multiple',
        checkProps: ({ row }) => ({ disabled: row.editable === false || row.deleteable === false }),
    },
    {
        colKey: 'name',
        title: '用户名',
        cell: ({ row: { name } }) => <Text>{name}</Text>,
    },
    {
        colKey: 'commnet',
        title: '描述',
        ellipsis: ({ row: { comment } }: TableRowData) => (<Text>{comment || '-'}</Text>),
    },
    {
        colKey: 'token_enable',
        title: 'Token 状态',
        ellipsis: ({ row: { token_enable } }: TableRowData) => (<Tag theme={token_enable ? 'success' : 'danger'}>{token_enable ? '启用' : '禁用'}</Tag>),
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

                            }}>
                            <EditIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={row.editable === false ? '无权限操作' : '编辑'}>
                        <Button
                            shape="square"
                            variant="text"
                            disabled={row.editable === false}
                            onClick={() => handleEditUser(row)}>
                            <EditIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={row.deleteable === false ? '无权限操作' : '删除'}>
                        <Button shape="square" variant="text" disabled={row.deleteable === false}>
                            <DeleteIcon />
                        </Button>
                    </Tooltip>
                </Space>
            )
        },
    },
]


const GroupsTable: React.FC<IUsersProps> = ({ }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);

    // 合并编辑相关状态
    const [searchState, setSearchState] = useState<{
        groups: TableProps['data'];
        current: number;
        limit: number;
        previous: number;
        total: number;
        query: string;
        fetchError: boolean;
        isLoading: boolean;
    }>({ groups: [], current: 1, limit: 10, previous: 0, total: 0, query: '', fetchError: false, isLoading: false });

    // 合并编辑相关状态
    const [editorState, setEditorState] = useState<{
        visible: boolean;
        mode: 'create' | 'edit';
        data?: TableRowData;
    }>({ visible: false, mode: 'create', data: undefined });

    // 编辑、新建事件
    const handleEditUserGroup = (row: TableRowData) => {
        setEditorState({
            visible: true,
            mode: 'edit',
            data: { ...row },
        })
    }

    const handleCreateUserGroup = () => {
        setEditorState({
            visible: true,
            mode: 'create',
            data: undefined,
        });
    };

    // 模拟远程请求
    async function fetchData(pageInfo: PageInfo, searchParam?: string) {
        setSearchState(s => ({ ...s, current: pageInfo.current, limit: pageInfo.pageSize, previous: pageInfo.previous, fetchError: false, isLoading: true }));
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeUserGroups({
                limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
            });
            setSearchState(s => ({ ...s, groups: response.content, total: response.totalCount, isLoading: false }));
        } catch (error: Error | any) {
            setSearchState(s => ({ ...s, fetchError: true, isLoading: false }));
            openErrNotification("获取数据失败", error);
        }
    }

    useEffect(() => {
        fetchData({ current: 1, pageSize: searchState.limit, previous: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const table = (
        <>
            <Row justify='space-between' className={style.toolBar}>
                <Col>
                    <Row gutter={8} align='middle'>
                        <Col>
                            <Button onClick={handleCreateUserGroup}>新建</Button>
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
            <Table
                data={searchState.groups}
                columns={columns(handleEditUserGroup)}
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
                table
            )}
        </>
    )
}

export default React.memo(GroupsTable);