title: lessone
speaker: youxiachai
url: https://github.com/leannodejs/leannodejs.github.io
transition: cards

[slide]

# Node.js第一课

[slide]

## 演讲者信息

![](./avatar.jpg)

* github: https://github.com/youxiachai
* weibo: @游戏阿柴
* blog: http://blog.gfdsa.net

[slide]

# 大纲 {:&.flexbox.vleft}

* Node.js 项目构建与依赖管理  {:&.build}
* 用Express编写第一个Node.js程序
* 使用Mocha进行单元测试

[slide]

# Node.js 项目构建与依赖管理

[slide]

## CommonJS 规范

* Packages  {:&.build}
* Modules
* Code & Doc


[slide]

# Packages {:&.flexbox.vleft}

[slide]

# Modules(模块定义) {:&.flexbox.vleft}

[slide]

# Code & Doc(代码与文档) {:&.flexbox.vleft}

[slide]

## 神奇的NPM

* 使用NPM安装模块  {:&.build}
* NPM部署项目

[slide]

# 使用NPM安装模块   {:&.flexbox.vleft}

[slide]

# NPM部署项目   {:&.flexbox.vleft}

[slide]

## 扩展阅读

[Node.js 项目的依赖管理](http://deadhorse.me/nodejs/2014/01/18/node_dependences_version.html)

[CommonJS 官网](http://wiki.commonjs.org/wiki/CommonJS)

[slide]

# 编写第一个Node.js WEB 程序

*  学习基本NPM命令 {:&.build}
*  Express 简介
*  Express restful
*  Express 中间件系统
*  编写第一个中间件


[slide]

## 学习NPM命令

* npm install pkgs --save {:&.build}
* npm list
* npm info


[slide]

## Express 简介

* 目前最广泛使用的Web 开发容器 {:&.build}
* 使用简单
* 小而美

[slide]

# Let's Express Hello World! {:&.flexbox.vleft}

[slide]

## Express restful

* req.params <- 获取路径参数 {:&.build}
* req.query <- 获取查询语句
* req.body <- POST body值

[slide]

# Express 中间件系统 {:&.flexbox.vleft}


[slide]

## 常用Express 中间件

* cookie & session {:&.build}
* static
* render
* methodOverrider


[slide]

## 编写第一个中间件

```js
function(req, res, next) {

}
```

[slide]

# 部署Node.js项目

[slide]
# 使用Mocha进行单元测试

* 用上单测不侧漏 {:&.build}

[slide]

## 用上单测不侧漏

* BDD
* TDD

[slide]
