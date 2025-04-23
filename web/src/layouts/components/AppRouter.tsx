import React, { Suspense, memo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout, Loading, MessagePlugin } from 'tdesign-react';
import routers, { IRouter } from 'router';
import { useAppSelector } from 'modules/store';
import { resolve } from 'utils/path';
import Page from './Page';
import Style from './AppRouter.module.less';

const { Content } = Layout;

type TRenderRoutes = (routes: IRouter[], parentPath?: string, breadcrumbs?: string[]) => React.ReactNode[];

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLogin } = useAppSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    if (!isLogin) {
      MessagePlugin.error('您当前未登录，请先登录');
    }
  }, [isLogin]);

  if (!isLogin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

/**
 * 渲染应用路由
 * @param routes
 * @param parentPath
 * @param breadcrumb
 */
const renderRoutes: TRenderRoutes = (routes, parentPath = '', breadcrumb = []) =>
  routes.map((route, index: number) => {
    const { Component, children, redirect, meta } = route;
    const currentPath = resolve(parentPath, route.path);
    let currentBreadcrumb = breadcrumb;

    if (redirect) {
      // 重定向
      return <Route key={index} path={currentPath} element={<Navigate to={redirect} replace />} />;
    }

    if (Component) {
      if (currentPath === '/login') {
        // 登录页不需要权限
        // 有路由菜单
        return (
          <Route
            key={index}
            path={currentPath}
            element={
              <Page isFullPage={route.isFullPage} breadcrumbs={currentBreadcrumb}>
                <Component />
              </Page>
            }
          />
        );
      } else {
        // 有路由菜单
        return (
          <Route
            key={index}
            path={currentPath}
            element={
              <PrivateRoute>
                <Page isFullPage={route.isFullPage} breadcrumbs={currentBreadcrumb}>
                  <Component />
                </Page>
              </PrivateRoute>
            }
          />
        );
      }
    }
    // 无路由菜单
    return children ? renderRoutes(children, currentPath, currentBreadcrumb) : null;
  });

const AppRouter = () => (
  <Content>
    <Suspense
      fallback={
        <div className={Style.loading}>
          <Loading />
        </div>
      }
    >

      <Routes>{renderRoutes(routers)}</Routes>
    </Suspense>
  </Content>
);

export default memo(AppRouter);
