import { lazy } from 'react';
import { CheckCircleIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const metrics: IRouter[] = [
  {
    path: '/metrics',
    meta: {
      title: '平台观测',
      Icon: CheckCircleIcon,
    },
    children: [
      {
        path: 'event',
        Component: lazy(() => import('pages/Metrics/Success')),
        meta: {
          title: '事件记录',
        },
      },
      {
        path: 'operation',
        Component: lazy(() => import('pages/Metrics/Fail')),
        meta: {
          title: '操作审计',
        },
      },
      {
        path: 'control',
        Component: lazy(() => import('pages/Metrics/NetworkError')),
        meta: {
          title: '监控指标',
        },
      },
      {
        path: 'microservice',
        Component: lazy(() => import('pages/Metrics/NetworkError')),
        meta: {
          title: '服务监控',
        },
      }
    ],
  },
];

export default metrics;
