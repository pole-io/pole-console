import { lazy } from 'react';
import { QueueIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const configuration: IRouter[] = [
  {
    path: '/configuration',
    meta: {
      title: '配置管理',
      Icon: QueueIcon,
    },
    children: [
      {
        path: 'group',
        Component: lazy(() => import('pages/Configuration/Group')),
        meta: {
          title: '分组',
        },
      },
      {
        path: 'template',
        Component: lazy(() => import('pages/Configuration/Template')),
        meta: { title: '模板' },
      },
      {
        path: 'kubernetes',
        Component: lazy(() => import('pages/Configuration/Kubernetes')),
        meta: { title: '容器' },
      },
    ],
  },
];

export default configuration;
