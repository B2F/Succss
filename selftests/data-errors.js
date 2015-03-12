/**
 * @file
 * This file is used to selftest configuration error messages.
 * 
 * @see selftests/run-errors.sh
 * 
 */

Succss.pages = {
  'emptyPage': {},
  'goodPage': {
    'url': 'succss.ifzenelse.net',
  },
  'badUrl': {
    'url': 'sucs.ifzenelse.net',
  },
  'badSelector': {
    'url': 'succss.ifzenelse.net',
    'captures': {
      'fakeElement':'',
    }
  },
}

Succss.options = {
  exitOnError:false
}

Succss.viewports = {
  'brokenViewportMissingProp': {
    'height':1000
  },
  'brokenViewportWrongValueType': {
    'height':'1980',
    'width':1200,
  },
  'goodViewport': {
    'height':800,
    'width':600
  }
}
