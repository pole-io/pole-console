import ErrorPage from 'components/ErrorPage';
import React, { useState } from 'react';
import { Drawer, Form, Input, Space, Button, Select, Table, Tooltip, Descriptions, Tag } from "tdesign-react";
import type { FormProps, PrimaryTableProps, TableProps, TableRowData } from 'tdesign-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import Text from 'components/Text';
import { describeFileReleaseVersions } from 'services/config_release';
import { openErrNotification } from 'utils/notifition';
import { Delete1Icon, Edit1Icon, RollbackIcon } from 'tdesign-icons-react';

interface IReleaseTableProps {
    namespace: string;
    group: string;
    filename: string;
    editable: boolean;
    deleteable: boolean;
}

const ServerError = () => <ErrorPage code={500} />;

const columns = (props: IReleaseTableProps, handleViewRelease: (view: boolean, row: TableRowData) => void): PrimaryTableProps['columns'] => [
    {
        colKey: 'name',
        title: '名称',
        cell: ({ row: { name } }) => <Text>{name}</Text>,
    },
    {
        colKey: 'version',
        title: 'Version',
        cell: ({ row: { version } }) => <Text>{version}</Text>,
    },
    {
        colKey: 'active',
        title: '状态',
        cell: ({ row: { active } }) => active ? <Tag theme='primary'>使用中</Tag> : <></>,
    },
    {
        colKey: 'releaseType',
        title: '发布类型',
        cell: ({ row: { releaseType } }) => releaseType === 'beta' ? <Tag theme='warning'>灰度发布</Tag> : <Tag theme='success'>全量发布</Tag>,
    },
    {
        colKey: 'ctime',
        title: '发布时间',
        cell: ({ row: { createTime } }) => <Text>{createTime}</Text>,
    },
    {
        colKey: 'action',
        title: '操作',
        cell: ({ row }) => {
            return (
                <Space>
                    <Tooltip content={props.editable === false ? '无权限操作' : '重发布'}>
                        <Button shape="square" variant="text" disabled={props.editable === false}>
                            <Edit1Icon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={props.editable === false ? '无权限操作' : '回滚至此版本'}>
                        <Button shape="square" variant="text" disabled={row.deleteable === false}>
                            <RollbackIcon />
                        </Button>
                    </Tooltip>
                    <Tooltip content={props.editable === false ? '无权限操作' : '撤销'}>
                        <Button shape="square" variant="text" disabled={row.deleteable === false}>
                            <Delete1Icon />
                        </Button>
                    </Tooltip>
                </Space>
            )
        },
    },
]

const ReleaseTable: React.FC<IReleaseTableProps> = (props) => {
    const dispatch = useAppDispatch();

    const [searchState, setSearchState] = useState<{
        releases: TableProps['data'];
        total: number;
        query: string;
        fetchError: boolean;
        isLoading: boolean;
    }>({ releases: [], total: 0, query: '', fetchError: false, isLoading: false });

    React.useEffect(() => {
        fetchReleaseVersions();
    }, [props.namespace, props.group, props.filename]);

    const fetchReleaseVersions = async () => {
        setSearchState((prev) => ({ ...prev, isLoading: true }));
        try {
            const releases = await describeFileReleaseVersions({
                namespace: props.namespace,
                group: props.group,
                file_name: props.filename,
            });
            setSearchState((prev) => ({
                ...prev,
                releases: releases.configFileReleases || [],
                total: releases.configFileReleases?.length || 0,
                isLoading: false,
            }));
        } catch (err) {
            setSearchState((prev) => ({
                ...prev,
                fetchError: true,
                isLoading: false,
            }));
            openErrNotification("获取版本列表失败", err as string);
        }
    }

    const handleViewRelease = (view: boolean, row: TableRowData) => {

    }

    const table = (
        <>
            <Descriptions
                itemLayout="horizontal"
                layout="horizontal"
                size="small"
                title={`${props.filename}`}
            ></Descriptions>
            <Table
                data={searchState.releases}
                columns={columns(props, handleViewRelease)}
                loading={searchState.isLoading}
                rowKey="id"
                size={"large"}
                tableLayout={'auto'}
                cellEmptyContent={'-'}
                pagination={{
                    defaultCurrent: 1,
                    defaultPageSize: 10,
                    total: searchState.total,
                    showJumper: true,
                }}
                selectOnRowClick={false}
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

export default React.memo(ReleaseTable);