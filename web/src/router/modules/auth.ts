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
      // 这里的路由是为了在服务列表中点击实例跳转到实例详情页
      {
        path: 'users/detail',
        Component: lazy(() => import('pages/Auth/User/UserDetail')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
      {
        path: 'users/groupdetail',
        Component: lazy(() => import('pages/Auth/User/GroupDetail')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
      {
        path: 'policies/detail',
        Component: lazy(() => import('pages/Auth/Policy/PolicyDetail')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
      {
        path: 'roles/detail',
        Component: lazy(() => import('pages/Auth/Role/RoleDetail')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
    ],
  },
];

export default auth;
