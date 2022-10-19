const { console, core, global, mpv, event, standaloneWindow, menu, sidebar } =
  iina;
import {
  LearningInfo,
  MessageType,
  SubContent,
  SubContents,
} from "../pages/src/constants";
import { sleep } from "../pages/src/tool";

let panelLoaded = false;
export let learningInfo = new LearningInfo();

let loadingLearningSub: SubContents = undefined;
// The API of mpv only have the function to get next subtitle.
let loadingTask: string = undefined;
let loadingBeginPos: number = undefined;

// generate a paragraph subtitle
function getSub(): SubContent {
  let content = new SubContent();
  content.start = mpv.getNumber("sub-start");
  content.end = mpv.getNumber("sub-end");
  content.text = mpv.getString("sub-text");
  return content;
}

export function generateSubContent(begin: number, duration: number) {
  if (!core.status.paused) {
    core.pause();
  }
  core.seekTo(begin);
  sleep(500);

  loadingLearningSub = new SubContents();
  loadingLearningSub.beginTime = begin;
  loadingLearningSub.loadingDuration = duration;

  let lastSub: SubContent = undefined;
  // If get the next subtitle have 5 times same, will stop
  let sameTime = 0;
  loadingTask = setInterval(() => {
    if (!core.status.paused) {
      core.pause();
    }
    if (loadingLearningSub) {
      if (
        loadingLearningSub.loadingDuration !== 0 &&
        core.status.position >
          loadingLearningSub.beginTime + loadingLearningSub.loadingDuration
      ) {
        finishLoadSub();
        return;
      }
      if (sameTime > 10) {
        finishLoadSub();
      }
      const sub = getSub();
      // post update process message
      let duration = loadingLearningSub.loadingDuration;
      if (duration === 0) {
        duration = learningInfo.fileDuration;
      }
      const indexSubProcess = Math.ceil(
        ((sub.end - loadingLearningSub.beginTime) / duration) * 100,
      );
      indexSubProcess > 0 &&
        postToAll(MessageType.UpdateSubProcess, {
          indexSubProcess,
          isIndexingSub: true,
        });

      if (lastSub && sub.text === lastSub.text) {
        sameTime++;
        lastSub = sub;
        mpv.command("sub-seek", ["1", "primary"]);
        return;
      }
      if (
        (sub.text !== undefined || sub.text === "") &&
        !(lastSub && sub.start === lastSub.start)
      ) {
        loadingLearningSub.addLearningSub(sub);
        mpv.command("sub-seek", ["1", "primary"]);
      }
      lastSub = sub;
      sameTime = 0;
    }
  }, 500);
}

// Finish generate subtitle
export function finishLoadSub(): boolean {
  if (loadingTask != undefined) {
    clearInterval(loadingTask);
    loadingTask = undefined;
  }
  if (loadingBeginPos) {
    core.seekTo(loadingBeginPos);
    loadingBeginPos = undefined;
  }
  if (!loadingLearningSub) {
    return false;
  }

  postToAll(MessageType.UpdateSubProcess, {
    isIndexingSub: false,
  });
  loadingLearningSub.endTime = core.status.position;
  learningInfo.subContentsList.push(loadingLearningSub);
  loadingLearningSub = undefined;
}

export function isIndexingSub() {
  return loadingLearningSub !== undefined;
}

// Action
export function indexSubAction(duration) {
  if (!isIndexingSub()) {
    loadingBeginPos = core.status.position;
    generateSubContent(
      duration === "0" ? 0 : core.status.position,
      parseInt(duration),
    );
  }
  // updateUI();
}

// postMessage
export function postToAll(action: string, data: any) {
  if (panelLoaded) {
    standaloneWindow.postMessage(action, data);
  }
  sidebar.postMessage(action, data);
}

export function standaloneWindowloaded() {
  panelLoaded = true;
}

export function isStandaloneWindowloaded() {
  return panelLoaded;
}
