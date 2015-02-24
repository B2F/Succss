#!/bin/sh

# Log latest test:
./selftests/run.sh 2>&1 | tee ./selftests/run.log
# Trim shell colors:
sed -ri 's/\x1B\[[^m]*m//g' ./selftests/run.log
if grep -rni 'Tests failed' ./selftests/run.log; then
  echo 'selftests suite failed, see above lines from ./selftests/run.log'
else
  echo 'selftests suite is successful'
fi