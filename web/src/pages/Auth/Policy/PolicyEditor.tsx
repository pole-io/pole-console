import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Space, Button, InputNumber, Radio, Switch, Select } from "tdesign-react";
import type { FormProps } from 'tdesign-react';
import { Icon } from 'tdesign-icons-react';

import { useAppDispatch, useAppSelector } from 'modules/store';
import { openErrNotification, openInfoNotification } from 'utils/notifition';
import LabelInput from 'components/LabelInput';

const { FormItem } = Form;

interface IPolicyEditorProps {
    modify: boolean;
    op: string;
    closeDrawer: () => void;
    visible: boolean;
}

const PolicyEditor: React.FC<IPolicyEditorProps> = ({ visible, op, modify, closeDrawer }) => {
    return (
        <>
        </>
    )
}

export default React.memo(PolicyEditor);