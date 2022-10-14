// const { console, core, global, mpv, event } = iina;
import { getLangName } from "./tool";

export enum LearningInfoStatus {
  Start = "Start",
  Stop = "Stop",
  Loading = "Loading",
}

// A sentence of subtitle info
export class SubContent {
  start: number;
  end: number;
  text: string;
}
// A paragraph of subtitle info
export class SubContents {
  contents: Array<SubContent>;
  beginTime: number;
  endTime: number;
  // Estimated subtitle duration
  loadingDuration: number;
  constructor() {
    this.contents = [];
  }

  addLearningSub(sub: SubContent): boolean {
    if (
      this.contents.length === 0 ||
      sub.start > this.contents[this.contents.length - 1].end
    ) {
      this.contents.push(sub);
    } else if (this.contents.length === 1) {
      if (
        this.contents[0].start === sub.start &&
        this.contents[0].end === sub.end
      ) {
        return false;
      }
      this.contents.splice(0, 0, sub);
    } else {
      for (let index = 0; index < this.contents.length - 1; index++) {
        if (
          this.contents[index].start === sub.start &&
          this.contents[index].end === sub.end
        ) {
          return false;
        }
        if (
          this.contents[index].end < sub.start &&
          sub.end < this.contents[index + 1].start
        ) {
          this.contents.splice(index + 1, 0, sub);
        }
      }
    }
    return true;
  }

  timeInContents(t: number) {
    return this.beginTime < t && this.endTime > t;
  }
}

export class SubInfo {
  id: number;
  title: string;
  filename: string;
  defaultSub: boolean;
  selected: boolean;
  external: boolean;
  // constructor() {}
}

export class LearningInfo {
  fileURL: string;

  status: LearningInfoStatus;
  process: Object;
  learningID: number;
  nativeID: number;
  bilingual: boolean;

  subInfos: Array<SubInfo>;
  subContentsList: Array<SubContents>;

  constructor() {
    this.bilingual = false;
    this.process = {};
    this.subContentsList = [];
  }

  getLearningSub() {
    return this.subInfos.filter(function (sub) {
      return sub.external;
    });
  }
}

export class SubMessage {
  learningSub: Array<SubInfo>;
  nativeSub: Array<SubInfo>;
}

export function trackListToSubList(track_list_json: string) {
  const track_list = JSON.parse(track_list_json);
  let sub_list: Array<SubInfo> = [];
  for (const track of track_list) {
    if (track.type === "sub") {
      let sub = new SubInfo();
      sub.id = track.id;
      sub.defaultSub = track.default;

      let title = "";
      let lang_name = getLangName(track.lang);
      if (lang_name) {
        title += "[" + lang_name + "] ";
      }
      if (track.title) {
        title += track.title;
      }
      if (track.default) {
        title += "(Default)";
      }
      if (title === "") {
        title = "Sub" + track.id;
      }
      sub.filename = track.external ? track.title : "";
      sub.title = title;

      if (track.selected !== undefined) {
        sub.selected = track.selected;
      }
      sub.external = track.external;
      sub_list.push(sub);
    }
  }
  return sub_list;
}
