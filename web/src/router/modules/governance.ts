import { lazy } from 'react';
import { LayersIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const result: IRouter[] = [
  {
    path: '/governance',
    meta: {
      title: '流量治理',
      Icon: LayersIcon,
    },
    children: [
      {
        path: 'router',
        Component: lazy(() => import('pages/Governance/Router')),
        meta: { title: '路由转发' },
      },
      {
        path: 'ratelimit',
        Component: lazy(() => import('pages/Governance/RateLimit')),
        meta: {
          title: '访问限流',
        },
      },
      {
        path: 'circuitbreaker',
        Component: lazy(() => import('pages/Governance/CircuitBreaker')),
        meta: { title: '熔断探测' },
      },
      {
        path: 'security',
        Component: lazy(() => import('pages/Governance/Security')),
        meta: { title: '服务鉴权' },
      }
    ],
  },
];

export default result;
