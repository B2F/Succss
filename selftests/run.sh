#!/bin/sh
echo
echo "add with configuration default values and  multiple filters and captures fake optionnal"
succss add selftests/data-defaults.js --pages=defaults,home --captures=body,homebody,fake --viewports=default
echo
echo "check with default values and no filters"
succss check selftests/data-defaults.js
echo
echo "single filter, custom configuration and rmtree option"
succss add selftests/data.js --pages=advanced-selectors --rmtree
echo
echo "check with a filter, imagediff (default) and resemble (optional)"
succss check selftests/data.js --pages=advanced-selectors --resemble=true
echo
echo "writing diff images"
succss check selftests/data-diff.js --pages=advanced-selectors
echo
echo "Writing small diff images with minimum width"
succss add selftests/data.js --pages=diffCanvas
succss check selftests/data-diff.js --pages=diffCanvas
