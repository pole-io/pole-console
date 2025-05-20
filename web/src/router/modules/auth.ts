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
        path: 'principals',
        Component: lazy(() => import('pages/Auth/Principal')),
        meta: {
          title: '成员管理',
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
        path: 'principals/userdetail',
        Component: lazy(() => import('pages/Auth/Principal/UserDetail')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
      {
        path: 'principals/groupdetail',
        Component: lazy(() => import('pages/Auth/Principal/GroupDetail')),
        isFullPage: false,
        meta: {
          hidden: true,
        },
      },
      {
        path: 'principals/roledetail',
        Component: lazy(() => import('pages/Auth/Principal/RoleDetail')),
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
    ],
  },
];

export default auth;
