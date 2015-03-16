#!/bin/sh
# Atm, this script output must be visually processed to check for errors

set -v

# missing arguments:
succss

# wrong action argument:
succss ads

# missing data file:
succss add 

# wrong data file:
succss add a

# missing page url:
succss add selftests/data-errors/missing-url.js

# wrong capture filter:
succss add selftests/data-errors.js --pages=goodPage --captures=badCapture

# wrong pages filter:
succss add selftests/data-errors.js --pages=badPage

# wrong viewports filter:
succss add selftests/data-errors.js --viewports=badViewport

# bad viewport values
succss add selftests/data-errors/bad-viewports.js --viewports=brokenViewportWrongValueType
succss add selftests/data-errors/bad-viewports.js --viewports=brokenViewportMissingProp

# missing base screenshot
succss check selftests/data-errors.js --pages=goodPage

# bad url value
succss add selftests/data-errors.js --pages=badUrl

# bad selector
succss add selftests/data-errors.js --pages=badSelector

# using wrong compareTo* arguments
succss check selftests/data-errors.js --pages=goodPage --compareToPage=badPage --compareToViewport=badViewport
