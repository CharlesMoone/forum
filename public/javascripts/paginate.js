var Paginate = function (obj) {
    /**
     * 要插入数据的目标位置id
     * @type {jQuery}
     */
    this.id = obj.id;

    /**
     * 数据
     * @type {Array}
     */
    this.article = obj.article || [];

    /**
     * 每页长度
     * @type {number}
     */
    this.listLength = obj.listLength || 6;

    /**
     * 是否具有搜索功能
     * @type {boolean}
     */
    this.search = obj.search || true;

    /**
     * 是否有callback函数
     * 这里的回调函数是在所有数据填充完毕之后调用的
     * @type {Function}
     */
    this.callback = obj.callback || function () {};

    /**
     * 当前页码
     * @type {number}
     */
    this.page = 0;

    /**
     * 包含前一页、后一页、页号的ul
     * @type {jQuery}
     */
    this.pagination = $('.pagination');

    /**
     * 前一页
     * @type {jQuery}
     */
    this.pageBefore = $('.pageBefore');

    /**
     * 后一页
     * @type {jQuery}
     */
    this.pageNext = $('.pageNext');

    /**
     * 跳转目标的input输入框
     * @type {jQuery}
     */
    this.pageTarget = $('.pageTarget');

    /**
     * 跳转按钮
     * @type {jQuery}
     */
    this.pageGo = $('.pageGo');

    /**
     * 总页码长度
     * @type {number}
     */
    this.maxPage = Math.ceil(this.article.length/this.listLength);

    /**
     * 保存页码号
     * @type {null}
     */
    this.pageLi = null;

    /**
     * 缓存this指针
     * @type {Paginate}
     */
    var that = this;

    /**
     * 轻量级享元结构
     * @type {{get}}
     */
    this.flyWeight = (function () {
        var created = [];
        function create() {
            var article = document.createElement("ARTICLE");
            document.getElementById(that.id).appendChild(article);
            created.push(article);
            return article;
        }
        return {
            get: function () {
                if (created.length < that.listLength) {
                    return create();
                } else {
                    var temp = created.shift();
                    created.push(temp);
                    return temp;
                }
            }
        }
    })();

    /**
     * 调用初始化函数
     */
    this.init();
};
Paginate.prototype = {
    /**
     * 设置数据,更改数据
     * @param _article
     */
    setArticle: function (_article) {
        this.article = _article;
        this.maxPage = Math.ceil(this.article.length/this.listLength);
    },

    /**
     * 初始化表格结构和进行事件绑定
     */
    init: function () {
        this.pageChange();
        this.eventBind();
        this.dataChange();
        this.callback();
        this.search && this.searchData();
    },

    /**
     * 设置操作
     * @returns {string}
     */
    setOperation: function () {

    },

    /**
     * 设置表格数据
     * @param _article
     */
    setData: function (_article) {
        this.setArticle(_article);
        this.clearPageLi();
        this.pageChange();
        this.dataChange();
    },

    /**
     * 清除页码
     */
    clearPageLi: function () {
        this.pageLi && this.pageLi.remove();
    },

    /**
     * 修改数据
     */
    dataChange: function () {
        var pageLi = this.pageLi,
            page = this.page,
            article = this.article,
            num,
            temp,
            i,
            j;
        /**
         * 给当前页码放上active
         */
        for (i = 0; i < pageLi.length; i ++) {
            if ($(pageLi[i]).hasClass('active'))
                $(pageLi[i]).removeClass('active');
            if ($(pageLi[i]).html() == page+1) {
                $(pageLi[i]).addClass('active');
            }
        }
        for (i = 0; i < this.listLength; i++) {
            num = i + page*6;
            if (article[num]) {
                temp = [];
                for (j in article[num]) {
                    switch (j) {
                        case '_id': temp.push("<input type='hidden' data-id='" + article[num][j] + "' />"); break;
                        case 'title': temp.push("<h4><span>" + article[num][j] + "</span>" + "<p class='remove " + article[num].hidden + "'></p>" + "</h4>");break;
                        case 'content': temp.push("<p>" + article[num][j] + "</p>");break;
                        case 'leftSpan': temp.push("<span>" + article[num][j] + "</span>");break;
                        case 'rightSpan': temp.push("<span>" +article[num][j] + "</span>");break;
                    }
                }
                this.flyWeight.get().innerHTML = temp.join('');
            } else {
                this.flyWeight.get().innerHTML = null;
            }
        }
        // this.callback();
    },

    /**
     * 修改页码
     */
    pageChange: function () {
        var i;
        for (i = 0; i < (this.maxPage>5?5:this.maxPage); i ++) {
            i == this.page ? this.pageNext.before("<li class='pageNumber active'>" + (i+1) + "</li>") : this.pageNext.before("<li class='pageNumber'>" + (i+1) + "</li>");
        }
        this.pageLi = $('.pageNumber');
    },

    /**
     * 事件绑定
     */
    eventBind: function () {
        var that = this, number;
        this.pagination.click(function (e) {
            var _target = e.target;
            if (_target.className == 'pageBefore') {
                if (that.page == 0) {
                    return ;
                }
                that.page --;
            } else if (_target.className == 'pageNext') {
                if (that.page == that.maxPage-1) {
                    return ;
                }
                that.page ++;
            } else if (_target.className.indexOf('pageNumber') > -1) {
                that.page = e.target.innerHTML-1;
            }
            if (that.maxPage > 5) {
                that.pageNumberChange();
            }
            that.dataChange();
        });
        this.pageGo.click(function () {
            number = that.pageTarget.val();
            that.pageTarget.val(null);
            if (!/\d+/.test(number) || number > that.maxPage || number <= 0) {
                return ;
            }
            that.page = number - 1;
            if (that.maxPage > 5) {
                that.pageNumberChange();
            }
            that.dataChange();
        });
    },

    searchData: function () {
        var useful = this.article;
        var search = $("#search");
        var $this = this;
        search.bind("input propertychange", function () {
            $this.page = 0;
            if ($(this).val() == "") {
                $this.setData(useful);
                return ;
            }
            var _useful = [], _num = 0;
            for (var i = 0; i < useful.length; i ++) {
                for (var j in useful[i]) {
                    if (j == "id") {
                        continue ;
                    }
                    if (useful[i][j].indexOf($(this).val()) > -1) {
                        _useful[_num] = useful[i];
                        _num ++;
                        break ;
                    }
                }
            }
            $this.setData(_useful);
        });
    },

    /**
     * 修改页码数字
     */
    pageNumberChange: function () {
        var temp = this.page + 1,
            maxPage = this.maxPage,
            pageLi = this.pageLi,
            i;
        if (temp > 2 && temp < maxPage - 1) {
            temp = temp - 2;
        } else if (temp == 2) {
            temp = temp - 1;
        } else if (temp == maxPage - 1) {
            temp = temp - 3;
        } else if (temp == maxPage) {
            temp = temp - 4;
        }
        for (i = 0; i < 5; i ++) {
            pageLi[i].innerHTML = temp + i;
        }
    }
};