# 这是基于websocket的在线聊天室demo

其中Tomcat-Websocket项目是基于tomcat服务器的java版服务端实现，Nodejs-Websocket项目是基于Nodejs的js版服务端实现。两个项目的服务端逻辑基本一致，客户端代码可以通用。此外，前者所有功能都基于websocket实现，后者采用webrtc技术实现语音视频的通讯，相比之下技术更成熟，性能更好。

## 主要功能
浏览器端文本、视频、语音的即时通讯。

## 文档
参考简书：[https://www.jianshu.com/nb/4071127](https://www.jianshu.com/nb/4071127)

## Docker支持
已添加docker-compose.yml和Dockerfile，可以很方便的在docker下运行demo。

1. 获取项目
```bash
git clone git://github.com/anyesu/websocket
```

2. 使用 `docker-compose` 启动容器
```bash
cd websocket/websocket-samples && docker-compose up
```

3. 访问 `yourip:8080` 或者 `yourip:3000`

## 维护说明
本目录下demo后续不再维护，仅作为博客配套的例子。tomcat版已重构为maven项目websocket-chat，以后针对这个项目进行维护。
