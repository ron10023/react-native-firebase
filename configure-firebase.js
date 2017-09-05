#! /usr/bin/env node

var fs = require("fs");
var {exec} = require("child_process");
var pkg = require("./package.json");

var isLive = true;
var app_code = "";
var firebase_version = "11.0.4";

var desiredPackages = {
    "AdMob": false,
    "Auth": false,
    "DynamicLinks": true,
    "RemoteConfig": false,
    "DB": false,
    "Messaging": true,
    // "Performance": false,
    "Storage": false
}

function configureAndroid(shouldRegister, onFinish) {
    function handleGradleFile() {
        try {
            var gradleFilePath = "android/build.gradle";
            var data = fs.readFileSync(gradleFilePath, "utf8").toString().split("\n");
            var stringToInject = "        classpath 'com.google.gms:google-services:3.1.0'";
            if (shouldRegister == true) {
                var indexToInjectGoogleServicesClassPath = data.indexOf("}", data.indexOf("dependencies") + "dependencies".length) - 1;
                data.splice(indexToInjectGoogleServicesClassPath, 0, stringToInject + "\n");
            
            } else {
                var indexToInjectGoogleServicesClassPath = data.indexOf(stringToInject);
                data.splice(indexToInjectGoogleServicesClassPath, 2);
            }
            data = data.join("\n");
            if (isLive == true) {
                fs.writeFile(gradleFilePath, data, function (err) {
                    if (err) console.log(e);
                });
            }
            
            gradleFilePath = "android/app/build.gradle";
            data = fs.readFileSync(gradleFilePath, "utf8").toString();
            stringToInject = "apply plugin: 'com.google.gms.google-services'";
            if (shouldRegister == true) {
                data = data + "\n" + stringToInject + "\n";
                data = data.substring(0, data.indexOf("}", data.indexOf("ndk {"))) + "\n" + "multiDexEnabled true" + "\n" + data.substring(data.indexOf("}", data.indexOf("ndk {")));
            } else {
                data = data.substring(0, data.indexOf("\n" + stringToInject + "\n"));
            }
            
            if (shouldRegister == true) {
                // if (desiredPackages.DynamicLinks == true) {
                // var indexToInjectProductFlavors = data.indexOf("}", data.indexOf("    buildTypes {") + 1) + 1;
                // indexToInjectProductFlavors = data.indexOf("}", indexToInjectProductFlavors + 1) + 1;
                // stringToInject = '\n\n    flavorDimensions "all"' + "\n\n" +
                //                 '    productFlavors {' + "\n" +
                //                 '       main {' + "\n" +
                //                 '            dimensions "all"' + "\n" +
                //                 '            resValue "string", "app_code", "' + app_code + '"' + "\n" +
                //                 '       }' + "\n" +
                //                 '    }' + "\n" +
                //                 "";
                // var data1 = data.substring(0, indexToInjectProductFlavors);
                // data1 += stringToInject;
                // data = data1 + data.substring(indexToInjectProductFlavors);
                // }
                var indexToInjectFirebaseComponents = data.indexOf('compile "com.facebook.react:react-native:"  // From node_modules');
                stringToInject = "\n    // RNFirebase required dependencies"                                                                                        + "\n" +
                                "    compile(project(':react-native-firebase')) {"                                                                                     + "\n" +
                                "        transitive = false"                                                                                                           + "\n" +
                                "    }"                                                                                                                                + "\n" +
                                '    compile "com.google.firebase:firebase-core:' + firebase_version + '"'                                                             + "\n" +
                                "    // If you are recieving Google Play API availability issues, add the following dependency"                                        + "\n" +
                                //'    compile "com.google.android.gms:play-services-base:' + firebase_version + '"'                                                     + "\n" +
                                "    // RNFirebase optional dependencies"                                                                                              + "\n" +
                                //'    compile "com.google.firebase:firebase-analytics:' + firebase_version + '"'                                                       + "\n" + 
                                '    compile "com.google.firebase:firebase-crash:' + firebase_version + '"'                                                            + "\n" + 
                                (desiredPackages.AdMob == false ? '' : '    compile "com.google.firebase:firebase-ads:' + firebase_version + '"'+ "\n"  )              + 
                                (desiredPackages.Auth == false ? '' : '    compile "com.google.firebase:firebase-auth:' + firebase_version + '"'+ "\n"  )              + 
                                (desiredPackages.DynamicLinks == false ? '' : '    compile "com.google.firebase:firebase-invites:' + firebase_version + '"'+ "\n"  )   + 
                                (desiredPackages.RemoteConfig == false ? '' : '    compile "com.google.firebase:firebase-config:' + firebase_version + '"'+ "\n"  )    +
                                (desiredPackages.DB == false ? '' : '    compile "com.google.firebase:firebase-database:' + firebase_version + '"'+ "\n"  )            + 
                                (desiredPackages.Messaging == false ? '' : '    compile "com.google.firebase:firebase-messaging:' + firebase_version + '"'+ "\n"  )    + 
                                // (desiredPackages.Performance == false ? '' : '    compile "com.google.firebase:firebase-perf:' + firebase_version + '"'+ "\n"  )       + 
                                (desiredPackages.Storage == false ? '' : '    compile "com.google.firebase:firebase-storage:' + firebase_version + '"'+ "\n"  )        + 
                                "    // END of RNFirebase optional dependencies"                                                                                       + "\n" +
                                "";
                var indexToInjectFirebaseComponents = data.indexOf('    compile "com.facebook.react:react-native:"  // From node_modules');
                data = data.substring(0, indexToInjectFirebaseComponents) + stringToInject + data.substring(indexToInjectFirebaseComponents);
            } else {
                // var data1 = data.substring(0, data.indexOf('    flavorDimensions "all"'));
                // var indexOfLastInjectedRow = data.indexOf("}", data.indexOf('            dimensions "all"'));
                // indexOfLastInjectedRow = data.indexOf("}", indexOfLastInjectedRow + 1) + 1;
                // data = data1 + data.substring(indexOfLastInjectedRow);

                var indexToInjectedFirstFirebaseComponents = data.indexOf("\n    // RNFirebase required dependencies");
                var indexToInjectedLastFirebaseComponents = data.indexOf('    compile "com.facebook.react:react-native:"  // From node_modules');
                data = data.substring(0, indexToInjectedFirstFirebaseComponents) + data.substring(indexToInjectedLastFirebaseComponents);
            
            }

            if (isLive == true) {
                fs.writeFile(gradleFilePath, data, function (err) {
                    if (err) console.log(e);
                });
            }
        } catch(e) {
            console.log("error loading gradle file: " + e.stack);
        }
    }

    function handleSettingsGradleFile() {
        try {
            var gradleFilePath = "android/settings.gradle";
            var stringToInject = "include ':react-native-firebase'" + "\n" +
                                 "project(':react-native-firebase').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-firebase/android')";
            var data = fs.readFileSync(gradleFilePath, "utf8").toString().split("\n");
            if (shouldRegister == true) {
                var indexToInjectReactNativeFirebase = data.indexOf("include ':app'") - 1;
                data.splice(indexToInjectReactNativeFirebase, 0, stringToInject + "\n");
            } else {
                var indexOfInjectedReactNativeFirebase = data.indexOf("include ':react-native-firebase'");
                data.splice(indexOfInjectedReactNativeFirebase, 3);
            }
            data = data.join("\n");

            if (isLive == true) {
                fs.writeFile(gradleFilePath, data, function (err) {
                    if (err) console.log(e);
                });
            }
        } catch(e) {
            console.log("error loading settings file: " + e.stack);
        }
    }

    function registerPackages() {
        try {
            console.log("getting package name");
            var filePath = "android/app/src/main/AndroidManifest.xml";
            var data = fs.readFileSync(filePath, "utf8").toString().split("\n");
            var packageName = data[1].substring(data[1].indexOf('package="') + 'package="'.length, data[1].indexOf('"', data[1].indexOf('package="') + 'package="'.length));
            
            filePath = "android/app/src/main/java/" + packageName.replace(/\./g, '/') + "/MainApplication.java";
            data = fs.readFileSync(filePath, "utf8").toString().split("\n");
            // console.log("data original length", data.length);
            var stringToInject = "\n // Required package"                                                                                                                               + "\n" +
                                 "import io.invertase.firebase.RNFirebasePackage;"                                                                                                      + "\n" +  
                                 "// Optional packages"                                                                                                                                 + "\n" +                                                                
                                 "import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // Firebase Analytics"                                                             + "\n" +
                                 (desiredPackages.AdMob == false ? "" : "import io.invertase.firebase.admob.RNFirebaseAdMobPackage; // Firebase AdMob" + "\n")                          +
                                 "import io.invertase.firebase.crash.RNFirebaseCrashPackage; // Firebase Crash Reporting"                                                               + "\n" +
                                 (desiredPackages.Auth == false ? "" : "import io.invertase.firebase.auth.RNFirebaseAuthPackage; // Firebase Auth" + "\n")                              +
                                 (desiredPackages.DynamicLinks == false ? "" : "import io.invertase.firebase.config.RNFirebaseInvitesPackage; // Firebase Dynamic Links" + "\n")        +
                                 (desiredPackages.RemoteConfig == false ? "" : "import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage; // Firebase Remote Config" + "\n")   +
                                 (desiredPackages.DB == false ? "" : "import io.invertase.firebase.database.RNFirebaseDatabasePackage; // Firebase Realtime Database" + "\n")           +
                                 (desiredPackages.Messaging == false ? "" : "import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; // Firebase Cloud Messaging" + "\n")    +
                                 // (desiredPackages.Performance == false ? "" : "import io.invertase.firebase.perf.RNFirebasePerformancePackage; // Firebase Performance" + "\n")         +
                                 (desiredPackages.Storage == false ? "" : "import io.invertase.firebase.storage.RNFirebaseStoragePackage; // Firebase Storage" + "\n")                  +
                                 "";
            var parts = stringToInject.split("\n");
            if (shouldRegister == true) {
                console.log("");
                console.log("adding desired imports");
                console.log("");
                var indexToInjectImportFirebasePackages = data.indexOf("public class MainApplication extends Application implements ReactApplication {");
                for (var i = 0; i < parts.length; i++) {
                    data.splice(indexToInjectImportFirebasePackages + i, 0, parts[i]);
                }
            } else {
                console.log("");
                console.log("removing desired imports");
                console.log("");
                var indexToInjectedFirstImportFirebasePackages = data.indexOf("import io.invertase.firebase.RNFirebasePackage;") - 1;
                var indexToInjectedLastImportFirebasePackages = data.indexOf("public class MainApplication extends Application implements ReactApplication {");
                if (indexToInjectedFirstImportFirebasePackages > -1) {
                    data.splice(indexToInjectedFirstImportFirebasePackages, indexToInjectedLastImportFirebasePackages - indexToInjectedFirstImportFirebasePackages);
                }
                // indexToInjectedLastImportFirebasePackages = data.indexOf("public class MainApplication extends Application implements ReactApplication {");
                // data.splice(indexToInjectedLastImportFirebasePackages - 2, 2);
            }
            // console.log("data before length", data.length);
            stringToInject = "                    ,new RNFirebasePackage() // <-- Add this line"                                                 + "\n" +
                             "                    // Optional packages"                                                                          + "\n" +
                             "                    ,new RNFirebaseAnalyticsPackage()"                                                             + "\n" +
                             (desiredPackages.AdMob == false ? "" : "                    ,new RNFirebaseAdMobPackage()," + "\n")                 +
                             "                    ,new RNFirebaseCrashPackage()"                                                                 + "\n" +
                             (desiredPackages.Auth == false ? "" : "                    ,new RNFirebaseAuthPackage()" + "\n")                    +
                             (desiredPackages.DynamicLinks == false ? "" : "                    ,new RNFirebaseInvitesPackage()" + "\n")         +
                             (desiredPackages.RemoteConfig == false ? "" : "                    ,new RNFirebaseRemoteConfigPackage()" + "\n")    +
                             (desiredPackages.DB == false ? "" : "                    ,new RNFirebaseDatabasePackage()" + "\n")                  +
                             (desiredPackages.Messaging == false ? "" : "                    ,new RNFirebaseMessagingPackage()" + "\n")          +
                             // (desiredPackages.Performance == false ? "" : "                    ,new RNFirebasePerformancePackage()," + "\n")  +
                             (desiredPackages.Storage == false ? "" : "                    ,new RNFirebaseStoragePackage()" + "\n")              + 
                             "                    // End Of Optional packages"                                                                   + 
                             "";
            parts = stringToInject.split("\n");
            if (shouldRegister == true) {
                console.log("");
                console.log("adding desired packages");
                console.log("");
                var indexToInjectFirebasePackages = data.indexOf("            );", data.indexOf("            return Arrays.<ReactPackage>asList("));
                for (var i = 0; i < parts.length; i++) {
                    data.splice(indexToInjectFirebasePackages + i, 0, parts[i]);
                }
            } else {
                console.log("");
                console.log("removing desired packages");
                console.log("");
                var indexToInjectedFirebasePackages = data.indexOf("                    ,new RNFirebasePackage(), // <-- Add this line,");
                // var indexOfInjectedLastFirebasePackages = data.indexOf("                    // End Of Optional packages");
                if (indexToInjectedFirebasePackages > -1) {
                    data.splice(indexToInjectedFirebasePackages, parts.length);
                }
            }
            // console.log("data after length", data.length);
            if (isLive == true) {
                fs.writeFile(filePath, data.join("\n"), function (err) {
                    if (err) console.log(e);
                });
            }

            filePath = "android/app/src/main/AndroidManifest.xml";
            data = fs.readFileSync(filePath, "utf8").toString().split("\n");
            if (desiredPackages.Messaging == true) {
                stringToInject = '    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />' + "\n" + 
                                 '    <uses-permission android:name="android.permission.VIBRATE" />'                + 
                                 "";

                parts = stringToInject.split("\n");
                if (shouldRegister == true) {
                    console.log("");
                    console.log("adding required FCM permissions");
                    console.log("");
                    var indexToInjectPermissions = data.indexOf('    <uses-permission android:name="android.permission.INTERNET" />');
                    for (var i = 0; i < parts.length; i++) {
                        data.splice(indexToInjectPermissions + i, 0, parts[i]);
                    }
                } else {
                    console.log("");
                    console.log("removing required FCM permissions");
                    console.log("");
                    var indexToInjectedPermissions = data.indexOf('    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />');
                    if (indexToInjectedPermissions > -1) {
                        data.splice(indexToInjectedPermissions, parts.length);
                    }
                }

                if (shouldRegister == true) {
                    console.log("");
                    console.log("adding loaunchMode='singleTop'");
                    console.log("");
                    var indexToInjectLaunchMode = data.indexOf('      <activity') + 1;
                    stringToInject = '        android:launchMode="singleTop"';
                    data.splice(indexToInjectLaunchMode, 0, stringToInject);
                } else {
                    console.log("");
                    console.log("removing loaunchMode='singleTop'");
                    console.log("");
                    var indexToInjectedLaunchMode = data.indexOf('        android:launchMode="singleTop"');
                    if (indexToInjectedLaunchMode > -1) {
                        data.splice(indexToInjectedLaunchMode, 1);
                    }
                }

                stringToInject = '        <service'                                                                                             + "\n" + 
                                 '            android:name="io.invertase.firebase.messaging.MessagingService"'                                  + "\n" +
                                 '            android:enabled="true"'                                                                           + "\n" +
                                 '            android:exported="true">'                                                                         + "\n" +
                                 '                <intent-filter>'                                                                              + "\n" +
                                 '                    <action android:name="com.google.firebase.MESSAGING_EVENT" />'                           + "\n" +
                                 '                </intent-filter>'                                                                             + "\n" +
                                 '        </service>'                                                                                           + "\n" + 
                                 '        <service android:name="io.invertase.firebase.messaging.InstanceIdService" android:exported="false">'  + "\n" + 
                                 '                <intent-filter>'                                                                              + "\n" +
                                 '                    <action android:name="com.google.firebase.INSTANCE_ID_EVENT" />'                           + "\n" +
                                 '                </intent-filter>'                                                                             + "\n" +
                                 '        </service>'                                                                                           + "\n" + 
                                 "";

                parts = stringToInject.split("\n");
                if (shouldRegister == true) {
                    console.log("");
                    console.log("registering FCM required services");
                    console.log("");
                    var indexToInjectServices = data.indexOf('    </application>') - 1;
                    for (var i = 0; i < parts.length; i++) {
                        data.splice(indexToInjectServices + i, 0, parts[i]);
                    }
                    if (data[data.length - 1] != "</manifest>") {
                        data.splice(data.indexOf('    </application>') + 1, 0, "</manifest>");
                    }
                } else {
                    console.log("");
                    console.log("removing FCM required services");
                    console.log("");
                    var indexToInjectedServices = data.indexOf('            android:name="io.invertase.firebase.messaging.MessagingService"') - 1;
                    if (indexToInjectedServices > -1) {
                        data.splice(indexToInjectedServices, parts.length);
                    }
                }   
            }

            if (desiredPackages.DynamicLinks == true) {
                var packageNameParts = packageName.split(".");
                stringToInject = '        <intent-filter>'                                                         + "\n" + 
                                 '            <action android:name="android.intent.action.VIEW"/>'                 + "\n" + 
                                 '            <category android:name="android.intent.category.DEFAULT"/>'          + "\n" + 
                                 '            <category android:name="android.intent.category.BROWSABLE"/>'        + "\n" + 
                                 '            <data android:host="' + packageName + '" android:scheme="https"/>'   + "\n" + 
                                 '            <data android:host="' + packageName + '" android:scheme="http"/>'    + "\n" + 
                                 '        </intent-filter>'                                                        + 
                                 "";

                parts = stringToInject.split("\n");
                if (shouldRegister == true) {
                    console.log("");
                    console.log("adding DynamicLinks required intent-filter");
                    console.log("");
                    var indexToInjectIntentFilter = data.indexOf('        </intent-filter>') - 1;
                    for (var i = 0; i < parts.length; i++) {
                        data.splice(indexToInjectIntentFilter + i, 0, parts[i]);
                    }
                } else {
                    console.log("");
                    console.log("removing DynamicLinks required intent-filter");
                    console.log("");
                    var indexToInjectedIntentFilter = data.indexOf('            <data android:host="' + packageName + '" android:scheme="https"/>') - 4;
                    data.splice(indexToInjectedIntentFilter, parts.length);
                }
            }

            if (isLive == true) {
                fs.writeFile(filePath, data.join("\n"), function (err) {
                    if (err) console.log(e);
                });
            }

        } catch(e) {
            console.log("error loading app build.gradle file: " + e.stack);
        }
    }

    console.log("proccessing gradle files");
    handleGradleFile();

    console.log("proccessing settings file");
    handleSettingsGradleFile();

    console.log("injecting firebase packages");
    registerPackages();

    console.log("");
    if (shouldRegister == true) {
        var text = "(don't forget to download your google-services.json from the Firebase console and put it in 'Android/app' folder)";
        if (!fs.existsSync("google-services.json")) {
            console.log("ANDROID PLATFORM LINKED! " + text);
        } else {
            console.log("ANDROID PLATFORM LINKED! ");
            var fsExtra = require("fs-extra");
            fsExtra.copy("google-services.json", "android/app/google-services.json");
        }
    } else {
        if (fs.existsSync("android/app/google-services.json")) {
            fs.unlink("android/app/google-services.json");
        }
    }
    console.log("");

    if (onFinish) {
        onFinish();
    }
}

function configureIOS(shouldRegister, onFinish) {
    function initialize(onPodsAdded) {
        try {
            var filePath = "ios/" + pkg.name + "/AppDelegate.m";
            var data = fs.readFileSync(filePath, "utf8").toString().split("\n");
            
            var stringToInject = "#import <Firebase.h>" + "\n";

            var parts = stringToInject.split("\n");
            if (shouldRegister == true) {
                console.log("");
                console.log("adding Firebase.h import");
                console.log("");
                var indexToInjectFirebaseImport = data.indexOf('@implementation AppDelegate');
                for (var i = 0; i < parts.length; i++) {
                    data.splice(indexToInjectFirebaseImport + i, 0, parts[i]);
                }
            } else {
                console.log("");
                console.log("removing Firebase.h import");
                console.log("");
                var indexToInjectedFirebaseImport = data.indexOf("#import <Firebase.h>");
                data.splice(indexToInjectedFirebaseImport, parts.length);
            }

            stringToInject = "  [FIRApp configure];" + "\n" +
                             "";
            parts = stringToInject.split("\n");
            if (shouldRegister == true) {
                console.log("");
                console.log("adding configuration call");
                console.log("");
                var indexToInjectFirebaseConfigure = data.indexOf("- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions") + 2;
                for (var i = 0; i < parts.length; i++) {
                    data.splice(indexToInjectFirebaseConfigure + i, 0, parts[i]);
                }
            } else {
                console.log("");
                console.log("removing configuration call");
                console.log("");
                var indexToInjectedFirebaseConfigure = data.indexOf("  [FIRApp configure];");
                data.splice(indexToInjectedFirebaseConfigure, parts.length);
            }

            if (isLive == true) {
                fs.writeFile(filePath, data.join("\n"), function (err) {
                    if (err) {
                        console.log(e);
                    } else {
                        if (onPodsAdded) {
                            onPodsAdded();
                        }
                    }
                });
            }

        } catch(e) {
            console.log("error loading app AppDelegate.m file: " + e.stack);
        }
    }

    function handlePods(callback) {
        function continuePodsHandling(onPodsHandled) {
            try {
                var filePath = "ios/Podfile";
                var data = fs.readFileSync(filePath, "utf8").toString().split("\n");
                var stringToInject = "  # Required by RNFirebase"                                                              + "\n" +
                                     "  pod 'Firebase/Core'"                                                                   + "\n" +
                                     "  pod 'RNFirebase', :path => '../node_modules/react-native-firebase'"                    + "\n" +
                                     "  # [OPTIONAL PODS]"                                                                     + "\n" +
                                     (desiredPackages.AdMob == false ? "" : "  pod 'Firebase/AdMob'" + "\n")                   +
                                     (desiredPackages.Auth == false ? "" : "  pod 'Firebase/Auth'" + "\n")                     +
                                     "  pod 'Firebase/Crash'"                                                                  + "\n" +
                                     (desiredPackages.DB == false ? "" : "  pod 'Firebase/Database'" + "\n")                   +
                                     (desiredPackages.DynamicLinks == false ? "" : "  pod 'Firebase/DynamicLinks'" + "\n")     +
                                     (desiredPackages.Messaging == false ? "" : "  pod 'Firebase/Messaging'" + "\n")           +
                                     (desiredPackages.RemoteConfig == false ? "" : "  pod 'Firebase/RemoteConfig'" + "\n")     +
                                     (desiredPackages.Storage == false ? "" : "  pod 'Firebase/Storage'" + "\n")               +
                                     "  pod 'Yoga', :path => '../node_modules/react-native/ReactCommon/yoga'"                  + "\n" +
                                     "  pod 'React', :path => '../node_modules/react-native', :subspecs => ["                  + "\n" +
                                     "    'BatchedBridge' # Required For React Native 0.45.0+"                                + "\n" +
                                     // "    'Core'"                                                                              + "\n" +
                                     "  ]"                                                                                     + "\n" +
                                     "  # [END OPTIONAL PODS]"                                                                     + "\n" +
                                     "";

                if (shouldRegister == true) {
                    console.log("");
                    console.log("adding desired pods");
                    console.log("");
                    var indexToInjectPods = data.indexOf("end");
                    data.splice(indexToInjectPods, 0, stringToInject + "\n");
                } else {
                    console.log("");
                    console.log("removing desired pods");
                    console.log("");
                    var indexToFirstInjectedPods = data.indexOf("  # Required by RNFirebase");
                    var indexToLastInjectedPods = data.indexOf("  # [END OPTIONAL PODS]") + 1;
                    data.splice(indexToFirstInjectedPods, indexToLastInjectedPods - indexToFirstInjectedPods);
                    if (data.join("\n").indexOf("pods ") == -1) {
                        exec("cd ios; rm Podfile; rm Podfile.lock; rm -R Pods; rm -R " + pkg.name + ".xcworkspace;", (err, stdout, stderr) => {
                            // console.log(err, stdout, stderr);
                        });
                    }
                }
                data = data.join("\n");

                function continueWithFlow() {
                    function handleDynamicLinks() {
                        
                        if (onPodsHandled) {
                            onPodsHandled();
                        }
                    }

                    if (desiredPackages.Messaging == true) {
                        try {
                            filePath = "ios/" + pkg.name + "/AppDelegate.h";
                            data = fs.readFileSync(filePath, "utf8").toString().split("\n");
                            var stringToInject = "@import UserNotifications;" + "\n";

                            var parts = stringToInject.split("\n");
                            if (shouldRegister == true) {
                                console.log("");
                                console.log("adding UserNotification import");
                                console.log("");
                                var indexToInjectUserNotificationImport = data.indexOf('@interface AppDelegate : UIResponder <UIApplicationDelegate>');
                                for (var i = 0; i < parts.length; i++) {
                                    data.splice(indexToInjectUserNotificationImport + i, 0, parts[i]);
                                }
                            } else {
                                console.log("");
                                console.log("removing UserNotification import");
                                console.log("");
                                var indexToInjectedUserNotificationImport = data.indexOf('@import UserNotifications;');
                                data.splice(indexToInjectedUserNotificationImport, parts.length);
                            }

                            if (shouldRegister == true) {
                                console.log("");
                                console.log("upgrading AppDelegate interface");
                                console.log("");
                                var indexToUpdateInterface = data.indexOf('@interface AppDelegate : UIResponder <UIApplicationDelegate>');
                                data.splice(indexToUpdateInterface, 1, "@interface AppDelegate : UIResponder <UIApplicationDelegate,UNUserNotificationCenterDelegate>");
                            } else {
                                console.log("");
                                console.log("downgrading AppDelegate interface");
                                console.log("");
                                var indexToUpdateInterface = data.indexOf("@interface AppDelegate : UIResponder <UIApplicationDelegate,UNUserNotificationCenterDelegate>");
                                data.splice(indexToUpdateInterface, 1, '@interface AppDelegate : UIResponder <UIApplicationDelegate>');
                            }

                            function handleAppDelegateMFile() {
                                filePath = "ios/" + pkg.name + "/AppDelegate.m";
                                data = fs.readFileSync(filePath, "utf8").toString().split("\n");
                                
                                var stringToInject = '#import "RNFirebaseMessaging.h"' + "\n";

                                var parts = stringToInject.split("\n");
                                if (shouldRegister == true) {
                                    console.log("");
                                    console.log("adding RNFirebaseMessaging.h import");
                                    console.log("");
                                    var indexToInjectFirebaseImport = data.indexOf('@implementation AppDelegate');
                                    for (var i = 0; i < parts.length; i++) {
                                        data.splice(indexToInjectFirebaseImport + i, 0, parts[i]);
                                    }
                                } else {
                                    console.log("");
                                    console.log("removing RNFirebaseMessaging.h import");
                                    console.log("");
                                    var indexToInjectedFirebaseImport = data.indexOf('#import "RNFirebaseMessaging.h"');
                                    data.splice(indexToInjectedFirebaseImport, parts.length);
                                }

                                stringToInject = "  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];" + "\n" +
                                                "";
                                parts = stringToInject.split("\n");
                                if (shouldRegister == true) {
                                    console.log("");
                                    console.log("adding notification center configuration");
                                    console.log("");
                                    var indexToInjectNotificationCenterDelegate = data.indexOf("  [FIRApp configure];") + 2;
                                    for (var i = 0; i < parts.length; i++) {
                                        data.splice(indexToInjectNotificationCenterDelegate + i, 0, parts[i]);
                                    }
                                } else {
                                    console.log("");
                                    console.log("removing notification center configuration");
                                    console.log("");
                                    var indexToInjectedNotificationCenterDelegate = data.indexOf("  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];");
                                    data.splice(indexToInjectedNotificationCenterDelegate, parts.length);
                                }

                                stringToInject = "-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {" + "\n" +
                                                    "  [RNFirebaseMessaging didReceiveLocalNotification:notification];" + "\n" +
                                                    "}" + "\n\n" +
                                                    "- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {" + "\n" +
                                                    "  [RNFirebaseMessaging didReceiveRemoteNotification:userInfo];" + "\n" +
                                                    "}" + "\n\n" +
                                                    "- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo" + "\n" + 
                                                    "                    fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler {" + "\n" +
                                                    "  [RNFirebaseMessaging didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];" + "\n" +
                                                    "}" + "\n\n" +
                                                    "- (void)userNotificationCenter:(UNUserNotificationCenter *)center" + "\n" +
                                                    "       willPresentNotification:(UNNotification *)notification" + "\n" +
                                                    "         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {" + "\n" +
                                                    "  [RNFirebaseMessaging willPresentNotification:notification withCompletionHandler:completionHandler];" + "\n" +
                                                    "}" + "\n\n" +
                                                    "- (void)userNotificationCenter:(UNUserNotificationCenter *)center" + "\n" +
                                                    "didReceiveNotificationResponse:(UNNotificationResponse *)response" + "\n" +
                                                    "         withCompletionHandler:(void (^)())completionHandler {" + "\n" +
                                                    "  [RNFirebaseMessaging didReceiveNotificationResponse:response withCompletionHandler:completionHandler];" + "\n" +
                                                    "}" + "\n\n" +
                                                    "";
                                parts = stringToInject.split("\n");
                                if (shouldRegister == true) {
                                    console.log("");
                                    console.log("adding notification methods");
                                    console.log("");
                                    var indexToInjectNotificationMethods = data.indexOf("@end") - 1;
                                    for (var i = 0; i < parts.length; i++) {
                                        data.splice(indexToInjectNotificationMethods + i, 0, parts[i]);
                                    }
                                } else {
                                    console.log("");
                                    console.log("removing notification methods");
                                    console.log("");
                                    var indexToInjectedNotificationMethods = data.indexOf("-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {");
                                    data.splice(indexToInjectedNotificationMethods, parts.length);
                                }

                                if (isLive == true) {
                                    fs.writeFile(filePath, data.join("\n"), function (err) {
                                        if (err) {
                                            console.log(e);
                                        } else {
                                            // filePath = "ios/" + pkg.name + "/" + pkg.name + ".entitlements";
                                            // data = fs.readFileSync(filePath, "utf8").toString().split("\n");
                                            // stringToInject = "	<key>aps-environment</key>" + "\n" +
                                            //                  "	<string>development</string>" +
                                            //                  "";

                                            // parts = stringToInject.split("\n");
                                            // if (shouldRegister == true) {
                                            //     console.log("adding required entitlements...");
                                            //     var indexToInject = data.indexOf("<dict/>");
                                            //     if (indexToInject > -1) { // there are no entitlements here
                                            //         // data.splice(indexToInject, 1);
                                            //         data.splice(indexToInject, 0, "<dict>");
                                            //         for (var i = 0; i < parts.length; i++) {
                                            //             data.splice(indexToInject + 1 + i, 0, parts[i]);
                                            //         }
                                            //         data.splice(indexToInject + parts.length, 0, "</dict>");
                                            //     } else {
                                            //         var indexToInject = data.indexOf("</dict>");
                                            //         for (var i = 0; i < parts.length; i++) {
                                            //             data.splice(indexToInject + i, 0, parts[i]);
                                            //         }
                                            //     }
                                            // } else {
                                            //     console.log("removing required entitlements...");
                                            //     var indexToInjected = data.indexOf("	<key>aps-environment</key>");
                                            //     data.splice(indexToInjected, parts.length + 1);
                                            //     var indexToStart = data.indexOf("<dict>");
                                            //     var indexToEnd = data.indexOf("</dict>");
                                            //     console.log(indexToEnd - 1, indexToStart);
                                            //     if (indexToEnd - 1 == indexToStart) {
                                            //         data.splice(indexToStart, 2);
                                            //         data.splice(indexToStart, 0, "<dict/>");
                                            //     }
                                            // }

                                            // if (isLive == true) {
                                            //     fs.writeFile(filePath, data.join("\n"), function (err) {
                                            //         if (err) console.log(e);
                                            //     });
                                            // }

                                            filePath = "ios/" + pkg.name + "/Info.plist";
                                            data = fs.readFileSync(filePath, "utf8").toString().split("\n");
                                            stringToInject = "	<key>UIBackgroundModes</key>"             + "\n" + 
                                                             "	<array>"                                  + "\n" +
                                                             "		<string>remote-notification</string>" + "\n" +
                                                             "	</array>"                                 + 
                                                             "";
                                            parts = stringToInject.split("\n");
                                            if (shouldRegister == true) {
                                                console.log("adding required background modes...");
                                                var indexOfBackgroundModes = data.indexOf("	<key>UIBackgroundModes</key>");
                                                if (indexOfBackgroundModes == -1) {
                                                    var indexToInjectBackgroundModes = data.indexOf("</dict>");
                                                    for (var i = 0; i < parts.length; i++) {
                                                        data.splice(indexToInjectBackgroundModes + i, 0, parts[i]);
                                                    }
                                                } else {
                                                    for (var i = 0; i < parts.length; i++) {
                                                        data.splice(indexOfBackgroundModes + 1 + i, 0, parts[i]);
                                                    }
                                                }
                                            } else {
                                                console.log("removing required background modes...");
                                                var indexOfRemoteNotifications = data.indexOf("		<string>remote-notification</string>");
                                                data.splice(indexOfRemoteNotifications, 1);
                                                var indexOfBackgroundModes = data.indexOf("	<key>UIBackgroundModes</key>");
                                                var indexOfStartOfBackgroundModes = indexOfBackgroundModes + 1;
                                                var indexOfEndOfBackgroundModes = data.indexOf("	</array>", indexOfStartOfBackgroundModes);
                                                if (indexOfEndOfBackgroundModes - 1 == indexOfStartOfBackgroundModes) { // there are no more background modes
                                                    data.splice(indexOfBackgroundModes, parts.length - 1);
                                                }
                                            }

                                            if (isLive == true) {
                                                fs.writeFile(filePath, data.join("\n"), function (err) {
                                                    if (err) console.log(e);
                                                });
                                            }

                                            if (desiredPackages.DynamicLinks == true) {
                                                handleDynamicLinks();
                                            } else {
                                                if (onPodsHandled) {
                                                    onPodsHandled();
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    if (desiredPackages.DynamicLinks == true) {
                                        handleDynamicLinks();
                                    } else {
                                        if (onPodsHandled) {
                                            onPodsHandled();
                                        }
                                    }
                                }
                            }

                            if (isLive == true) {
                                fs.writeFile(filePath, data.join("\n"), function (err) {
                                    if (err) {
                                        console.log(e);
                                    } else {
                                        handleAppDelegateMFile();
                                    }
                                });
                            } else {
                                handleAppDelegateMFile();
                            }
                        } catch(e) {
                            console.log("error loading app AppDelegate.m file: " + e.stack);
                        }
                    } else {

                    }
                }

                if (isLive == true) {
                    fs.writeFile(filePath, data, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        continueWithFlow();
                    });
                } else {
                    continueWithFlow();
                }
            } catch(e) {
                console.log("error loading Podfile: " + e.stack);
            }
        }

        if (shouldRegister == true) {
            exec("pod --version", (err, stdout, stderr) => {
                function continueHandlingPods() {
                    if (!fs.existsSync("ios/Podfile")) {
                        exec("cd ios; pod init;", (err, stdout, stderr) => {
                            if (err) {
                                console.log(err);
                                return;
                            }

                            continuePodsHandling(function () {
                                if (callback) {
                                    callback();
                                }
                            });
                        });
                    } else {
                        continuePodsHandling(function () {
                            if (callback) {
                                callback();
                            }
                        });
                    }
                }
                if (stderr.toUpperCase().indexOf("NOT FOUND") > -1) {
                    console.log("CocoaPods not installed. Installing using 'sudo'...");
                    exec("sudo gem install cocoapods", (err, stdout, stderr) => {
                        if (err) {
                            console.log(err);
                        } else {
                            continueHandlingPods();
                        }
                    });
                } else {
                    continueHandlingPods();
                }
            });
        } else {
            continuePodsHandling(function () {
                if (callback) {
                    callback();
                }
            });
        }
    }

    console.log("initializing...");
    initialize(function () {
        console.log("handling pods");
        handlePods(function () {
            if (shouldRegister == true) {
                console.log("installing pods...");
                exec("cd ios; pod install;", (err, stdout, stderr) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (stderr != "") {
                            console.log(stderr);
                        }

                        console.log("");
                        var text = "(don't forget to download your GoogleServices-Info.plist from the Firebase console and put it in 'ios/" + pkg.name + "' folder)";
                        if (!fs.existsSync("GoogleService-Info.plist")) {
                            console.log("IOS PLATFORM LINKED! " + text);
                        } else {
                            var fsExtra = require("fs-extra");
                            fsExtra.copy("GoogleService-Info.plist", "ios/" + pkg.name + "/GoogleService-Info.plist");
                            console.log("IOS PLATFORM LINKED! ");
                        }
                        console.log("");

                        if (onFinish) {
                            onFinish();
                        }
                    }
                });
            } else {
                if (fs.existsSync("ios/" + pkg.name + "/GoogleService-Info.plist")) {
                    fs.unlink("ios/" + pkg.name + "/GoogleService-Info.plist", function (err) {
                        console.log(err);
                    });
                }
            }
        });
    });
}

function linkReactNativeFirebase() {
    exec("npm install --save react-native-firebase", (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return;
        } else {
            configureAndroid(true, function () {
                configureIOS(true, function () {
                    console.log("");
                    console.log("");
                    console.log("DONE!");
                    console.log("");
                });
            });
        }
    });
}

function unlinkReactNativeFirebase() {
    exec("npm uninstall --save react-native-firebase", (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return;
        } else {
            configureAndroid(false, function () {
                configureIOS(false, function () {
                    console.log("");
                    console.log("");
                    console.log("DONE!");
                    console.log("");
                });
            });
        }
    });
}

function processArgs() {
    var argv = require("minimist")(process.argv.slice(2));

    // console.log(argv);
    if (argv._[0] == "link") {
        var atLeastOneSelected = false;
        for (var i = 0; i < Object.keys(desiredPackages).length; i++) {
            if (desiredPackages[Object.keys(desiredPackages)[i]] == true) {
                atLeastOneSelected = true;
                break;
            }
        }
        if (atLeastOneSelected) { 
            showMenu();
        } 
    } else if (argv._[0] == "unlink") {
        var atLeastOneSelected = false;
        for (var i = 0; i < Object.keys(desiredPackages).length; i++) {
            if (desiredPackages[Object.keys(desiredPackages)[i]] == true) {
                atLeastOneSelected = true;
                break;
            }
        }
        if (atLeastOneSelected) {
            showMenu();
        }
    } else if (argv._[0] == "bundle") {
        exec("react-native bundle --entry-file ./index.ios.js --platform ios --bundle-output ios/main.jsbundle --assets-dest ./ios", (err, stdout, stderr) => {

        });
    }
}

function showMenu() {
    var Prompt = require("prompt-checkbox");
    var modules = [];
    
    for (var i = 0; i < Object.keys(desiredPackages).length; i++) {
        modules.push({
            name: Object.keys(desiredPackages)[i],
            checked: desiredPackages[Object.keys(desiredPackages)[i]]
        });
    }
    var prompt = new Prompt({
        name: "modules",
        message: "Please selected the desired modules:",
        radio: true,
        choices: modules
    });
    prompt.run()
        .then(function(choices) {
            for (var i = 0; i < Object.keys(desiredPackages).length; i++) { // reset all options
                desiredPackages[Object.keys(desiredPackages)[i]] = false;
            }
            var atLeastOneSelected = false;
            for (var i = 0; i < choices.length; i++) {
                desiredPackages[choices[i]] = true;
                atLeastOneSelected = true;
            }
            var argv = require("minimist")(process.argv.slice(2));
            if (argv._[0] == "link" && atLeastOneSelected == true) {
                linkReactNativeFirebase();
            } else if (argv._[0] == "unlink") {
                unlinkReactNativeFirebase();
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}

function toggleMenu() {
    if (!pkg.devDependencies["prompt-checkbox"] && !pkg.dependencies["prompt-checkbox"]) {
        exec("npm install --save-dev prompt-checkbox", (err, stdout, strerr) => {
            if (err) console.log(err);
            showMenu();
        });
    } else {
        showMenu();
    }
}

if (!pkg.devDependencies.miniminst && !pkg.dependencies.miniminst) {
    exec("npm install --save-dev minimist fs-extra", (err, stdout, strerr) => {
        if (err) console.log(err);
        processArgs();
    });
} else {
    processArgs();
}

