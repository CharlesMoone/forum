$(document).ready(function () {
    ($.timeConvert = function (time) {
        time = new Date(+time);
        return time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' '+ (time.getHours().toString().length > 1 ? time.getHours() : ('0' + time.getHours())) +':'+(time.getMinutes().toString().length > 1 ? time.getMinutes() : ('0' + time.getMinutes()));
    })($);

    var $quit = $("#quit");
    var $write = $("#write");
    var $newReply = $("#newReply");
    var $noteBody = $("#noteBody");

    var id = getParameterByName('id', window.location.href);

    var useful = [];
    var paginate = new Paginate({
        id: 'noteBody',
        article: useful,
        callback: function () {
            var $article = $('article');
            $article.click(function (e) {
                if ($(e.target).hasClass('remove')) {
                    $.ajax({
                        url: '/reply/remove',
                        method: 'post',
                        dataType: 'json',
                        data: {
                            _id: $(this).find('input[type=hidden]').data('id')
                        },
                        success: function (data) {
                            if (data.code !== '001') {
                                new Inform({title: 'Inform', content: data.message}).alert(function () {
                                    $('.popMsg').remove();
                                });
                                return ;
                            }
                            getAll(id, useful, paginate);
                        },
                        error: function (err) {
                            console.error(err);
                            new Inform({title: 'Inform', content: 'With some unknown error!'}).alert(function () {
                                $('.popMsg').remove();
                            });
                        }
                    });
                }
            });
        }
    });

    getAll(id, useful, paginate);

    $quit.click(function () {
        $.ajax({url: '/user/quit', method: 'post', dataType: 'json', success: function (data) {
            window.location.reload();
        }});
    });

    $write.click(function () {
        $newReply.css('display', 'inherit');
    });

    var $submit = $("#submit");
    var $cancel = $("#cancel");

    $submit.click(function () {
        var replyContent = $("#replyContent").val();
        var data = replyContent ? {
            replyContent: replyContent
        } : null;
        if (!data) {
            new Inform({title: 'Inform', content: 'content can\'t be null!'}).alert(function () {
                $('.popMsg').remove();
            });
            return ;
        }
        data.targetId = id;
        $.ajax({
            url: '/reply/add',
            method: 'post',
            dataType: 'json',
            async: false,
            data: data,
            success: function (data) {
                if (data.code !== '001') {
                    new Inform({title: 'Inform', content: 'save error!'}).alert(function () {
                        $('.popMsg').remove();
                    });
                    return ;
                }
                getAll(id, useful, paginate);
                $("#replyContent").val('');
                $newReply.css('display', 'none');
            },
            error: function (err) {
                console.error(err);
                new Inform({title: 'Inform', content: 'With some unknown error!'}).alert(function () {
                    $('.popMsg').remove();
                });
            }
        });
    });

    $cancel.click(function () {
        $newReply.css('display', 'none');
    });
});

function getAll(id, useful, paginate) {
    useful = [];
    $.ajax({
        url: '/reply/all',
        method: 'post',
        dataType: 'json',
        data: {
            targetId: id
        },
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
                    title: data[i].account,
                    content: data[i].replyContent,
                    leftSpan: '',
                    rightSpan: $.timeConvert(data[i].createTime),
                    sort: data[i].createTime,
                    hidden: data[i].account !== $("#name").html() ? 'hidden' : ''
                }
            }
            useful.sort(timeSort);

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
    return a.sort - b.sort;
}

var getParameterByName = function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};