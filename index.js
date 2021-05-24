/**
 * @format
 */

import {AppRegistry,PermissionsAndroid} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import RNCallKeep from 'react-native-callkeep';
import messaging from '@react-native-firebase/messaging';
import uuid from 'uuid';
import {Platform} from "react-native"

AppRegistry.registerComponent(appName, () => App);


// AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', () => ({ name, callUUID, handle }) => {
//     // Make your call here
    
//     return Promise.resolve();
//   });


AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);



export default async (message: RemoteMessage) => {
   const options = {
        ios: {
            appName: 'MyApp',
            imageName: '../img/TabBar/contacts.imageset/contacts.png',
            ringtoneSound: 'my_ringtone_sound_filename_in_bundle',
            maximumCallGroups: '1',
            maximumCallsPerCallGroup: '1'
        },
        android: {
            alertTitle: 'Permissions Required',
            alertDescription: 'This application needs to access your phone calling accounts to make calls',
            cancelButton: 'Cancel',
            okButton: 'ok',
            imageName: 'sim_icon',
            additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS]
        }
    };

    RNCallKeep.setup(options);
    RNCallKeep.setAvailable(true);
   
    // if(message.data.type==='2'){
    //         let _uuid = uuid.v4();
    //         RNCallKeep.displayIncomingCall(_uuid, "123", "123");
    // }

    return Promise.resolve();
} 

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
//   const callUUID = uuid.v4();  // Register background handler
//   let number = String(Math.floor(Math.random() * 100000));
//   RNCallKeep.displayIncomingCall(callUUID, number, "testddfgfdgdfge", 'numberdgdgdgdgdf', true);
  

// });


messaging().setBackgroundMessageHandler(async (message) => {
     console.log('Message handled in the background!', message);
     const callUUID = uuid.v4();  // Register background handler
     let number = String(Math.floor(Math.random() * 100000));
     RNCallKeep.backToForeground()
     setTimeout(()=>{
      RNCallKeep.displayIncomingCall(callUUID, number, "testddfgfdgdfge", 'numberdgdgdgdgdf', true);

     },1000)
});

