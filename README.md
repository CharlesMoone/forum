# 简单论坛的实现 *v1.0.0*
基于nodeJs+express+mongodb

####写在前面
>此作品仅用于个人测试, 严禁私自商用

####兼容性测试
* chrome 52.0.2743.116 (64-bit) - 兼容
* Safari 9.1.2 - 兼容
* Firefox 45.0.1 - 兼容
* 因为我是用Mac开发的, 所以IE Edge的测试不方便进行
* 理论支持: IE9+

##程序设计
>本程序基于nodeJs+express, 创建的方法借助于webstorm, 作品包括设计配色配图在内均为原创。

####一、web设计

设计的颜色均取自于知道创宇的 *logo* , 因为 *logo* 的颜色为蓝色, 所以整个页面的主体颜色也应用蓝色。

html方面的布局采用了flex布局, flex是css3新出的一个布局, 该布局可以更好的规划页面的结构。


    body > top          > content
         > header       > img + article
         > content      > nav
                        > section
         > pagination   > ul
         > footer       > content
         
    对body使用display: flex; 设置纵向排列flex-flow: column nowrap;
    对子模块看需求, 例如content就需要设置display: inherit; flex-flow: row-reverse nowrap;
    
页面分为3个, 分别是首页index, 登录/注册页register, 查看回复页replys。index与replys比较相似, 采取了相同的设计。右侧nav为两者的区分, 子页面replys可以实现返回和回复的功能, 主页面index可以实现新增帖子、查看全部(开发中)和查看我的帖子(开发中)的功能。

登录/注册页面中, 全局对回车事件进行了监听, 在两个input中回车是可以直接执行登录。登录没什么好说的, 登录会对账号密码是否为空判断, 登录成功后会存储session信息。没有设置失效时间, 所以只要保持浏览器的开启, 一直存在。注册则多了一步对账号对判定, 设置了相同账号无法注册。

####二、javascript设计

####分页 *paginate.js*

这次的 *paginate.js* 是阉割版, 只保留了flyweight的享元模式和基本的数据显示功能, 阉割掉了修改、删除、批量删除、前端查询的功能。

用法参照如下:

    var paginate = new Paginate({
            id: 'noteBody',
            article: useful,
            callback: function () {}
        });
        
其中 *useful* 为数组数据。第一次会执行init进行配置, 之后如果有修改 *useful* 则需要用

    paginate.setData(useful);
    
考虑到mongodb得到的数据不一定会按顺序, 我们在setData之前还需要

    useful.sort(timeSort);
    
    funtion timeSort(a, b) {
        return a.sort - b.sort;
    }

详细功能可以见[http://temp.zmade.cn]

    账号tjgj, 密码guo123456
    !!!请不要对账号内数据进行操作
    
####弹窗 *message.js*

弹窗是我早些时候开发的一个插件, 调用方式很简单

包含
    
    <link rel="stylesheet" href="/stylesheets/message.css" />
    <script src="/javascripts/message.js"></script>
    
调用方法为

    new Inform({title: '', content: ''})
        .alert(function () {});
        
title为弹窗的左上角名称(理解为弹窗类型), content为弹窗的提示文字, 支持html语句。obj.alert(callback)可以使弹窗显示, callback是弹窗在点了确定后的回调函数, 例如remove掉该弹窗, 或者其他。

####用户登录/注册 *user.js*

用户登录注册我写了一个 *class user* 作用是做数据检查和ajax提交, 调用方法如下:

    new Login({}).submit();

####其他js

其他的js多为获取数据, ajax提交数据, 调用上述两种方法。不做过多说明

####三、后台设计

后台的设计主要分为db模块和controller模块。

####db模块

分为user、note、reply, 主要功能是封装 *schema* 以及开放出新增、查询、删除的功能。核心工作是

    function initData(data, db) {
        var query = {};
        for (var key in data) {
            if (db.tree[key]) {
                query[key] = data[key];
            }
        }
        return query;
    }
    
该代码的作用为初始化基础数据, 防止有多余数据的侵入。

其他的就不多说了, 就是基本的数据库查询操作。

####controller模块

同样分为userController、noteController、replyController, 主要功能是接受请求, 并做数据整理, 例如从req.session的中获取account和userId, 打包交给db处理, db处理完并返回给controller做进一步处理, 例如res.send()给前台信息。

####四、数据库设计

总计有3张数据表, Note、Reply、User, Note存储的为在index页面中所有的用户发布的所有帖子, Reply存储的为所有用户发送的回复, 无论是回复哪个帖子, 都会存储在Reply中, 所以在删除Note的时候, 同时会进行对Reply中数据的删除, 而在Reply中与Note相关联的是targetId, 由于我对mongodb的操作不是了解很深, 所以对其外键关联不太清楚, 但是mongodb的效率很高, 所以我就直接建立了一个新的数据表存储所有的Reply。

####五、完善与改进方案

本作品仍需要进一步完善, 包括代码需要重构, 在完成前端replys.js和index.js都是按照功能去实现, 没有进行详细的构想与整合, 所以代码会显得有些冗杂。

后台的数据处理有重复的地方也没有进行好好的整合, 也需要重构。