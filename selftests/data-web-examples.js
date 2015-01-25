/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var baseUrl = 'succss.ifzenelse.net';

Succss.pages = {
  'home': {
    url:'succss.ifzenelse.net',
    directory:'screenshots/dir',
    captures: {
      'header':'',
      // Key:name Value:CSS selector.
      'dynamic-text':'body #header-text > #static-line + span',
    },
  },
  'special': {
    url:'http://succss.ifzenelse.net/commandline?bgColor=A7A',
    captures: {
      'body': {
        // Selectors can have a hook callback "before" capture.
        before: function() {
          this.click('#logo-image');
          console.log('... Waiting for color squares randomization');
          this.wait(1000, function() {
            console.log('Done!');
          });
        }
      },
    },
  },
  // Will output: './screenshots/home--body--default-viewport.png'
  'concise': { url:'succss.ifzenelse.net/home?bgColor=088&variation=0', 'good':true },
  'installation': {
    'url': baseUrl + '/installation&variation=0',
    'directory':'./screenshots/installation',
    captures: {
      'header':''
    },
  },
  'configuration': {
    'url': baseUrl + '/configuration?bgColor=A7A&variation=0',
    'directory':'./screenshots/configuration/',
    'source': 'installation',
  },
  'capture-prop': {
    'url':baseUrl + '/fork&variation=0',
    'captures': { 'header-text':'#static-line' },
    'good':true
  }
};

Succss.callback = function(capture) {

  // The other available action is 'add'
  if (capture.action == 'check') {
    if (!capture.options.good && !capture.page.good) {
      casper.test.assertTruthy(fs.exists(capture.filePath), 'The updated capture was taken (' + capture.filePath + ').');
      casper.test.assertNotEquals(fs.size(capture.filePath), fs.size(capture.basePath), 'Base and update are different in size.');
    }
  }
}

Succss.viewports = {
  'classic-wide': {
    width: 1366,
    height: 768
  },
}

Succss.options = {
  imagediff:false,
  resemble:false,
  diff:true,
  exitOnError:false
}

Succss.diff = function(imgBase, imgCheck, capture) {

  if (capture.page.name != 'special') {
    try {
        this.injectJs('lib/resemble.js');

        resemble.outputSettings({
          errorColor: {
            red: 0,
            green: 255,
            blue: 255
          },
          errorType: 'movement',
          transparency: 0.8,
          largeImageThreshold: 1000
        });

        this.resemble(imgBase, imgCheck, capture);
    }
    catch(e) {
      console.log(e);
    }
  }
};