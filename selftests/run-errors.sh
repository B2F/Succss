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
echo
echo "bad viewport values"
succss add selftests/data-errors.js --pages=goodPage --viewports=brokenViewportWrongValueType
succss add selftests/data-errors.js --pages=goodPage --viewports=brokenViewportMissingProp
echo
echo "missing base screenshot"
succss check selftests/data-errors.js --pages=goodPage --viewports=goodViewport
echo
echo "bad url value"
succss add selftests/data-errors.js --pages=badUrl --viewports=goodViewport
echo
echo "bad selector"
succss add selftests/data-errors.js --pages=badSelector --viewports=goodViewport
echo
echo 'compare pages and viewports'
succss check selftests/data-compare.js
echo
echo 'escaped char in filename'
succss add selftests/data-errors.js --pages='bad pagename' --viewports=goodViewport
