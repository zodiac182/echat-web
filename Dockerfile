# 第一阶段：构建 Vue 项目
FROM docker.m.daocloud.io/node:18 as build-stage
WORKDIR /app
COPY . .
RUN npm install && npm run build

# 第二阶段：使用 Nginx 提供静态资源服务
FROM docker.m.daocloud.io/nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf.template /etc/nginx/templates/default.conf.template
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 第三阶段：启动 Nginx
ENTRYPOINT ["/entrypoint.sh"]
