/* eslint-disable react-native/no-inline-styles */
import React, { Component, Fragment } from "react";
import {
  I18nManager,
  Alert,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  FlatList,
  TouchableOpacity,
  BackHandler,
  NativeModules,
  Image as Image1,
} from "react-native";
import CustomLoader from "../../Utils/CustomLoader";
import COLORS from "../../Constants/Colors";
import Header from "../Settings/SettingsHeader";
import API from "../../Constants/APIUrls";
import {
  validateEmail,
  validateIsEmpty,
  validatePhoneNumber,
} from "../../Utils/Validations";
import {
  Icon,
  Avatar,
  Image,
  Button,
  Input,
  Badge,
} from "react-native-elements";
import { getItem, storeItem, removeItem } from "../../Utils/AsyncUtils";
import { Colors, Strings } from "../../Constants";
import { ActivityIndicator } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import LinearGradient from "react-native-linear-gradient";
import { RFC_2822 } from "moment";
import Modal from "react-native-modal";
import axiosConfig from "../../Utils/AxiosConfig";
import { checkIsPhone } from "@utils/Common";

import { OTSession, OTPublisher, OTSubscriber, OT } from "opentok-react-native";

var colors = ["#00B4FF", "#0074FF"];
var colorsGray = ["#00000000", "#00000000", "#000000"];
const docImage = require("../../Assets/doc.png");
const bottomImage = require("../../Assets/chat_bottom.png");
const addImage = require("../../Assets/add_circular3x.png");

import {
  setUserAsBusyApi,
  forceDisconnectSession,
  getSessionTokenApi,
  sendJoinCallReqApi,
} from "../../Actions/ActionCreators";
import { withNavigation } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

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

class VideoCallScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: "",
      isDialogueVisible: false,
      isAddNewUserDialogueVisible: false,
      isListUserDialogueVisible: false,
      isLoading: false,

      userPic: "",
      name: "",

      channelDetailsFromWebRtc: null,
      setUserAsBusyDataRes: "",

      apiKey: Strings.OPENTOK_APIKEY,
      sessionId: "",
      tokenId: "",

      streamProperties: {},
      isConnected: false,

      subscribersArr: [],
      sessionConnectionId: "",
      streamConnectionId: "",

      forceDisconnectDataRes: "",
      getSessionTokenDataRes: "",
      sendJoinCallApiDataRes: "",

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

      callDisconnectApi: false,
      disconnectSession: false,

      //list
      dataList: [
        {
          firstName: "adasdasd",
          lastName: "asdasd",
          avatar: "",
          isAvailable: true,
        },
      ],

      firstName: "",
      lastName: "",
      emailId: "",

      audioTrack: true,
      publishAudio: true,

      groupCallIsConnect: false,

      subscriberWidth: 100,
      subscriberHeight: 100,
      subscriberCount: 0,

      // For getting User Channel Information
      getChatChannelInfoDataRes: null,
      doctorID: "",
      gotResponseOnce: false,

      // For creating new chat channel
      createMessageChannelDataRes: null,
    };

    //Session
    this.otSessionRef = React.createRef();
    this.otPublisherRef = React.createRef();
    this.otSubscriberRef = React.createRef();
    this.sessionEventHandlers = {
      streamCreated: (event) => {
        console.log("SWAPVC >> Stream created: ", JSON.stringify(event));
        try {
          const streamProperties = {
            ...this.state.streamProperties,
            [event.streamId]: {
              subscribeToAudio: true,
              subscribeToVideo: true,
              insertMode: "append",
            },
          };
          this.setState({ streamProperties });

          this.addStream();

          //adding data
          event.connection.data = this.state.userInfo._id;
          this.state.streamConnectionId = event.streamId;
          this.setState({ streamConnectionId: event.streamId });
        } catch (e) {
          console.log("SWAPVC >> Stream created error: " + e);
        }
      },
      streamDestroyed: (event) => {
        console.log("SWAPVC >> Stream destroyed: ", JSON.stringify(event));
        this.removeStream();
      },
      sessionConnected: (event) => {
        console.log("SWAPVC >> session connected: ", JSON.stringify(event));
        this.setState({
          isConnected: true,
        });
      },
      connectionCreated: (event) => {
        console.log("SWAPVC >> connection created", JSON.stringify(event));
      },
      connectionDestroyed: (event) => {
        console.log("SWAPVC >> connection destroyed Props", props);
        console.log("SWAPVC >> connection destroyed", JSON.stringify(event));
        this._goBack();
      },
      sessionDisconnected: (event) => {
        console.log("SWAPVC >> Client disConnect to a session");
        this.setState({
          isConnected: false,
        });
        this._goBack();
      },
      sessionReconnected: (event) => {
        console.log("SWAPVC >> session reconnected");
      },
    };

    this.sessionOptions = {
      connectionEventsSuppressed: true, // default is false
      androidZOrder: "onTop", // Android only - valid options are 'mediaOverlay' or 'onTop'
      androidOnTop: "publisher", // Android only - valid options are 'publisher' or 'subscriber'
      useTextureViews: true, // Android only - default is false
      isCamera2Capable: false, // Android only - default is false
      ipWhitelist: false, // https://tokbox.com/developer/sdks/js/reference/OT.html#initSession - ipWhitelist
    };

    //subscriber
    this.subscriberProperties = {
      subscribeToAudio: true,
      subscribeToVideo: true,
    };

    this.subscriberEventHandlers = {
      error: (error) => {
        console.log(
          "SWAPVC >> There was an error with the subscriber: ",
          error
        );
      },
    };

    //Publisher
    this.publisherEventHandlers = {
      streamCreated: (event) => {
        console.log(
          "SWAPVC >> Publisher stream created: ",
          JSON.stringify(event)
        );

        try {
          const publisherProperties = {
            ...this.state.publisherProperties,
            [event.streamId]: {
              publishAudio: true,
              publishVideo: true,
              cameraPosition: "front",
            },
          };
          this.setState({ publisherProperties });
          this.setState({ publisherEventStreamId: event.streamId });
          //adding data
          this.setState({ sessionConnectionId: event.connection });
        } catch (e) {
          console.log("SWAPVC >> Publisher Stream created error: " + e);
        }
      },
      streamDestroyed: (event) => {
        console.log(
          "SWAPVC >> Publisher stream destroyed: ",
          JSON.stringify(event)
        );
      },
    };
  }

  getPublisher() {
    if (this.otPublisherRef) {
      this.setState({
        publisher: this.otPublisherRef.current.getPublisher(),
      });
    }
  }

  addStream() {
    var stream = this.state.subscriberCount + 1;
    this.setState({ subscriberCount: stream });
    this.setSubscriberArea(stream);
  }

  removeStream() {
    if (this.state.subscriberCount > 1) {
      var stream = this.state.subscriberCount - 1;
      this.setState({ subscriberCount: stream });
      this.setSubscriberArea(stream);
    } else {
      this.setState({
        isConnected: false,
      });
      this._goBack();
    }
  }

  setSubscriberArea(stream) {
    if (stream === 1) {
      this.setState({ subscriberWidth: 100, subscriberHeight: 100 });
    } else if (stream === 2) {
      this.setState({ subscriberWidth: 100, subscriberHeight: 50 });
    } else if (stream === 3 || stream === 4) {
      this.setState({ subscriberWidth: 50, subscriberHeight: 50 });
    } else {
      this.setState({ subscriberWidth: 20, subscriberHeight: 20 });
    }
  }

  _goBack() {
    this.props.navigation.goBack();
  }

  async componentDidMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );

    const userData = await getItem(Strings.USER_DATA);
    if (userData) {
      this.setState({
        userInfo: userData.data,
      });
    }

    try {
      const langData = await getItem(Strings.SELECTED_LANGUAGE);
      if (langData) {
        this.setI18nConfig(langData); // set initial config
      } else {
        this.setI18nConfig("en"); // set initial config
      }
    } catch (e) { }

    try {
      if (this.props.navigation.getParam("data") !== null) {
        this.setState({
          channelDetailsFromWebRtc: this.props.navigation.getParam("data"),
        });
      }
      //call api
      this.joinMultipleCall();
    } catch (e) {
      console.log("SWAPVC >> ", e);
    }

    //publisher
    //this.getPublisher();
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

  joinMultipleCall() {
    if (
      this.state.channelDetailsFromWebRtc.hasOwnProperty(
        "alreadyExistingSessionToken"
      ) &&
      this.state.channelDetailsFromWebRtc.alreadyExistingSessionToken
    ) {
      this.openGroupCall(false);
    } else {
      this.openGroupCall(true);
    }
  }

  openGroupCall(isConnect) {
    try {
      this.setState({ groupCallIsConnect: isConnect });
      let isTokenExist = false;
      if (
        this.state.channelDetailsFromWebRtc.hasOwnProperty(
          "alreadyExistingSessionToken"
        ) &&
        this.state.channelDetailsFromWebRtc.alreadyExistingSessionToken
      ) {
        isTokenExist = true;
      }
      if (isTokenExist) {
        console.log("SWAPLOG >> if there isTokenExist ::::>>>");
        //get sessin token
        this.callSessionTokenApi();
      } else {
        console.log("SWAPLOG >> else part there isTokenExist ::::>>>");
        //set user busy
        this.setState({
          apiKey: Strings.OPENTOK_APIKEY,
          sessionId: this.state.channelDetailsFromWebRtc.option.openTok.session,
          tokenId: this.state.channelDetailsFromWebRtc.option.openTok.token,
        });
        this.callSetUserBusyApi();
      }
    } catch (e) {
      console.log("SWAPLOG >> " + e);
    }
  }

  callSetUserBusyApi() {
    try {
      //call Api
      let postData = {
        publisher_id: this.state.userInfo._id,
        subscriber_id: this.state.channelDetailsFromWebRtc.option.openTok
          .session,
      };

      this.setState({
        isLoading: true,
      });
      this.props.setUserAsBusyApi(postData);
    } catch (e) { }
  }

  callSessionTokenApi() {
    //call Api
    let postData = {
      token: this.state.channelDetailsFromWebRtc.alreadyExistingSessionToken,
    };

    this.setState({
      isLoading: true,
    });
    this.props.getSessionTokenApi(postData);
  }

  callWebRtcApi(isAll, callOptionsDetails) {
    try {
      this.setState({
        isLoading: true,
      });
      if (isAll) {
        axiosConfig
          .post(API.WEBRTC_URL, {
            // Request Body
            to: callOptionsDetails.to,
            status: 1,
            from: this.state.userInfo,
            option: callOptionsDetails,
            room: callOptionsDetails.room,
            alreadyExistingSessionToken: callOptionsDetails.option.openTok
              ? callOptionsDetails.option.openTok.session
              : callOptionsDetails.option.option.openTok.session,
            newlyAddedPatientRequest: true,
            initiatorConnectionObj: callOptionsDetails.initiatorConnectionObj,
          })
          .then((response) => {
            this.setState({
              isLoading: false,
            });
            console.log("SWAPLOG : webrtc ", JSON.stringify(response.data));
            this._showMessage("Request Sent Successfully to patient.");
          })
          .catch((err) => {
            this.setState({
              isLoading: false,
            });
            console.log("SWAPLOG : Error webrtc ", err);
            throw err;
          });
      } else {
        axiosConfig
          .post(API.WEBRTC_URL, {
            // Request Body
            to: callOptionsDetails.to,
            status: 1,
            from: this.state.userInfo,
            option: callOptionsDetails,
            room: callOptionsDetails.room,
          })
          .then((response) => {
            this.setState({
              isLoading: false,
            });
            console.log("SWAPLOG : webrtc ", JSON.stringify(response.data));
          })
          .catch((err) => {
            this.setState({
              isLoading: false,
            });
            console.log("SWAPLOG : Error webrtc ", err);
            throw err;
          });
      }
    } catch (err) {
      console.log("SWAPLOG : Error webrtc ", err);
      this.setState({
        isLoading: false,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    
    //set user busy
    if (prevState.setUserAsBusyDataRes !== this.state.setUserAsBusyDataRes) {
      this.setState({
        isLoading: false,
      });
      let setUserAsBusyData = this.state.setUserAsBusyDataRes;
      if (setUserAsBusyData && setUserAsBusyData.code === 200) {
        // write code for stop ring after accepting call
      }
    }

    //get Separate Token
    if (
      prevState.getSessionTokenDataRes !== this.state.getSessionTokenDataRes
    ) {
      this.setState({
        isLoading: false,
      });
      let getSessionTokenData = this.state.getSessionTokenDataRes;
      if (getSessionTokenData && getSessionTokenData.code === 200) {
        // write code for stop ring after accepting call and group session token
        if (
          !this.state.groupCallIsConnect &&
          !this.state.channelDetailsFromWebRtc.hasOwnProperty(
            "newlyAddedPatientRequest"
          ) &&
          !this.state.channelDetailsFromWebRtc.newlyAddedPatientRequest
        ) {
          console.log("SWAPLOG : webrtc ", " Api Call");
          var callOptionsDetails = this.state.channelDetailsFromWebRtc;
          this.callWebRtcApi(false, callOptionsDetails);
          // if (window.cordova && ringCall) {
          //   ringCall.play();
          // }
        } else {
          // if (window.cordova) {
          //   ringCall.stop();
          // }
        }

        //initialize view
        this.setState({
          apiKey: Strings.OPENTOK_APIKEY,
          sessionId: this.state.channelDetailsFromWebRtc.option.option.openTok
            .session,
          tokenId: this.state.channelDetailsFromWebRtc.option.option.openTok
            .token,
        });
      }
    }

    //send join api call
    if (
      prevState.sendJoinCallApiDataRes !== this.state.sendJoinCallApiDataRes
    ) {
      this.setState({
        isLoading: false,
      });
      let sendJoinCallApiData = this.state.sendJoinCallApiDataRes;
      if (sendJoinCallApiData && sendJoinCallApiData.code === 200) {
        // write code for adding new user
        this._showMessage(translate("INVITATION_SENT"));
      } else if (sendJoinCallApiData && sendJoinCallApiData.code === 208) {
        // write code for adding existing user

        var callOptionsDetails = this.state.channelDetailsFromWebRtc;

        callOptionsDetails.to = {
          avatar: sendJoinCallApiData.data.avatar,
          name:
            sendJoinCallApiData.data.firstName +
            " " +
            sendJoinCallApiData.data.lastName,
          _id: sendJoinCallApiData.data._id,
        };

        if (
          callOptionsDetails &&
          callOptionsDetails.option &&
          callOptionsDetails.option.users
        ) {
          callOptionsDetails.option.users.to = sendJoinCallApiData.data._id;
        } else {
          callOptionsDetails.option.option.users = {
            from: this.state.userInfo._id,
            to: callOptionsDetails.to._id,
          };
        }

        //call Api
        console.log("SWAPLOG : webrtc ", " Api Call for group call");
        this.callWebRtcApi(true, callOptionsDetails);
      }
    }
    if (
      prevState.forceDisconnectDataRes !== this.state.forceDisconnectDataRes
    ) {
      this.setState({
        isLoading: false,
      });
      this.setState({
        callDisconnectApi: false,
      });
      let forceDisconnectData = this.state.forceDisconnectDataRes;
      if (forceDisconnectData && forceDisconnectData.code === 200) {
        this._goBack();
      } else {
        this._goBack();
      }
    }
  }

  handleBackButtonClick() {
    if (this.props.navigation.isFocused()) {
      return true;
    }
  }

  componentWillUnmount() {
    console.log("SWAPVC : >>> componentWillUnmount VideoCallScreen");
    this.setState({
      isConnected: false,
    });
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let update = {};
    if (
      nextProps.VideoCallReducer.setUserAsBusyDataRes !==
      prevState.setUserAsBusyDataRes
    ) {
      update.setUserAsBusyDataRes =
        nextProps.VideoCallReducer.setUserAsBusyDataRes;
    }
    if (
      nextProps.VideoCallReducer.getSessionTokenDataRes !==
      prevState.getSessionTokenDataRes
    ) {
      update.getSessionTokenDataRes =
        nextProps.VideoCallReducer.getSessionTokenDataRes;
    }
    if (
      nextProps.VideoCallReducer.sendJoinCallApiDataRes !==
      prevState.sendJoinCallApiDataRes
    ) {
      update.sendJoinCallApiDataRes =
        nextProps.VideoCallReducer.sendJoinCallApiDataRes;
    }
    if (
      nextProps.VideoCallReducer.forceDisconnectDataRes !==
      prevState.forceDisconnectDataRes
    ) {
      update.forceDisconnectDataRes =
        nextProps.VideoCallReducer.forceDisconnectDataRes;
    }
    return update;
  }

  _toggleDialogue() {
    this.setState({ isDialogueVisible: !this.state.isDialogueVisible });
  }

  _toggleNewUserDialogue() {
    if (this.state.subscriberCount >= 4) {
      this._showMessage(translate("CANT_ADD_MORE_PARIENT"));
    } else {
      this.setState({ isDialogueVisible: false });

      setTimeout(() => {
        this.setState({
          isAddNewUserDialogueVisible: !this.state.isAddNewUserDialogueVisible,
        });
      }, 200);
    }
  }

  _toggleListUserDialogue() {
    this.setState({ isDialogueVisible: false });
    this.setState({ isAddNewUserDialogueVisible: false });

    setTimeout(() => {
      this.setState({
        isListUserDialogueVisible: !this.state.isListUserDialogueVisible,
      });
    }, 200);
  }

  getSessionId() {
    try {
      if (this.state.channelDetailsFromWebRtc.alreadyExistingSessionToken) {
        return this.state.channelDetailsFromWebRtc.alreadyExistingSessionToken;
      } else {
        return this.state.sessionId;
      }
    } catch (e) {
      console.log("SWAPVC >> getSessionId = ", JSON.stringify(e));
      return this.state.sessionId;
    }
  }

  _callCut() {
    Alert.alert(
      Strings.APP_NAME,
      translate("DISCONNECT_CALL"),
      [
        {
          text: translate("YES"),
          onPress: () => {
            if (this.state.subscriberCount === 1) {
              this.callEndApiCall();
            } else {
              this._goBack();
            }
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

  _showMessage(message) {
    Alert.alert(
      Strings.APP_NAME,
      message,
      [
        {
          text: translate("OK"),
          onPress: () => { },
        },
      ],
      { cancelable: false }
    );
  }

  callEndApiCall() {
    if (this.state.callDisconnectApi === false) {
      this.setState({
        callDisconnectApi: true,
      });

      console.log("SWAPVC >> sessionId = ", this.state.sessionId);
      console.log(
        "SWAPVC >> connectionId = ",
        this.state.sessionConnectionId.connectionId
      );

      //call Api
      let postData = {
        sessionId: this.getSessionId(),
        connectionId: this.state.sessionConnectionId.connectionId,
      };

      this.setState({
        isLoading: true,
      });
      this.props.forceDisconnectSession(postData);
    }
  }

  _switchCamera() {
    try {
      console.log(
        "SWAPVC >> _switchCamera = ",
        JSON.stringify(this.state.publisherProperties)
      );
      var campos = this.state.publisherCameraPosition === "front" ? "back" : "front";
      this.setState({ publisherCameraPosition: campos, actionType: 'camera' });
      this.state.publisherProperties.cameraPosition = campos;

      this.state.publisherProperties.cameraPosition = campos;
      const publisherProperties = {
        ...this.state.publisherProperties, ...this.state.actionType,
        [this.state.publisherEventStreamId]: {
          publishAudio: true, publishVideo: true,
          cameraPosition: campos,
        },
      };
      this.setState({ publisherProperties });

      try {
        OT.changeCameraPosition(this.state.publisherEventStreamId, campos);
      } catch (ex) { }
    } catch (e) {
      console.log("SWAPVC >> _switchCamera Err = ", e);
    }
  }

  _switchSound() {
    try {
      var audPos = !this.state.audioTrack;
      this.setState({
        audioTrack: audPos,
      });
      this.state.streamProperties.subscribeToAudio = audPos;

      try {
        OT.subscribeToAudio(this.state.streamConnectionId, audPos);
      } catch (ex) { }
    } catch (e) {
      console.log("SWAPVC >> _switchSound Err = ", e);
    }
  }

  _switchMic() {
    try {
      var audPos = !this.state.publishAudio;
      this.setState({
        publishAudio: audPos, actionType: 'mic'
      });

      this.state.publisherProperties.publishAudio = audPos;
      const publisherProperties = {
        ...this.state.publisherProperties, ...this.state.actionType,
        [this.state.publisherEventStreamId]: {
          publishAudio: audPos,
          publishVideo: true,
          cameraPosition: this.state.publisherCameraPosition,
        },
      };
      this.setState({ publisherProperties });
      try {
        OT.publishAudio(this.state.publisherEventStreamId, audPos);
      } catch (ex) { }
    } catch (e) {
      console.log("SWAPVC >> _switchMic Err = ", e);
    }
  }

  addNewPatients() {
    this.setState({
      firstNameError: "",
      lastNameError: "",
      emailIdError: "",
      isValid: true,
    });

    let isPhone = checkIsPhone(this.state.emailId.trim());

    if (validateIsEmpty(this.state.firstName.trim())) {
      this.setState({
        firstNameError: translate("FIRST_NAME_REQ"),
        isValid: false,
      });
    } else if (validateIsEmpty(this.state.lastName.trim())) {
      this.setState({
        lastNameError: translate("LAST_NAME_REQ"),
        isValid: false,
      });
    } else if (validateIsEmpty(this.state.emailId.trim())) {
      this.setState({
        emailIdError: translate("EMAIL_REQ"),
        isValid: false,
      });
    } else if (this.state.emailId.trim().length > 0) {
      if (isPhone && !validatePhoneNumber(this.state.emailId.trim())) {
        this.setState({
          emailError: translate("PROVIDE_VALID_PHONE"),
          isValid: false,
        });
      } else if (
        isPhone == false &&
        !validateEmail(this.state.emailId.trim())
      ) {
        this.setState({
          emailError: translate("PROVIDE_VALID_EMAIL"),
          isValid: false,
        });
      }
    }

    if (this.state.isValid) {
      this._toggleNewUserDialogue();
      //call Add user api
      this.setState({
        isLoading: true,
      });
      let postData = {
        email: this.state.emailId,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        loggedInUserId: this.state.userInfo._id,
        sessionObj: this.state.channelDetailsFromWebRtc,
        alreadyExistingSessionToken: this.state.channelDetailsFromWebRtc.option
          .openTok
          ? this.state.channelDetailsFromWebRtc.option.openTok.session
          : this.state.channelDetailsFromWebRtc.option.option.openTok.session,
      };
      this.props.sendJoinCallReqApi(postData);
    }
  }

  clickOnAddButton = (index, item) => {
    //click listener
  };

  renderFeed(index, item) {
    return (
      <View
        style={{
          backgroundColor: COLORS.white,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
          }}
        >
          <View
            style={{
              flex: 1,
              marginStart: 10,
              marginEnd: 10,
              marginTop: 10,
            }}
          >
            <TouchableWithoutFeedback onPress={() => { }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    flex: 0.1,
                  }}
                >
                  <View>
                    <Avatar
                      rounded
                      size={wp(15)}
                      containerStyle={{
                        padding: 2,
                      }}
                      source={{
                        uri: item.avatar ? item.avatar : Strings.CHANGEABLE_PIC,
                      }}
                      renderPlaceholderContent={
                        <ActivityIndicator color={COLORS.PRIMARY_COLOR} />
                      }
                    />
                    <Badge
                      badgeStyle={{ height: 10, width: 10 }}
                      status={item.isAvailable === true ? "success" : "error"}
                      containerStyle={{
                        position: "absolute",
                        top: wp(11),
                        left: wp(11),
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{ flex: 0.7, marginLeft: wp(6), marginTop: wp(2) }}
                >
                  <View style={{ marginTop: 10, marginLeft: 15 }}>
                    <View style={{ flexDirection: "row" }}>
                      <Text style={{ color: "#555555" }}>
                        {item.firstName + " " + item.lastName}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    flex: 0.2,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignContent: "flex-end",
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() => this.clickOnAddButton(index, item)}
                  >
                    <View
                      style={{
                        borderColor: "white",
                        margin: 5,
                        alignSelf: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        alignContent: "center",
                        backgroundColor: "white",
                      }}
                    >
                      <Image
                        source={addImage}
                        containerStyle={{
                          width: wp(6),
                          height: wp(6),
                          alignSelf: "center",
                          alignItems: "center",
                          justifyContent: "center",
                          alignContent: "center",
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flex: 0.19,
              }}
            />
            <View
              style={{
                flex: 0.81,
                marginEnd: 20,
                height: 1,
                marginTop: 10,
                backgroundColor: COLORS.background_color,
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  renderListUserDialogue() {
    return (
      <Modal
        animationIn="slideInDown"
        animationOut="slideOutDown"
        animationInTiming={100}
        animationOutTiming={100}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          margin: 0,
          backgroundColor: "transparent",
        }}
        onBackButtonPress={() => this._toggleListUserDialogue()}
        isVisible={this.state.isListUserDialogueVisible}
      >
        <Fragment>
          <SafeAreaView
            style={{ flex: 0, backgroundColor: "transparent" }}
            forceInset={{ top: "never" }}
          />
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
            forceInset={{ top: "never" }}
          >
            <View
              style={{
                alignItems: "center",
                width: wp(80),
                height: hp(50),
                borderRadius: hp(3),
                backgroundColor: Colors.WHITE_COLOR,
              }}
            >
              <View style={{ flexDirection: "row", padding: 10 }}>
                <View
                  style={{
                    justifyContent: "flex-end",
                    alignContent: "flex-end",
                    alignSelf: "flex-end",
                    alignItems: "flex-end",
                    flex: 0.8,
                    marginLeft: 10,
                  }}
                >
                  <Text
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      alignSelf: "flex-start",
                      alignItems: "center",
                      color: "#0074FF",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Choose Patient
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => this._toggleListUserDialogue()}
                >
                  <View
                    style={{
                      justifyContent: "flex-end",
                      alignContent: "flex-end",
                      alignSelf: "flex-end",
                      alignItems: "flex-end",
                      flex: 0.2,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#EBF1F6",
                        borderRadius: 30,
                        width: 30,
                        height: 30,
                        justifyContent: "center",
                        alignContent: "center",
                        alignSelf: "center",
                        alignItems: "center",
                        marginTop: 5,
                        marginEnd: -5,
                      }}
                    >
                      <Image
                        source={require("../../Assets/gray_cross.png")}
                        containerStyle={{
                          width: 20,
                          height: 20,
                          justifyContent: "center",
                          alignContent: "center",
                          alignSelf: "center",
                          alignItems: "center",
                        }}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              >
                <ScrollView>
                  {this.state.dataList.length !== 0 ? (
                    <FlatList
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{
                        borderRadius: 15,
                        overflow: "hidden",
                      }}
                      style={{
                        padding: 10,
                        marginTop: 10,
                        width: wp(80),
                        height: hp(40),
                      }}
                      data={this.state.dataList}
                      numColumns={1}
                      extraData={this.state.reloadList}
                      renderItem={({ item, index }) =>
                        this.renderFeed(index, item)
                      }
                    />
                  ) : (
                      <View style={{ flex: 1, justifyContent: "center" }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#999999",
                            marginTop: 20,
                            alignSelf: "center",
                          }}
                        >
                          No patient available.
                      </Text>
                      </View>
                    )}
                </ScrollView>
              </View>
            </View>
          </SafeAreaView>
        </Fragment>
      </Modal>
    );
  }

  renderNewUserDialogue() {
    return (
      <Modal
        animationIn="slideInDown"
        animationOut="slideOutDown"
        animationInTiming={100}
        animationOutTiming={100}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          margin: 0,
          backgroundColor: "transparent",
        }}
        onBackButtonPress={() => this._toggleNewUserDialogue()}
        isVisible={this.state.isAddNewUserDialogueVisible}
      >
        <Fragment>
          <SafeAreaView
            style={{ flex: 0, backgroundColor: "transparent" }}
            forceInset={{ top: "never" }}
          />
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
            forceInset={{ top: "never" }}
          >
            <View
              style={{
                alignItems: "center",
                width: wp(80),
                height: hp(40),
                borderRadius: hp(3),
                backgroundColor: Colors.WHITE_COLOR,
              }}
            >
              <View style={{ flexDirection: "row", padding: 10 }}>
                <View
                  style={{
                    justifyContent: "flex-end",
                    alignContent: "flex-end",
                    alignSelf: "flex-end",
                    alignItems: "flex-end",
                    flex: 0.8,
                    marginLeft: 10,
                  }}
                >
                  <Text
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      alignSelf: "flex-start",
                      alignItems: "center",
                      color: "#0074FF",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Invite Patient
                  </Text>
                </View>

                <TouchableWithoutFeedback
                  onPress={() => this._toggleNewUserDialogue()}
                >
                  <View
                    style={{
                      justifyContent: "flex-end",
                      alignContent: "flex-end",
                      alignSelf: "flex-end",
                      alignItems: "flex-end",
                      flex: 0.2,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#EBF1F6",
                        borderRadius: 30,
                        width: 30,
                        height: 30,
                        justifyContent: "center",
                        alignContent: "center",
                        alignSelf: "center",
                        alignItems: "center",
                        marginTop: 5,
                        marginEnd: -5,
                      }}
                    >
                      <Image
                        source={require("../../Assets/gray_cross.png")}
                        containerStyle={{
                          width: 20,
                          height: 20,
                          justifyContent: "center",
                          alignContent: "center",
                          alignSelf: "center",
                          alignItems: "center",
                        }}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              >
                <Input
                  placeholder="First Name"
                  autoCapitalize="none"
                  inputContainerStyle={{
                    borderBottomColor: "transparent",
                    marginTop: 15,
                    backgroundColor: "#EBF1F6",
                    height: hp(6),
                    width: wp(70),
                    borderRadius: hp(1),
                  }}
                  leftIcon={
                    <Icon
                      name="user-o"
                      type="font-awesome"
                      size={18}
                      color="#CED7DC"
                    />
                  }
                  leftIconContainerStyle={{ paddingRight: 10 }}
                  rightIconContainerStyle={{ paddingLeft: 10 }}
                  errorMessage={this.state.firstNameError}
                  onChangeText={(firstName) =>
                    this.setState({ firstName: firstName })
                  }
                  value={this.state.firstName}
                />

                <Input
                  placeholder="Last Name"
                  autoCapitalize="none"
                  inputContainerStyle={{
                    borderBottomColor: "transparent",
                    marginTop: 10,
                    backgroundColor: "#EBF1F6",
                    height: hp(6),
                    width: wp(70),
                    borderRadius: hp(1),
                  }}
                  leftIcon={
                    <Icon
                      name="user-o"
                      type="font-awesome"
                      size={18}
                      color="#CED7DC"
                    />
                  }
                  leftIconContainerStyle={{ paddingRight: 10 }}
                  rightIconContainerStyle={{ paddingLeft: 10 }}
                  errorMessage={this.state.lastNameError}
                  onChangeText={(lastName) =>
                    this.setState({ lastName: lastName })
                  }
                  value={this.state.lastName}
                />

                <Input
                  placeholder="Email"
                  autoCapitalize="none"
                  inputContainerStyle={{
                    borderBottomColor: "transparent",
                    marginTop: 10,
                    height: hp(6),
                    backgroundColor: "#EBF1F6",
                    width: wp(70),
                    borderRadius: hp(1),
                  }}
                  leftIcon={
                    <Icon
                      name="email-outline"
                      type="material-community"
                      size={18}
                      color="#CED7DC"
                    />
                  }
                  leftIconContainerStyle={{ paddingRight: 10 }}
                  rightIconContainerStyle={{ paddingLeft: 10 }}
                  errorMessage={this.state.emailIdError}
                  onChangeText={(emailId) =>
                    this.setState({ emailId: emailId })
                  }
                  value={this.state.emailId}
                />

                <TouchableWithoutFeedback
                  onPress={() => {
                    this.addNewPatients();
                  }}
                >
                  <LinearGradient
                    colors={colors}
                    useAngle={true}
                    angle={60}
                    style={{
                      marginTop: hp(3),
                      width: wp(70),
                      height: hp(5),
                      justifyContent: "center",
                      alignSelf: "center",
                      flexDirection: "row",
                      borderRadius: 30,
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 8,
                      },
                      shadowOpacity: 0.44,
                      shadowRadius: 10.32,
                      elevation: 16,
                    }}
                  >
                    <Text
                      style={{
                        marginLeft: 8,
                        justifyContent: "center",
                        alignSelf: "center",
                        color: "#FFF",
                        fontWeight: "bold",
                      }}
                    >
                      Send Request
                    </Text>
                  </LinearGradient>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </SafeAreaView>
        </Fragment>
      </Modal>
    );
  }

  renderDialogue() {
    return (
      <Modal
        animationIn="slideInDown"
        animationOut="slideOutDown"
        animationInTiming={100}
        animationOutTiming={100}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          margin: 0,
          backgroundColor: "transparent",
        }}
        onBackButtonPress={() => this._toggleDialogue()}
        isVisible={this.state.isDialogueVisible}
      >
        <Fragment>
          <SafeAreaView
            style={{ flex: 0, backgroundColor: "transparent" }}
            forceInset={{ top: "never" }}
          />
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
            forceInset={{ top: "never" }}
          >
            <View
              style={{
                alignItems: "center",
                width: wp(80),
                height: hp(34),
                borderRadius: hp(3),
                backgroundColor: Colors.WHITE_COLOR,
              }}
            >
              <TouchableWithoutFeedback onPress={() => this._toggleDialogue()}>
                <View
                  style={{
                    justifyContent: "flex-end",
                    alignContent: "flex-end",
                    alignSelf: "flex-end",
                    alignItems: "flex-end",
                    margin: 10,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#EBF1F6",
                      borderRadius: 30,
                      width: 30,
                      height: 30,
                      justifyContent: "center",
                      alignContent: "center",
                      alignSelf: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={require("../../Assets/gray_cross.png")}
                      containerStyle={{
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignContent: "center",
                        alignSelf: "center",
                        alignItems: "center",
                      }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <Avatar
                size={hp(12)}
                rounded
                source={{
                  uri: this.state.userPic,
                }}
                containerStyle={{
                  borderWidth: 2,
                  borderColor: "#BAC6CD",
                  padding: 6,
                  backgroundColor: Colors.white,
                }}
                overlayContainerStyle={{ backgroundColor: "#BAC6CD" }}
                icon={{
                  name: "user",
                  type: "entypo",
                  color: Colors.black,
                }}
              />

              <Button
                buttonStyle={{
                  borderColor: "#FFD800",
                  borderWidth: 2,
                  borderRadius: hp(5),
                  backgroundColor: "#FFD800",
                  width: wp(70),
                  height: hp(5),
                  marginTop: hp(1),
                }}
                titleStyle={{
                  color: "black",
                  fontSize: hp(2),
                }}
                containerStyle={{
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: hp(1.5),
                }}
                title="Choose Existing Patient"
                onPress={() => this._toggleListUserDialogue()}
              />

              <Button
                buttonStyle={{
                  borderColor: "#555555",
                  borderWidth: 2,
                  borderRadius: hp(5),
                  backgroundColor: "#555555",
                  width: wp(70),
                  height: hp(5),
                }}
                titleStyle={{
                  color: "white",
                  fontSize: hp(2),
                }}
                containerStyle={{
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: hp(1.2),
                }}
                title={translate("INVITE_PATIENT")}
                onPress={() => this._toggleNewUserDialogue()}
              />
            </View>
          </SafeAreaView>
        </Fragment>
      </Modal>
    );
  }

  renderView() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.sessionId !== "" ? (
          <OTSession
            apiKey={this.state.apiKey}
            sessionId={this.state.sessionId}
            token={this.state.tokenId}
            eventHandlers={this.sessionEventHandlers}
            ref={this.otSessionRef}
            options={this.sessionOptions}>

            <OTSubscriber
              style={{
                width: "" + this.state.subscriberWidth + "%",
                height: "" + this.state.subscriberHeight + "%",
                alignSelf: "stretch", insertMode: "append",
              }}
              ref={this.otSubscriberRef}
              properties={this.subscriberProperties}
              eventHandlers={this.subscriberEventHandlers}
              streamProperties={this.state.streamProperties}
            />

            <OTPublisher
              style={{
                borderColor: "#BAC6CD",
                backgroundColor: "#FFF",
                borderWidth: 1,
                borderRadius: 15,
                overflow: "hidden",
                padding: 5,
                margin: 20,
                width: 120,
                height: 150,
                justifyContent: "flex-end",
                position: "absolute",
                alignSelf: "stretch",
              }}
              ref={this.otPublisherRef}
              properties={this.state.publisherProperties}
              actionType={this.state.actionType}
              eventHandlers={this.publisherEventHandlers}
            />
          </OTSession>
        ) : null}

        <View
          style={{
            position: "absolute",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.1)",
            height: hp(28),
          }}
        >
          <Image
            source={bottomImage}
            containerStyle={{
              width: wp(100),
              height: hp(15),
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
              height: hp(8),
              width: hp(8),
              borderRadius: hp(8) / 2,
              backgroundColor: "#F21D53",
              bottom: hp(6),
              alignSelf: "center",
            }}
          >
            <Image
              containerStyle={{
                height: hp(5),
                width: hp(5),
                marginTop: hp(1),
                marginStart: hp(1.5),
              }}
              resizeMode="contain"
              source={require("../../Assets/contact.png")}
            />
          </View>
        </TouchableWithoutFeedback>

        {/*  */}

        {/* <TouchableOpacity
          style={{
            position: "absolute",
            borderColor: COLORS.WHITE_COLOR,
            backgroundColor: COLORS.WHITE_COLOR,
            borderWidth: 1,
            borderRadius: 15,
            marginStart: 5,
            width: 50,
            height: 50,
            bottom: hp(2),
            left: wp(5),
            alignSelf: "flex-start",
          }}
          onPress={() => this._switchMic()}
        >
          <Icon
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
            color="#0074FF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor: COLORS.WHITE_COLOR,
            backgroundColor: COLORS.WHITE_COLOR,
            borderWidth: 1,
            borderRadius: 15,
            right: wp(5),
            width: 50,
            height: 50,
            bottom: hp(2),
            alignSelf: "flex-end",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => this._switchSound()}
        >
          <Icon
            style={{
              flex: 0.1,
              opacity: 1,
            }}
            containerStyle={{
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: wp(2),
            }}
            name={this.state.audioTrack ? "sound" : "sound-mute"}
            type="entypo"
            size={30}
            color="#0074FF"
          />
        </TouchableOpacity> */}

        {/*  */}

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor: COLORS.WHITE_COLOR,
            backgroundColor: COLORS.WHITE_COLOR,
            borderWidth: 1, borderRadius: 15,
            marginStart: 5, width: 50, height: 50,
            bottom: hp(2), left: wp(5), alignSelf: "flex-start",
          }}
          onPress={() => { }}>
          <Image
            containerStyle={{
              height: hp(3.5),
              width: hp(3.5),
              marginTop: hp(1),
              marginStart: hp(1),
            }}
            resizeMode="contain"
            source={require("../../Assets/speech_bubble_3x.png")}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor: COLORS.BACKGROUND_COLOR,
            backgroundColor: COLORS.BACKGROUND_COLOR,
            borderWidth: 1,
            borderRadius: 15,
            right: wp(5),
            width: 50,
            height: 50,
            bottom: hp(2),
            alignSelf: "flex-end",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => this._toggleNewUserDialogue()}>
          <Icon
            style={{ opacity: 1 }}
            containerStyle={{
              justifyContent: "center", alignContent: "center",
              alignSelf: "center", alignItems: "center",
            }}
            name="user-follow"
            type="simple-line-icon"
            size={25}
            color="#0074FF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor: COLORS.WHITE_COLOR,
            backgroundColor: COLORS.WHITE_COLOR, borderWidth: 1,
            borderRadius: 15, marginBottom: 20,
            right: wp(5), width: 50,
            height: 50, bottom: hp(12), alignSelf: "flex-end",
          }}
          onPress={() => this._switchMic()}>
          <Icon
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
            color="#0074FF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor: COLORS.WHITE_COLOR,
            backgroundColor: COLORS.WHITE_COLOR,
            borderWidth: 1,
            borderRadius: 15,
            marginBottom: 20,
            right: wp(5),
            width: 50,
            height: 50,
            bottom: hp(19),
            alignSelf: "flex-end",
          }}
          onPress={() => this._switchSound()}>
          <Icon
            style={{ flex: 0.1, opacity: 1 }}
            containerStyle={{
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: wp(2),
            }}
            name={this.state.audioTrack ? "sound" : "sound-mute"}
            type="entypo"
            size={30}
            color="#0074FF"
          />
        </TouchableOpacity>
        {/* sound-mute */}

        <TouchableOpacity
          style={{
            position: "absolute",
            borderColor: COLORS.WHITE_COLOR,
            backgroundColor: COLORS.WHITE_COLOR,
            borderWidth: 1, borderRadius: 15,
            marginBottom: 20, width: 50, height: 50,
            bottom: hp(12), marginLeft: wp(6),
            alignSelf: "flex-start",
          }}
          onPress={() => this._switchCamera()}>
          <Icon
            style={{ flex: 0.1, opacity: 1 }}
            containerStyle={{
              justifyContent: "center",
              alignContent: "center",
              alignSelf: "center",
              alignItems: "center",
              marginTop: wp(0.7),
            }}
            name="camera"
            type="ionicon"
            size={36}
            color="#0074FF"
          />
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <Fragment>
        <SafeAreaView
          style={{ flex: 0, backgroundColor: COLORS.WHITE_COLOR }}
          forceInset={{ top: "never" }}
        />
        {this.renderDialogue()}
        {this.renderNewUserDialogue()}
        {this.renderListUserDialogue()}

        <SafeAreaView
          style={{
            flex: 1,

            backgroundColor: COLORS.background_color,
          }}
          forceInset={{ top: "never" }}>
          {this.renderView()}
        </SafeAreaView>

        {
          <CustomLoader
            isLoading={this.state.isLoading}
            leftAlign={0}
            isTransparent={false}
          />
        }
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    VideoCallReducer: state.VideoCallReducer,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setUserAsBusyApi,
      forceDisconnectSession,
      getSessionTokenApi,
      sendJoinCallReqApi,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(VideoCallScreen));
