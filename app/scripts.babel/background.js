'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '2s'});

chrome.commands.onCommand.addListener(command => {
  //console.log(command);
  //return;

  if (command.startsWith('toggle-two-minutes')) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, {command});
    });
  }
});

chrome.commands.getAll(commands => {
  console.log(commands.map(command => command.shortcut));
});

console.log('\'Allo \'Allo! Event Page for Browser Action');
