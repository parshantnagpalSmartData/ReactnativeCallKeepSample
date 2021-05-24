import React from 'react';
import RNCallKeep from 'react-native-callkeep';
import {TouchableOpacity, View, Text, PermissionsAndroid, Alert} from "react-native";
import uuid from 'uuid';
import messaging from '@react-native-firebase/messaging';

console.log("uuiduuiduuid",uuid.v4())
let  unsubscribe;

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.currentCallId = null;

    // Add RNCallKeep Events
    RNCallKeep.addEventListener('didReceiveStartCallAction', this.didReceiveStartCallAction);
    RNCallKeep.addEventListener('answerCall', this.onAnswerCallAction);
    RNCallKeep.addEventListener('endCall', this.onEndCallAction);
    RNCallKeep.addEventListener('didDisplayIncomingCall', this.onIncomingCallDisplayed);
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', this.onToggleMute);
    RNCallKeep.addEventListener('didToggleHoldCallAction', this.onToggleHold);
    RNCallKeep.addEventListener('didPerformDTMFAction', this.onDTMFAction);
    RNCallKeep.addEventListener('didActivateAudioSession', this.audioSessionActivated);
  }

  // Initialise RNCallKeep
  setup = () => {
    const options = {
      ios: {
        appName: 'ReactNativeWazoDemo',
        imageName: 'sim_icon',
        supportsVideo: false,
        maximumCallGroups: '1',
        maximumCallsPerCallGroup: '1'
      },
      android: {
        alertTitle: 'Permissions Required',
        alertDescription:
          'This application needs to access your phone calling accounts to make calls',
        cancelButton: 'Cancel',
        okButton: 'ok',
        imageName: 'sim_icon',
        additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS]
      }
    };

    try {
      RNCallKeep.setup(options);
      RNCallKeep.setAvailable(true); // Only used for Android, see doc above.
    } catch (err) {
      console.error('initializeCallKeep error:', err.message);
    }
  }

  componentDidMount(){
    this.setup()
    this.firebaseFunctionCall()
  }

  displayIncomingCall( handle, localizedCallerName){
    
    const callUUID = uuid.v4();
    let number = String(Math.floor(Math.random() * 100000));
    RNCallKeep.displayIncomingCall(callUUID, number, "testddfgfdgdfge", 'numberdgdgdgdgdf', true);
  }


    // Use startCall to ask the system to start a call - Initiate an outgoing call from this point
  startCall = ({ handle, localizedCallerName }) => {

    console.log("Start call ")
    // Your normal start call action
    RNCallKeep.startCall(this.getCurrentCallId(), handle, localizedCallerName);
  };

  reportEndCallWithUUID = (callUUID, reason) => {
    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  }

  // Event Listener Callbacks

  didReceiveStartCallAction = (data) => {
    let { handle, callUUID, name } = data;
    // Get this event after the system decides you can start a call
    // You can now start a call from within your app
  };

  onAnswerCallAction = (data) => {  
    let { callUUID } = data;
    console.log("displayName",callUUID)
    // Called when the user answers an incoming call
    //  RNCallKeep.answerIncomingCall(uuid)
  };

  onEndCallAction = (data) => {
    let { callUUID } = data;
    RNCallKeep.endCall(this.getCurrentCallId());

    this.currentCallId = null;
  };

  // Currently iOS only
  onIncomingCallDisplayed = (data) => {
    let { error } = data;
    // You will get this event after RNCallKeep finishes showing incoming call UI
    // You can check if there was an error while displaying
  };

  onToggleMute = (data) => {
    let { muted, callUUID } = data;
    // Called when the system or user mutes a call
  };

  onToggleHold = (data) => {
    let { hold, callUUID } = data;
    // Called when the system or user holds a call
  };

  onDTMFAction = (data) => {
    let { digits, callUUID } = data;
    // Called when the system or user performs a DTMF action
  };

  audioSessionActivated = (data) => {
    // you might want to do following things when receiving this event:
    // - Start playing ringback if it is an outgoing call
  };

  getCurrentCallId = () => {
    if (!this.currentCallId) {
      this.currentCallId = uuid.v4();
    }

    return this.currentCallId;
  };




  
firebaseFunctionCall = () =>{
    messaging()
    .getToken()
    .then((fcmToken) => {
      if (fcmToken) {
        console.log("fcmTokenfcmTokenfcmToken",fcmToken)

      } else {
        console.log('[FCMService] User doesnt not have a device token');
      }
    })
    .catch((error) => {
      console.log('[FCMService] getToken rejected', error);
    });

     unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
    // Register background handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
  
//   // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
//   // console.log('Message handled in the background!', remoteMessage);
  
// });

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log(
    'Notification caused app to open from background state:',
    remoteMessage.notification,
  );
});

messaging()
.getInitialNotification()
.then(remoteMessage => {
  if (remoteMessage) {
    console.log(
      'Notification caused app to open from quit state:',
      remoteMessage.notification,
    );
  }

});

  }


//  const requestUserPermission = async()=> {
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
//     if (enabled) {
//       console.log('Authorization status:', authStatus);
//       firebaseFunctionCall()
//     }
//   }








  render() {
    return(
      <View>
      <TouchableOpacity onPress={()=>{this.displayIncomingCall({handle: "+919041908802",localizedCallerName: "Parshant Nagpal" })}}>
        <Text>Testtttt</Text>
       </TouchableOpacity> 
    </View>  
    )
 
  }
}