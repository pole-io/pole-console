import ErrorPage from 'components/ErrorPage';
import React, { useState } from 'react';
import { Drawer, Form, Input, Space, Button, Select, Table, Tooltip, Descriptions, Tag, Popconfirm } from "tdesign-react";
import type { FormProps, PrimaryTableProps, TableProps, TableRowData } from 'tdesign-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import Text from 'components/Text';
import { describeFileReleaseVersions, releaseConfigFile, rollbackFileReleases } from 'services/config_release';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import { Delete1Icon, Edit1Icon, RollbackIcon, SendIcon } from 'tdesign-icons-react';
import { publishConfigFiles, releaseRollback, releasesRemove } from 'modules/configuration/release';

interface IReleaseTableProps {
    namespace: string;
    group: string;
    filename: string;
    editable: boolean;
    deleteable: boolean;
}

const ServerError = () => <ErrorPage code={500} />;

const columns = (props: IReleaseTableProps, handleEditRelease: (op: string, row: TableRowData) => void): PrimaryTableProps['columns'] => [
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
        cell: ({ row: { releaseType } }) => releaseType === 'gray' ? <Tag theme='warning'>灰度发布</Tag> : <Tag theme='success'>全量发布</Tag>,
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
                    {row.releaseType !== 'gray' && (
                        <>
                            <Tooltip content={props.editable ? '回滚至此版本' : '无权限操作'}>
                                <Popconfirm
                                    content="确认回滚至此版本吗"
                                    destroyOnClose
                                    placement="top"
                                    showArrow
                                    theme="default"
                                    onConfirm={() => {
                                        handleEditRelease('rollback', row)
                                    }}
                                >
                                    <Button
                                        shape="square"
                                        icon={<RollbackIcon />}
                                        variant="text"
                                        disabled={!props.editable}
                                    />
                                </Popconfirm>
                            </Tooltip>
                        </>
                    )}
                    <Tooltip content={props.editable ? '撤销' : '无权限操作'}>
                        <Popconfirm
                            content="确认删除吗"
                            destroyOnClose
                            placement="top"
                            showArrow
                            theme="default"
                            onConfirm={() => {
                                handleEditRelease('delete', row)
                            }}
                        >
                            <Button
                                shape="square"
                                icon={<Delete1Icon />}
                                variant="text"
                                disabled={!props.deleteable}
                            />
                        </Popconfirm>

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

    const handleEditRelease = async (op: string, row: TableRowData) => {
        if (op === 'publish') {
            // 重新发布
            const res = await dispatch(publishConfigFiles({
                state: {
                    namespace: props.namespace,
                    group: props.group,
                    fileName: props.filename,
                    name: row.name as string,
                    releaseDescription: row.releaseDescription as string,
                    releaseType: row.releaseType as 'normal' | 'gray',
                    betaLabels: []
                }
            }))
            if (res.meta.requestStatus === 'fulfilled') {
                openInfoNotification('发布配置成功', '发布配置成功');
            } else {
                openErrNotification('发布配置失败', res.payload as string);
            }
        } else if (op === 'rollback') {
            // 回滚发布
            const res = await dispatch(releaseRollback({
                state: {
                    namespace: props.namespace,
                    group: props.group,
                    fileName: props.filename,
                    name: row.name as string,
                }
            }))
            if (res.meta.requestStatus === 'fulfilled') {
                openInfoNotification('回滚发布成功', '回滚发布成功');
            } else {
                openErrNotification('回滚发布失败', res.payload as string);
            }
        } else if (op === 'delete') {
            // 删除发布
            const res = await dispatch(releasesRemove({
                state: [{
                    namespace: props.namespace,
                    group: props.group,
                    fileName: props.filename,
                    name: row.name as string
                }]
            }))
            if (res.meta.requestStatus === 'fulfilled') {
                openInfoNotification('请求成功', '撤销发布成功');
            } else {
                openErrNotification('撤销发布失败', res.payload as string);
            }
        } else {
            // 查看发布详细
        }
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
                columns={columns(props, handleEditRelease)}
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