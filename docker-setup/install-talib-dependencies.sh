#!/bin/bash
wget https://s3.ap-south-1.amazonaws.com/quantinsti-web/ta-lib-0.4.0-src.tar.gz 
tar xvfz ta-lib-0.4.0-src.tar.gz
cd ta-lib
./configure --prefix=/usr
make
make install