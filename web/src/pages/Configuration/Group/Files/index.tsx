import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Row, Col, Breadcrumb, Tree, Input, TreeInstanceFunctions, Tabs, Popconfirm } from 'tdesign-react';
import { Delete1Icon, FileAddIcon, Icon, RefreshIcon } from 'tdesign-icons-react';
import { useNavigate, BrowserRouterProps } from 'react-router-dom';
import type { TreeProps, TreeNodeModel } from 'tdesign-react';

import ErrorPage from 'components/ErrorPage';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification } from 'utils/notifition';
import style from './index.module.less';
import { ConfigFile, describeAllConfigFiles } from 'services/config_files';
import { viewConfigFile } from 'modules/configuration/file';
import FileCreator from './FileCreator';
import ReleaseTable from '../Releases/ReleaseTable';
import { selectConfigGroup } from 'modules/configuration/group';
import SubscribeTable from './SubscribeTable';
import FileView from './FileView';

const { BreadcrumbItem } = Breadcrumb;
const { TabPanel } = Tabs;

interface IFileListProps {
}

const ServerError = () => <ErrorPage code={500} />;

const renderIcon: TreeProps['icon'] = (node) => {
    let name = 'file';
    if (node.getChildren(true)) {
        if (node.expanded) {
            name = 'folder-open';
            if (node.loading) {
                name = 'loading';
            }
        } else {
            name = 'folder';
        }
    }
    return <Icon name={name} />;
};

const renderTree = (files: ConfigFile[]) => {
    const root: any = [];

    files.forEach(file => {
        const parts = file.name.split('/').filter(Boolean);
        let currentLevel = root;

        parts.forEach((part, idx) => {
            let node = currentLevel.find((item: any) => item.label === part);
            if (!node) {
                node = {
                    label: part,
                    value: idx === parts.length - 1 ? file.name : part,
                    disabled: idx === parts.length - 1 ? false : true,
                    children: idx === parts.length - 1 ? false : [],
                };
                currentLevel.push(node);
            }
            if (node.children !== false) {
                currentLevel = node.children;
            }
        });
    });
    return root;
}

export default React.memo((props: IFileListProps & BrowserRouterProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate()
    const urlParams = new URLSearchParams(window.location.search);
    const namespace = urlParams.get('namespace');
    const group = urlParams.get('group');
    const treeRef = React.useRef<TreeInstanceFunctions>(null);

    const ownerGroup = useAppSelector(selectConfigGroup);

    const [searchState, setSearchState] = useState<{
        files: any[];
        fetchError: boolean;
        isLoading: boolean;
    }>({ files: [], fetchError: false, isLoading: false });

    // 合并编辑相关状态
    const [editState, setEditState] = useState<{
        activeNode?: TreeNodeModel;
        visible: boolean;
        mode: 'create' | 'edit' | 'view';
        editable?: boolean;
        deleteable?: boolean;
        nodeFilter: string;
    }>({ activeNode: undefined, visible: false, mode: 'view', editable: ownerGroup.editable, deleteable: ownerGroup.deleteable, nodeFilter: '' });

    // 模拟远程请求
    async function fetchData() {
        setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
        try {
            // 请求可能存在跨域问题
            const response = await describeAllConfigFiles({ namespace: namespace ? namespace : '', group: group ? group : '', });
            setSearchState(s => ({ ...s, files: renderTree(response), isLoading: false }));
        } catch (error: Error | any) {
            setSearchState(s => ({ ...s, fetchError: true, isLoading: false }));
            openErrNotification("获取数据失败", error);
        }
    }

    React.useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const treeSearch: TreeProps['filter'] = (node) => {
        const rs = (node.data.label as string).indexOf(editState.nodeFilter) >= 0;
        return rs;
    };

    const renderOperations = (node: TreeNodeModel) => (
        <>
            {/* 只有是激活状态的 node 才可以展示删除操作 */}
            {editState.activeNode && editState.activeNode.data.value === node.value && (
                <Tooltip content={editState.deleteable ? '删除' : '无权限操作'}>
                    <Popconfirm
                        content="确认删除吗"
                        destroyOnClose
                        placement="top"
                        showArrow
                        theme="default"
                        onConfirm={() => {
                            handleOperateFile(node, 'delete');
                        }}
                    >
                        <Button style={{ marginLeft: '10px' }} disabled={!editState.deleteable} size="small" variant='text' icon={<Delete1Icon />} />
                    </Popconfirm>
                </Tooltip>

            )}
        </>
    );

    const handleOperateFile = (node: TreeNodeModel, op: 'create' | 'delete') => {
        if (op === 'delete') {
            return;
        }
        dispatch(viewConfigFile({
            namespace: namespace ? namespace : '',
            group: group ? group : '',
            name: '',
        }));
        setEditState(s => ({ ...s, visible: true, mode: 'create', activeNode: undefined }));
    }

    const mainView = (
        <>
            <Breadcrumb maxItemWidth="200px">
                <BreadcrumbItem>{namespace}</BreadcrumbItem>
                <BreadcrumbItem onClick={() => {
                    navigate(-1);
                }}>
                    {group}
                </BreadcrumbItem>
            </Breadcrumb>
            <Row>
                <Col span={3}>
                    <Row justify='space-between' className={style.toolBar}>
                        <Col span={9}>
                            <Input value={editState.nodeFilter} onChange={value => setEditState(s => ({ ...s, nodeFilter: value }))} />
                        </Col>
                        <Col>
                            <Tooltip content={ownerGroup.editable ? '新建配置文件' : '没有权限'}>
                                <Button
                                    variant='text'
                                    size='small'
                                    icon={<FileAddIcon />}
                                    onClick={() => handleOperateFile({} as TreeNodeModel, 'create')}
                                    disabled={!ownerGroup.editable}
                                />
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip content="刷新">
                                <Button
                                    variant='text'
                                    size='small'
                                    icon={<RefreshIcon />}
                                    onClick={() => fetchData()}
                                />
                            </Tooltip>
                        </Col>
                    </Row>
                    <Tree
                        ref={treeRef}
                        activable={true}
                        checkStrictly={true}
                        valueMode='onlyLeaf'
                        allowFoldNodeOnFilter={true}
                        data={searchState.files}
                        hover
                        expandAll={true}
                        icon={renderIcon}
                        scroll={{ type: 'virtual' }}
                        style={{ height: 'calc(100vh - 270px)' }}
                        filter={treeSearch}
                        onActive={(node, ctx) => {
                            setEditState(s => ({ ...s, activeNode: { ...ctx.node }, visible: true, mode: 'edit' }));
                            dispatch(viewConfigFile({
                                namespace: namespace ? namespace : '',
                                group: group ? group : '',
                                name: ctx.node.value as string,
                            }));
                        }}
                        operations={renderOperations}
                    />
                </Col>
                <Col span={8} style={{ marginLeft: 30 }}>
                    {(editState.visible && editState.mode === 'edit') && (
                        <Tabs>
                            <TabPanel value={'file_editor'} label="配置编辑">
                                <div style={{ marginLeft: 20, marginTop: 20 }}>
                                    <FileView editable={ownerGroup.editable} deleteable={ownerGroup.deleteable} key={editState.activeNode?.value} />
                                </div>
                            </TabPanel>
                            <TabPanel value={'file_release'} label="发布记录">
                                <div style={{ marginLeft: 20, marginTop: 20 }}>
                                    <ReleaseTable
                                        namespace={namespace ? namespace : ''}
                                        group={group ? group : ''}
                                        filename={editState.activeNode?.value as string}
                                        editable={editState.editable || true}
                                        deleteable={editState.deleteable || true} />
                                </div>
                            </TabPanel>
                            <TabPanel value={'file_subscribe'} label="订阅查询">
                                <div style={{ marginLeft: 20, marginTop: 20 }}>
                                    <SubscribeTable
                                        namespace={namespace ? namespace : ''}
                                        group={group ? group : ''}
                                        filename={editState.activeNode?.value as string}
                                        editable={editState.editable || true}
                                        deleteable={editState.deleteable || true} />
                                </div>
                            </TabPanel>
                        </Tabs>
                    )}
                </Col>
            </Row>
            {(editState.visible && editState.mode === 'create') && (
                <FileCreator
                    namespace={namespace ? namespace : ''}
                    group={group ? group : ''}
                    visible={editState.visible && editState.mode === 'create'}
                    closeDrawer={() => {
                        setEditState(s => ({ ...s, visible: false, mode: 'view' }));
                    }}
                    refresh={() => {
                        setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
                        fetchData();
                    }}
                />
            )}

        </>
    );

    return (
        <div>
            {searchState.fetchError ? (
                <ServerError />
            ) : (
                mainView
            )}
        </div>
    );
});