import React, { } from 'react';
import { Steps, Drawer, Form, Input, Space, Row, Col, Switch, Select, FormProps, InputAdornment, Button } from "tdesign-react";
import FormItem from 'tdesign-react/es/form/FormItem'

import { useAppDispatch, useAppSelector } from 'modules/store';;
import CodeEditor from 'components/CodeEditor';
import LabelInput from 'components/LabelInput';
import { describeEncryptAlgo } from 'services/config_files';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import { saveConfigFiles } from 'modules/configuration/file';
import { get } from 'lodash';
import { resolveFileFormat } from 'utils/path';

interface IFileCreatorProps {
    modify?: boolean;
    namespace: string;
    group: string;
    visible: boolean;
    closeDrawer: () => void;
    refresh: () => void;
}

const { StepItem } = Steps;

const FileCreator: React.FC<IFileCreatorProps> = (props) => {
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();

    const filename = Form.useWatch('name', form);
    const comment = Form.useWatch('comment', form);
    const tags = Form.useWatch('tags', form);
    const encrypted = Form.useWatch('encrypted', form);
    const encryptAlgo = Form.useWatch('encryptAlgo', form);

    const [createState, setCreateState] = React.useState<{
        content: string;
        curStep: number;
        encryptAlgo: { label: string, value: string }[];
    }>({
        content: '', curStep: 1, encryptAlgo: []
    });

    // 获取加密算法列表
    const fetchEncrtyptAlgo = async () => {
        try {
            const ret = await describeEncryptAlgo();
            const algoList = ret.algorithms.map((item) => ({
                label: item,
                value: item
            }));
            setCreateState({
                ...createState,
                encryptAlgo: algoList
            });
        } catch (err) {
            openErrNotification('获取加密算法列表失败', err as string);
        }
    }

    React.useEffect(() => {
        if (props.visible) {
            fetchEncrtyptAlgo();
        }
    }, [props.visible]);

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        console.log(e);
        if (e.validateResult !== true) {
            return;
        }

        const labels = tags as { key: string, value: string }[]

        const newData = {
            namespace: props.namespace,
            group: props.group,
            name: filename,
            comment: comment,
            format: resolveFileFormat(filename),
            content: createState.content,
            tags: labels,
            encrypted: encrypted,
            encryptAlgo: encryptAlgo,
        }

        console.log('newData', newData);

        const result = await dispatch(saveConfigFiles({ state: { ...newData } }));
        if (result.meta.requestStatus !== 'fulfilled') {
            openErrNotification('请求错误', result?.payload as string);
        } else {
            openInfoNotification('请求成功', '创建配置文件成功');
            props.refresh();
            props.closeDrawer();
        }
    }

    const createForm = (
        <>
            <Form
                form={form}
                layout="vertical"
                labelWidth={120}
                labelAlign={'left'}
                onSubmit={onSubmit}
            >
                {createState.curStep === 1 && (
                    <>
                        <FormItem label="命名空间" name="namespace" initialData={props.namespace}>
                            <Input disabled={true} />
                        </FormItem>
                        <FormItem label="配置组" name="group" initialData={props.group}>
                            <Input disabled={true} />
                        </FormItem>
                        <FormItem label="文件名称" name="name">
                            <Input suffix={`文件格式: ${resolveFileFormat(filename)}`} />
                        </FormItem>
                        <FormItem label="文件描述" name="comment">
                            <Input />
                        </FormItem>
                        <FormItem label="配置加密" name={'encrypted'}>
                            <Switch />
                        </FormItem>
                        <FormItem shouldUpdate={(prev, next) => {
                            const enableChange = prev.encrypted !== next.encrypted;
                            return enableChange;
                        }}>
                            {({ getFieldValue }) => {
                                if (getFieldValue('encrypted') === true) {
                                    return (
                                        <FormItem label="加密算法类型" key="ice" name={'encryptAlgo'}>
                                            <Select options={createState.encryptAlgo} />
                                        </FormItem>
                                    );
                                }
                                return <></>;

                            }}
                        </FormItem>
                        <LabelInput
                            disabled={false}
                            label="文件标签"
                            name="tags"
                        />
                    </>
                )}
                {createState.curStep === 2 && (
                    <>
                        <Space style={{ marginTop: 20, width: '100%' }}>
                            <CodeEditor
                                allowFullScreen={true}
                                readonly={false}
                                language={resolveFileFormat(filename)}
                                value={createState.content}
                                onChange={(value: string | undefined) => {
                                    setCreateState({
                                        ...createState,
                                        content: value || ''
                                    });
                                }}
                            />
                        </Space>
                    </>
                )}
            </Form>
        </>
    )
    return (
        <Drawer
            header={props.modify ? "编辑" : "创建"}
            size='960px'
            style={{ width: '100%' }}
            visible={props.visible}
            onClose={() => {
                setCreateState({
                    ...createState,
                    content: '',
                    curStep: 1
                });
                props.closeDrawer();
            }}
            footer={
                createState.curStep === 1 ? (
                    <>
                        <Space>
                            <Button theme="default" onClick={() => {
                                setCreateState({
                                    ...createState,
                                    curStep: 2
                                });
                            }}>
                                下一步
                            </Button>
                        </Space>
                    </>
                )
                    :
                    createState.curStep === 2 ? (
                        <>
                            <Space>
                                <Button theme="default" onClick={() => {
                                    setCreateState({
                                        ...createState,
                                        curStep: 1
                                    });
                                }}>
                                    上一步
                                </Button>
                                <Button theme='primary' type='submit' onClick={() => {
                                    form.submit({ showErrorMessage: true });
                                }}>
                                    提交
                                </Button>
                            </Space>
                        </>
                    )
                        :
                        <>
                        </>
            }
        >
            <Row>
                <Col span={3}>
                    <Steps layout="vertical" current={createState.curStep} onChange={(value) => {
                        setCreateState({
                            ...createState,
                            curStep: value as number
                        });
                    }}>
                        <StepItem value={1} title="元信息">
                        </StepItem>
                        <StepItem value={2} title="文件内容" style={{ width: '80' }}>
                        </StepItem>
                    </Steps>
                </Col>
                <Col span={9}>
                    {createForm}
                </Col>
            </Row>
        </Drawer>
    )
}

export default React.memo(FileCreator)