#!/bin/sh
succss add selftests/data-defaults.js --pages=defaults,home --captures=body,homebody,fake --viewports=default
succss check selftests/data-defaults.js
succss add selftests/data.js --pages=advanced-selectors  --rmtree
succss check selftests/data.js --pages=advanced-selectors
succss check selftests/data-diff.js --pages=advanced-selectors
