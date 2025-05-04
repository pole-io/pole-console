import React, { useState } from 'react';
import { Drawer, Form, Input, Space, Button, Select } from "tdesign-react";
import type { FormProps } from 'tdesign-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import LabelInput from 'components/LabelInput';
import { saveConfigGroups, selectConfigGroup, updateConfigGroups } from 'modules/configuration/group';
import { describeAllNamespaces, NamespaceView } from 'services/namespace';

const { FormItem } = Form;

interface IConfigGroupEditorProps {
    modify: boolean;
    closeDrawer: () => void;
    refresh: () => void;
    visible: boolean;
}

const ConfigGroupEditor: React.FC<IConfigGroupEditorProps> = ({ visible, modify, closeDrawer, refresh }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const currentGroup = useAppSelector(selectConfigGroup);

    const { id, name, namespace, comment, department, business, metadata } = currentGroup;
    const [namespaceOptions, setNamespaceOptions] = useState<{ label: string, value: string }[]>([]);
    const group_labels = metadata ? Object.entries(metadata).map(([key, value]) => ({ key, value })) : [];

    React.useEffect(() => {
        if (!visible) {
            form.reset();
            return;
        }
        if (currentGroup.name) {
            form.setFieldsValue({
                name: name,
                namespace: namespace,
                comment: comment,
                department: department,
                business: business,
                group_labels: group_labels,
            });
        }
    }, [visible, currentGroup]);

    React.useEffect(() => {
        if (!modify) {
            fetchNamespaceList();
        }
    }, []);

    async function fetchNamespaceList() {
        const allNamespaces = await describeAllNamespaces();
        const options = allNamespaces.map((item: NamespaceView) => ({
            label: item.name,
            value: item.name,
        }));
        setNamespaceOptions(options);
    }

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        console.log(e);
        if (e.validateResult !== true) {
            return;
        }

        const labels = form.getFieldValue('group_labels') as { key: string, value: string }[]

        const newData = {
            id: modify ? id : 0,
            name: form.getFieldValue('name') as string,
            namespace: form.getFieldValue('namespace') as string,
            comment: form.getFieldValue('comment') as string,
            department: form.getFieldValue('department') as string,
            business: form.getFieldValue('business') as string,
            metadata: labels.reduce((acc: { [key: string]: string }, { key, value }) => {
                acc[key] = value;
                return acc;
            }, {}),
        }

        let result;
        if (modify) {
            result = await dispatch(updateConfigGroups({ state: { ...newData } }))
        } else {
            result = await dispatch(saveConfigGroups({ state: { ...newData } }))
        }

        if (result.meta.requestStatus !== 'fulfilled') {
            openErrNotification('请求错误', result?.payload as string);
        } else {
            openInfoNotification('请求成功', modify ? '修改命名空间成功' : '创建命名空间成功');
            closeDrawer();
            refresh();
        }
    }

    const groupForm = (
        <Form
            form={form}
            layout="vertical"
            labelWidth={120}
            labelAlign={'left'}
            onSubmit={onSubmit}
        >
            <FormItem label={'命名空间'} name={'namespace'} initialData={namespace}>
                <Select
                    disabled={modify}
                    filterable={true}
                    options={namespaceOptions}
                    value={namespace}
                />
            </FormItem>
            <FormItem label={'名称'} name={'name'} initialData={name} rules={[
                { required: true, message: '请输入配置分组名称' },
                { pattern: /^[a-zA-Z0-9._-]+$/, message: '只允许数字、英文字母、.、-、_' },
                { max: 128, message: '长度不超过128个字符' }
            ]}>
                <Input
                    readonly={modify}
                    size='large'
                    placeholder={'允许数字、英文字母、.、-、_，限制128个字符'}
                    disabled={modify}
                />
            </FormItem>
            <FormItem
                label={'部门'}
                name={'department'}
                initialData={department}
                rules={[{ max: 255, message: '长度不超过255个字符' }]}>
                <Input />
            </FormItem>
            <FormItem
                label={'业务'}
                name='business'
                initialData={business}
                rules={[{ max: 255, message: '长度不超过255个字符' }]}>
                <Input />
            </FormItem>
            <FormItem
                label={'描述'}
                name={'comment'}
                initialData={comment}
                rules={[{ max: 1024, message: '长度不超过1024个字符' }]}
            >
                <Input />
            </FormItem>
            <LabelInput form={form} label='分组标签' name='group_labels' disabled={false} />
            <FormItem style={{ marginTop: 100 }}>
                <Space>
                    <Button type="submit" theme="primary">
                        提交
                    </Button>
                    <Button type="reset" theme="default">
                        重置
                    </Button>
                </Space>
            </FormItem>
        </Form>
    )

    return (
        <div>
            <Drawer
                size='large'
                header={modify ? "编辑" : "创建"}
                footer={false}
                visible={visible}
                showOverlay={false}
                onClose={closeDrawer}
            >
                {groupForm}
            </Drawer>
        </div>
    );
}

export default React.memo(ConfigGroupEditor);