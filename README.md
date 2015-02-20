##SUCCSS, a CSS Regression testing tool
###Turn your CSS designs into successful integrations.

Full documentation at: [succss.ifzenelse.net][7]

![small diff image example][12]

####Install:
```
npm install -g succss
```

####Configure:
```
// data.js
Succss.pages = {
  'home': {
    url:'succss.ifzenelse.net/home',
    directory:'screenshots/dir',
    // captures: { 'name' : 'CSS selector' }
    captures: {
      // leave an empty value if selector == name
      'header':'',
      'dynamic-text':'body #header-text > #static-line + span',
      ...
    },
  },
  'another-page': {
    ...
  }
};

Succss.viewports = {
  // './screenshots/dir/home--header--1366x768.png' file
  // './screenshots/dir/home--dynamic-text--1366x768.png' file
  'default': {
    width: 1366,
    height: 768
  },
  // './screenshots/dir/home--header--640x480.png' file
  // './screenshots/dir/home--dynamic-text--640x480.png' file
  'mobile-landscape': {
    width: 640,
    height: 480
  },
  ...
}
```

####Run:
```
succss add data.js
```


####Check updates against added references:
```
succss check data.js
```


####Do you need more infos ?

- [Installation troubleshooting][1]
- [Advanced Configuration][2]
- [Succss from the CLI][3]
- [Custom validations][4]
- [Why another CSS Regression Testing tool ?][5]
- [Fork Succss !][6]
- [Typical use cases][0]
- --[Home page][7]

![large diff image example][8]

####Built with:
- [CasperJS][9]
- [Imagediff][10]
- [ResembleJS][11]
- MIT Licenses
Thanks to them !

[0]:http://succss.ifzenelse.net/usecases
[1]:http://succss.ifzenelse.net/installation
[2]:http://succss.ifzenelse.net/configuration
[3]:http://succss.ifzenelse.net/commandline
[4]:http://succss.ifzenelse.net/customize
[5]:http://succss.ifzenelse.net/why
[6]:http://succss.ifzenelse.net/fork
[7]:http://succss.ifzenelse.net/home
[8]:https://raw.githubusercontent.com/B2F/Succss-doc/master/img/screenshots/large-diff.jpeg
[9]:http://casperjs.org/
[10]:http://humblesoftware.github.io/js-imagediff/
[11]:http://huddle.github.io/Resemble.js/
[12]:https://raw.githubusercontent.com/B2F/Succss-doc/master/img/screenshots/small-diff.jpeg
