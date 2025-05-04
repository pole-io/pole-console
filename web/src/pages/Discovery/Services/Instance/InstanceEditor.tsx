import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Space, Button, InputNumber, Radio, Switch, Select } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { Icon } from 'tdesign-icons-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import LabelInput from 'components/LabelInput';
import { selectInstance, updateInstances, saveInstances } from 'modules/discovery/instance';
import { HEALTH_CHECK_STRUCT, InstanceLocation } from 'services/instance';
import { get } from 'lodash';


const { FormItem } = Form;

interface IInstanceEditorProps {
    modify: boolean;
    op: string;
    closeDrawer: () => void;
    refresh: () => void;
    visible: boolean;
}

const HealthCheckTypeOptions = [{ label: '心跳上报', value: 1 }, { label: 'TCP 探测', value: 2, disabled: true }, { label: 'HTTTP 探测', value: 3, disabled: true }]

const InstanceEditor: React.FC<IInstanceEditorProps> = ({ visible, op, modify, closeDrawer, refresh }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const currentInstance = useAppSelector(selectInstance);
    const {
        id,
        namespace,
        service,
        host,
        port,
        protocol,
        version,
        weight,
        metadata,
        healthy,
        isolate,
        location,
        enable_health_check,
        health_check
    } = currentInstance;

    const instance_labels = metadata ? Object.entries(metadata).map(([key, value]) => ({ key, value })) : [];

    React.useEffect(() => {
        form.setFieldsValue({
            instance_labels: instance_labels,
            location: location,
        })
    }, [id])

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        if (e.validateResult !== true) {
            return;
        }

        const labels = form.getFieldValue('instance_labels') as { key: string, value: string }[]

        let newData = {
            id: modify ? id : '',
            namespace: form.getFieldValue('namespace') as string,
            service: form.getFieldValue('service') as string,
            host: form.getFieldValue('host') as string,
            port: form.getFieldValue('port') as number,
            protocol: form.getFieldValue('protocol') as string,
            version: form.getFieldValue('version') as string,
            weight: form.getFieldValue('weight') as number,
            healthy: form.getFieldValue('healthy') as boolean,
            isolate: form.getFieldValue('isolate') as boolean,
            location: {
                region: form.getFieldValue(['location', 'region']) as string,
                zone: form.getFieldValue(['location', 'zone']) as string,
                campus: form.getFieldValue(['location', 'campus']) as string,
            },
            health_check: {} as HEALTH_CHECK_STRUCT,
            enable_health_check: form.getFieldValue('enable_health_check') as boolean,
            metadata: labels.reduce((acc: { [key: string]: string }, label: { key: string, value: string }) => {
                acc[label.key] = label.value;
                return acc;
            }, {}),
        }
        if (newData.enable_health_check) {
            newData.health_check = {
                type: form.getFieldValue(['health_check', 'type']) as number,
                heartbeat: {
                    ttl: form.getFieldValue(['health_check', 'heartbeat', 'ttl']) as number,
                }
            };
        }

        console.log(e, newData);
        let result;
        if (modify) {
            result = await dispatch(updateInstances({ state: { ...newData } }))
        } else {
            result = await dispatch(saveInstances({ state: { ...newData } }))
        }

        if (result.meta.requestStatus !== 'fulfilled') {
            openErrNotification('请求错误', result?.payload as string);
        } else {
            openInfoNotification('请求成功', modify ? '修改服务实例成功' : '创建服务实例成功');
            closeDrawer();
            refresh();
        }
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
                <Input readonly={op === 'view'} />
            </FormItem>
            <FormItem label={'服务'} name={'service'} initialData={service}>
                <Input readonly={op === 'view'} />
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
                    readonly={op === 'view'}
                    min={1}
                    max={65535}
                    step={1}
                />
            </FormItem>
            <FormItem label={'协议'} name={'protocol'} initialData={protocol} rules={[
                { required: false, message: '请输入服务协议, TCP/UDP/HTTP/gRPC/DUBBO/...' },
                { max: 128, message: '长度不超过128个字符' }
            ]}>
                <Input readonly={op === 'view'} />
            </FormItem>
            <FormItem label={'版本'} name={'version'} initialData={version} rules={[
                { required: false, message: '请输入服务版本' },
                { max: 128, message: '长度不超过128个字符' }
            ]}>
                <Input readonly={op === 'view'} />
            </FormItem>
            <FormItem label={'权重'} name={'weight'} initialData={weight} rules={[
                { required: false, message: '请输入服务权重' },
                { pattern: /^[0-9]{1,5}$/, message: '请输入正确的权重' },
            ]}>
                <InputNumber
                    readonly={op === 'view'}
                    min={0}
                    max={100}
                    step={1}
                />
            </FormItem>
            <FormItem label="隔离状态" name="isolate" initialData={isolate}>
                <Switch disabled={op === 'view'} size="large" label={['开', '关']} />
            </FormItem>
            <FormItem label="健康状态" name="healthy" initialData={healthy}>
                <Switch disabled={op === 'view'} size="large" label={['健康', '异常']} />
            </FormItem>
            <FormItem label="健康检查" name="enable_health_check" initialData={enable_health_check}>
                <Switch disabled={op === 'view'} size="large" label={['开', '关']} />
            </FormItem>
            <FormItem shouldUpdate={(prev, next) => prev.enable_health_check !== next.enable_health_check}>
                {({ getFieldValue }) => {
                    if (getFieldValue('enable_health_check') === true) {
                        return (
                            <FormItem label="健康检查类型" key="ice" name={['health_check', 'type']} initialData={health_check?.type}>
                                <Select
                                    readonly={op === 'view'}
                                    options={HealthCheckTypeOptions}
                                />
                            </FormItem>
                        );
                    }
                    return <></>;
                }}
            </FormItem>
            <FormItem shouldUpdate={(prev, next) => {
                const enableChange = prev.enable_health_check !== next.enable_health_check;
                const typeChange = prev?.health_check?.type !== next?.health_check?.type;
                return enableChange || typeChange;
            }}>
                {({ getFieldValue }) => {
                    // 心跳健康检查
                    if (getFieldValue('enable_health_check') === true && getFieldValue(['health_check', 'type']) === 1) {
                        return (
                            <FormItem label="心跳上报 TTL" key="ttl" name={['health_check', 'heartbeat', 'ttl']} initialData={get(health_check, 'heartbeat.ttl', 5)}>
                                <InputNumber
                                    readonly={op === 'view'}
                                    min={1}
                                    max={60}
                                    step={1}
                                    suffix="秒"
                                />
                            </FormItem>
                        );
                    }
                    return <></>
                }}
            </FormItem>
            <Space>
                <FormItem name={['location', 'region']} initialData={[location.region]} label={'位置'}>
                    <Input readonly={op === 'view'} label={'区域'} placeholder='' />
                </FormItem>
                <FormItem name={['location', 'zone']} initialData={[location.zone]}>
                    <Input readonly={op === 'view'} label={'可用区'} placeholder='' />
                </FormItem>
                <FormItem name={['location', 'campus']} initialData={[location.campus]}>
                    <Input readonly={op === 'view'} label={'机房'} placeholder='' />
                </FormItem>
            </Space>
            <LabelInput form={form} label='实例标签' name='instance_labels' disabled={op === 'view'} />
            {op !== 'view' && (
                <FormItem style={{ marginTop: 100 }}>
                    <Space>
                        <Button type="submit" theme="primary">
                            提交
                        </Button>
                    </Space>
                </FormItem>
            )}
        </Form>
    )

    return (
        <div>
            <Drawer
                size='large'
                header={op === 'view' ? '详细' : modify ? "编辑" : "创建"}
                footer={false}
                visible={visible}
                showOverlay={false}
                onClose={closeDrawer}
            >
                {instanceForm}
            </Drawer>
        </div>
    );
}

export default React.memo(InstanceEditor);