import React, { useState, useEffect } from 'react';
import { Popup, Table, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData, Tag } from 'tdesign-react';

import Search from 'components/Search';
import LabelInput from 'components/LabelInput';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { describeInstances, HEALTH_STATUS_MAP, ISOLATE_STATUS_MAP } from 'services/instance';
import { openErrNotification } from 'utils/notifition';
import { ChevronRightCircleIcon, DeleteIcon, EditIcon, RefreshIcon } from 'tdesign-icons-react';
import { BrowserRouterProps } from 'react-router-dom';
import FormItem from 'tdesign-react/es/form/FormItem';

import style from './index.module.less';
import InstanceEditor from './InstanceEditor';
import { editorInstance, resetInstance } from 'modules/discovery/instance';


interface IInstanceListProps {
}

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditInstance: (row: TableRowData) => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'id',
        title: 'ID',
        type: 'multiple',
        checkProps: ({ row }) => ({ disabled: row.editable === false || row.deleteable === false }),
    },
    {
        colKey: 'host',
        title: '主机',
        cell: ({ row: { host } }) => <Text>{host}</Text>,
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
        cell: ({ row: { ctime, mtime } }) => <Text>创建: {ctime}<br />修改: {mtime}</Text>,
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
                            onClick={() => handleEditInstance(row)}>
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
    const searchParams = new URLSearchParams(window.location.search);
    const namespace = searchParams.get('namespace');
    const serviceName = searchParams.get('service');

    // 合并编辑相关状态
    const [listState, setListState] = useState<{
        instances: TableProps['data'];
        loading: boolean;
        selectedRow?: TableRowData;
        pageInfo: PageInfo;
        total: number;
        fetchError: boolean;
        visible: boolean;
        mode: 'create' | 'edit';
    }>({ loading: false, instances: [], selectedRow: undefined, pageInfo: { previous: 0, current: 1, pageSize: 10 }, total: 0, fetchError: false, visible: false, mode: 'create' });

    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);
    const [searchParam, setSearchParam] = useState<string>('');
    const [expandedRowKeys, setExpandedRowKeys] = useState(['']);

    async function rehandleChange(pageInfo: PageInfo) {
        const { current, pageSize } = pageInfo;
        setListState(prevState => ({ ...prevState, pageInfo: { ...prevState.pageInfo, current, pageSize } }));
        await fetchData(pageInfo);
    }

    // 模拟远程请求
    async function fetchData(pageInfo: PageInfo) {
        setListState(prevState => ({ ...prevState, loading: true, fetchError: false }));
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeInstances({
                limit: pageSize, offset: (current - 1) * pageSize, namespace: namespace ? namespace : '', service: serviceName ? serviceName : ''
            });

            setListState(prevState => ({ ...prevState, loading: false, instances: response.list, total: response.totalCount }));
        } catch (error: Error | any) {
            setListState(prevState => ({ ...prevState, loading: false, fetchError: true }));
            openErrNotification("获取服务实例列表失败", error);
        }
    }

    useEffect(() => {
        fetchData({
            current: listState.pageInfo.current,
            pageSize: listState.pageInfo.pageSize,
            previous: 0,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 编辑、新建事件
    const handleEditInstance = (row: TableRowData) => {
        dispatch(editorInstance({
            id: row.id,
            host: row.host,
            port: row.port,
            protocol: row.protocol,
            version: row.version,
            weight: row.weight,
            healthy: row.healthy,
            isolate: row.isolate,
            metadata: row.metadata ? row.metadata : {'': ''},
            namespace: row.namespace,
            service: row.service,
            location: row.location,
        }))

        setListState({
            ...listState,
            visible: true,
            mode: 'edit',
            selectedRow: { ...row },
        })
    }

    const handleCreateInstance = (row: TableRowData) => {
        dispatch(resetInstance())

        setListState({
            ...listState,
            visible: true,
            mode: 'create',
            selectedRow: undefined,
        })
    }


    {/* <!-- :defaultExpandedRowKeys="defaultExpandedRowKeys" --> */ }
    const table = (
        <>
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
                        <Search onChange={(value: string) => {
                            setSearchParam(value);
                        }} />
                        <Tooltip content="刷新">
                            <RefreshIcon onClick={() => fetchData({ current: 1, pageSize: 10, previous: 0 })} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
            <InstanceEditor
                key={listState.mode + (listState.selectedRow?.id || 'new') + (listState.visible ? '1' : '0')}
                modify={listState.mode === 'edit'}
                visible={listState.visible}
                closeDrawer={() => {
                    // 关闭后重置编辑器状态
                    // dispatch(resetService());
                    setListState(s => ({ ...s, visible: false }));
                }} />
            <Table
                data={listState.instances}
                columns={columns(handleEditInstance)}
                loading={listState.loading}
                rowKey="id"
                size={"large"}
                tableLayout={'auto'}
                cellEmptyContent={'-'}
                pagination={{
                    current: listState.pageInfo.current,
                    pageSize: listState.pageInfo.pageSize,
                    total: listState.total,
                    showJumper: true,
                    onChange(pageInfo) {
                        rehandleChange(pageInfo);
                    },
                }}
                onPageChange={(pageInfo) => {
                    rehandleChange(pageInfo);
                }}
                selectOnRowClick={false}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={(selected: Array<string | number>) => {
                    setSelectedRowKeys(selected);
                }}
                expandOnRowClick={false}
                expandIcon={<ChevronRightCircleIcon />}
                // 可展开和收起
                onExpandChange={(value, params) => {
                    setExpandedRowKeys(value as string[])
                }}
                expandedRow={({ row }) => {
                    return (
                        <>
                            {row.metadata && (
                                <FormItem label="标签" labelWidth={100} className="label-input">
                                    <LabelInput readonly={true} labels={row.metadata} />
                                </FormItem>
                            )}
                        </>
                    )
                }}
                expandedRowKeys={expandedRowKeys}
            />
        </>
    );

    return (
        <div>
            {listState.fetchError ? (
                <ServerError />
            ) : (
                table
            )}
        </div>
    );
});