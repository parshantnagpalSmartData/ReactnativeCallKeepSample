import React, { Component } from 'react';
import { View, Dimensions, Image , TouchableWithoutFeedback, TouchableOpacity, Alert} from 'react-native';
import { OTSession, OTPublisher, OTSubscriber, OT } from 'opentok-react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import Icon from 'react-native-vector-icons/Ionicons';
import IconEntypo from 'react-native-vector-icons/Entypo';


const bottomImage = require("./Assets/chat_bottom.png");

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
     
      subscriberWidth: 100,
      subscriberHeight: 100,
   //publisher
      publisherProperties: {
        publishAudio: true,
        publishVideo: true,
        cameraPosition: "front",
      },
      actionType: "camera",
      publisherEventStreamId: "",
      publisherCameraPosition: "front",
      publisher: "",
      audioTrack: true,
      publishAudio: true,
      streamProperties: {},
    };
    this.apiKey = "47228604";
    this.sessionId =
      "1_MX40NzIyODYwNH5-MTYyMDkxNTI1MTkxNX5wTnhHT1dsMnVvL0c4YkhNbG9TUHU3UjJ-fg";
    this.token =
      "T1==cGFydG5lcl9pZD00NzIyODYwNCZzaWc9ZTBjOGUxNTVjOGU4NzRiNmRhMmExMzgwOWY4NmVkNmNiNzllNDc2ZDpzZXNzaW9uX2lkPTFfTVg0ME56SXlPRFl3Tkg1LU1UWXlNRGt4TlRJMU1Ua3hOWDV3VG5oSFQxZHNNblZ2TDBjNFlraE5iRzlUVUhVM1VqSi1mZyZjcmVhdGVfdGltZT0xNjIwOTE1MzExJm5vbmNlPTAuODE2NTgyNzQzMjE4ODUxNSZyb2xlPW1vZGVyYXRvciZleHBpcmVfdGltZT0xNjIzNTA3MzEwJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9";
      this.sessionOptions = {
        // connectionEventsSuppressed: true, // default is false
        // androidZOrder: 'onTop', // Android only - valid options are 'mediaOverlay' or 'onTop'
        androidOnTop: 'publisher',  // Android only - valid options are 'publisher' or 'subscriber'
        // useTextureViews: true,  // Android only - default is false
        // isCamera2Capable: false, // Android only - default is false
        // ipWhitelist: false, // https://tokbox.com/developer/sdks/js/reference/OT.html#initSession - ipWhitelist
        // enableStereoOutput: true // Enable stereo output, default is false
        
      };
    }
   


    _switchCamera = () =>{
      try {
        console.log(
          "SWAPVC >> _switchCamera = ",
          JSON.stringify(this.state.publisherProperties)
        );
        let publisherProperties = {...this.state.publisherProperties}

        var campos = this.state.publisherCameraPosition === "front" ? "back" : "front";
        this.setState({ publisherCameraPosition: campos, actionType: 'camera' });
        publisherProperties.cameraPosition = campos;
  

        // const publisherProperties = {
        //   ...publisherProperties, actionType,
        //   // [this.state.publisherEventStreamId]: {
        //   //   publishAudio: true, publishVideo: true,
        //   //   cameraPosition: campos,
        //   // },
        // };
        console.log("publisherPropertiespublisherProperties,",publisherProperties)
        this.setState({ publisherProperties });
  
        try {
          OT.changeCameraPosition(this.state.publisherEventStreamId, campos);
        } catch (ex) { }
      } catch (e) {
        console.log("SWAPVC >> _switchCamera Err = ", e);
      }
    }  
    
    
  _switchMic() {
    try {
      var audPos = !this.state.publishAudio;
      this.setState({
        publishAudio: audPos, actionType: 'mic'
      });

      let publisherProperties = {...this.state.publisherProperties}
      publisherProperties.publishAudio = audPos;
      // const publisherProperties = {
      //   ...this.state.publisherProperties, ...this.state.actionType,
      //   [this.state.publisherEventStreamId]: {
      //     publishAudio: audPos,
      //     publishVideo: true,
      //     cameraPosition: this.state.publisherCameraPosition,
      //   },
      // };
      this.setState({ publisherProperties });
      try {
        OT.publishAudio(this.state.publisherEventStreamId, audPos);
      } catch (ex) { }
    } catch (e) {
      console.log("SWAPVC >> _switchMic Err = ", e);
    }
  }

  _callCut() {
    Alert.alert(
      "App Name ",
      "DISCONNECT_CALL",
      [
        {
          text: "YES",
          onPress: () => {
            this._goBack();
            // if (this.state.subscriberCount === 1) {
            //   this.callEndApiCall();
            // } else {
            //   this._goBack();
            // }
          },
        },
        {
          text: translate("NO"),
          onPress: () => { },
        },
      ],
      { cancelable: false }
    );
  }

  _switchSound() {
    try {
      var audPos = !this.state.audioTrack;
      this.setState({
        audioTrack: audPos,
      });
      let streamProperties = {...this.state.streamProperties}

      
      streamProperties.subscribeToAudio = audPos;
      this.setState({streamProperties})

      try {
        OT.subscribeToAudio(this.state.streamConnectionId, audPos);
      } catch (ex) { }
    } catch (e) {
      console.log("SWAPVC >> _switchSound Err = ", e);
    }
  }


   
  render() {
    return (
      <View style={{ flex: 1 }}>
        <OTSession apiKey={this.apiKey} sessionId={this.sessionId} token={this.token} options={this.sessionOptions}>
          <OTPublisher style={{
            
            
            
            width: 200, height: 200 ,
            borderColor: "#BAC6CD",
            backgroundColor: "#FFF",
            borderWidth: 1,
            borderRadius: 15,
            overflow: "hidden",
            padding: 5,
            margin: 20,
            // justifyContent: "flex-end",
            position: "absolute",
            alignSelf: "stretch",
            bottom : 100,
            right :20,
            zIndex : 10

            }} 
            properties={this.state.publisherProperties}
            
            />
          <OTSubscriber  style={{
                width: "100%",
                height: "100%",
                // width: windowWidth,
                // height: windowHeight,
                alignSelf: "stretch", 
                insertMode: "append",
    
        
              }}
              streamProperties={this.state.streamProperties}
              
              />
        </OTSession>


        <View
          style={{
            position: "absolute",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.1)",
            height: 28,
          }}
        >
          <Image
            source={bottomImage}
            containerStyle={{
              width: 100,
              height: 15,
              backgroundColor: "transparent",
            }}
          />
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            this._callCut();
          }}
        >
          <View
            style={{
              position: "absolute",
              height: 80,
              width: 80,
              borderRadius: 40,
              backgroundColor: "#F21D53",
              bottom: 40,
              alignSelf: "center",
              justifyContent: "center",
              marginStart: 1.5,
              alignItems: "center"
            }}
          >
            <Image
              containerStyle={{
                height: 50,
                width: 50,
           
              }}
              resizeMode="contain"
              source={require("./Assets/contact.png")}
            />
          </View>
        </TouchableWithoutFeedback>
     
        <TouchableOpacity
          style={{
    


            position: "absolute",
            borderColor: "white",
            backgroundColor:  "white",
            borderWidth: 1,
            borderRadius: 15,
            marginBottom: 20,
            right:5,
            width: 50,
            height: 50,
            bottom: 5,
            alignSelf: "flex-end",
          }}
          onPress={() => this._switchMic()}>
          {/* <Icon
            style={{
              flex: 0.1,
              opacity: 1,
            }}
            containerStyle={{
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: 2,
            }}
            name={this.state.publishAudio ? "ios-mic" : "ios-mic-off"}
            type="ionicon"
            size={40}
            color="#0074FF" */}
          {/* /> */}
          <Icon 
           size={40}
          name={this.state.publishAudio ? "ios-mic" : "ios-mic-off"}  color="#0074FF" /> 
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor:  "white",
            backgroundColor:  "white", borderWidth: 1,
            borderRadius: 15, marginBottom: 100,
            right: 5, width: 50,
            height: 50, bottom: 12, alignSelf: "flex-end",
          }}
          onPress={() => this._switchSound()}>
          {/* <Icon
            style={{ flex: 0.1, opacity: 1 }}
            containerStyle={{
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: 2,
            }}
            name={this.state.audioTrack ? "sound" : "sound-mute"}
            type="entypo"
            size={30}
            color="#0074FF"
          /> */}
                <IconEntypo 
         size={50}
           name={this.state.audioTrack ? "sound" : "sound-mute"}  color="#0074FF" /> 
        </TouchableOpacity>
        {/* sound-mute */}

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor:  "white",
            backgroundColor:  "white",
            borderWidth: 1, borderRadius: 15,
            marginBottom: 20, width: 50, height: 50,
            bottom: 5, marginLeft: 6,
            alignSelf: "flex-start",
          }}
          onPress={() => this._switchCamera()}>
          {/* <Icon
            style={{ flex: 0.1, opacity: 1 }}
            containerStyle={{
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: 0.7,
            }}
            name="camera"
            type="ionicon"
            size={36}
            color="#0074FF" */}
          {/* /> */}
           <Icon 
          size={50}
         name="camera"  color="#0074FF" /> 
        </TouchableOpacity>
      </View>
    );
  }
}

export default App;