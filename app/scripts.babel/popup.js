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
    });

    chrome.storage.sync.get(null, vault => {
      checkbox.checked = !!vault.burning;
    });
  }
}
