import React, { useEffect, useState, useCallback } from 'react';
import { describeComplicatedNamespaces } from 'services/namespace';
import { Table, Popup, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon, ChevronRightCircleIcon, CreditcardIcon } from 'tdesign-icons-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification } from 'utils/notifition';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { CheckVisibilityMode, VisibilityModeMap } from 'utils/visible';
import NamespaceEditor from './NamespaceEditor';
import Search from 'components/Search';
import LabelInput from 'components/LabelInput';
import FormItem from 'tdesign-react/es/form/FormItem';
import style from './index.module.less';
import { editorNamespace } from 'modules/namespace';

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditNamespace: (row: TableRowData) => void): PrimaryTableProps['columns'] => [
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
        // ellipsis 定义超出省略的浮层内容，cell 定义单元格内容
        ellipsis: ({ row: { comment } }: TableRowData) => (<Text>{comment || '-'}</Text>),
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
        cell: ({ row: { ctime, mtime } }: TableRowData) => <Text>创建: {ctime}<br />修改: {mtime}</Text>,
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
                            onClick={() => handleEditNamespace(row)}>
                            <EditIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={row.editable === false ? '无权限操作' : '授权'}>
                        <Button shape="square" variant="text" disabled={row.editable === false}>
                            <CreditcardIcon />
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

export default React.memo(() => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState<boolean>();
    const [data, setData] = useState<TableProps['data']>([]);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string | number>>([]);
    const [fetchError, setFetchError] = useState(false);
    const [searchParam, setSearchParam] = useState<string>('');
    const [expandedRowKeys, setExpandedRowKeys] = useState(['']);

    // 合并编辑相关状态
    const [editorState, setEditorState] = useState<{
        visible: boolean;
        mode: 'create' | 'edit';
        data?: TableRowData;
    }>({ visible: false, mode: 'create', data: undefined });

    // 编辑、新建事件
    const handleEditNamespace = (row: TableRowData) => {
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

    async function rehandleChange(pageInfo: PageInfo) {
        const { current, pageSize } = pageInfo;
        setCurrent(current);
        setPageSize(pageSize);
        await fetchData(pageInfo);
    }

    // 模拟远程请求
    async function fetchData(pageInfo: PageInfo) {
        setIsLoading(true);
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeComplicatedNamespaces({
                limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
            });
            setData(response.namespaces);
            setTotal(response.amount);
            setIsLoading(false);
        } catch (error: Error | any) {
            setFetchError(true);
            openErrNotification("获取数据失败", error);
        }
    }

    useEffect(() => {
        fetchData({ current: current, pageSize: pageSize, previous: 0 });
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
                        <Search onChange={(value: string) => {
                            setSearchParam(value);
                        }} />
                        <Tooltip content="刷新">
                            <RefreshIcon onClick={() => fetchData({ current, pageSize, previous: 0 })} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
            <NamespaceEditor
                key={editorState.mode + (editorState.data?.name || 'new') + (editorState.visible ? '1' : '0')}
                modify={editorState.mode === 'edit'}
                visible={editorState.visible}
                closeDrawer={() => setEditorState(s => ({ ...s, visible: false }))} />
            <Table
                data={data}
                columns={columns(handleEditNamespace)}
                loading={isLoading}
                rowKey="name"
                size={"large"}
                tableLayout={'auto'}
                cellEmptyContent={'-'}
                pagination={{
                    current,
                    pageSize,
                    total,
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
                expandedRow={({ row }) => (
                    <FormItem label="标签" labelWidth={100} className="label-input">
                        <LabelInput readonly={true} labels={row.metadata} />
                    </FormItem>
                )}
                expandedRowKeys={expandedRowKeys}
            />
        </>
    );

    return (
        <div>
            {fetchError ? (
                <ServerError />
            ) : (
                table
            )}
        </div>
    )
});