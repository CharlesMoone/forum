//"use strict";

var Login = function (obj) {
    this.url = obj.url || "";
    this.method = obj.method || "post";
    this.dataType = obj.dataType || "json";
    this.data = obj.data || null;
    this.callback = obj.callback || function (data) {console.log(data)};
};
Login.prototype.check = function () {
    console.log(!!this.url && !!this.data);
    return !!this.url && !!this.data;
};
Login.prototype.submit = function () {
    var _this = this;

    if (!this.check()) {
        new Inform({title: 'Inform', content: 'url && data can\'t be null!'}).alert(function () {
            $('.popMsg').remove();
        });
        return this;
    }

    try {
        $.ajax({
            url: this.url,
            method: this.method,
            dataType: this.dataType,
            data: this.data,
            success: function (data) {
                if (data.code !== '001') {
                    console.log(data.code, data.message);
                    new Inform({title: 'Inform', content: data.message}).alert(function () {
                        $('.popMsg').remove();
                    });
                    return ;
                }
                _this.callback(data);
            },
            error: function (err) {
                console.error(err);
                new Inform({title: 'Inform', content: 'submit with error! place try again!'}).alert(function () {
                    $('.popMsg').remove();
                });
            }
        });
    } catch (e) {
        console.error(e);
    }
    return this;
};

$(document).ready(function () {
    $("#register").click(function () {
        (new Login({
            url: '/user/register',
            data: {
                account: $("#account").val(),
                password: $("#password").val()
            },
            callback: function (data) {
                console.log(data);
            }
        })).submit();
    });
    $("#login").click(function () {
        var $account = $("#account").val();
        var $password = $("#password").val();
        var data;
        data = ($account && $password) ? {account: $account, password: $password} : null;
        (new Login({
            url: '/user/login',
            data: data,
            callback: function (data) {
                console.log(data);
            }
        })).submit();
    })
});