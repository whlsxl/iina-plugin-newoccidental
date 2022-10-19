import { Reducer } from "react";
import {
  Configuration,
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
  // onMessage
  | { type: "updateSub"; payload: SubMessage }
  | { type: "updateConfiguration"; config: Configuration }
  | { type: "updateSubProcess"; process: UpdateSubProcess }
  // inner event
  | { type: "stopIndexSub" }
  | { type: "selectProcess"; key: ProcessSelectKey }
  | { type: "selectProcessArray"; process: ProcessSelectArray }
  | { type: "selectBilingual"; bilingual: boolean };

export interface UpdateSubProcess {
  indexSubProcess: number;
  isIndexingSub: boolean;
}

export type ProcessSelectKey =
  | "listen"
  | "learning"
  | "native"
  | "again"
  | "follow";

export type ProcessSelectArray = Array<ProcessSelectKey>;

export interface AppState {
  learningSub: Array<SubInfo>;
  nativeSub: Array<SubInfo>;
  isIndexingSub: boolean;
  indexSubProcess: number;
  // config
  process: ProcessSelectArray;
  bilingual: boolean;
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
    case "selectProcess": {
      const process = [...state.process];
      const index = process.indexOf(action.key);
      if (index !== -1) {
        process.splice(index, 1);
      } else {
        process.push(action.key);
      }
      iina.postMessage(MessageType.ChangeConfigurationAction, {
        process,
      });
      return {
        ...state,
        process,
      };
    }
    case "selectProcessArray": {
      iina.postMessage(MessageType.ChangeConfigurationAction, {
        process: action.process,
      });
      return {
        ...state,
        process: action.process,
      };
    }
    case "updateConfiguration": {
      return {
        ...state,
        ...action.config,
      };
    }
    case "selectBilingual": {
      iina.postMessage(MessageType.ChangeConfigurationAction, {
        bilingual: action.bilingual,
      });
      return {
        ...state,
        bilingual: action.bilingual,
      };
    }
    default:
      return state;
  }
};
