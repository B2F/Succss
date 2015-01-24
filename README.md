##SUCCSS, a CSS Regression testing tool
###Turn your CSS designs into successful integrations.

Full documentation at: [succss.ifzenelse.net][7]

####Install:
```
npm install -g succss
```


####Configure:
```
// your-conf.js
Succss.pages = {
  'any webpage': {
    url:'succss.ifzenelse.net',
    directory:'./screenshots',
    captures: {
      // Key:name Value:CSS selector.
      'header':'header',
      'square1':'#red.color-square',
      'square2':'#green.color-square',
      'square3':'#blue.color-square'
    },
  },
  'another one': { 
    ... 
  }
};

Succss.viewports: {
  'classic wide': {
    width: 1366,
    height: 768
  },
  'mobile': {
    width: 320,
    height: 480
  },
  ...
}
```

####Run:
```
succss add your-conf.js
```


####Check updates against added references:
```
succss check your-conf.js
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

[0]:http://succss.ifzenelse.net/usecases
[1]:http://succss.ifzenelse.net/installation
[2]:http://succss.ifzenelse.net/configuration
[3]:http://succss.ifzenelse.net/commandline
[4]:http://succss.ifzenelse.net/customize
[5]:http://succss.ifzenelse.net/why
[6]:http://succss.ifzenelse.net/fork
[7]:http://succss.ifzenelse.net/home
