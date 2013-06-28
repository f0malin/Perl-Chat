package PerlChat::Plugin::DB;

use strict;
use warnings;

use Dancer::Plugin;
use MongoDB;

our $_db;

register 'db' => sub {
    _connect() unless $_db;
    return $_db;
};

sub _connect {
    my $client = MongoDB::MongoClient->new(host => '127.0.0.1', port => 27017, w => 0);
    $_db = $client->get_database('perlchat');
}

register_plugin;

1;
