import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Radio, RadioGroup, Space, Button } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { describeAllNamespaces, NamespaceView } from 'services/namespace';
import { describeAllServices, ServiceView } from 'services/service';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import { saveServiceAliass, selectServiceAlias, updateServiceAliass } from 'modules/discovery/alias';

const { FormItem } = Form;

interface IServiceEditorProps {
    modify: boolean;
    closeDrawer: () => void;
    refresh: () => void;
    visible: boolean;
}

const ServiceAliasEditor: React.FC<IServiceEditorProps> = ({ visible, modify, closeDrawer, refresh }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const currentAlias = useAppSelector(selectServiceAlias);
    const { id, service, namespace, alias_namespace, alias, comment } = currentAlias;

    const [namespaceOptions, setNamespaceOptions] = useState<{ label: string, value: string }[]>([]);
    const [servicesOpts, setServicesOpts] = useState<{ label: string, value: string }[]>([]);


    useEffect(() => {
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

        const allServices = await describeAllServices();
        const serviceOptions = allServices.list.map((item: ServiceView) => ({
            label: item.name,
            value: item.namespace + '@' + item.name,
        }));
        setServicesOpts(serviceOptions);
    }

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        console.log('onSubmit', e);
        if (e.validateResult !== true) {
            return;
        }

        const selectedSvc = form.getFieldValue('name') as string;
        const selectedSvcNamespace = selectedSvc.split('@')[0];
        const selectedSvcName = selectedSvc.split('@')[1];

        const newData = {
            id: modify ? id : '',
            service: selectedSvcName,
            namespace: selectedSvcNamespace,
            alias_namespace: form.getFieldValue('alias_namespace') as string,
            alias: form.getFieldValue('alias') as string,
            comment: form.getFieldValue('comment') as string,
        }
        let result;
        if (modify) {
            result = await dispatch(updateServiceAliass({ state: { ...newData } }))
        } else {
            result = await dispatch(saveServiceAliass({ state: { ...newData } }))
        }
        if (result.meta.requestStatus === 'fulfilled') {
            openInfoNotification('操作成功', modify ? '修改服务别名成功' : '创建服务别名成功');
            closeDrawer();
            refresh();
        } else {
            openErrNotification('操作失败', result?.payload as string);
        }
    }

    const aliasForm = (
        <Form
            labelWidth={140}
            labelAlign={'left'}
            form={form}
            onSubmit={onSubmit}
        >
            <FormItem label="目标服务" name="name" rules={[{ required: true, message: '服务名称不能为空' }]}>
                <Select
                    disabled={modify}
                    filterable={true}
                    options={servicesOpts}
                    value={currentAlias.service}
                />
            </FormItem>
            <FormItem label="别名所在命名空间" name="alias_namespace" rules={[{ required: true, message: '命名空间不能为空' }]}>
                <Select
                    disabled={modify}
                    filterable={true}
                    options={namespaceOptions}
                    value={currentAlias.alias_namespace}
                />
            </FormItem>
            <FormItem label="别名" name="alias" rules={[{ required: true, message: '别名不能为空' }]}>
                <Input />
            </FormItem>
            <FormItem label="备注" name="comment">
                <Input />
            </FormItem>
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
    );

    return (
        <>
            <div>
                <Drawer
                    size='large'
                    header={modify ? "编辑" : "创建"}
                    footer={false}
                    visible={visible}
                    showOverlay={false}
                    onClose={closeDrawer}
                >
                    {aliasForm}
                </Drawer>
            </div>
        </>
    )
}

export default React.memo(ServiceAliasEditor);