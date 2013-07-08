var getting_message = false;
var laststamp = 0;

var roomid;
var esubject; {
    var matches = window.location.href.match(/\/room\/([0-9a-f]+)\/(.*)/);
    roomid = matches[1];
    esubject = matches[2];
    if (!esubject) {
        esubject = "all";
    }
}

$("#btn_send").on("click", function() {
    sendMsg();
});

$("#content").on("keypress", function(e) {
    if (e.which && e.which == 13) {
        if (e.ctrlKey) {
            e.ctrlKey = false;
        } else {
            sendMsg();
            e.preventDefault();
        }
    }
});

$("#content").focus();

setInterval(getMsgs, 1000);

var lastScroll = 0;

function getMsgs() {
    getting_message = true;

    $.ajax({
        url: "/api/getmessages/" + roomid + "/" + esubject + "/" + laststamp,
        dataType: "json",
        success: function(data) {
            var i;
            var chatwindow = document.getElementById("chat-window");

            for (i = 0; i < data.length; i++) {
                var date = new Date();
                date.setTime(data[i].sendtime * 1000);
                if (data[i].nick == nick) {
                    $("#chat-window").append("<div class='alert alert-warning span6 pull-right' style='text-align:right'><em>" + date.getHours() + ":" + (date.getMinutes() >= 10 ? "" : "0") + date.getMinutes() + "</em> <strong>我</strong><br/>" + do_filters(data[i].msg) + "</div>");
                } else {
                    $("#chat-window").append("<div class='alert alert-info span6'><strong>" + escapeHtml(data[i].nick) + "</strong> <em>" + date.getHours() + ":" + (date.getMinutes() >= 10 ? "" : "0") + date.getMinutes() + "</em><br/>" + do_filters(data[i].msg) + "</div>");
                }
                laststamp = data[i].sendtime;
            }
            if (chatwindow.scrollTop >= lastScroll) {
                chatwindow.scrollTop = chatwindow.scrollHeight;
                lastScroll = chatwindow.scrollTop;
            }


        },
        complete: function() {
            getSubject();
        }
    });
}

function getSubject() {
    $.ajax({
        url: "/api/getsubjects/" + roomid,
        dataType: "json",
        success: function(data) {
            var subject_window = $("#subject-window");
            var content = "<a href='/room/" + roomid + "/'>全部</a><br/>";
            var i;
            for (i = 0; i < data.length; i++) {
                content += '<a href="/room/' + roomid + '/' + escape(data[i].title) + '">' + escapeHtml(data[i].title) + "</a><br/>";
            }
            subject_window.html(content);
        },
        complete: function() {
            getting_message = false;
        }
    });
}

function sendMsg() {
    var content = $("#content");
    var msg = content.val();
    var subject = unescape(esubject);
    if (subject && subject != "all") {
        msg = "#" + subject + "# " + msg;
    }
    if (roomid) {
        $.post("/api/sendmsg", {
            roomid: roomid,
            msg: msg
        }, function() {

        });
        content.val("");
    }
}

function escapeHtml(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>").replace("&nbsp;", " ");
}

var matchPIC = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@#:;\+\-])+(gif|jpg|png))", "ig");
var matchURL = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@&#:;\+\-])+)", "ig");

function do_filters(str) {
    str = escapeHtml(str);
    find_at(str);
    if (matchPIC.test(str)) {
        str = (str.replace(matchPIC, "<img src=\"$1\" hint=\"$1\"></img>"));
    } else {
        str = (str.replace(matchURL, "<a target=\"_blank\" href=\"$1\">$1</a>"));
    }
    return str;
}

function find_at(str) {
    var users = str.match(/\@\S+/ig);
    if (users) {
        for (i = 0; i < users.length; i++) {
            if (users[i] == '@' + nick) {
                 var timerArr = $.blinkTitle.show();
                 setInterval(function() {        //此处是过一定时间后自动消失
                                        $.blinkTitle.clear(timerArr);
                                     }, 15000)
                }
        }
    }
}

(function($) {
         $.extend({
             /**
              * 调用方法： var timerArr = $.blinkTitle.show();
              *            $.blinkTitle.clear(timerArr);
              */
             blinkTitle : {
                 show : function() {    //有新消息时在title处闪烁提示
                    var step=0
                     _title = 'Perl Chat';
                     var timer = setInterval(function() {
                         step++;
                         if (step==3) {step=1};
                         if (step==1) { document.title= '@' + nick};
                         if (step==2) { document.title= '你妈妈叫你回家吃饭！'};
                     }, 1000);
                     return [timer, _title];
                 },

                 /**
                  * @param timerArr[0], timer标记
                 * @param timerArr[1], 初始的title文本内容
                 */
                 clear : function(timerArr) {    //去除闪烁提示
                     if(timerArr) {
                         clearInterval(timerArr[0]);
                         document.title = timerArr[1];
                     };
                 }
             }
         });
     })(jQuery);