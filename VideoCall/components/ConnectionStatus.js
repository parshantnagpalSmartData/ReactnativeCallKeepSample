import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';

class ConnectionStatus extends Component {
  render() {
    let status = this.props.connected ? 'Connected' : 'Disconnected';
    return (
      <View>
        <Text>Status:</Text> {status}
      </View>
    );
  }
}

export default ConnectionStatus;
