# react-native-firebase

### Description

This script automates the use of ['react-native-firebase'](https://invertase.io/react-native-firebase) package.

### Installation

1) Download the script and put it in the root folder of your react native project.

2) Add this line to the 'scripts' section of your package.json file:

      "configure-firebase": "node configure-firebase.js"

### Usage

You have several options:

1) 'npm run configure-firebase link'.

2) 'npm run configure-firebase unlink'.

3) 'npm run configure-firebase bundle' - this runs the 'bundle-ios' script so you'll be ready to check the integration on a device.

##### Note

When you run the script, it installs all its dependencies and presents a menu so you can select the desired features you wish to use in your app.
