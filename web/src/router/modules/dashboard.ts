import { lazy } from 'react';
import { AppIcon } from 'tdesign-icons-react';
import { IRouter } from '../index';

const dashboard: IRouter[] = [
  {
    path: '/dashboard',
    meta: {
      title: '仪表盘',
      Icon: AppIcon,
    },
    Component: lazy(() => import("pages/Dashboard/Base"))
  },
];

export default dashboard;