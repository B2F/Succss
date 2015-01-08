#!/bin/sh
succss add selftests/data-defaults.js --pages=defaults,home --captures=body,fakeSelector --viewports=default
succss check selftests/data-defaults.js
succss add selftests/data.js --rmtree
succss check selftests/data.js
succss check selftests/data-diff.js
