#!/bin/sh

# 替换环境变量 -> 生成实际的 nginx 配置
envsubst '${SERVER_HOST} ${SERVER_PORT}' </etc/nginx/templates/default.conf.template >/etc/nginx/conf.d/default.conf

# 启动 Nginx（前台）
nginx -g 'daemon off;'
