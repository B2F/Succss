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

####Read the documentation: [succss.readthedocs.io][7]
####Fork the documentation: [github.com/B2F/Succss-doc][-1]

***

[![large diff image example][8]][7]

####Discover a new way to test websites, automagically.

- [Use cases][0]
- [Configuration][2]
- [CLI options][3]
- [Custom validations][4]
- [Why another CSS Regression Testing tool ?][5]
- [Fork Succss !][6]
- [Installation troubleshooting][1]
- --[Home page][7]

####Built with:
- [CasperJS][9]
- [Imagediff][10]
- [ResembleJS][11]
- MIT Licenses
- Thanks to them !

[-1]: https://github.com/B2F/Succss-doc
[0]:https://succss.readthedocs.io/en/latest/usecases/
[1]:https://succss.readthedocs.io/en/latest/installation/
[2]:https://succss.readthedocs.io/en/latest/configuration/
[3]:https://succss.readthedocs.io/en/latest/commandline/
[4]:https://succss.readthedocs.io/en/latest/customize/
[5]:https://succss.readthedocs.io/en/latest/why/
[6]:https://succss.readthedocs.io/en/latest/fork/
[7]:https://succss.readthedocs.io/en/latest/
[8]:https://raw.githubusercontent.com/B2F/Succss-doc/master/img/screenshots/large-diff.jpeg
[9]:http://casperjs.org/
[10]:http://humblesoftware.github.io/js-imagediff/
[11]:http://huddle.github.io/Resemble.js/
[12]:https://raw.githubusercontent.com/B2F/Succss-doc/master/img/screenshots/small-diff.jpeg
[100]:https://succss.readthedocs.io/en/latest/configuration/#pages
[101]:https://succss.readthedocs.io/en/latest/commandline/
[200]:https://www.npmjs.com/
[300]:https://succss.readthedocs.io/en/latest/configuration/#before
[301]:https://succss.readthedocs.io/en/latest/configuration/#hide
[302]:https://succss.readthedocs.io/en/latest/commandline/#compareto
