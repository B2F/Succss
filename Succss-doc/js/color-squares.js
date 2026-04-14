var params = {};
location.search.substr(1).split("&").forEach(function(item) {params[item.split("=")[0]] = item.split("=")[1];});

var currentHeadline = defaultHeadline = parseInt(params.headline) || 0;
var yGap = parseInt(params.ygap) || 9;
if (params.bgColor) params.bgColor = "#" + params.bgColor;
var originalBackgroundColor = params.bgColor || '#56CCF2';
var variation = baseVariation = parseInt(params.variation) || 0;
isNaN(parseInt(params.speed)) ? speed = 500 : speed = parseInt(params.speed);
var breakage = parseInt(params.breakage) || 50;
var broken = false;

// Keep initial values so the jiggle easter egg can reset.
var initialVariation = variation;
var initialBaseVariation = baseVariation;
var initialSpeed = speed;
var initialBreakage = breakage;
var initialYGap = yGap;

var subHeadline = [
  'Turn your <strong>CSS</strong> into <strong>success</strong>ful design integrations.',
  'Build your websites with SUCCSS, success guaranteed.',
  'Bring some <strong>fun</strong> to your <strong>C</strong>ascading <strong>S</strong>tlye<strong>S</strong>heets :)',
  'How sweet is using Succss? As eating a #f16 candy !',
  'Try SUCCSS, it doesn\'t mean you SUC(Kat)CSS ;)',
  'SUCCSS, you\'ll still need to fix what is broken.',
  'Fork SUCCSS, look under the hood.',
  'Check your <strong>style</strong> with SUCCSS.',
  'SUCCSS.ifzenelse.net, it\'s not easter yet did you find all the "eggs"?'
];

loadingFix();

var colors = {
  "red":"#FF0000",
  "red1":"#F54949",
  "red2":"#CC0000",
  "red3":"#990000",
  "red4":"#B04949",
  "orange":"#FF7033",
  "orange1":"#FF6F00",
  "orange2":"#FF8645",
  "orange3":"#FF9466",
  "orange4":"#FF8040",
  "green":"#2F9929",
  "green1":"#49B049",
  "green2":"#31C400",
  "green3":"#31A631",
  "green4":"#439906",
  "blue":"#3366FF",
  "blue1":"#577FF5",
  "blue2":"#5757F5",
  "blue3":"#0D8EFF",
  "blue4":"#0E6B99",
  "purple":"#7530FF",
  "purple1":"#7363FF",
  "purple2":"#5F3BFF",
  "purple3":"#7300FF",
  "purple4":"#7A33FF"
};

var colorsHex = Array();

// The header square shows the *next* color that will be applied on click.
var nextHeaderColor = null;
var currentBgColor = null;

window.onload = function() {
  var i=0;
  for (var c in colors) {
    i++;
    (i%2 === 1) ? suffix = "even" : suffix = "odd";
    colorSquare = document.createElement('div');
    colorSquare.id = c;
    colorSquare.className = "color-square " + suffix;
    colorSquare.style.backgroundColor = colors[c];
    aside = document.getElementById("colors");
    aside.appendChild(colorSquare);
    colorsHex.push(colors[c]);
  }
  whyLink = document.createElement('a');
  whyLink.style.top = moveSideBar() + "px";
  whyLink.id = "why-link";
  whyLink.href = "#logo";
  whyLink.innerHTML = '?';
  whyLink.title = 'Click here ?! These awesome color blocks are used for SUCCSS selftests.';
  aside.appendChild(whyLink);
  onColorSquaresClick(function(e) {
    currentBgColor = colors[e.target.id];
    document.body.style.background = currentBgColor;
    updateColoredElements(currentBgColor);
    ensureNextHeaderColorDiff(currentBgColor);
    setTwitterShare();
  });
  // Header "logo" is now a color square. Clicking it picks a random color,
  // similar to the side squares.
  headerSquare = document.getElementById('logo-image');
  if (headerSquare) {
    currentBgColor = originalBackgroundColor;
    ensureNextHeaderColorDiff(currentBgColor);
    headerSquare.addEventListener('click', headerSquareClick);
  }
  whyLink.addEventListener('click', function(e) {
    // Bring back the original "jiggle" easter egg.
    e.preventDefault();

    jiggleClick();

    // Update URL params (shareable) without interrupting animation.
    try {
      history.replaceState(null, document.title, document.URL.replace(/(\?.*)/, '') + getParams());
    } catch (e) {
      // ignore
    }
  });
  setSubHeadline(defaultHeadline);
  params.page = setPage(params.page);
  setTwitterShare();
};

function pickRandomColor() {
  return colorsHex[Math.floor(Math.random() * colorsHex.length)];
}

function pickRandomColorDifferent(avoidColor) {
  // Best-effort: pick a different color than the current background.
  for (var i = 0; i < 20; i++) {
    var c = pickRandomColor();
    if (c !== avoidColor) return c;
  }
  return pickRandomColor();
}

function ensureNextHeaderColorDiff(avoidColor) {
  if (!nextHeaderColor || nextHeaderColor === avoidColor) {
    nextHeaderColor = pickRandomColorDifferent(avoidColor);
    setHeaderSquareColor(nextHeaderColor);
  }
}

function setHeaderSquareColor(color) {
  var headerSquare = document.getElementById('logo-image');
  if (!headerSquare) return;
  headerSquare.style.backgroundColor = color;
}

function moveSideBar() {
  var i=0;
  var startY=50;
  var x = {
    'even': 0,
    'odd':25
  };
  for (var c in colors) {
    i++;
    (i%2 == 1) ? suffix = "even" : suffix = "odd";
    startY+=yGap;
    colorSquare = document.getElementById(c);
    colorSquare.style.top = randomizePos(startY, variation).toString() + 'px';
    colorSquare.style.left = randomizePos(x[suffix], variation).toString() + 'px';
  }
  if (!broken && baseVariation >= breakage) {
    broken=true;
    variation = baseVariation += 100;
    var core = document.getElementById('core');
    var aside = document.getElementById('colors');
    var headerText = document.getElementById('header-text');
    var staticLine = document.getElementById('static-line');
    // Twitter button removed; keep the rest of the easter egg effect.
    document.body.removeChild(core);
    headerText.removeChild(staticLine);
    aside.style.width = "100%";
    setSubHeadline(5);
  }
  window.setTimeout(function() {moveSideBar();}, speed);
  return startY;
}

function setSubHeadline(index) {
  dynamicLine = document.getElementById('dynamic-line');
  dynamicLine.innerHTML = subHeadline[index];
  dynamicLine.style.display = "block";
  currentHeadline = index;
  setTwitterShare();
}

function randomizePos(pos, variation) {
  Math.random() > 0.5 ? sign = 1 : sign = -1;
  return pos + (Math.random()*variation * sign);
}

function randomizeBackground(colors) {
  colorPicked = colors[Math.floor(Math.random()*(colors.length-1))];
  document.body.style.backgroundColor = colorPicked;
  updateColoredElements(colorPicked);
}

function onColorSquaresClick(callback) {
  even = document.getElementsByClassName('color-square even');
  for (var e in even) if (!isNaN(parseInt(e))) even[e].addEventListener('click', callback);
  odd = document.getElementsByClassName('color-square odd');
  for (var o in odd) if (!isNaN(parseInt(o))) odd[o].addEventListener('click', callback);
}

function jiggleClick(opts) {
  opts = opts || {};
  // Reintroduce the old "rainbow" click behavior (jiggle, faster movement, random bg).
  if (!broken && variation !== 0) {
    setDefaultState();
    if (!opts.skipScroll) window.scrollTo(0, 0);
  }
  else {
    setTimeout(function() {
      baseVariation = baseVariation + 10;
      variation = baseVariation;
      aside = document.getElementById('colors');
      asideCoords = aside.getBoundingClientRect();
      if (!opts.skipScroll) {
        // getBoundingClientRect().top is viewport-relative.
        window.scrollTo(0, window.scrollY + asideCoords.top);
      }
      if (speed > 21) speed -= 20;

      if (!opts.skipBackground) {
        if (opts.backgroundColor) {
          currentBgColor = opts.backgroundColor;
          document.body.style.backgroundColor = currentBgColor;
          updateColoredElements(currentBgColor);
          ensureNextHeaderColorDiff(currentBgColor);
        }
        else {
          randomizeBackground(colorsHex);
        }
      }

      if (!opts.skipHeadline) {
        setSubHeadline(Math.floor(Math.random() * subHeadline.length));
      }
    }, 500);
  }
}

function headerSquareClick() {
  if (!nextHeaderColor) {
    currentBgColor = document.body.style.backgroundColor;
    ensureNextHeaderColorDiff(currentBgColor);
  }

  // If we're already jiggling, clicking again should reset (same as the old behavior).
  if (!broken && variation !== 0) {
    jiggleClick({ skipBackground: true, skipHeadline: true, skipScroll: true });
    return;
  }

  // Apply the "next" color immediately...
  currentBgColor = nextHeaderColor;
  document.body.style.backgroundColor = currentBgColor;
  updateColoredElements(currentBgColor);
  setSubHeadline(Math.floor(Math.random() * subHeadline.length));

  // ...and prepare the next "next" color for the square.
  nextHeaderColor = pickRandomColorDifferent(currentBgColor);
  setHeaderSquareColor(nextHeaderColor);

  // Restore the jiggle easter egg on the header square too,
  // but don't override the chosen background/headline.
  jiggleClick({ skipBackground: true, skipHeadline: true, skipScroll: true });
}

function setDefaultState() {
  broken = false;
  variation = initialVariation;
  baseVariation = initialBaseVariation;
  speed = initialSpeed;
  breakage = initialBreakage;
  yGap = initialYGap;
  currentBgColor = originalBackgroundColor;
  document.body.style.backgroundColor = currentBgColor;
  updateColoredElements(currentBgColor);
  ensureNextHeaderColorDiff(currentBgColor);
  setSubHeadline(defaultHeadline);
  setTwitterShare();
}

function getParams() {
  styles = window.getComputedStyle(document.body);
  rgb = decodeURIComponent(styles.backgroundColor.replace(/[#rgba()]/g, '')).split(', ');
  hex = ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
  return "?&page="+params.page+"&variation="+variation+"&breakage="+breakage+"&speed="+speed+"&ygap="+yGap+"&bgColor="+hex+"&headline="+currentHeadline;
}

function setTwitterShare() {
  var twitterUrl = 'https://twitter.com/intent/tweet?';
  var twitterButton = document.getElementById('twitter-button');
  if (!twitterButton) return;
  var url = encodeURIComponent(document.URL.replace(/(\?.*)/, '') + getParams());
  twitterButton.href = twitterUrl + 'text='+encodeURIComponent(subHeadline[currentHeadline].replace(/(<([^>]+)>)/ig,""))+"&url="+url;
}

function setPage(pageName) {
  if (!pageName || pageName == "undefined") pageName = 'home';
  var page = document.getElementById(pageName);
  var menu = document.getElementById('more-infos');
  if (page) page.style.display = menu.style.display = 'block';
  title = page.getElementsByTagName('h1');
  document.title = title[0].innerHTML + ' - ' + document.title;
  return pageName;
}

function loadingFix() {
  var css = 'article, #dynamic-line { display: none;} body {background-color: '+originalBackgroundColor+'} footer {background-color: rgba(' + hexToRgb(originalBackgroundColor)+ ', 0.7)} #more-infos {background-color: rgba(' + hexToRgb(originalBackgroundColor)+ ', 0.9)}',
      style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

function updateColoredElements(color) {
  document.getElementById('supporters').style.backgroundColor = 'rgba(' + hexToRgb(color) + ', 0.7)';
  document.getElementById('more-infos').style.backgroundColor = 'rgba(' + hexToRgb(color) + ', 0.9)';
}

function hexToRgb(hex) {
    var hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? parseInt(r[1], 16) + ',' + parseInt(r[2], 16) + ',' + parseInt(r[3], 16) : null;
}
