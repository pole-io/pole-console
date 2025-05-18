import React, { } from 'react';
import { Form, Space, Button, Row, Descriptions, Input, Switch, Select, StickyTool, Drawer, Tag } from "tdesign-react";

import { useAppDispatch, useAppSelector } from 'modules/store';;
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import CodeEditor from 'components/CodeEditor';
import DescriptionsItem from 'tdesign-react/es/descriptions/DescriptionsItem';
import { selectConfigFile, updateConfigFiles } from 'modules/configuration/file';
import { ConfigFile, describeEncryptAlgo, describeOneConfigFile, FileStatusMap } from 'services/config_files';
import LabelInput from 'components/LabelInput';
import { Edit1Icon, SaveIcon, RocketIcon, LightbulbIcon, Delete1Icon, RollbackIcon } from 'tdesign-icons-react';
import StickyItem from 'tdesign-react/es/sticky-tool/StickyItem';
import PublishForm from '../Releases/PublishForm';

const { FormItem } = Form;

interface IFileViewProps {
    editable?: boolean;
    deleteable?: boolean;
}

const FileView: React.FC<IFileViewProps> = (props) => {
    const dispatch = useAppDispatch();
    const currentFile = useAppSelector(selectConfigFile)
    const { id, name, group, namespace } = currentFile;
    const [form] = Form.useForm();

    const [fileInfo, setFileInfo] = React.useState<ConfigFile>();
    const [editorState, setEditorState] = React.useState<{
        model: 'view' | 'edit' | 'publish' | 'gray';
        publishView: boolean;
        encryptAlgo: { label: string, value: string }[];
        content: string;
    }>({ model: 'view', encryptAlgo: [], content: '', publishView: false });

    // 获取配置文件详细
    const fetchConfigFileDetail = async () => {
        try {
            const ret = await describeOneConfigFile({ namespace: namespace, group: group, name: name });
            setFileInfo(ret.configFile);
            setEditorState(prev => ({ ...prev, content: ret.configFile.content || '' }));
        } catch (err) {
            openErrNotification('获取配置文件详细失败', err as string);
        }
    }

    // 获取加密算法列表
    const fetchEncrtyptAlgo = async () => {
        try {
            const ret = await describeEncryptAlgo();
            const algoList = ret.algorithms.map((item) => ({
                label: item,
                value: item
            }));
            setEditorState(prev => ({ ...prev, encryptAlgo: algoList }));
        } catch (err) {
            openErrNotification('获取加密算法列表失败', err as string);
        }
    }

    React.useEffect(() => {
        fetchConfigFileDetail();
    }, [namespace, group, name]);

    const handleSaveFile = async () => {
        if (!fileInfo) {
            return;
        }
        const updateData = {
            namespace: namespace,
            group: group,
            name: fileInfo.name,
            format: fileInfo.format || 'text',
            comment: form.getFieldValue('comment') as string,
            encrypted: form.getFieldValue('encrypted') as boolean,
            encryptAlgo: form.getFieldValue('encryptAlgo') as string,
            content: editorState.content || '',
            tags: form.getFieldValue('file_tags') as { key: string, value: string }[],
        }
        const result = await dispatch(updateConfigFiles({ state: updateData }));
        if (result.meta.requestStatus !== 'fulfilled') {
            openErrNotification('请求错误', result?.payload as string);
        } else {
            openInfoNotification('保存成功', '配置文件已成功保存');
            // 重新获取文件信息
            fetchConfigFileDetail();
            setEditorState(prev => ({ ...prev, model: 'view' }));
        }
    }

    const editor = (
        <>
            {editorState.model === 'view' && (
                <>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Descriptions
                            itemLayout="horizontal"
                            layout="horizontal"
                            size="small"
                            title={name}
                            column={3}
                        >
                            <DescriptionsItem label="发布状态">
                                <Tag theme={FileStatusMap?.[fileInfo?.status as keyof typeof FileStatusMap]?.theme as "success" | "danger" | "default" | "primary" | "warning"} variant="outline">{FileStatusMap?.[fileInfo?.status as keyof typeof FileStatusMap]?.text ?? '-'}</Tag>
                            </DescriptionsItem>
                            <DescriptionsItem label="文件格式">
                                {fileInfo?.format}
                            </DescriptionsItem>
                            <DescriptionsItem label="修改时间">
                                {fileInfo?.modifyTime}
                            </DescriptionsItem>
                            <DescriptionsItem label="创建时间">
                                {fileInfo?.createTime}
                            </DescriptionsItem>
                            <DescriptionsItem label="加密状态">
                                {fileInfo?.encrypted ? '已加密' : '未加密'}
                            </DescriptionsItem>
                            <DescriptionsItem label="加密算法">
                                {fileInfo?.encryptAlgo}
                            </DescriptionsItem>
                        </Descriptions>
                    </Space>
                    <Space style={{ marginTop: 20, width: '100%' }}>
                        <CodeEditor
                            allowFullScreen={true}
                            readonly={editorState.model === 'view'}
                            language={fileInfo?.format}
                            value={editorState.content}
                            onChange={(value: string | undefined) => {
                                if (fileInfo) {
                                    setEditorState(prev => ({ ...prev, content: value || '' }));
                                }
                            }}
                        />
                    </Space>
                </>
            )}
            {editorState.model === 'edit' && (
                <Form
                    form={form}
                    layout="vertical"
                >
                    <FormItem
                        label="文件描述"
                        name="comment"
                        initialData={fileInfo?.comment}
                        rules={[{ max: 1024, message: '长度不超过1024个字符' }]}>
                        <Input />
                    </FormItem>
                    <FormItem label="配置加密" name={'encrypted'} initialData={fileInfo?.encrypted}>
                        <Switch onChange={(val) => {
                            if (val === true) {
                                fetchEncrtyptAlgo();
                            }
                        }} />
                    </FormItem>
                    <FormItem shouldUpdate={(prev, next) => {
                        const enableChange = prev.encrypted !== next.encrypted;
                        return enableChange;
                    }}>
                        {({ getFieldValue }) => {
                            if (getFieldValue('encrypted') === true) {
                                return (
                                    <FormItem label="加密算法类型" key="ice" name={'encryptAlgo'} initialData={fileInfo?.encryptAlgo}>
                                        <Select options={editorState.encryptAlgo} />
                                    </FormItem>
                                );
                            }
                            return <></>;
                        }}
                    </FormItem>
                    <LabelInput
                        disabled={false}
                        label="文件标签"
                        name="file_tags"
                    />
                </Form>
            )}
            {editorState.publishView && (
                <PublishForm
                    namespace={namespace}
                    group={group}
                    filename={name}
                    visible={editorState.publishView}
                    close={() => {
                        setEditorState(prev => ({ ...prev, publishView: false }));
                        // 重新获取文件信息
                        fetchConfigFileDetail();
                    }}
                />
            )}
            {(props.editable || props.deleteable) && (
                <StickyTool
                    style={{ zIndex: 1000 }}
                    placement='left-bottom'
                    offset={[1550, 200]}
                >
                    {props.editable && (
                        <StickyItem
                            label={editorState.model === 'view' ? '编辑' : '保存'}
                            icon={editorState.model === 'view' ?
                                <Edit1Icon onClick={() => {
                                    if (editorState.model === 'view') {
                                        setEditorState(prev => ({ ...prev, model: 'edit' }));
                                    }
                                }} />
                                :
                                <SaveIcon onClick={() => {
                                    if (editorState.model === 'edit') {
                                        handleSaveFile();
                                    }
                                }} />}
                        />
                    )}
                    {(editorState.model === 'edit' && props.editable) && (
                        <StickyItem label="撤销" icon={
                            <RollbackIcon onClick={() => {
                                setEditorState(prev => ({ ...prev, model: 'view', content: fileInfo?.content || '' }));
                            }} />}
                        />
                    )}
                    {(editorState.model === 'view' && props.editable) && (
                        <StickyItem label="发布" icon={
                            <RocketIcon onClick={() => {
                                setEditorState(prev => ({ ...prev, publishView: true }));
                            }} />}
                        />
                    )}
                </StickyTool>
            )}
        </>
    )

    return (
        <>
            {editor}
        </>
    )
}

export default React.memo(FileView)