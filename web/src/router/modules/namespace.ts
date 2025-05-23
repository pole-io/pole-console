import { lazy } from 'react';
import { ComponentSpaceIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const namespace: IRouter[] = [
  {
    path: '/namespace',
    meta: {
      title: '命名空间',
      Icon: ComponentSpaceIcon,
    },
    Component: lazy(() => import('pages/Namespace'))
  },
];

export default namespace;
