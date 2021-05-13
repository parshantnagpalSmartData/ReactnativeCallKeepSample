import React, { Component } from 'react';
import { OTPublisher } from 'opentok-react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';

class Publisher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      audio: true,
      video: true,
      videoSource: 'camera'
    };
  }

  setAudio = (audio) => {
    this.setState({ audio });
  }

  setVideo = (video) => {
    this.setState({ video });
  }

  changeVideoSource = (videoSource) => {
    (this.state.videoSource !== 'camera') ? this.setState({ videoSource: 'camera' }) : this.setState({ videoSource: 'screen' })
  }

  onError = (err) => {
    this.setState({ error: `Failed to publish: ${err.message}` });
  }

  render() {
    return (
      <View>
        <Text>Publisher</Text>
        <OTPublisher
          style={{ width: 200, height: 200 }}
          properties={{
            publishAudio: this.state.audio,
            publishVideo: this.state.video,
            videoSource: this.state.videoSource === 'screen' ? 'screen' : undefined
          }}
          onError={this.onError}
        />
      </View>
    );
  }
}

export default Publisher;
