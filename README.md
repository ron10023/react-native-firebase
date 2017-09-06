# react-native-firebase

[![npm version](https://img.shields.io/npm/v/react-native-configure-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-configure-firebase)
[![NPM downloads](https://img.shields.io/npm/dm/react-native-configure-firebase.svg?style=flat-square)](https://www.npmjs.com/package/react-native-configure-firebase)
[![License](https://img.shields.io/npm/l/react-native-configure-firebase.svg?style=flat-square)](/LICENSE)

### Description

This script automates the integration of ['react-native-firebase'](https://invertase.io/react-native-firebase) package.

#### Attention

Due to EventEmitter deprecation in React Native v0.48, Please [click here](https://github.com/invertase/react-native-firebase/issues/386) for a fix.

### Installation

#### Using NPM (when using with gulp)

npm i react-native-configure-firebase --save

##### Usage

var configureFirebase = require('react-native-configure-firebase');

configureFirebase(action, version);


options:

1) action - either 'link', 'unlink' or 'bundle'.

2) version - the desired firebase packages version to use.



#### Manually

1) Download the script and put it in the root folder of your react native project.

2) Add this line to the 'scripts' section of your package.json file:

      "configure-firebase": "node configure-firebase.js"

##### Usage

You have several options:

1) 'npm run configure-firebase link'.

2) 'npm run configure-firebase unlink'.

3) 'npm run configure-firebase bundle' - this runs the 'bundle-ios' script so you'll be ready to check the integration on a device.

### Note

When you run the script, it installs all its dependencies and presents a menu so you can select the desired features you wish to use in your app.

## Donation
If this project help you reduce time to develop, you can give me a cup of coffee :) 

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=EXPZ5C9ST6PSY)
