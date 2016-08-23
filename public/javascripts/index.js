$(document).ready(function () {
    ($.timeConvert = function (time) {
        time = new Date(+time);
        return time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' '+ (time.getHours().toString().length > 1 ? time.getHours() : ('0' + time.getHours())) +':'+(time.getMinutes().toString().length > 1 ? time.getMinutes() : ('0' + time.getMinutes()));
    })($);

    var $quit = $("#quit");
    var $write = $("#write");
    var $newNote = $("#newNote");

    var useful = [];

    var paginate = new Paginate({
        id: 'noteBody',
        article: useful,
        callback: function () {
            var $article = $('article');
            $article.click(function (e) {
                if ($(e.target).hasClass('remove')) {
                    $.ajax({
                        url: '/note/remove',
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
                            getAll(useful, paginate);
                        },
                        error: function (err) {
                            console.error(err);
                            new Inform({title: 'Inform', content: 'With some unknown error!'}).alert(function () {
                                $('.popMsg').remove();
                            });
                        }
                    });
                } else {
                    window.location.href = '/reply?id=' + $(this).find('input[type=hidden]').data('id');
                }
            });
        }
    });

    getAll(useful, paginate);

    $quit.click(function () {
        $.ajax({url: '/user/quit', method: 'post', dataType: 'json', success: function (data) {
            window.location.reload();
        }});
    });

    $write.click(function () {
        $newNote.css('display', 'inherit');
    });

    var $submit = $("#submit");
    var $cancel = $("#cancel");

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

    $cancel.click(function () {
        $newNote.css('display', 'none');
    });
});

function getAll(useful, paginate) {
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
    return b.sort - a.sort;
}