$(document).ready(function () {
    /**
     * 时间转换插件, 绑定在$中
     */
    ($.timeConvert = function (time) {
        time = new Date(+time);
        return time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' '+ (time.getHours().toString().length > 1 ? time.getHours() : ('0' + time.getHours())) +':'+(time.getMinutes().toString().length > 1 ? time.getMinutes() : ('0' + time.getMinutes()));
    })($);

    /**
     * 获取dom对象
     */
    var $quit = $("#quit");
    var $write = $("#write");
    var $newNote = $("#newNote");
    var $submit = $("#submit");
    var $cancel = $("#cancel");
    var $allNote = $("#all");
    var $myNote = $("#my");
    var $account = $("#name");

    /**
     * 声明数据为array
     * @type {Array}
     */
    var useful = [];

    /**
     * 创建分页器
     * @type {Paginate}
     */
    var paginate = new Paginate({
        id: 'noteBody',
        article: useful,
        callback: function () {
            var $article = $('article');
            $article.click(function (e) {
                if ($(e.target).hasClass('remove')) {
                    var that = this;
                    new Inform({title: 'Inform', content: 'sure to remove?'}).alert(function () {
                        $.ajax({
                            url: '/note/remove',
                            method: 'post',
                            dataType: 'json',
                            data: {
                                _id: $(that).find('input[type=hidden]').data('id')
                            },
                            success: function (data) {
                                if (data.code !== '001') {
                                    new Inform({title: 'Inform', content: data.message}).alert(function () {
                                        $('.popMsg').remove();
                                    });
                                    return ;
                                }
                                getAll(useful, paginate);
                            },
                            error: function (err) {
                                console.error(err);
                                new Inform({title: 'Inform', content: 'With some unknown error!'}).alert(function () {
                                    $('.popMsg').remove();
                                });
                            }
                        });
                    });
                } else {
                    window.location.href = '/reply?id=' + $(this).find('input[type=hidden]').data('id');
                }
            });
        }
    });

    /**
     * 获取所有数据, 并填充在页面上
     */
    getAll(useful, paginate);

    /**
     * 退出事件绑定
     */
    $quit.click(function () {
        $.ajax({url: '/user/quit', method: 'post', dataType: 'json', success: function (data) {
            window.location.reload();
        }});
    });

    /**
     * 打开新增帖子模块
     */
    $write.click(function () {
        $newNote.css('display', 'inherit');
    });

    /**
     * 提交帖子内容
     * url: '/note/new'
     */
    $submit.click(function () {
        var noteTitle = $("#noteTitle").val();
        var noteContent = $("#noteContent").val();
        var data = (noteTitle && noteContent) ? {
            noteTitle: noteTitle,
            noteContent: noteContent
        } : null;
        if (!data) {
            new Inform({title: 'Inform', content: 'title or content can\'t be null!'}).alert(function () {
                $('.popMsg').remove();
            });
            return ;
        }
        $.ajax({
            url: '/note/new',
            method: 'post',
            async: false,
            dataType: 'json',
            data: data,
            success: function (data) {
                if (data.code !== '001') {
                    new Inform({title: 'Inform', content: 'save error!'}).alert(function () {
                        $('.popMsg').remove();
                    });
                    return ;
                }
                getAll(useful, paginate);
                $("#noteTitle").val('');
                $("#noteContent").val('');
                $newNote.css('display', 'none');
            },
            error: function (err) {
                console.error(err);
                new Inform({title: 'Inform', content: 'With some unknown error!'}).alert(function () {
                    $('.popMsg').remove();
                });
            }
        });
    });

    /**
     * 关闭新增帖子模块
     */
    $cancel.click(function () {
        $newNote.css('display', 'none');
    });

    /**
     * 获取所有帖子
     */
    $allNote.click(function () {
        getAll(useful, paginate);
    });

    /**
     * 获取所有我的帖子
     */
    $myNote.click(function () {
        var article = paginate.article;
        var _useful = [];
        var num = 0;
        var i;
        paginate.page = 0;
        for (i = 0; i < article.length; i ++) {
            if (article[i].leftSpan === $account.html()) {
                _useful[num++] = article[i];
            }
        }
        _useful.sort(timeSort);
        paginate.setData(_useful);
    });
});


/**
 * 获取所有帖子
 * @param useful
 * @type Array useful
 * @param paginate
 * @type Paginate paginate
 */
function getAll(useful, paginate) {
    /**
     * 清空数组
     * @type {Array}
     */
    useful = [];
    $.ajax({
        url: '/note/all',
        method: 'post',
        dataType: 'json',
        success: function (data) {
            if (data.code !== '001') {
                new Inform({title: 'Inform', content: data.message}).alert(function () {
                    $('.popMsg').remove();
                });
                return ;
            }

            data = data.result;

            /**
             * 设置要展示的数据表相
             * id不显示, 保存在checkbox中
             * @type {Array}
             */
            for (var i = 0; i < data.length; i ++) {
                useful[i] = {
                    _id: data[i]._id,
                    title: data[i].noteTitle,
                    content: data[i].noteContent,
                    leftSpan: data[i].account,
                    rightSpan: $.timeConvert(data[i].createTime),
                    sort: data[i].createTime,
                    hidden: data[i].account !== $("#name").html() ? 'hidden' : ''
                }
            }

            /**
             * 防止mongodb抓取数据错乱, 进行数据排序
             */
            useful.sort(timeSort);

            /**
             * 设置数据
             */
            paginate.setData(useful);
        },
        error: function (err) {
            console.error(err);
            new Inform({title: 'Inform', content: 'With some unknown error!'}).alert(function () {
                $('.popMsg').remove();
            });
        }
    });
}

function timeSort(a, b) {
    return b.sort - a.sort;
}