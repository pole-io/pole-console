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
        meta: { title: '路由规则' },
      },
      {
        path: 'ratelimit',
        Component: lazy(() => import('pages/Governance/RateLimit')),
        meta: {
          title: '限流规则',
        },
      },
      {
        path: 'circuitbreaker',
        Component: lazy(() => import('pages/Governance/CircuitBreaker')),
        meta: { title: '熔断规则' },
      }
    ],
  },
];

export default result;
