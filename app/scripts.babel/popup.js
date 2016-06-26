'use strict';

{
  let checkbox;

  if (document.readyState != 'loading'){
    onReady();
  } else {
    document.addEventListener('DOMContentLoaded', onReady);
  }

  function onReady() {
    checkbox = document.querySelector('input[name="burning"]');

    checkbox.addEventListener('click', e => {
      chrome.storage.sync.set({'burning': checkbox.checked});
      refreshBadge();
    });

    chrome.storage.sync.get(null, vault => {
      checkbox.checked = !!vault.burning;
      refreshBadge();
    });
  }

  function refreshBadge() {
    chrome.browserAction.setBadgeText({
      text: checkbox.checked ? 'on' : ''
    });
  }
}
