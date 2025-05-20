import { lazy } from 'react';
import { ViewModuleIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const discovery: IRouter[] = [
  {
    path: '/discovery',
    meta: {
      title: '注册发现',
      Icon: ViewModuleIcon,
    },
    children: [
      {
        path: 'service',
        Component: lazy(() => import('pages/Discovery/Services')),
        meta: {
          title: '服务',
        },
      },
      {
        path: 'kubernetes',
        Component: lazy(() => import('pages/Discovery/Kubernetes')),
        meta: {
          title: '容器',
        },
      },
      // 这里的路由是为了在服务列表中点击实例跳转到实例详情页
      {
        path: 'service/instance',
        Component: lazy(() => import('pages/Discovery/Services/Instance')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
    ],
  },
];

export default discovery;
