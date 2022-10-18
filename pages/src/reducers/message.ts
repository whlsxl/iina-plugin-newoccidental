import { Reducer } from "react";
import {
  MessageType,
  // LearningInfo,
  // trackListToSubList,
  // SubContents,
  // SubContent,
  SubInfo,
  SubMessage,
} from "../constants";
// import produce from "immer";

export type MessageAction =
  | { type: "updateSub"; payload: SubMessage }
  | { type: "stopIndexSub" }
  | { type: "updateSubProcess"; process: UpdateSubProcess };

export interface UpdateSubProcess {
  indexSubProcess: number;
  isIndexingSub: boolean;
}
export interface AppState {
  learningSub: Array<SubInfo>;
  nativeSub: Array<SubInfo>;
  isIndexingSub: boolean;
  indexSubProcess: number;
}

export const messageReducer: Reducer<AppState, MessageAction> = (
  state,
  action,
) => {
  switch (action.type) {
    case "updateSub": {
      return {
        ...state,
        ...action.payload,
      };
    }
    case "stopIndexSub": {
      iina.postMessage(MessageType.StopIndexSubAction);
      return state;
    }
    case "updateSubProcess": {
      if (!action.process.indexSubProcess) {
        action.process.indexSubProcess = state.indexSubProcess;
      }
      return {
        ...state,
        ...action.process,
      };
    }
    default:
      return state;
  }
};
