import React, { useEffect, useState } from 'react';
import { Link, Popup, Table, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData, Tabs, Loading, Popconfirm } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon, CreditcardIcon } from 'tdesign-icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

import Search from 'components/Search';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { describeServiceAlias } from 'services/alias';
import { openErrNotification } from 'utils/notifition';
import style from './index.module.less';
import { editorServiceAlias, resetServiceAlias } from 'modules/discovery/alias';
import AliasEditor from './AliasEditor';

interface IServiceAliasProps {

}

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditService: (row: TableRowData, op: 'edit' | 'delete') => void, redirect: (service: string, namespace: string) => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'id',
        title: 'ID',
        type: 'multiple',
        checkProps: ({ row }) => ({ disabled: row.editable === false || row.deleteable === false }),
    },
    {
        colKey: 'alias_namespace',
        title: '别名命名空间',
        cell: ({ row: { alias_namespace } }) => <Text>{alias_namespace}</Text>,
    },
    {
        colKey: 'alias',
        title: '服务别名',
        cell: ({ row: { alias } }) => <Text>{alias}</Text>,
    },
    {
        colKey: 'namespace',
        title: '目标服务命名空间',
        cell: ({ row: { namespace } }: TableRowData) => <Text>{namespace}</Text>,
    },
    {
        colKey: 'service',
        title: '目标服务名',
        cell: ({ row: { service, namespace } }) => {
            return (
                <Link theme='primary'
                    onClick={() => {
                        redirect(service, namespace);
                    }}
                >
                    {service}
                </Link>
            )
        }
    },
    {
        colKey: 'commnet',
        title: '描述',
        ellipsis: true,
        cell: ({ row: { comment } }: TableRowData) => (<Text>{comment || '-'}</Text>),
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
                    <Tooltip content={row.editable === false ? '无权限操作' : '编辑'}>
                        <Button
                            shape="square"
                            variant="text"
                            disabled={row.editable === false}
                            onClick={() => handleEditService(row, 'edit')}>
                            <EditIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={row.editable === false ? '无权限操作' : '授权'}>
                        <Button shape="square" variant="text" disabled={row.editable === false}>
                            <CreditcardIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={row.deleteable === false ? '无权限操作' : '删除'}>
                        <Popconfirm
                            content="确认删除吗"
                            destroyOnClose
                            placement="top"
                            showArrow
                            theme="default"
                            onConfirm={() => {
                                handleEditService(row, 'delete');
                            }}
                        >
                            <Button shape="square" variant="text" disabled={row.deleteable === false}>
                                <DeleteIcon />
                            </Button>
                        </Popconfirm>

                    </Tooltip>
                </Space>
            )
        },
    },
]

const ServiceAliasTable: React.FC<IServiceAliasProps> = ({ }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);

    // 合并编辑相关状态
    const [searchState, setSearchState] = useState<{
        services: TableProps['data'];
        current: number;
        limit: number;
        previous: number;
        total: number;
        query: string;
        fetchError: boolean;
        isLoading: boolean;
    }>({ services: [], current: 1, limit: 10, previous: 0, total: 0, query: '', fetchError: false, isLoading: false });

    // 合并编辑相关状态
    const [editorState, setEditorState] = useState<{
        visible: boolean;
        mode: 'create' | 'edit';
        data?: TableRowData;
    }>({ visible: false, mode: 'create', data: undefined });

    // 编辑、新建事件
    const handleEditService = (row: TableRowData, op: 'edit' | 'delete') => {
        dispatch(editorServiceAlias({
            namespace: row.namespace,
            service: row.name,
            alias_namespace: row.alias_namespace,
            alias: row.name,
            comment: row.comment,
        }));

        setEditorState({
            visible: true,
            mode: 'edit',
            data: { ...row },
        })
    }

    const handleCreateService = () => {
        dispatch(resetServiceAlias());
        setEditorState({
            visible: true,
            mode: 'create',
            data: undefined,
        });
    };

    const refreshTable = () => {
        setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
        fetchData({ current: 1, pageSize: searchState.limit, previous: 0 }, searchState.query);
    }

    // 模拟远程请求
    async function fetchData(pageInfo: PageInfo, searchParam?: string) {
        setSearchState(s => ({ ...s, current: pageInfo.current, limit: pageInfo.pageSize, previous: pageInfo.previous, fetchError: false, isLoading: true }));
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeServiceAlias({
                limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
            });
            setSearchState(s => ({ ...s, services: response.content, total: response.totalCount, isLoading: false }));
        } catch (error: Error | any) {
            setSearchState(s => ({ ...s, fetchError: true, isLoading: false }));
            openErrNotification("获取数据失败", error);
        }
    }

    useEffect(() => {
        fetchData({ current: 1, pageSize: searchState.limit, previous: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    {/* <!-- :defaultExpandedRowKeys="defaultExpandedRowKeys" --> */ }
    const table = (
        <>
            <Row justify='space-between' className={style.toolBar}>
                <Col>
                    <Row gutter={8} align='middle'>
                        <Col>
                            <Button onClick={handleCreateService}>新建</Button>
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
            <AliasEditor
                key={editorState.mode + (editorState.data?.name || 'new') + (editorState.visible ? '1' : '0')}
                modify={editorState.mode === 'edit'}
                visible={editorState.visible}
                refresh={refreshTable}
                closeDrawer={() => {
                    // 关闭后重置编辑器状态
                    dispatch(resetServiceAlias());
                    setEditorState(s => ({ ...s, visible: false }));
                }} />
            <Table
                data={searchState.services}
                columns={columns(handleEditService, (service: string, namespace: string) => {
                    navigate(`instance?namespace=${namespace}&service=${service}`);
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
    );

    return (
        <div>
            {searchState.fetchError ? (
                <ServerError />
            ) : (
                <Loading loading={searchState.isLoading} className={style.loading}>
                    {table}
                </Loading>
            )}
        </div>
    )
}

export default React.memo(ServiceAliasTable);