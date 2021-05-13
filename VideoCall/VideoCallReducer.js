import ACTION_TYPES from "../../Actions/ActionTypes";

export default (state = {}, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER_BUSY:
      return {
        ...state,
        setUserAsBusyDataRes: action.payload,
      };
    case ACTION_TYPES.FORCE_DISCONNECT:
      return {
        ...state,
        forceDisconnectDataRes: action.payload,
      };
    case ACTION_TYPES.GET_SESSION_TOKEN:
      return {
        ...state,
        getSessionTokenDataRes: action.payload,
      };
    case ACTION_TYPES.SEND_JOIN_CALL_REQ:
      return {
        ...state,
        sendJoinCallApiDataRes: action.payload,
      };
    case ACTION_TYPES.GET_CHAT_CHANNEL_INFORMATION:
      return {
        ...state,
        getChatChannelInfoDataRes: action.payload,
      };
    case ACTION_TYPES.CREATE_MESSAGE_CHANNEL:
      return {
        ...state,
        createMessageChannelDataRes: action.payload,
      };
    default:
      return state;
  }
};
