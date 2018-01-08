FROM alpine:latest
MAINTAINER anyesu

# 拷贝项目
COPY . /usr/anyesu/tmp/Tomcat-Websocket

RUN echo -e "https://mirror.tuna.tsinghua.edu.cn/alpine/v3.4/main\n\
https://mirror.tuna.tsinghua.edu.cn/alpine/v3.4/community" > /etc/apk/repositories && \
    # 设置时区
    apk --update add ca-certificates && \
    apk add tzdata && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    # 安装jdk
    apk add openjdk7 && \
    # 安装wget
    apk add wget && \
    tmp=/usr/anyesu/tmp && \
    cd /usr/anyesu && \
    # 下载tomcat
    tomcatVer=7.0.82 && \
    wget http://mirror.bit.edu.cn/apache/tomcat/tomcat-7/v$tomcatVer/bin/apache-tomcat-$tomcatVer.tar.gz && \
    tar -zxvf apache-tomcat-$tomcatVer.tar.gz && \
    mv apache-tomcat-$tomcatVer tomcat && \
    # 清空webapps下自带项目
    rm -r tomcat/webapps/* && \
    rm apache-tomcat-$tomcatVer.tar.gz && \
    cd $tmp && \
    # 编译源码
    proj=$tmp/Tomcat-Websocket && \
    src=$proj/src && \
    tomcatBase=/usr/anyesu/tomcat && \
    classpath="$tomcatBase/lib/servlet-api.jar:$tomcatBase/lib/websocket-api.jar:$proj/WebRoot/WEB-INF/lib/fastjson-1.1.41.jar" && \
    output=$proj/WebRoot/WEB-INF/classes && \
    mkdir -p $output && \
    /usr/lib/jvm/java-1.7-openjdk/bin/javac -sourcepath $src -classpath $classpath -d $output `find $src -name "*.java"` && \
    # 拷贝到tomcat
    mv $proj/WebRoot $tomcatBase/webapps/ROOT && \
    rm -rf $tmp && \
    apk del wget && \
    # 清除apk缓存
    rm -rf /var/cache/apk/* && \
    # 添加普通用户
    addgroup -S group_docker && adduser -S -G group_docker user_docker && \
    # 修改目录所有者
    chown user_docker:group_docker -R /usr/anyesu

# 设置环境变量
ENV JAVA_HOME /usr/lib/jvm/java-1.7-openjdk
ENV CATALINA_HOME /usr/anyesu/tomcat
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/bin

# 暴露端口
EXPOSE 8080

# 启动命令（前台程序）
CMD ["catalina.sh", "run"]