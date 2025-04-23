import { set } from 'lodash';
import React, { useState } from 'react';
import { AddIcon, DeleteIcon } from 'tdesign-icons-react';
import { Form, Input, Space, SubmitContext } from 'tdesign-react';

interface ILabelInputProps {
    readonly?: boolean;
    labels: Record<string, string>;
    onChange?: (key: string, value: string, del: boolean) => void;
}

const LabelInput: React.FC<ILabelInputProps> = (props) => {
    const [keyValuePairs, setKeyValuePairs] = useState(
        props.labels ? Object.entries(props.labels).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]
    );

    const handleKeyChange = (index: number, key: string, value: string) => {
        const newKeyValuePairs = [...keyValuePairs];
        newKeyValuePairs[index].key = key;
        newKeyValuePairs[index].value = value;
        setKeyValuePairs(newKeyValuePairs);
        if (props.onChange) {
            props.onChange(key, newKeyValuePairs[index].value, false);
        }
    };

    const handleValueChange = (index: number, key: string, value: string) => {
        const newKeyValuePairs = [...keyValuePairs];
        newKeyValuePairs[index].key = key;
        newKeyValuePairs[index].value = value;
        setKeyValuePairs(newKeyValuePairs);
        if (props.onChange) {
            props.onChange(newKeyValuePairs[index].key, value, false);
        }
    };

    const handleAddPair = () => {
        setKeyValuePairs([...keyValuePairs, { key: '', value: '' }]);
    };

    const handleRemovePair = (index: number) => {
        const newKeyValuePairs = [...keyValuePairs];
        if (props.onChange) {
            props.onChange(newKeyValuePairs[index].key, newKeyValuePairs[index].value, true);
        }
        newKeyValuePairs.splice(index, 1);
        if (newKeyValuePairs.length === 0) {
            newKeyValuePairs.push({ key: '', value: '' });
        }
        setKeyValuePairs(newKeyValuePairs);
    };

    return (
        <>
            {keyValuePairs.map((pair: { key: string; value: string }, index: number) => (
                <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                    <Input
                        placeholder="键"
                        value={pair.key}
                        onChange={(e) => handleKeyChange(index, e, pair.value)}
                        style={{ flex: 1, marginRight: '10px' }}
                        disabled={props.readonly}
                        maxlength={128}
                    />
                    <Input
                        placeholder="值"
                        value={pair.value}
                        onChange={(e) => handleValueChange(index, pair.key, e)}
                        style={{ flex: 1, marginRight: '10px' }}
                        disabled={props.readonly}
                        maxlength={4096}
                    />
                    {!props.readonly && (
                        <Space>
                            <AddIcon onClick={() => handleAddPair()} />
                            <DeleteIcon onClick={() => handleRemovePair(index)} />
                        </Space>
                    )}
                </div>
            ))}
        </>
    );
};

export default React.memo(LabelInput);
