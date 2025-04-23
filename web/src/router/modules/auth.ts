import { lazy } from 'react';
import { UserCircleIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const auth: IRouter[] = [
  {
    path: '/auth',
    meta: {
      title: '权限控制',
      Icon: UserCircleIcon,
    },
    children: [
      {
        path: 'users',
        Component: lazy(() => import('pages/Auth/User')),
        meta: {
          title: '用户管理',
        },
      },
      {
        path: 'roles',
        Component: lazy(() => import('pages/Auth/Role')),
        meta: {
          title: '角色管理',
        },
      },
      {
        path: 'policies',
        Component: lazy(() => import('pages/Auth/Policy')),
        meta: {
          title: '策略管理',
        },
      },
    ],
  },
];

export default auth;
