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
        path: 'gateway',
        Component: lazy(() => import('pages/Discovery/Gateway')),
        meta: {
          title: '网关',
        },
      },
      {
        path: 'kubernetes',
        Component: lazy(() => import('pages/Discovery/Kubernetes')),
        meta: {
          title: '容器',
        },
      }
    ],
  },
];

export default discovery;
