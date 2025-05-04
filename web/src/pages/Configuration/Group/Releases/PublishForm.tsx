import CodeDiffEditor from 'components/CodeDiffEditor';
import React, { useState } from 'react';
import { Button, CustomValidator, Drawer, Form, FormProps, Input, Radio, RadioGroup, Space, Steps, Switch } from 'tdesign-react';

import { openErrNotification, openInfoNotification } from 'utils/notifition';
import { useAppDispatch, useAppSelector } from 'modules/store';
import { describeFileReleaseVersions, describeOneFileRelease } from 'services/config_release';
import { describeOneConfigFile } from 'services/config_files';
import { publishConfigFiles } from 'modules/configuration/release';
import { release } from 'os';
import MatchInput from 'components/MatchInput';
import ClientLabelInput from 'components/ClientLabelInput';
import { MatcheLabel } from 'services/types';

const { StepItem } = Steps;
const { FormItem } = Form;

export interface IPublishFormProps {
    namespace: string;
    group: string;
    filename: string;
    visible: boolean;
    close: () => void;
}

const PublishForm: React.FC<IPublishFormProps> = (props) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    // 合并编辑相关状态
    const [publishState, setPublishState] = useState<{
        curVal: string;
        nextVal: string;
        step: number;
        versions: string[];
    }>({ curVal: '', nextVal: '', step: 1, versions: [] });

    React.useEffect(() => {
        handleFetch();
    }, [props.namespace, props.group, props.filename]);

    const versionValidator: CustomValidator = (val) => {
        const releaseName = form.getFieldValue("name") as string;
        const exist = publishState.versions.includes(releaseName);
        if (exist) {
            return {
                result: false,
                type: 'warning',
                message: `当前配置版本已存在，如果继续发布则会重新发布 ${releaseName} 版本对应的内容`,
            };
        }
        return { result: true, message: '' };
    };

    const onSubmit: FormProps['onSubmit'] = async (e) => {
        console.log(e);
        if (e.validateResult !== true) {
            return;
        }
        const releaseType = form.getFieldValue("releaseType") as string;
        // 提交发布
        const pubData = {
            namespace: props.namespace,
            group: props.group,
            fileName: props.filename,
            name: form.getFieldValue("name") as string,
            releaseDescription: form.getFieldValue("comment") as string,
            releaseType: releaseType === 'normal' ? 'normal' as const : 'beta' as const,
            betaLabels: form.getFieldValue("betaLabels") as MatcheLabel[],
        }

        const ret = await dispatch(publishConfigFiles({ state: pubData }));
        if (ret.meta.requestStatus === 'fulfilled') {
            setPublishState({ ...publishState, curVal: '', nextVal: '', step: 1 });
            openInfoNotification('发布配置成功', '发布配置成功');
            props.close();
        } else {
            openErrNotification('发布配置失败', ret.payload as string);
            return;
        }
    }

    // 提交发布, 获取当前配置的最新数据以及当前处于使用中的配置发布信息
    const handleFetch = async () => {
        try {
            const versions = await describeFileReleaseVersions({
                namespace: props.namespace,
                group: props.group,
                file_name: props.filename,
            });
            setPublishState((prev) => ({
                ...prev,
                versions: versions.configFileReleases ? versions.configFileReleases.map((item) => item.name as string) : [],
            }));
        } catch (err) {
            openErrNotification('获取配置发布版本记录失败', err as string);
            return;
        }

        try {
            const next = await describeOneConfigFile({
                namespace: props.namespace,
                group: props.group,
                name: props.filename,
            });
            setPublishState((prev) => ({ ...prev, nextVal: next.configFile.content || '' }));
        } catch (err) {
            openErrNotification('获取配置文件信息失败', err as string);
            return;
        }

        try {
            const cur = await describeOneFileRelease({
                namespace: props.namespace,
                group: props.group,
                file_name: props.filename,
            });
            setPublishState((prev) => ({ ...prev, curVal: cur.configFileRelease ? cur.configFileRelease.content : '' }));
        } catch (err) {
            openErrNotification('获取最近一次发布信息失败', err as string);
            return;
        }
    }

    return (
        <>
            <Drawer
                header={'配置发布'}
                size='960px'
                style={{ width: '100%' }}
                visible={props.visible}
                placement="right"
                onClose={() => {
                    props.close();
                }}
                footer={
                    publishState.step === 1 ? (
                        <>
                            <Space>
                                <Button theme="default" onClick={() => {
                                    setPublishState(prev => ({
                                        ...prev,
                                        step: 2
                                    }));
                                }}>
                                    下一步
                                </Button>
                            </Space>
                        </>
                    ) : publishState.step === 2 ? (
                        <>
                            <Space>
                                <Button theme="default" onClick={() => {
                                    setPublishState(prev => ({
                                        ...prev,
                                        step: 1
                                    }));
                                }}>
                                    上一步
                                </Button>
                            </Space>
                        </>
                    ) : null
                }
            >
                <Steps current={publishState.step}>
                    <StepItem value={1} title="版本对比" />
                    <StepItem value={2} title="发布信息" />
                </Steps>
                <Form
                    form={form}
                    labelWidth={100}
                    style={{ marginTop: 20 }}
                    onSubmit={onSubmit}
                >
                    {publishState.step === 1 && (
                        <CodeDiffEditor
                            key={`${props.namespace}-${props.group}-${props.filename}-${publishState.curVal.length}-${publishState.nextVal.length}`}
                            namespace={props.namespace}
                            group={props.group}
                            filename={props.filename}
                            curValue={publishState.curVal}
                            nextValue={publishState.nextVal}
                        />
                    )}
                    {publishState.step === 2 && (
                        <>
                            <FormItem
                                label="版本名称"
                                name="name"
                                rules={[
                                    { required: true, message: '版本名称不能为空' },
                                    { max: 64, message: '长度不超过64个字符' },
                                    { validator: versionValidator },
                                ]}
                            >
                                <Input />
                            </FormItem>
                            <FormItem
                                label="版本描述"
                                name="comment"
                                rules={[
                                    { max: 255, message: '长度不超过255个字符' }
                                ]}
                            >
                                <Input />
                            </FormItem>
                            <FormItem label='发布类型' name='releaseType' initialData={'normal'}>
                                <RadioGroup>
                                    <Radio value="normal">全量发布</Radio>
                                    <Radio value="beta">灰度发布</Radio>
                                </RadioGroup>
                            </FormItem>
                            <FormItem shouldUpdate={(prev, next) => {
                                const enableChange = prev.releaseType !== next.releaseType;
                                return enableChange;
                            }}>
                                {({ getFieldValue }) => {
                                    if (getFieldValue('releaseType') === 'beta') {
                                        return (
                                            <ClientLabelInput form={form} label='客户端标签' name='betaLabels' disabled={false} />
                                        );
                                    }
                                    return <></>
                                }}
                            </FormItem>
                            <FormItem>
                                <Button theme='primary' type='submit' style={{ marginTop: 20 }}>
                                    提交
                                </Button>
                            </FormItem>
                        </>
                    )}
                </Form>
            </Drawer>
        </>
    )
}

export default React.memo(PublishForm);