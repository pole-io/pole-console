import React, { lazy } from 'react';
import { BrowserRouterProps } from 'react-router-dom';
import dashboard from './modules/dashboard'
import namespace from './modules/namespace';
import discovery from './modules/discovery';
import configuration from './modules/configuration';
import governance from './modules/governance';
import metrics from './modules/metrics';
import auth from './modules/auth';

export interface IRouter {
  path: string;
  redirect?: string;
  Component?: React.FC<BrowserRouterProps> | (() => any);
  /**
   * 当前路由是否全屏显示
   */
  isFullPage?: boolean;
  /**
   * meta未赋值 路由不显示到菜单中
   */
  meta?: {
    title?: string;
    Icon?: React.FC;
    /**
     * 侧边栏隐藏该路由
     */
    hidden?: boolean;
    /**
     * 单层路由
     */
    single?: boolean;
  };
  children?: IRouter[];
}

const routes: IRouter[] = [
  {
    path: '/login',
    Component: lazy(() => import('pages/Login')),
    isFullPage: true,
    meta: {
      hidden: true,
    },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
];

const allRoutes = [...routes, ...dashboard, ...namespace, ...discovery, ...configuration, ...governance, ...metrics, ...auth];

export default allRoutes;
