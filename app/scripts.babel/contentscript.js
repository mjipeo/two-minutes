'use strict';

console.log('\'Allo \'Allo! Content script');

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
    return this.el.querySelector('.two-minutes-button');
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
    this.focus();
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
    setTimeout(function () {
      div.parentNode.removeChild(div);
    }, 1000);

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
    return this;
  }
  focus() {
    this.el.focus();
    return this;
  }
  initialize() {
    this.el.setAttribute('id', 'two-minutes');
    this.el.setAttribute('tabindex', '0');
    this.el.innerHTML = `
      <div class="two-minutes-sub"></div>
      <div class="two-minutes-main"></div>
      <button type="button" class="two-minutes-button two-minutes-button-outline">Start</button>
    `;

    this.addEventListeners();

    this.focus();

    this.render();

    return this;
  }
  terminate() {
    clearInterval(this.interval);

    this.el.parentNode.removeChild(this.el);

    return this;
  }
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

{
  let timer = null;

  chrome.runtime.onMessage.addListener(request => {
    switch (request.command) {
      case 'toggle-two-minutes': {
        toggleTimer();
        break;
      }
      case 'toggle-two-minutes-timer': {
        getOrCreateTimer().toggle().focus();
        break;
      }
    }
  });

  chrome.storage.sync.get(null, vault => {
    if (vault.burning) {
      getOrCreateTimer().toggle();
    }
  });

  function toggleTimer() {
    if (timer) {
      timer.terminate();
      timer = null;
    } else {
      getOrCreateTimer();
    }
  }

  function getOrCreateTimer() {
    if (!timer) {
      timer = createTimer();
    }
    return timer;
  }

  function createTimer() {
    const div = document.createElement('div');
    document.body.appendChild(div);
    return (new Timer(div)).initialize();
  }
}
