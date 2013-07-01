
var getting_message = false;
var laststamp = 0;

var roomid;
var esubject;
{
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
        sendMsg();
        e.preventDefault();
    }
});

$("#content").focus();

setInterval(getMsgs, 500);

function getMsgs() {
    getting_message = true;

    $.ajax({
        url: "/api/getmessages/"+roomid+"/"+esubject+"/"+laststamp,
        dataType: "json",
        success: function(data) {
            var i;
            for (i=0;i<data.length;i++) {
                var date = new Date();
                date.setTime(data[i].sendtime * 1000);
                if (data[i].nick == nick) {
                    $("#chat-window").append("<div class='alert alert-warning'>"+date.getHours() + ":" + date.getMinutes()+" <strong>我：</strong>" + escapeHtml(data[i].msg) + "</div>");
                } else {
                    $("#chat-window").append("<div class='alert alert-info'>"+date.getHours() + ":" + date.getMinutes()+" <strong>" + escapeHtml(data[i].nick) + "：</strong>" + escapeHtml(data[i].msg) + "</div>");
                }
                laststamp = data[i].sendtime;
            }
            var chatwindow = document.getElementById("chat-window");
            chatwindow.scrollTop = chatwindow.scrollHeight;
        },
        complete: function() {
            getSubject();
        }
    });
}

function getSubject() {
    $.ajax({
        url: "/api/getsubjects/"+roomid,
        dataType: "json",
        success: function(data) {
            var subject_window = $("#subject-window");
            var content = "<a href='/room/"+roomid+"/'>全部</a><br/>";
            var i;
            for (i=0;i<data.length;i++) {
                content += '<a href="/room/'+roomid+'/'+escape(data[i].title)+'">' + escapeHtml(data[i].title) + "</a><br/>";
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
        msg = "#"+subject+"# " + msg;
    }
    if (roomid) {
        $.post("/api/sendmsg", {roomid:roomid, msg:msg}, function() {
            
        });
        content.val("");
    }
}

function escapeHtml(str) {
    return str.replace("<", "&lt;").replace(">", "&gt;");
}
