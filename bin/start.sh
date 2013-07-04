#!/bin/bash

plackup -s Starman -D -l :5000 -E production --access-log=access.log --max-requests=10000 --pid=my.pid bin/app.pl
