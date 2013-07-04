use MongoDB;

our $_db;

sub db {
    if (!$_db) {
        my $client = MongoDB::MongoClient->new(host => '127.0.0.1', port => 27017);
        $client->connect();
        $_db = $client->get_database('perlchat');
    }
    return $_db;
}

db();

my @pids;
for (0 .. 5) {
    if ($pid = fork()) {
        push @pids, $pid;
    } else {
        while (1) {
            my @subjects = db->get_collection("subjects")->find()->all();
            print scalar(@subjects), " $$\n";
            sleep 1;
        }
        exit();
    }
}

print "in main\n";
waitpid($_, 0) for @pids;

