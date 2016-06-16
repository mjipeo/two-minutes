'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

chrome.commands.onCommand.addListener(command => {
  if (command == 'toggle-two-minutes') {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {greeting: 'hello'}, function (response) {
        console.log(response.farewell);
      });
    });
  }
});

console.log('\'Allo \'Allo! Event Page for Browser Action');
