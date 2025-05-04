import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Space, Row, Col, TableRowData, Breadcrumb, Tree, Card, Input, TreeInstanceFunctions, Tabs, StickyTool } from 'tdesign-react';
import { AddIcon, ChatIcon, FileAddIcon, Icon, QrcodeIcon, RefreshIcon } from 'tdesign-icons-react';
import { useNavigate, BrowserRouterProps } from 'react-router-dom';
import type { TreeProps, TreeNodeValue, TreeNodeModel } from 'tdesign-react';

import ErrorPage from 'components/ErrorPage';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification } from 'utils/notifition';
import style from './index.module.less';
import { ConfigFile, describeAllConfigFiles } from 'services/config_files';
import FileEditor from './FileView';
import { viewConfigFile } from 'modules/configuration/file';
import TabPanel from 'tdesign-react/es/tabs/TabPanel';
import FileCreator from './FileCreator';
import StickyItem from 'tdesign-react/es/sticky-tool/StickyItem';
import ReleaseTable from '../Releases/ReleaseTable';
import { selectConfigGroup } from 'modules/configuration/group';
import SubscribeTable from './SubscribeTable';
import FileView from './FileView';

const { BreadcrumbItem } = Breadcrumb;

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
    }>({ activeNode: undefined, visible: false, mode: 'view', editable: ownerGroup.editable, deleteable: ownerGroup.deleteable });

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

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshTable = () => {
        setSearchState(s => ({ ...s, fetchError: false, isLoading: true }));
        fetchData();
    }

    const [nodeFilter, setNodeFilter] = useState('');

    const treeSearch: TreeProps['filter'] = (node) => {
        const rs = (node.data.label as string).indexOf(nodeFilter) >= 0;
        return rs;
    };

    const handleCreateFile = () => {
        dispatch(viewConfigFile({
            namespace: namespace ? namespace : '',
            group: group ? group : '',
            name: '',
        }));
        setEditState({
            visible: true,
            mode: 'create',
            activeNode: undefined,
        })
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
                            <Input value={nodeFilter} onChange={setNodeFilter} />
                        </Col>
                        <Col>
                            <Tooltip content={ownerGroup.editable ? '新建配置文件' : '没有权限'}>
                                <Button
                                    variant='text'
                                    size='small'
                                    icon={<FileAddIcon />}
                                    onClick={() => handleCreateFile()}
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
                            <TabPanel value={'file_release'} label="版本历史">
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
                    refresh={refreshTable}
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