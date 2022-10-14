import { Reducer } from "react";
import {
  // LearningInfo,
  // trackListToSubList,
  // SubContents,
  // SubContent,
  SubInfo,
  SubMessage,
} from "../../../src/constants";
// import produce from "immer";

export type MessageAction =
  | { type: "updateSub"; payload: SubMessage }
  | { type: "failure"; error: string };

export interface AppState {
  learningSub: Array<SubInfo>;
  nativeSub: Array<SubInfo>;
  // count: number;
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
    default:
      return state;
  }
};
