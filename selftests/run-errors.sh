#!/bin/sh
# Atm, this script output must be visually processed to check for errors

set -v

# missing arguments:
succss

# wrong action argument":
succss ads

# missing data file":
succss add 

# wrong data file":
succss add a

# missing page url":
succss add selftests/data-errors.js

# wrong capture filter":
succss add selftests/data-errors.js --pages=goodPage --captures=badCapture

# wrong pages filter":
succss add selftests/data-errors.js --pages=badPage

# wrong viewports filter":
succss add selftests/data-errors.js --viewports=badViewport

# bad viewport values"
succss add selftests/data-errors.js --pages=goodPage --viewports=brokenViewportWrongValueType
succss add selftests/data-errors.js --pages=goodPage --viewports=brokenViewportMissingProp

# missing base screenshot"
succss check selftests/data-errors.js --pages=goodPage --viewports=goodViewport

# bad url value"
succss add selftests/data-errors.js --pages=badUrl --viewports=goodViewport

# bad selector"
succss add selftests/data-errors.js --pages=badSelector --viewports=goodViewport

# compare pages and viewports'
succss check selftests/data-compare.js

# escaped char in filename'
succss add selftests/data-errors.js --pages='bad pagename' --viewports=goodViewport
