import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Space, Button, InputNumber, Radio, Switch, Select } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { Icon } from 'tdesign-icons-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import LabelInput from 'components/LabelInput';
import { saveUsers, updateUsers } from 'modules/user/users';
import { selectUser } from 'modules/user/users';


const { FormItem } = Form;

interface IUserEditorProps {
    modify: boolean;
    op: string;
    closeDrawer: () => void;
    visible: boolean;
}

const UserEditor: React.FC<IUserEditorProps> = ({ visible, op, modify, closeDrawer }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectUser);
    const {
        id,
        name,
        token_enable,
        password,
        comment,
        source,
        email,
        mobile,
        metadata,
    } = currentUser;

    const user_labels = metadata ? Object.entries(metadata).map(([key, value]) => ({ key, value })) : [];

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        console.log(e);
        if (e.validateResult !== true) {
            return;
        }

        const labels = form.getFieldValue('user_labels') as { key: string, value: string }[]

        const newData = {
            id: id,
            name: form.getFieldValue('name') as string,
            password: form.getFieldValue('password') as string || '',
            token_enable: form.getFieldValue('token_enable') as boolean,
            comment: form.getFieldValue('comment') as string,
            source: form.getFieldValue('source') as string,
            email: form.getFieldValue('email') as string,
            mobile: form.getFieldValue('mobile') as string,
            metadata: labels.reduce((acc: { [key: string]: string }, label: { key: string, value: string }) => {
                acc[label.key] = label.value;
                return acc;
            }, {}),
        }

        let result;
        if (modify) {
            result = await dispatch(updateUsers({ state: { ...newData } }))
        } else {
            result = await dispatch(saveUsers({ state: { ...newData } }))
        }

        if (result.meta.requestStatus !== 'fulfilled') {
            openErrNotification('请求错误', result?.payload as string);
        } else {
            openInfoNotification('请求成功', modify ? '修改用户信息成功' : '创建用户成功');
            closeDrawer();
        }
    };

    const userForm = (
        <Form
            form={form}
            layout="vertical"
            labelWidth={120}
            labelAlign={'left'}
            onSubmit={onSubmit}
        >
            <FormItem label={'用户名'} name={'name'} initialData={name}
                rules={[
                    { required: true, message: '用户名不能为空' },
                    { max: 64, message: '长度不超过64个字符' },
                ]}
            >
                <Input disabled={op === 'edit'} />
            </FormItem>
            {op === 'create' && (
                <FormItem label={'密码'} name={'password'} initialData={password}
                    rules={[
                        { required: true, message: '密码不能为空' },
                        { min: 6, message: '长度不小于6个字符' },
                        { max: 255, message: '长度不超过255个字符' }
                    ]}>
                    <Input type='password' />
                </FormItem>
            )}
            <FormItem label={'备注'} name={'comment'} initialData={comment}
                rules={[
                    { max: 255, message: '长度不超过255个字符' }
                ]}>
                <Input />
            </FormItem>
            <FormItem label={'来源'} name={'source'} initialData={source}
                rules={[
                    { max: 255, message: '长度不超过255个字符' }
                ]}>
                <Input />
            </FormItem>
            <FormItem
                label={'邮箱'}
                name={'email'}
                initialData={email}
                rules={[
                    { email: true, message: '请输入有效的邮箱地址' }
                ]}>
                <Input readonly={op === 'view'} />
            </FormItem>
            <FormItem
                label={'手机号'}
                name={'mobile'}
                initialData={mobile}
                rules={
                    [
                        { telnumber: true, message: '请输入有效的手机号' }
                    ]}
            >
                <Input readonly={op === 'view'} />
            </FormItem>
            <FormItem label="Token 启用状态" name="token_enable" initialData={op === 'create' ? true : token_enable}>
                <Switch disabled={op === 'view'} size="large" label={['启用', '禁用']} />
            </FormItem>
            <LabelInput form={form} label='用户标签' name='user_labels' disabled={op === 'view'} />
            {op !== 'view' && (
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
            )}
        </Form>
    )

    return (
        <div>
            <Drawer size='large' header={op === 'view' ? '详细' : modify ? "编辑" : "创建"} footer={false} visible={visible} showOverlay={false} onClose={closeDrawer}>
                {userForm}
            </Drawer>
        </div>
    );
}

export default React.memo(UserEditor);