import React, { useEffect, useState, useCallback } from 'react';
import { describeComplicatedNamespaces } from 'services/namespace';
import { Table, Popup, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData, Loading, Popconfirm } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon, ChevronRightCircleIcon, CreditcardIcon } from 'tdesign-icons-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification } from 'utils/notifition';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { CheckVisibilityMode, VisibilityModeMap } from 'utils/visible';
import NamespaceEditor from './NamespaceEditor';
import Search from 'components/Search';
import style from './index.module.less';
import { editorNamespace } from 'modules/namespace';

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditNamespace: (row: TableRowData, op: 'edit' | 'delete') => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'index',
        title: 'id',
        type: 'multiple' as const,
        checkProps: ({ row }: TableRowData) => ({ disabled: row.editable === false || row.deleteable === false }),
    },
    {
        colKey: 'name',
        title: '名称',
        cell: ({ row }: TableRowData) => <Text>{row.name}</Text>,
        fixed: 'left',
    },
    {
        colKey: 'service_export_to',
        title: '服务可见性',
        cell: ({ row: { name, service_export_to } }: TableRowData) => {
            const visibilityMode = CheckVisibilityMode(service_export_to, name)
            return (
                <div>
                    {visibilityMode ? (
                        VisibilityModeMap[visibilityMode]
                    ) : (
                        <Popup
                            trigger={'hover'}
                            content={
                                <Text>
                                    <div>{'服务可见的命名空间列表'}</div>
                                    {service_export_to?.map((item: string) => (
                                        <div key={item}>
                                            {item}
                                        </div>
                                    ))}
                                </Text>
                            }
                        >
                            <Text>{service_export_to ? service_export_to?.join(',') : '-'}</Text>
                        </Popup>
                    )}
                </div>
            )
        },
    },

    {
        colKey: 'commnet',
        title: '描述',
        ellipsis: true,
        cell: ({ row: { comment } }: TableRowData) => (<Text>{comment || '-'}</Text>),
    },
    {
        colKey: 'totalSerivce',
        title: '服务数',
        cell: ({ row }: TableRowData) => <Text>{row.total_service_count ?? '-'}</Text>,
    },
    {
        colKey: 'health/total',
        title: '健康实例/总实例数',
        cell: ({ row: { total_instance_count, total_health_instance_count } }: TableRowData) => (
            <Text>{`${total_health_instance_count}/${total_instance_count}`}</Text>
        ),
    },
    {
        colKey: 'time',
        title: '操作时间',
        cell: ({ row: { ctime, mtime } }: TableRowData) => <Text>修改: {mtime}<br />创建: {ctime}</Text>,
    },
    {
        colKey: 'action',
        title: '操作',
        cell: ({ row }: TableRowData) => {
            return (
                <Space>
                    <Tooltip content={row.editable === false ? '无权限操作' : '编辑'}>
                        <Button
                            shape="square"
                            variant="text"
                            disabled={row.editable === false}
                            onClick={() => handleEditNamespace(row, 'edit')}>
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
                                handleEditNamespace(row, 'delete');
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

export default React.memo(() => {
    const dispatch = useAppDispatch();
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);

    // 合并编辑相关状态
    const [searchState, setSearchState] = useState<{
        namespaces: TableProps['data'];
        current: number;
        limit: number;
        previous: number;
        total: number;
        query: string;
        fetchError: boolean;
        isLoading: boolean;
    }>({ namespaces: [], current: 1, limit: 10, previous: 0, total: 0, query: '', fetchError: false, isLoading: false });


    // 合并编辑相关状态
    const [editorState, setEditorState] = useState<{
        visible: boolean;
        mode: 'create' | 'edit';
        data?: TableRowData;
    }>({ visible: false, mode: 'create', data: undefined });

    // 编辑、新建事件
    const handleEditNamespace = (row: TableRowData, op: 'edit' | 'delete') => {
        if (op === 'delete') {
            return;
        }

        dispatch(editorNamespace({
            name: row.name,
            comment: row.comment,
            service_export_to: row.service_export_to ? row.service_export_to : [],
            metadata: row.metadata,
            visibility_mode: row.visibility_mode,
        }));

        setEditorState({
            visible: true,
            mode: 'edit',
            data: { ...row },
        })
    }

    const handleCreateNamespace = () => {
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
        console.log('fetchData', pageInfo, searchParam);
        setSearchState(s => ({ ...s, current: pageInfo.current, limit: pageInfo.pageSize, previous: pageInfo.previous, fetchError: false, isLoading: true }));
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeComplicatedNamespaces({
                limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
            });
            setSearchState(s => ({ ...s, namespaces: response.namespaces, total: response.amount, isLoading: false }));
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
                            <Button onClick={handleCreateNamespace}>新建</Button>
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
                                fetchData({ current: 1, pageSize: searchState.limit, previous: 0 }, value);
                            }}
                        />
                        <Tooltip content="刷新">
                            <RefreshIcon onClick={() => fetchData({ current: 1, pageSize: searchState.limit, previous: 0 })} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
            <NamespaceEditor
                key={editorState.mode + (editorState.data?.name || 'new') + (editorState.visible ? '1' : '0')}
                modify={editorState.mode === 'edit'}
                visible={editorState.visible}
                refresh={refreshTable}
                closeDrawer={() => {
                    setEditorState(s => ({ ...s, visible: false }))
                }} />
            <Table
                data={searchState.namespaces}
                columns={columns(handleEditNamespace)}
                loading={searchState.isLoading}
                rowKey="name"
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
                <Loading loading={searchState.isLoading}>
                    {table}
                </Loading>
            )}
        </div>
    )
});