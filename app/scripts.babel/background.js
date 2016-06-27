'use strict';

{
  chrome.commands.onCommand.addListener(command => {
    if (command.startsWith('toggle-two-minutes')) {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, {command});
      });
    }

    switch (command) {
      case 'toggle-two-minutes-burning': {
        chrome.storage.sync.get(null, vault => {
          chrome.storage.sync.set({'burning': !vault.burning});
        });
        break;
      }
    }

  });

  chrome.storage.onChanged.addListener(onStorageChanged);

  //chrome.commands.getAll(commands => {
    //console.log(commands.map(command => command.shortcut));
  //});

  onStorageChanged();

  function onStorageChanged(changes) {
    chrome.storage.sync.get(null, vault => {
      chrome.browserAction.setBadgeText({
        text: vault.burning ? 'on' : ''
      });
    });
  }
}
