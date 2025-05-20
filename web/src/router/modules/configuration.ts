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
        path: 'kubernetes',
        Component: lazy(() => import('pages/Configuration/Kubernetes')),
        meta: { title: '容器' },
      },
      // 这里的路由是为了在服务列表中点击实例跳转到实例详情页
      {
        path: 'group/files',
        Component: lazy(() => import('pages/Configuration/Group/Files')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
    ],
  },
];

export default configuration;
