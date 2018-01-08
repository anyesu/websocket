FROM node:alpine
MAINTAINER anyesu

# 拷贝项目
COPY . /usr/anyesu/node

RUN  echo -e "https://mirror.tuna.tsinghua.edu.cn/alpine/v3.4/main\n\
https://mirror.tuna.tsinghua.edu.cn/alpine/v3.4/community" > /etc/apk/repositories && \
    # 设置时区
    apk --update add ca-certificates && \
    apk add tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    # 安装ws模块
    npm install ws@1.1.0 express -g

# 设置环境变量
ENV NODE_PATH /usr/local/lib/node_modules

# 启动命令（前台程序）
CMD ["node", "/usr/anyesu/node/server.js"]