
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
        url: "/api/getmessages/"+roomid+"/"+esubject+"/"+laststamp,
        dataType: "json",
        success: function(data) {
            var i;
            var chatwindow = document.getElementById("chat-window");
                
            for (i=0;i<data.length;i++) {
                var date = new Date();
                date.setTime(data[i].sendtime * 1000);
                if (data[i].nick == nick) {
                    $("#chat-window").append("<div class='alert alert-warning span6 pull-right' style='text-align:right'><em>"+date.getHours() + ":" +  (date.getMinutes() >=10 ?"":"0") + date.getMinutes()+"</em> <strong>我</strong><br/>" + do_filters(data[i].msg) + "</div>");
                } else {
                    $("#chat-window").append("<div class='alert alert-info span6'><strong>" + escapeHtml(data[i].nick) + "</strong> <em>"+date.getHours() + ":" + (date.getMinutes() >=10 ?"":"0") + date.getMinutes()+"</em><br/>" + do_filters(data[i].msg) + "</div>");
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
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
}

var matchPIC = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@#:;\+\-])+(gif|jpg|png))", "ig");
var matchURL = new RegExp("((?:http|https|ftp|mms|rtsp)://(&(?=amp;)|[A-Za-z0-9\./=\?%_~@&#:;\+\-])+)","ig");

function do_filters(str) {
    str = escapeHtml(str);
    var str2 ="";
    str2 =str.replace("&nbsp;"," ");
    
    if(matchPIC.test(str)){
        str2 = (str2.replace(matchPIC, "<img src=\"$1\" hint=\"$1\"></img>"));
    }else{
        str2 = (str2.replace(matchURL, "<a target=\"_blank\" href=\"$1\">$1</a>"));
    }
    return str2;
}
