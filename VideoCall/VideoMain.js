/**
 * Video Main Screen
 */

import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { OTSession, OTStreams, preloadScript } from "opentok-react-native";

import ConnectionStatus from "./components/ConnectionStatus";
import Publisher from "./components/Publisher";
import Subscriber from "./components/Subscriber";

class VideoMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      connected: false,
    };

    this.apiKey = "46724492";
    this.sessionId =
      "1_MX40NjcyNDQ5Mn5-MTU4OTg2NDcwNDAzMH5tYUk4T0lEWmZHR1Y0T0xWMmZtY2hHclF-fg";
    this.token =
      "T1==cGFydG5lcl9pZD00NjcyNDQ5MiZzaWc9YjI4NDZjOGZlNmZkYzIxY2RkZWU0M2Y2NGNhYjExMGExMjE0NjI5YzpzZXNzaW9uX2lkPTFfTVg0ME5qY3lORFE1TW41LU1UVTRPVGcyTkRjd05EQXpNSDV0WVVrNFQwbEVXbVpIUjFZMFQweFdNbVp0WTJoSGNsRi1mZyZjcmVhdGVfdGltZT0xNTg5ODY0NzUzJm5vbmNlPTAuNjU5NzAxODQ3NDAzODQwNyZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNTg5ODg2MzUzJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9";

    this.sessionEvents = {
      sessionConnected: () => {
        this.setState({ connected: true });
      },
      sessionDisconnected: () => {
        this.setState({ connected: false });
      },
    };
  }

  onError = (err) => {
    this.setState({ error: `Failed to connect: ${err.message}` });
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <OTSession
          apiKey={this.apiKey}
          sessionId={this.sessionId}
          token={this.token}
          eventHandlers={this.sessionEvents}
          onError={this.onError}
        >
          {this.state.error ? <View>{this.state.error}</View> : null}
          <ConnectionStatus connected={this.state.connected} />
          <Publisher />
          <OTStreams>
            <Subscriber />
          </OTStreams>
        </OTSession>
      </View>
    );
  }
}

export default preloadScript(VideoMain);
