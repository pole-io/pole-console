import React, { useEffect, useState } from 'react';
import { Link, Popup, Table, Button, PageInfo, PrimaryTableProps, TableProps, Tooltip, Space, Row, Col, TableRowData, Tabs, Loading, Select } from 'tdesign-react';
import { DeleteIcon, EditIcon, RefreshIcon, ChevronRightCircleIcon, CreditcardIcon } from 'tdesign-icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

import ErrorPage from 'components/ErrorPage';
import Text from 'components/Text';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { describeServices } from 'services/service';
import { openErrNotification } from 'utils/notifition';
import { CheckVisibilityMode, VisibilityModeMap } from 'utils/visible';
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
            onClick={() => { redirect(name, namespace) }}
        >{name}</Link>,
    },
    {
        colKey: 'namespace',
        title: '命名空间',
        cell: ({ row: { namespace } }) => <Text>{namespace}</Text>,
    },
]

interface IServiceSubscribeProps {

}


const ServiceSubscribeTable: React.FC<IServiceSubscribeProps> = ({ }) => {
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

    // 模拟远程请求
    async function fetchData(pageInfo: PageInfo, searchParam?: string) {
        setSearchState(s => ({ ...s, current: pageInfo.current, limit: pageInfo.pageSize, previous: pageInfo.previous, fetchError: false, isLoading: true }));
        try {
            const { current, pageSize } = pageInfo;
            // 请求可能存在跨域问题
            const response = await describeServices({
                limit: pageSize, offset: (current - 1) * pageSize, ...(searchParam && { name: searchParam })
            });
            setSearchState(s => ({ ...s, services: response.list, total: response.totalCount, isLoading: false }));
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
                            <Select />
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Space>
                        <Tooltip content="刷新">
                            <RefreshIcon onClick={() => fetchData({ current: 1, pageSize: searchState.limit, previous: 0 })} />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>
            <Table
                data={searchState.services}
                columns={columns(handleEditService, (service: string, namespace: string) => {
                    navigate(`instance?namespace=${namespace}&service=${service}`);
                    // navigate(`/discovery/service/instance/${namespace}/${service}`);
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

export default React.memo(ServiceSubscribeTable);