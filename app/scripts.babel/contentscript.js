'use strict';

console.log('\'Allo \'Allo! Content script');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(sender.tab ?
              'from a content script:' + sender.tab.url :
              'from the extension');
  activate();

  if (request.greeting == 'hello') {
    sendResponse({farewell: 'goodbye'});
  }
});

class Timer {
  constructor(el) {
    this.el = el;

    this.main = '0200';
    this.sub = '';
    this.active = false;
    this.keyTyped = false;
    this.interval = null;
    this.remaining = null;
  }
  getSubEl() {
    return this.el.querySelector('.two-minutes-sub');
  }
  getMainEl() {
    return this.el.querySelector('.two-minutes-main');
  }
  getButtonEl() {
    return this.el.querySelector('.button');
  }
  addEventListeners() {
    this.el.addEventListener('keyup', this.onKeyup.bind(this));
    this.el.addEventListener('click', this.onClick.bind(this));
    this.getButtonEl().addEventListener('click', this.toggle.bind(this));
  }
  onKeyup(e) {
    if (e.keyCode == 13) {
      this.toggle();
    }
    if (!this.active && isDigit(e.keyCode)) {
      if (!this.keyTyped) {
        this.main = '0000';
        this.keyTyped = true;
      }
      this.main += (e.keyCode - '0'.charCodeAt(0));
      this.main = this.main.substring(1);
      this.render();
    }
  }
  onClick(e) {
    this.el.focus();
  }
  onTick() {
    this.remaining -= 1;
    this.main = unparse(this.remaining);
    this.render();

    if (!this.remaining) {
      this.end();
    }
  }
  toggle() {
    return !this.active ? this.start() : this.stop();
  }
  start() {
    this.sub = this.main;
    this.remaining = parse(this.main);
    this.interval = setInterval(this.onTick.bind(this), 1000);
    this.active = true;

    toggleClass(this.el, 'active');

    this.render();
  }
  stop() {
    this.main = this.sub;
    this.sub = '';
    this.active = false;

    toggleClass(this.el, 'active');

    clearInterval(this.interval);

    this.render();
  }
  end() {
    this.stop();

    let div = document.createElement('div');
    div.setAttribute('id', 'two-minutes-flash');
    //div.innerHTML = '<h1>Timer Done</h1>';
    document.body.appendChild(div);
    //setTimeout(function () {
      //div.parentNode.removeChild(div);
    //}, 1000);

    // FIXME: Alert
    /*
    let div = document.createElement('div');
    div.setAttribute('id', 'two-minutes-flash');
    document.body.appendChild(div);
    setTimeout(function () {
      div.parentNode.removeChild(div);
    }, 1000);
    */
  }
  render() {
    this.getSubEl().textContent = timize(this.sub);
    this.getMainEl().textContent = timize(this.main);
    this.getButtonEl().textContent = this.active ? 'Stop' : 'Start';
  }
  run() {
    this.el.setAttribute('id', 'two-minutes');
    this.el.setAttribute('tabindex', '0');
    this.el.innerHTML = `
      <div class="two-minutes-sub"></div>
      <div class="two-minutes-main"></div>
      <button type="button" class="button button-outline">Start</button>
    `;

    this.addEventListeners();

    this.el.focus();

    this.render();
  }
}

{
  const div = document.createElement('div');
  document.body.appendChild(div);

  (new Timer(div)).run();
}

function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    var classes = el.className.split(' ');
    var existingIndex = classes.indexOf(className);

    if (existingIndex >= 0)
      classes.splice(existingIndex, 1);
    else
      classes.push(className);

    el.className = classes.join(' ');
  }
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function timize(str) {
  return !!str ? [str.substr(0, 2), str.substr(2, 2)].join(':') : '';
}

function parse(str) {
  return 60 * parseInt(str.substr(0, 2)) + parseInt(str.substr(2, 2));
}

function unparse(value) {
  const minutes = parseInt(value / 60);
  const seconds = value % 60;
  return [minutes, seconds].map(just).join('');
}

function just(number) {
  if (parseInt(number) >= 10) {
    return number;
  } else {
    return '0' + number;
  }
}

function isDigit(keyCode) {
  return keyCode >= '0'.charCodeAt(0) && keyCode <= '9'.charCodeAt(0);
}


/*
let sub = '';
let target = '0200';
let div = null;
let keyTyped = false;

function redraw() {
  console.log('redrawing');
  div.querySelector('.sub').innerHTML = timize(sub);
  div.querySelector('.main').innerHTML = timize(target);
}

function start() {
  sub = target;

  toggleClass(div, 'active');

  let remaining = parse(target);
  setInterval(() => {
    console.log(remaining);

    remaining -= 1;
    target = unparse(remaining);
    redraw();

    if (!remaining) {
      end();
    }
  }, 1000);

  redraw();
}

function end() {
  let div = document.createElement('div');
  div.setAttribute('id', 'two-minutes-flash');
  document.body.appendChild(div);
  setTimeout(function () {
    div.parentNode.removeChild(div);
  }, 1000);
}

function activate() {
  return;
  div = document.createElement('div');
  div.setAttribute('id', 'two-minutes');
  div.setAttribute('tabindex', '0');
  div.innerHTML = `
  <div class="sub"></div>
  <div class="main"></div>
  `;
  div.addEventListener('keyup', (e) => {
    console.log(e.keyCode);

    if (e.keyCode == 13) {
      start();
      //end();
    }
    if (e.keyCode >= '0'.charCodeAt(0) && e.keyCode <= '9'.charCodeAt(0)) {
      if (!keyTyped) {
        target = '0000';
        keyTyped = true;
      }
      target += (e.keyCode - '0'.charCodeAt(0));
      target = target.substring(1);
      redraw();
    }
  });
  div.addEventListener('click', (e) => {
    div.focus();
  });
  document.body.appendChild(div);
  div.focus();
  redraw();

}

activate();  // FIXME
*/
