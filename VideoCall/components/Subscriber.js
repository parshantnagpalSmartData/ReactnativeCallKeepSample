import React, { Component } from 'react';
import { OTSubscriber } from 'opentok-react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';

class Subscriber extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      audio: true,
      video: true
    };
  }

  setAudio = (audio) => {
    this.setState({ audio });
  }

  setVideo = (video) => {
    this.setState({ video });
  }

  onError = (err) => {
    this.setState({ error: `Failed to subscribe: ${err.message}` });
  }

  render() {
    return (
      <View>
        <Text>Subscriber</Text>
        {this.state.error ? <Text>{this.state.error}</Text> : null}
        <OTSubscriber
          style={{ width: 200, height: 200 }}
          properties={{
            subscribeToAudio: this.state.audio,
            subscribeToVideo: this.state.video
          }}
          onError={this.onError}
        />
      </View>
    );
  }
}

export default Subscriber;
