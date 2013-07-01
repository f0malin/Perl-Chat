#!/bin/bash

plackup -s Starman -D -l :5000 -E production --access-log=access.log bin/app.pl
