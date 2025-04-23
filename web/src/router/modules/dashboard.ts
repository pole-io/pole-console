import { lazy } from 'react';
import { UserCircleIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const dashboard: IRouter[] = [
  {
    path: '/dashboard',
    meta: {
      title: '个人中心',
      Icon: UserCircleIcon,
    },
    Component: lazy(() => import("pages/Dashboard/Base"))
  },
];

export default dashboard;