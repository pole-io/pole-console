import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Space, Button, InputNumber } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import LabelInput from 'components/LabelInput';
import { selectInstance } from 'modules/discovery/instance';
import { InstanceLocation } from 'services/instance';


const { FormItem } = Form;

interface IInstanceEditorProps {
    modify: boolean;
    closeDrawer: () => void;
    visible: boolean;
}

const InstanceEditor: React.FC<IInstanceEditorProps> = ({ visible, modify, closeDrawer }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const currentInstance = useAppSelector(selectInstance);
    const { id, namespace, service, host, port, protocol, version, weight, metadata, healthy, isolate, location } = currentInstance;

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        console.log(e);
        if (e.validateResult !== true) {
            return;
        }
        const newData = {
            id: modify ? id : '',
        }

        let result;
        if (modify) {
            // result = await dispatch(updateServices({ state: { ...newData } }))
        } else {
            // result = await dispatch(saveServices({ state: { ...newData } }))
        }

        // if (result.meta.requestStatus !== 'fulfilled') {
        //     openErrNotification('请求错误', result?.payload as string);
        // } else {
        //     openInfoNotification('请求成功', modify ? '修改命名空间成功' : '创建命名空间成功');
        // }
        closeDrawer();
    };

    const instanceForm = (
        <Form
            form={form}
            layout="vertical"
            labelWidth={120}
            labelAlign={'left'}
            onSubmit={onSubmit}
        >
            <FormItem label={'命名空间'} name={'namespace'} initialData={namespace}>
                <Input disabled={true} />
            </FormItem>
            <FormItem label={'服务'} name={'service'} initialData={service}>
                <Input disabled={true} />
            </FormItem>
            <FormItem label={'主机'} name={'host'} initialData={host} rules={[
                { required: true, message: '请输入服务IP' },
                { pattern: /^(((\d{1,2}|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d{1,2}|1\d{2}|2[0-4]\d|25[0-5]))$|^([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?)$/, message: '请输入正确的IP地址或域名' },
                { max: 15, message: '长度不超过15个字符' }
            ]}>
                <Input disabled={modify} />
            </FormItem>
            <FormItem label={'端口'} name={'port'} initialData={port} rules={[
                { required: true, message: '请输入服务端口' },
                { pattern: /^[0-9]{1,5}$/, message: '请输入正确的端口号' },
            ]}>
                <InputNumber
                    disabled={modify}
                    min={1}
                    max={65535}
                    step={1}
                />
            </FormItem>
            <FormItem label={'协议'} name={'protocol'} initialData={protocol} rules={[
                { required: false, message: '请输入服务协议, TCP/UDP/HTTP/gRPC/DUBBO/...' },
                { max: 128, message: '长度不超过128个字符' }
            ]}>
                <Input />
            </FormItem>
            <FormItem label={'版本'} name={'version'} initialData={version} rules={[
                { required: false, message: '请输入服务版本' },
                { max: 128, message: '长度不超过128个字符' }
            ]}>
                <Input />
            </FormItem>
            <FormItem label={'权重'} name={'weight'} initialData={weight} rules={[
                { required: false, message: '请输入服务权重' },
                { pattern: /^[0-9]{1,5}$/, message: '请输入正确的权重' },
            ]}>
                <InputNumber
                    min={0}
                    max={100}
                    step={1}
                />
            </FormItem>
            <FormItem>
                {({ getFieldValue, setFieldsValue }) => {
                    return (
                        <FormItem name={'location'} label={'位置'}>
                            <Space>
                                <Input label={'区域'} name='region' onChange={(v) => {
                                    const newLoc = { ...location, region: v };
                                    setFieldsValue({ location: newLoc });
                                }} />
                                <Input label={'可用区'} name='zone' onChange={(v) => {
                                    const newLoc = { ...location, zone: v };
                                    setFieldsValue({ location: newLoc });
                                }} />
                                <Input label={'机房'} name='campus' onChange={(v) => {
                                    const newLoc = { ...location, campus: v };
                                    setFieldsValue({ location: newLoc });
                                }} />
                            </Space>
                        </FormItem>
                    )
                }}
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
            <FormItem style={{ marginLeft: 100, marginTop: 100 }}>
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
            <Drawer size='large' header={modify ? "编辑" : "创建"} footer={false} visible={visible} showOverlay={false} onClose={closeDrawer}>
                {instanceForm}
            </Drawer>
        </div>
    );
}

export default React.memo(InstanceEditor);