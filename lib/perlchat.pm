package perlchat;

use Dancer ':syntax';
use PerlChat::Plugin::DB;
use Digest::SHA1 qw(sha1_hex);

our $VERSION = '0.1';

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
            redirect "/";
        } else {
            template "login" => { errmsg => "密码错误", nick => $nick };
        }
    } else {
        db->get_collection("users")->insert({nick => $nick, pass => password($pass)});
        session 'nick' => $nick;
        redirect "/";
    }
};

sub password {
    return sha1_hex('sklsfhi@#%#@$FHLK' . $_[0]);
}

true;
