/**
 * Tencent is pleased to support the open source community by making Polaris available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

package router

import (
	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/handlers"
)

// ConfigRouter 路由请求
func ConfigRouter(r *gin.Engine, config *bootstrap.Config) {
	// 配置中心
	configV1 := r.Group(config.WebServer.ConfigURL)
	// 配置文件组
	// 批量创建配置文件组
	configV1.POST("groups", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 批量更新配置文件组
	configV1.PUT("groups", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 批量删除配置文件组
	configV1.POST("groups/delete", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 查询配置文件组列表
	configV1.GET("groups", handlers.ReverseProxyForServer(&config.PoleServer, config))

	// 配置文件
	// 批量创建配置文件
	configV1.POST("files", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 批量更新配置文件
	configV1.PUT("files", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 批量删除配置文件
	configV1.POST("files/delete", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 查询配置文件详细
	configV1.GET("files/detail", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 查询配置文件列表
	configV1.GET("files/search", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 配置导入导出
	configV1.POST("files/export", handlers.ReverseProxyForServer(&config.PoleServer, config))
	configV1.POST("files/import", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 配置加密算法
	configV1.GET("files/encrypt/algorithms", handlers.ReverseProxyForServer(&config.PoleServer, config))

	// 发布配置文件
	configV1.POST("files/release", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 查询单个配置发布信息
	configV1.GET("files/release", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 查询配置发布列表
	configV1.GET("files/releases", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 配置发布回滚
	configV1.PUT("files/releases/rollback", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 删除配置发布记录信息
	configV1.POST("files/releases/delete", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 查询配置发布的版本列表
	configV1.GET("files/release/versions", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 取消配置灰度发布
	configV1.POST("files/releases/stopbeta", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 配置文件发布历史
	configV1.GET("files/releasehistory", handlers.ReverseProxyForServer(&config.PoleServer, config))
	//配置文件模板
	configV1.GET("configfiletemplates", handlers.ReverseProxyForServer(&config.PoleServer, config))
}
