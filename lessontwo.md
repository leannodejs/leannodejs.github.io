title: lesson two
speaker: youxiachai
url: https://github.com/leannodejs/leannodejs.github.io
transition: cards

[slide]

# Node.js 微信公众平台开发

[slide]

## 演讲者信息

![](./avatar.jpg)

* github: https://github.com/youxiachai
* weibo: @游戏阿柴
* blog: http://blog.gfdsa.net

[slide]

# 大纲 {:&.flexbox.vleft}

* 搜包的策略  {:&.build}
* 数据库操作
* 微信公众平台业务处理

[slide]

# 搜包的策略 {:&.flexbox.vleft}

* 去哪找 {:&.build}
* 怎么找
* 靠谱的

[slide]

# 数据库操作 {:&.flexbox.vleft}

* 建立数据库连接 {:&.build}
* 使用Sequelize简化数据库操作

[slide]

## 建立数据库连接

```js
var mysql      = require('mysql');
//1 建立数据库连接
var connection = mysql.createConnection({
    host     : 'localhost',
    database : 'mysql',
    user     : 'root',
    password :  null
});

connection.connect();

//进行查询
connection.query('SELECT * from user', function(err, rows) {
    if (err) throw err;
    console.log('The solution is: ', rows[0]);
});

//关闭连接
connection.end();
```

[slide]

# Sequelize Node.js 上的多数据库ORM {:&.flexbox.vleft}

* 多数据库支持: MySQL, MariaDB, SQLite and PostgreSQL {:&.build}
* 上手简单

[slide]

## Sequelize 数据库配置

```js
//index.js
var Sequelize = require('sequelize');

var mysql = new Sequelize('msyql',  'root',  null, {
        host: '127.0.0.1',
        port:  3306,
        dialect: 'mysql',
        logging: true,
        omitNull: true,
        maxConcurrentQueries: 100,
        define: {
        timestamps: false,
            freezeTableName: true,
            charset: 'utf8',
            collate: 'utf8_general_ci'
    },
        pool: { maxConnections: 100, maxIdleTime: 300}
    });

```

[slide]

## Sequelize 模型定义

```js
//user.js
module.exports = function (sequelize, DataType) {
    return sequelize.define('user', {
        id: {type: DataType.INTEGER, primaryKey: true, autoIncrement: true},
        name : {type: DataType.STRING, comment:'用户名',  validate: {
            notNull : true
        }},
        password: {type : DataType.STRING, comment:'密码'},
        email : {type : DataType.STRING, defaultValue : '', validate:{
            isEmail:true
        }}
    });
}
```

```js
//index.js
exports.User = mysql.import(__dirname + '/user');
```

[slide]

## Sequelize 的查询

```js
var DBModel = require('/index')

DBModel
.User
.findall()
.done(function (err ,result){
//查询结果

})
```


[slide]

# 微信公众平台服务号业务处理 {:&.flexbox.vleft}

* 用户消息处理  {:&.build}
* 菜单处理


[slide]

## Wechat 模块用户消息处理

[slide]

## Wechat 菜单处理

[slide]

## FAQ

[slide]