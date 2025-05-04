import React, { useState } from 'react';
import { FormProps } from 'react-router-dom';
import { AddIcon, DeleteIcon } from 'tdesign-icons-react';
import { Button, Form, Input, InputAdornment, Space } from 'tdesign-react';
import type { CustomValidator, InternalFormInstance } from 'tdesign-react';

const { FormItem, FormList } = Form;

interface ILabelInputProps {
    form?: InternalFormInstance;
    name: string;
    label: string;
    disabled: boolean;
}

const LabelInput: React.FC<ILabelInputProps> = (props) => {

    const labelsValidator: CustomValidator = (val) => {
        if (!props.form) {
            return { result: true, message: '' };
        }
        const labels = props.form.getFieldValue(props.name) as { key: string, value: string }[];
        const keys = labels.map(label => label.key);
        const hasDuplicate = keys.length !== new Set(keys).size;
        if (hasDuplicate) {
            return {
                result: false,
                type: 'error',
                message: '标签 key 不能重复',
            };
        }
        return { result: true, message: '' };
    };

    return (
        <div style={{ marginTop: 20 }}>
            <FormList
                name={props.name}
                rules={[{ validator: labelsValidator }]}
            >
                {(fields, { add, remove }) => (
                    <>
                        {!fields || fields.length === 0 && (
                            <>
                                <FormItem label={`${props.label}`}>
                                    {props.disabled ? null : (
                                        <Space>
                                            <AddIcon onClick={() => add()} />
                                        </Space>
                                    )}
                                </FormItem>
                            </>
                        )}
                        {fields.map(({ key, name, ...restField }, index) => (
                            <FormItem key={key} label={index === 0 ? `${props.label}` : ' '}>
                                <FormItem
                                    key={'key-' + key}
                                    {...restField}
                                    name={[name, 'key']}
                                    rules={[
                                        { required: true, message: '标签不能为空' },
                                        { max: 128, message: '长度不超过128个字符' },
                                        { validator: labelsValidator },
                                    ]}
                                >
                                    <InputAdornment prepend="key">
                                        <Input readonly={props.disabled} />
                                    </InputAdornment>
                                </FormItem>
                                <FormItem>
                                    
                                </FormItem>
                                <FormItem
                                    key={'value-' + key}
                                    {...restField}
                                    name={[name, 'value']}
                                    rules={[
                                        { required: true, message: '值不能为空' },
                                        { max: 4096, message: '长度不超过4096个字符' },
                                    ]}
                                >
                                    <InputAdornment prepend="value">
                                        <Input readonly={props.disabled} />
                                    </InputAdornment>
                                </FormItem>
                                {props.disabled ? null : (
                                    <FormItem>
                                        <Button size='small' variant='text' icon={<DeleteIcon />} onClick={() => remove(name)} disabled={props.disabled} />
                                    </FormItem>
                                )}
                                {props.disabled ? null : (
                                    <Space>
                                        <Button  size='small' variant='text' icon={<AddIcon />} onClick={() => add()} disabled={props.disabled} />
                                    </Space>
                                )}
                            </FormItem>
                        ))}
                    </>
                )}
            </FormList>
        </div>
    );
};

export default React.memo(LabelInput);
