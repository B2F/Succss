#!/bin/sh
echo
echo "missing arguments":
succss
echo
echo "wrong action argument":
succss ads
echo
echo "missing data file":
succss add 
echo
echo "wrong data file":
succss add a
echo
echo "missing page url":
succss add selftests/data-errors.js
echo
echo "wrong capture filter":
succss add selftests/data-errors.js --pages=goodPage --captures=badCapture
echo
echo "wrong pages filter":
succss add selftests/data-errors.js --pages=badPage
echo
echo "wrong viewports filter":
succss add selftests/data-errors.js --viewports=badViewport
