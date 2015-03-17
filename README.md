##SUCCSS, a CSS Regression testing tool
###What is succss ?

Succss is a command line tool built to find **image-based differences** between website **updates**. Succss relies on [npm][200] and is installed globally.

Get it with the following command:

```
npm install -g succss
```


First, write a [configuration file][100] where captures are defined from **css selectors**, additional actions and/or other [options][101] can be specified. Then capture or update image references:

```
succss add configuration.js
```

When your website is updated, you will be able to compare its current state to previously added references, running:
```
succss check configuration.js
```
If at least one difference is found, you will be notified and a corresponding screenshot will be generated:

![large diff image example][12]

Among other things, Succss has features to achieve advanced comparisons with [custom user input][300], it can also [hide elements][301] before captures and compare similar selectors rendering across [multiple pages and/or viewports][302].

####Read the documentation: [succss.ifzenelse.net][7]
####Fork the documentation: [github.com/B2F/Succss-doc][-1]

***

[![large diff image example][8]][7]

####Discover a new way to test websites, automagically.

- [Installation troubleshooting][1]
- [Advanced Configuration][2]
- [Succss from the CLI][3]
- [Custom validations][4]
- [Why another CSS Regression Testing tool ?][5]
- [Fork Succss !][6]
- [Typical use cases][0]
- --[Home page][7]

####Built with:
- [CasperJS][9]
- [Imagediff][10]
- [ResembleJS][11]
- MIT Licenses
- Thanks to them !

[-1]: https://github.com/B2F/Succss-doc
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
[100]:http://succss.ifzenelse.net/configuration#pages
[101]:http://succss.ifzenelse.net/commandline
[200]:https://www.npmjs.com/
[300]:http://succss.ifzenelse.net/configuration#before
[301]:http://succss.ifzenelse.net/configuration#hide
[302]:http://succss.ifzenelse.net/commandline#compareto

