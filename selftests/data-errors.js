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
  },
  'badUrl': {
    'url': 'sucs.ifzenelse.net',
  },
  'badSelector': {
    'url': 'https://succss.readthedocs.io/en/latest/',
    'captures': {
      'fakeElement':'',
    }
  },
}
