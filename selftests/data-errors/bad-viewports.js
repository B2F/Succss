/**
 * @file
 * This file is used to selftest configuration error messages.
 * 
 * @see selftests/run-errors.sh
 * 
 */

Succss.pages = {
  'goodPage': {
    'url': 'succss.ifzenelse.net',
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
