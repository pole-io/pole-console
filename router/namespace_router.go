package router

import (
	"github.com/gin-gonic/gin"
	"github.com/polarismesh/polaris-console/bootstrap"
	"github.com/polarismesh/polaris-console/handlers"
)

// NamespaceRouter 路由请求
func NamespaceRouter(r *gin.Engine, config *bootstrap.Config) {
	// 后端server路由组
	v1 := r.Group(config.WebServer.CoreURL)
	// 创建命名空间
	v1.POST("/namespaces", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 查看命名空间
	v1.GET("/namespaces", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 修改命名空间
	v1.PUT("/namespaces", handlers.ReverseProxyForServer(&config.PoleServer, config))
	// 删除命名空间
	v1.POST("/namespaces/delete", handlers.ReverseProxyForServer(&config.PoleServer, config))
}
