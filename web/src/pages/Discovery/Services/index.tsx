import React, { useEffect, useState } from 'react';
import { Link, Popup, Table, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon, ChevronRightCircleIcon, CreditcardIcon } from 'tdesign-icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

import Search from 'components/Search';
import LabelInput from 'components/LabelInput';
import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { describeServices } from 'services/service';
import { openErrNotification } from 'utils/notifition';
import { CheckVisibilityMode, VisibilityModeMap } from 'utils/visible';
import ServiceEditor from './ServiceEditor';
import FormItem from 'tdesign-react/es/form/FormItem';
import style from './index.module.less';
import { editorService, resetService } from 'modules/discovery/service';

const ServerError = () => <ErrorPage code={500} />;

const columns = (handleEditService: (row: TableRowData) => void, redirect: (service: string, namespace: string) => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'id',
        title: 'ID',
        type: 'multiple',
        checkProps: ({ row }) => ({ disabled: row.editable === false || row.deleteable === false }),
    },
    {
        colKey: 'name',
        title: '服务名',
        cell: ({ row: { name, namespace } }) => <Link
            theme="primary"
            onClick={() => {redirect(name, namespace)}}
        >{name}</Link>,
    },
    {
        colKey: 'namespace',
        title: '命名空间',
        cell: ({ row: { namespace } }) => <Text>{namespace}</Text>,
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
        colKey: 'department',
        title: '部门',
        cell: ({ row: { department } }) => <Text>{department || '-'}</Text>,
    },
    {
        colKey: 'business',
        title: '业务',
        cell: ({ row: { business } }) => <Text>{business || '-'}</Text>,
    },
    {
        colKey: 'health/total',
        title: '健康实例/总实例数',
        cell: ({ row: { healthy_instance_count, total_instance_count } }) => (
            <Text>
                {`${healthy_instance_count ?? '-'}/${total_instance_count ?? '-'}`}
            </Text>
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
                            onClick={() => handleEditService(row)}>
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
    const navigate = useNavigate();
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
    const handleEditService = (row: TableRowData) => {
        dispatch(editorService({
            id: row.id,
            namespace: row.namespace,
            name: row.name,
            comment: row.comment,
            service_export_to: row.service_export_to ? row.service_export_to : [],
            metadata: row.metadata,
            ports: row.ports,
            owners: row.owners,
            department: row.department,
            business: row.business,
            visibility_mode: row.visibility_mode,
        }));

        setEditorState({
            visible: true,
            mode: 'edit',
            data: { ...row },
        })
    }

    const handleCreateService = () => {
        dispatch(resetService());
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
            const response = await describeServices({
                limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
            });
            setData(response.list);
            setTotal(response.totalCount);
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
                        <Search onChange={(value: string) => {
                            setSearchParam(value);
                        }} />
                        <Tooltip content="刷新">
                            <RefreshIcon onClick={() => fetchData({ current, pageSize, previous: 0 })} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
            <ServiceEditor
                key={editorState.mode + (editorState.data?.name || 'new') + (editorState.visible ? '1' : '0')}
                modify={editorState.mode === 'edit'}
                visible={editorState.visible}
                closeDrawer={() => {
                    // 关闭后重置编辑器状态
                    dispatch(resetService());
                    setEditorState(s => ({ ...s, visible: false }));
                }} />
            <Table
                data={data}
                columns={columns(handleEditService, (service: string, namespace: string) => {
                    navigate(`instance?namespace=${namespace}&service=${service}`);
                    // navigate(`/discovery/service/instance/${namespace}/${service}`);
                })}
                loading={isLoading}
                rowKey="id"
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