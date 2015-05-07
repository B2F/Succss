#!/bin/sh
set -v

date

# add with configuration default values, multiple filters and captures fake optionnal
succss add selftests/data-defaults.js --pages=defaults,home --captures=body,homebody,fake --viewports=default

# check with default values and no filters
succss check selftests/data-defaults.js

# single filter, custom configuration
succss add selftests/data.js --pages=advanced-selectors

# Writing small diff images with minimum width
# Also, overrides default 'add' and 'check' options from the configuration file
succss add selftests/data.js
succss check selftests/data-diff.js

# with static images comparison
succss check selftests/data.js --checkDir=selftests/static-images

# phantom base, phantom matches, slimer diff
succss add selftests/data-diff.js --pages=installation
succss check selftests/data-diff.js --pages=installation --diff=false --good
succss check selftests/data-diff.js --pages=installation --engine=slimerjs

# slimer base, phantom diff, slimer matches
succss add selftests/data-diff.js --pages=installation --engine=slimerjs
succss check selftests/data-diff.js --pages=installation
succss check selftests/data-diff.js --pages=installation --engine=slimerjs --diff=false --good --verbose

# custom capture property
succss add selftests/data-web-examples.js --viewports=classic-wide --pages=capture-prop
succss check selftests/data-web-examples.js --viewports=classic-wide --pages=capture-prop

# callback 'before' after a window.scrollTo, special slimerjs '=,' fix
succss add selftests/data-web-examples.js --viewports=classic-wide --pages=,special --captures=body --engine=slimerjs
succss check selftests/data-web-examples.js --viewports=classic-wide --pages=,special --captures=body --engine=slimerjs --verbose

# page and viewports comparisons
succss check selftests/data-compare.js

# hidden capture property:
succss add selftests/data.js --pages=hiddenElements --viewports=wide
succss check selftests/data-diff.js --pages=hiddenElements --viewports=wide

# imagediff lightness, stack, diffRGB & canvas setting
succss check selftests/data-diff.js --lightness=255
