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
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/handlers"
)

// Router 路由请求
func Router(config *bootstrap.Config) {
	r := gin.Default()
	r.Use(Cors())
	// // 加载静态资源
	// r.Static("/static", config.WebServer.WebPath+"static")

	// // 加载Swagger UI
	// // r.Static("/apidocs", "./swagger-ui")

	// // 加载界面
	// r.LoadHTMLGlob(config.WebServer.WebPath + "index.html")
	r.GET("/", handlers.PolarisPage(config))

	// 监控请求路由组
	mv1 := r.Group(config.WebServer.MonitorURL)
	mv1.GET("/query_range", handlers.ReverseProxyForMonitorServer(&config.MonitorServer))
	mv1.GET("/label/:resource/values", handlers.ReverseProxyForMonitorServer(&config.MonitorServer))

	// 管理接口
	AdminRouter(r, config)
	// 命名空间请求
	NamespaceRouter(r, config)
	// 鉴权请求
	AuthRouter(r, config)
	// 服务请求
	DiscoveryV1Router(r, config)
	// 配置请求
	ConfigRouter(r, config)
	// 指标监控接口
	MetricsRouter(r, config)

	address := fmt.Sprintf("%v:%v", config.WebServer.ListenIP, config.WebServer.ListenPort)
	if err := r.Run(address); err != nil {
		fmt.Printf("run http server: %+v\n", err)
	}
}

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Header("Access-Control-Allow-Origin", "*") // 可将将 * 替换为指定的域名
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
			c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
			c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
			c.Header("Access-Control-Allow-Credentials", "true")
		}
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}
		c.Next()
	}
}
