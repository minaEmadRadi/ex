window.onload = function() {
    var pageContent = document.body.innerText;
    var pageUrl = window.location.href;
    console.log('Page URL:', pageUrl);
    console.log('Page Content:', pageContent);
    chrome.runtime.sendMessage({ pageData: "Data from page console" });
    chrome.runtime.sendMessage({ pageContent: pageContent, pageUrl: pageUrl });
    const eventData = { key: "value" };
    const customEvent = new CustomEvent('customKeyEventFromPage', { detail: eventData });
    document.dispatchEvent(customEvent);
};
var  pressedKeys = [];


document.addEventListener('customKeyEventFromPage', function(event) {
    const eventData = event.detail;
    chrome.runtime.sendMessage({ keysData: eventData });
});

function dispatchCustomEvent(keyValue) {
    const customEvent = new CustomEvent('customKeyEventFromPage', { detail: { key: keyValue } });
    document.dispatchEvent(customEvent);
    pressedKeys = [];
}

document.addEventListener('keydown', function(event) {
    const key = event.key; 
    pressedKeys.push(key);
    sendPressedKeys();

});

function sendPressedKeys() {
    if (pressedKeys.includes('Enter') ) {
        pressedKeys = pressedKeys.filter(key => key !== 'Enter');
        const keyValueString = pressedKeys.join('');
        dispatchCustomEvent(keyValueString);
    }else if (pressedKeys.includes('MouseClick')) {
        pressedKeys = pressedKeys.filter(key => key !== 'MouseClick');
        const keyValueString = pressedKeys.join('');
        dispatchCustomEvent(keyValueString);
    }
}
document.addEventListener('click', function(event) {
    pressedKeys.push('MouseClick');
    sendPressedKeys();
});
