import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { OTSession, OTPublisher, OTSubscriber } from 'opentok-react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
     
      subscriberWidth: 100,
      subscriberHeight: 100,
      
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

            }} />
          <OTSubscriber  style={{
                width: "100%",
                height: "100%",
                // width: windowWidth,
                // height: windowHeight,
                alignSelf: "stretch", 
                insertMode: "append",
                        // justifyContent: "flex-end",
        
              }}/>
        </OTSession>
      </View>
    );
  }
}

export default App;