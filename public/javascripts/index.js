$(document).ready(function () {
    $("#quit").click(function () {
        $.ajax({url: '/user/quit', method: 'post', dataType: 'json', success: function (data) {
            window.location.reload();
        }});
    });
});