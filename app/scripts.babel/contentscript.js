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

let sub = '';
let target = '0200';
let div = null;
let keyTyped = false;

function redraw() {
  console.log('redrawing');
  div.querySelector('.sub').innerHTML = decorate(sub);
  div.querySelector('.main').innerHTML = decorate(target);
}

function decorate(str) {
  return !!str ? [str.substr(0, 2), str.substr(2, 2)].join(':') : '';
}

function parse(string) {
  return 60 * parseInt(string.substr(0, 2)) + parseInt(string.substr(2, 2));
}

function unparse(total) {
  const minutes = parseInt(total / 60);
  const seconds = total % 60;
  return [minutes, seconds].map(just).join('');
}

function just(number) {
  if (parseInt(number) >= 10) {
    return number;
  } else {
    return '0' + number;
  }
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
