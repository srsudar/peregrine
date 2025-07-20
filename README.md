# peregrine

> A Chrome extension that allows users to easily navigate to saved urls.

This is a fork of the wonderful [Redirect](https://github.com/kritts/redirect)
extension, which stopped working when Chrome required manifest v3.


## Overview 
Peregrine is a Chrome extension that makes it easy to navigate to custom urls.
Users can save short keys that map to saved urls. Typing ";" and then the saved
key into the address bar opens the users saved url. It is intended to make
navigating to urls fast and easy.


## Getting your settings from Redirect

If you want to grab your settings from Redirect, you can (for a brief time at
least) re-enable it using these flags at `chrome://flags`. Thanks to [this
reddit
thread](https://www.reddit.com/r/chrome/comments/1lx26ur/for_those_who_want_to_enable_legacy_extensions/)
for the tip.

```
chrome://flags/#temporary-unexpire-flags-m137                     [Enabled]

chrome://flags/#extension-manifest-v2-deprecation-warning         [Disabled]
chrome://flags/#extension-manifest-v2-deprecation-disabled        [Disabled]
chrome://flags/#extension-manifest-v2-deprecation-unsupported     [Disabled]
chrome://flags/#allow-legacy-mv2-extensions                       [Enabled]
```

Then, open the settings and run this in the console:

```
const result = {};
document.querySelectorAll('tbody tr').forEach(row => {
  const cells = row.querySelectorAll('td');
  if (cells.length >= 2) {
    const key = cells[0].textContent.trim();
    const value = cells[1].textContent.trim();
    result[key] = value;
  }
});
copy(result);
```

Then, install Peregrine, open the settings page, and run this:

```
t = <paste results from above and hit enter>

for (const [key, value] of Object.entries(t)) {
  window.commonFunctions.saveRedirect(key, value);
}
```
