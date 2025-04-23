import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Radio, RadioGroup, SelectOption, SelectValue, Space, Button } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { describeAllNamespaces, NamespaceView } from 'services/namespace';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import LabelInput from 'components/LabelInput';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { saveNamespace, selectCurrentNamespace, updateNamespace } from 'modules/namespace';
import { VisibilityMode_Single, VisibilityMode_All, VisibilityMode_Specified } from 'utils/visible';

const { FormItem } = Form;

interface NamespaceEditorProps {
    modify: boolean;
    closeDrawer: () => void;
    visible: boolean;
}

const NamespaceEditor: React.FC<NamespaceEditorProps> = ({ visible, modify, closeDrawer }) => {
    const [form] = Form.useForm();

    const dispatch = useAppDispatch();
    const currentNsState = useAppSelector(selectCurrentNamespace);
    const { name, comment, service_export_to, metadata, visibility_mode } = currentNsState;
    const [namespaceOptions, setNamespaceOptions] = useState<{ label: string, value: string }[]>([]);

    useEffect(() => {
        fetchNamespaceList();
    }, []);

    useEffect(() => {
        if (modify && name) {
            form.setFieldsValue({
                name: name,
                comment: comment,
                service_export_to: service_export_to,
                metadata: metadata,
                visibility_mode: { type: visibility_mode },
            });
        }
    }, [name, comment, service_export_to, metadata, visibility_mode]);

    async function fetchNamespaceList() {
        const allNamespaces = await describeAllNamespaces();
        const options = allNamespaces.map((item: NamespaceView) => ({
            label: item.name,
            value: item.name,
        }));
        setNamespaceOptions(options);
    }

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        if (e.validateResult !== true) {
            return;
        }

        const data = {
            name: form.getFieldValue('name') as string,
            comment: form.getFieldValue('comment') as string,
            service_export_to: form.getFieldValue('service_export_to') as string[],
            metadata: metadata,
        }

        let result;
        if (modify) {
            result = await dispatch(updateNamespace({ state: data }))
        } else {
            result = await dispatch(saveNamespace({ state: data }))
        }
        if (result.meta.requestStatus !== 'fulfilled') {
            openErrNotification('请求错误', result?.payload as string);
        } else {
            openInfoNotification('请求成功', modify ? '修改命名空间成功' : '创建命名空间成功');
        }
        closeDrawer();
    };

    return (
        <div>
            <Drawer size='large' header={modify ? "编辑" : "创建"} footer={false} visible={visible} showOverlay={false} onClose={closeDrawer}>
                <Form
                    form={form}
                    layout="vertical"
                    labelWidth={120}
                    labelAlign={'left'}
                    onSubmit={onSubmit}
                >
                    <FormItem
                        label={'命名空间'}
                        name={"name"}
                        initialData={name}
                        rules={modify ? [] : [
                            { required: true, message: '命名空间不能为空' },
                            { pattern: /^[a-zA-Z0-9._-]+$/, message: '只允许数字、英文字母、.、-、_' },
                            { max: 128, message: '长度不超过128个字符' }
                        ]}>
                        <Input
                            size='large'
                            readonly={modify}
                        />
                    </FormItem>
                    <FormItem
                        label={'描述'}
                        name={"comment"}
                        initialData={comment}
                        tips={'命名空间描述信息'}
                        rules={[{ max: 1024, message: '长度不超过1024个字符' }]}>
                        <Input />
                    </FormItem>
                    <FormItem>
                        {({ getFieldValue, setFieldsValue }) => {
                            return (
                                <FormItem
                                    label={'标签'}
                                    name={"metadata"}
                                    style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        <LabelInput
                                            labels={metadata}
                                            onChange={(key: string, value: string, del: boolean) => {
                                                if (del) {
                                                    const newLabels = { ...metadata };
                                                    delete newLabels[key];
                                                    setFieldsValue({ metadata: newLabels });
                                                } else {
                                                    if (key !== '' && value !== '') {
                                                        const newLabels = { ...metadata, [key]: value };
                                                        setFieldsValue({ metadata: newLabels });
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </FormItem>
                            )
                        }}
                    </FormItem>
                    <FormItem
                        label={'服务可见性'}
                        name={"visibility_mode"}
                        tips={'当前命名空间下的服务被允许可见的命名空间列表'}
                        initialData={visibility_mode}
                    >
                        <RadioGroup>
                            <Radio value={VisibilityMode_Single}>{'仅当前命名空间'}</Radio>
                            <Radio value={VisibilityMode_All}>{'全部命名空间（包括新增）'}</Radio>
                            <Radio value={VisibilityMode_Specified}>{'指定命名空间'}</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem shouldUpdate={(prev, next) => prev.visibility_mode !== next.visibility_mode}>
                        {({ getFieldValue, setFieldsValue }) => {
                            const ret = getFieldValue('visibility_mode') as string;
                            if (ret !== VisibilityMode_Specified) {
                                return <></>;
                            }
                            return (
                                <FormItem label={'选择命名空间'}
                                    name={"service_export_to"}
                                    tips={'当前命名空间下的服务被允许可见的命名空间列表'}
                                >
                                    <Select
                                        multiple={true}
                                        value={service_export_to || []}
                                        options={[{ label: '当前全部命名空间', value: '__all__', checkAll: true }, ...namespaceOptions]}
                                    />
                                </ FormItem>
                            )
                        }}
                    </FormItem>
                    <FormItem style={{ marginLeft: 100, marginTop: 100 }}>
                        <Space>
                            <Button type="submit" theme="primary">
                                提交
                            </Button>
                            <Button type="reset" theme="default" onClick={() => closeDrawer()}>
                                取消
                            </Button>
                        </Space>
                    </FormItem>
                </Form>
            </Drawer>
        </div>
    );
}

export default React.memo(NamespaceEditor);