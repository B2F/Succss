#!/bin/sh
set -v

date

# add with configuration default values and  multiple filters and captures fake optionnal
succss add selftests/data-defaults.js --pages=defaults,home --captures=body,homebody,fake --viewports=default

# check with default values and no filters
succss check selftests/data-defaults.js

# single filter, custom configuration and rmtree option
succss add selftests/data.js --pages=advanced-selectors --rmtree

# check with a filter, imagediff (default) and resemble (optional)
succss check selftests/data.js --pages=advanced-selectors --resemble

# Writing small diff images with minimum width
succss add selftests/data.js --pages=diffCanvas
succss check selftests/data-diff.js --pages=diffCanvas

# with static images comparison
succss check selftests/data.js --pages=diffCanvas --checkDir=selftests/static-images

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
