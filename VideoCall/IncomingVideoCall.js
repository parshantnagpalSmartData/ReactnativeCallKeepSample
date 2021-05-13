/* eslint-disable react/self-closing-comp */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { Component, Fragment } from "react";
import {
  I18nManager,
  View,
  Image,
  StatusBar,
  ImageBackground,
  Text,
  SafeAreaView,
  TouchableWithoutFeedback,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Colors, Strings } from "../../Constants";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { getItem, storeItem } from "../../Utils/AsyncUtils";
import LinearGradient from "react-native-linear-gradient";
import COLORS from "../../Constants/Colors";

const topImage = require("../../Assets/splashscreenImageTop.png");
const centerImage = require("../../Assets/logo_splashscreen.png");
const bottomImage = require("../../Assets/splashscreenImageBottom.png");
import { SocketIO } from "../../Utils/SocketIO";

//++ Multi Language
import I18n from "i18n-js";
import memoize from "lodash.memoize";

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  en: () => require("../../translations/en.json"),
  es: () => require("../../translations/es.json"),
};

const translate = memoize(
  (key, config) => I18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);
//-- Multi Language

// Import the react-native-sound module
var Sound = require("react-native-sound");

// Enable playback in silence mode
Sound.setCategory("Playback");

var sound = null;

export default class IncomingVideoCall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channelDetailsFromWebRtc: null,
      image: "",
      name: "",
    };
  }

  async componentDidMount() {
    const langData = await getItem(Strings.SELECTED_LANGUAGE);

    try {
      if (langData) {
        this.setI18nConfig(langData); // set initial config
      } else {
        this.setI18nConfig("en"); // set initial config
      }
    } catch (e) {}

    try {
      if (this.props.navigation.getParam("data") !== null) {
        this.setState({
          channelDetailsFromWebRtc: this.props.navigation.getParam("data"),
        });
        this.setState({
          image: this.props.navigation.getParam("image"),
        });
        this.setState({
          name: this.props.navigation.getParam("name"),
        });
      }
    } catch (e) {
      console.log("SWAPIVC >> ", e);
    }

    //play sound
    this.setPlayer();
  }

  setI18nConfig = (languageTag) => {
    // clear translation cache
    translate.cache.clear();
    // update layout direction
    I18nManager.forceRTL(false); //isRTL
    // set i18n-js config
    I18n.translations = {
      [languageTag]: translationGetters[languageTag](),
    };
    I18n.locale = languageTag;
  };

  setPlayer = () => {
    try {
      // Load the sound file 'whoosh.mp3' from the app bundle
      // See notes below about preloading sounds within initialization code below.
      //Sound.MAIN_BUNDLE
      //www.noiseaddicts.com
      //https://github.com/zmxv/react-native-sound
      // const url = "https://mdustry.com/ringtone/calling-tone-new.mp3";
      const url = require("../../Assets/audio/calling-tone.mp3");
      sound = new Sound(url, (error, sounds) => {
        if (error) {
          console.log("SWAPSOUND>> failed to load the sound", error);
          return;
        }
        // loaded successfully
        console.log(
          "SWAPSOUND>> duration in seconds: " +
            sound.getDuration() +
            "number of channels: " +
            sound.getNumberOfChannels()
        );

        // Play the sound with an onEnd callback
        // sound.play((success) => {
        //   if (success) {
        //     console.log("SWAPSOUND>> successfully finished playing");
        //   } else {
        //     console.log(
        //       "SWAPSOUND>> playback failed due to audio decoding errors"
        //     );
        //   }
        // });

        sound.play((success) => {
          sound.play((success) => {
            sound.play((success) => {
              sound.play((success) => {
                sound.play((success) => {
                  sound.play((success) => {
                    sound.play((success) => {
                      sound.play((success) => {
                        sound.play((success) => {
                          sound.play((success) => {
                            this.stopPlayer();
                            this.callSocketEmit();
                            this.props.navigation.goBack();
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });

      // Reduce the volume by half
      sound.setVolume(1);

      // Position the sound to the full right in a stereo field
      //sound.setPan(1);

      // Loop indefinitely until stop() is called
      //sound.setNumberOfLoops(-1);
      //console.log("loops: " + sound.getNumberOfLoops());

      console.log("SWAPSOUND>>  setPlayer Done");
    } catch (err) {
      console.log("SWAPSOUND>>  " + err);
    }
  };

  stopPlayer = () => {
    try {
      // Pause the sound
      sound.pause();

      // Stop the sound and rewind to the beginning
      sound.stop(() => {
        // Note: If you want to play a sound after stopping and rewinding it,
        // it is important to call play() in a callback.
        //whoosh.play();
        // Release the audio player resource
        sound.release();
      });
    } catch (err) {
      console.log("SWAPSOUND>>  " + err);
    }
  };

  callSocketEmit = () => {
    try {
      SocketIO.emit("patient-request-rejected", {
        patient_id: this.state.channelDetailsFromWebRtc.to._id,
        doctor_id: this.state.channelDetailsFromWebRtc.from._id,
      });
      console.log("SWAPSOUND>>  patient-request-rejected >>>>>> ");
    } catch (e) {
      console.log("SWAPSOUND>>  patient-request-rejected >>> Error = " + e);
    }
  };

  componentWillUnmount() {
    try {
      // Release the audio player resource
      sound.release();
    } catch (err) {
      console.log("SWAPSOUND>>  " + err);
    }
  }

  render() {
    let colors = ["#00000000", "#00000000", COLORS.TRANS_BLACK, COLORS.black];

    return (
      <Fragment>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: COLORS.WHITE_COLOR,
          }}
          forceInset={{ top: "never" }}
        >
          {this.state.channelDetailsFromWebRtc != null ? (
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.WHITE_COLOR,
              }}
            >
              <Image
                source={{
                  uri: this.state.image,
                }}
                //source={require("../../Assets/doc.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  flex: 1,
                }}
                renderPlaceholderContent={
                  <ActivityIndicator color={COLORS.PRIMARY_COLOR} />
                }
              />

              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "30%",
                  bottom: 1,
                }}
              >
                <LinearGradient
                  colors={colors}
                  useAngle={true}
                  angle={180}
                  style={{
                    flex: 1,
                    borderRadius: 0,
                    shadowColor: COLORS.grey_400,
                    shadowOffset: {
                      width: 0,
                      height: 8,
                    },
                    shadowOpacity: 0.44,
                    shadowRadius: 10.32,
                    elevation: 16,
                  }}
                ></LinearGradient>
              </View>

              <TouchableWithoutFeedback
                onPress={() => {
                  {
                    this.stopPlayer();
                    this.props.navigation.goBack();
                    this.props.navigation.navigate("VideoCallScreen", {
                      data: this.state.channelDetailsFromWebRtc,
                    });
                  }
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    bottom: hp(12),
                    alignSelf: "flex-start",
                  }}
                >
                  <Image
                    style={{
                      height: hp(10),
                      width: hp(10),
                      marginStart: wp(20),
                    }}
                    resizeMode="contain"
                    source={require("../../Assets/accept_call.png")}
                  />
                </View>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback
                onPress={() => {
                  this.stopPlayer();
                  this.callSocketEmit();
                  this.props.navigation.goBack();
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    bottom: hp(12),
                    alignSelf: "flex-end",
                  }}
                >
                  <Image
                    style={{
                      height: hp(10),
                      width: hp(10),
                      marginEnd: wp(20),
                    }}
                    resizeMode="contain"
                    source={require("../../Assets/reject_call.png")}
                  />
                </View>
              </TouchableWithoutFeedback>

              <View
                style={{
                  position: "absolute",
                  bottom: hp(4),
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.WHITE_COLOR,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {this.state.name}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.background_color,
              }}
            ></View>
          )}
        </SafeAreaView>
      </Fragment>
    );
  }
}
