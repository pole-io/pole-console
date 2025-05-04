import React, { useState, useEffect } from 'react';
import { Popup, Table, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData, Tag, Breadcrumb, Link, Loading } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon } from 'tdesign-icons-react';
import { useNavigate, BrowserRouterProps } from 'react-router-dom';

import Search from 'components/Search';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { describeInstances, HEALTH_STATUS_MAP, ISOLATE_STATUS_MAP } from 'services/instance';
import { openErrNotification } from 'utils/notifition';
import style from './index.module.less';
import InstanceEditor from './InstanceEditor';
import { editorInstance, resetInstance } from 'modules/discovery/instance';

const { BreadcrumbItem } = Breadcrumb;

interface IInstanceListProps {
}

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditInstance: (view: boolean, row: TableRowData) => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'id',
        title: 'ID',
        type: 'multiple',
        checkProps: ({ row }) => ({ disabled: row.editable === false || row.deleteable === false }),
    },
    {
        colKey: 'host',
        title: '主机',
        cell: ({ row }) => (
            <Link theme='primary' onClick={() => handleEditInstance(true, row)}>
                <Text>{row.host}</Text>
            </Link>
        ),
    },
    {
        colKey: 'port',
        title: '端口',
        cell: ({ row: { port } }) => <Text>{port || '-'}</Text>,
    },
    {
        colKey: 'protocol',
        title: '协议',
        cell: ({ row: { protocol } }) => <Text>{protocol || '-'}</Text>,
    },
    {
        colKey: 'version',
        title: '版本',
        cell: ({ row: { version } }) => (
            <Text>{version || '-'}</Text>
        ),
    },
    {
        colKey: 'weight',
        title: '权重',
        cell: ({ row: { weight } }) => (
            <Text>{weight || '-'}</Text>
        ),
    },
    {
        colKey: 'healthy',
        title: '健康状态',
        cell: ({ row: { healthy } }) => (
            <Tag theme={HEALTH_STATUS_MAP?.[healthy as keyof typeof HEALTH_STATUS_MAP]?.theme as "success" | "danger" | "default" | "primary" | "warning"} variant="outline">{HEALTH_STATUS_MAP?.[healthy as keyof typeof HEALTH_STATUS_MAP]?.text ?? '-'}</Tag>
        ),
    },
    {
        colKey: 'isolate',
        title: '隔离状态',
        cell: ({ row: { isolate } }) => (
            <Tag theme={ISOLATE_STATUS_MAP?.[isolate as keyof typeof ISOLATE_STATUS_MAP]?.theme as "success" | "danger" | "default" | "primary" | "warning"} variant="outline">{ISOLATE_STATUS_MAP?.[isolate as keyof typeof ISOLATE_STATUS_MAP]?.text ?? '-'}</Tag>
        ),
    },
    {
        colKey: 'location',
        title: '地理位置',
        cell: ({ row: { location } }) => (
            <Text>{location?.region || '-'}/{location?.zone || '-'}/{location?.campus || '-'}</Text>
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
        cell: ({ row }) => {
            return (
                <Space>
                    <Tooltip content={row.editable === false ? '无权限操作' : '编辑'}>
                        <Button
                            shape="square"
                            variant="text"
                            disabled={row.editable === false}
                            onClick={() => handleEditInstance(false, row)}>
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

export default React.memo((props: IInstanceListProps & BrowserRouterProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate()
    const urlParams = new URLSearchParams(window.location.search);
    const namespace = urlParams.get('namespace');
    const serviceName = urlParams.get('service');
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);

    const [searchState, setSearchState] = useState<{
        instances: TableProps['data'];
        current: number;
        limit: number;
        previous: number;
        total: number;
        query: string;
        fetchError: boolean;
        isLoading: boolean;
    }>({ instances: [], current: 1, limit: 10, previous: 0, total: 0, query: '', fetchError: false, isLoading: false });

    // 合并编辑相关状态
    const [editState, setEditState] = useState<{
        selectedRow?: TableRowData;
        visible: boolean;
        mode: 'create' | 'edit' | 'view';
    }>({ selectedRow: undefined, visible: false, mode: 'create' });

    // 模拟远程请求
    async function fetchData(pageInfo: PageInfo, searchParam?: string) {
        setSearchState(s => ({ ...s, current: pageInfo.current, limit: pageInfo.pageSize, previous: pageInfo.previous, fetchError: false, isLoading: true }));
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeInstances({
                limit: pageSize, offset: (current - 1) * pageSize, namespace: namespace ? namespace : '', service: serviceName ? serviceName : ''
            });
            setSearchState(s => ({ ...s, instances: response.list, total: response.totalCount, isLoading: false }));
        } catch (error: Error | any) {
            setSearchState(s => ({ ...s, fetchError: true, isLoading: false }));
            openErrNotification("获取数据失败", error);
        }
    }

    useEffect(() => {
        fetchData({ current: 1, pageSize: searchState.limit, previous: 0 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshTable = () => {
        setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
        fetchData({ current: 1, pageSize: searchState.limit, previous: 0 }, searchState.query);
    }

    // 编辑、新建事件
    const handleEditInstance = (view: boolean, row: TableRowData) => {
        dispatch(editorInstance({
            id: row.id,
            host: row.host,
            port: row.port,
            protocol: row.protocol,
            version: row.version,
            weight: row.weight,
            healthy: row.healthy,
            isolate: row.isolate,
            metadata: row.metadata ? row.metadata : { '': '' },
            namespace: row.namespace,
            service: row.service,
            location: row.location,
            enable_health_check: row.enable_health_check,
            health_check: row.health_check,
        }))
        setEditState({
            visible: true,
            mode: view ? 'view' : 'edit',
            selectedRow: { ...row },
        })
    }

    const handleCreateInstance = (row: TableRowData) => {
        dispatch(resetInstance())
        setEditState({
            visible: true,
            mode: 'create',
            selectedRow: undefined,
        })
    }


    {/* <!-- :defaultExpandedRowKeys="defaultExpandedRowKeys" --> */ }
    const table = (
        <>
            <Breadcrumb maxItemWidth="200px">
                <BreadcrumbItem>{namespace}</BreadcrumbItem>
                <BreadcrumbItem onClick={() => {
                    navigate(-1);
                }}>
                    {serviceName}
                </BreadcrumbItem>
            </Breadcrumb>
            <Row justify='space-between' className={style.toolBar}>
                <Col>
                    <Row gutter={8} align='middle'>
                        <Col>
                            <Button onClick={handleCreateInstance}>新建</Button>
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
                            }} />
                        <Tooltip content="刷新">
                            <RefreshIcon onClick={() => fetchData({ current: 1, pageSize: 10, previous: 0 })} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
            <InstanceEditor
                key={editState.mode + (editState.selectedRow?.host || 'new') + (editState.visible ? '1' : '0')}
                modify={editState.mode === 'edit'}
                op={editState.mode}
                visible={editState.visible}
                refresh={refreshTable}
                closeDrawer={() => {
                    // 关闭后重置编辑器状态
                    dispatch(resetInstance());
                    setEditState(s => ({ ...s, visible: false }));
                    setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
                    fetchData({ current: 1, pageSize: searchState.limit, previous: 0 }, searchState.query);
                }} />
            <Table
                data={searchState.instances}
                columns={columns(handleEditInstance)}
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
    );
});