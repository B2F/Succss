/**
 * @file
 * This file is used to selftest configuration error messages.
 * 
 * @see selftests/run-errors.sh
 * 
 */

Succss.pages = {
  'goodPage': {
    'url': 'https://succss.readthedocs.io/en/latest/',
  }
}

Succss.viewports = {
  'brokenViewportMissingProp': {
    'height':1000
  },
  'brokenViewportWrongValueType': {
    'height':'1980',
    'width':1200,
  }
}
