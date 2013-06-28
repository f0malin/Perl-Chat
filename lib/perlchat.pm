package perlchat;

use Dancer ':syntax';
use Digest::SHA1 qw(sha1_hex);
use MongoDB;

our $VERSION = '0.1';

our $_db;

sub password {
    return sha1_hex('sklsfhi@#%#@$FHLK' . $_[0]);
}

sub db {
    if (!$_db) {
        my $client = MongoDB::MongoClient->new(host => '127.0.0.1', port => 27017);
        $_db = $client->get_database('perlchat');
    }
    return $_db;
}

db->get_collection("users")->ensure_index({nick => 1}, {unique => true});
db->get_collection("subjects")->ensure_index({title => 1}, {unique => true});
db->get_collection("rooms")->ensure_index({name => 1}, {unique => true});

eval {
    db->get_collection("rooms")->insert({name => 'PerlChina', desc => 'Perl中国社区', notify => 'PerlChina大会将于8月10日在北京举行'});
};

get '/' => sub {
    if (!session('nick')) {
        redirect "/login";
        return;
    }
    "ok";
};

get '/login' => sub {
    template 'login';
};

post '/login' => sub {
    my $nick = param("nick");
    my $pass = param("pass");
    my $user = db->get_collection("users")->find_one({nick => $nick});
    if ($user) {
        if (password($pass) eq $user->{'pass'}) {
            session 'nick' => $nick;
            session 'uid' => $user->{_id};
            redirect "/room";
        } else {
            template "login" => { errmsg => "密码错误", nick => $nick };
        }
    } else {
        my $uid = db->get_collection("users")->insert({nick => $nick, pass => password($pass)});
        session 'nick' => $nick;
        session 'uid' => $uid;
        redirect "/room";
    }
};

get "/room" => sub {
    my $room = db->get_collection("rooms")->find_one();
    if ($room) {
        redirect "/room/" . $room->{'_id'}->value();
    } else {
        "error";
    }
};

get "/room/:roomid" => sub {
    my $room = db->get_collection("rooms")->find_one({_id => MongoDB::OID->new(value => param("roomid"))});
    if ($room) {
        template 'room' => { room => $room, nick => session("nick") };
    } else {
        return "error";
    }
};

post "/api/sendmsg" => sub {
    my $uid = session("uid");
    my $nick = session("nick");
    if ($uid && $nick) {
        my $subject;
        if (param("msg") =~ /#(.*?)#/) {
            $subject = $1;
            db->get_collection("messages")->insert({subject => $subject, uid => $uid, nick => $nick, msg => param("msg"), roomid => MongoDB::OID->new(value => param("roomid")), sendtime => time});
            db->get_collection("subjects")->update(
                {
                    title => $subject,
                    roomid => MongoDB::OID->new(value => param("roomid"))
                },
                {
                    '$inc' => { 'msg_count' => 1},
                    '$set' => {uptime => time}
                },
                {upsert => 1}
            );
        } else {
            db->get_collection("messages")->insert({uid => $uid, nick => $nick, msg => param("msg"), roomid => MongoDB::OID->new(value => param("roomid")), sendtime => time});
        }
    } else {
        "error";
    }
};

get "/api/getmessages/:roomid/:subject/:laststamp" => sub {
    my $laststamp = param("laststamp");
    debug "laststamp " . $laststamp;
    my @messages = db->get_collection("messages")->find({
        roomid => MongoDB::OID->new(value => param("roomid")),
        'sendtime' => {'$gt' => 0 + $laststamp}
    })->sort({sendtime => 1})->all();
    debug (@messages);
    return \@messages;
};


true;
