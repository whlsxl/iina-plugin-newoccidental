const { console, core, global, mpv, event, standaloneWindow, menu, sidebar } =
  iina;
import {
  LearningInfo,
  trackListToSubList,
  SubContents,
  SubContent,
  SubMessage,
  MessageType,
} from "../pages/src/constants";
import { sleep } from "../pages/src/tool";

console.log("index.ts");

let panelLoaded = false;
let learningInfo = new LearningInfo();
let loadingLearningSub: SubContents = undefined;
// The API of mpv only have the function to get next subtitle.
let loadingTask: string = undefined;
let loadingBeginPos: number = undefined;

function postToAll(action: string, data: any) {
  if (panelLoaded) {
    standaloneWindow.postMessage(action, data);
  }
  sidebar.postMessage(action, data);
}

function updateUI() {
  if (panelLoaded) {
    standaloneWindow.postMessage("updateUI", learningInfo);
  }
  sidebar.postMessage("updateUI", learningInfo);
}

function updateSub() {
  const data: SubMessage = {
    learningSub: learningInfo.getLearningSub(),
    nativeSub: learningInfo.subInfos,
  };
  postToAll(MessageType.UpdateSub, data);
}

function getSub(): SubContent {
  let content = new SubContent();
  content.start = mpv.getNumber("sub-start");
  content.end = mpv.getNumber("sub-end");
  content.text = mpv.getString("sub-text");
  return content;
}

// generate a paragraph subtitle
function generateSubContent(begin: number, duration: number) {
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
      postToAll(MessageType.UpdateSubProcess, {
        indexSubProcess: Math.ceil(
          ((sub.end - loadingLearningSub.beginTime) / duration) * 100,
        ),
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

// Action
function indexSubAction(duration) {
  if (!loadingLearningSub) {
    loadingBeginPos = core.status.position;
    generateSubContent(
      duration === "0" ? 0 : core.status.position,
      parseInt(duration),
    );
  }
  // updateUI();
}

// Finish generate subtitle
function finishLoadSub(): boolean {
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

function loadPanel() {
  if (panelLoaded) {
    return;
  }
  console.log("loadPanel");
  // standaloneWindow.loadFile("views/index.html");
  standaloneWindow.loadFile("views/index.html");
  standaloneWindow.setProperty({ title: "Learning Panel", resizable: false });
  standaloneWindow.setFrame(400, 840);
  standaloneWindow.onMessage(MessageType.StopIndexSubAction, async (data) => {
    finishLoadSub();
  });
  standaloneWindow.onMessage("requestUpdate", async (data) => {
    console.log("standaloneWindow requestUpdate");
    standaloneWindow.postMessage("updateUI", learningInfo);
  });

  standaloneWindow.onMessage("postProcessAction", async (data) => {
    console.log("postProcessAction: ");
    learningInfo.process = data;
    updateUI();
  });

  standaloneWindow.onMessage("postStatusAction", async (data) => {
    console.log("postStatusAction: " + data);
    learningInfo.status = data.status;
    updateUI();
  });
  standaloneWindow.onMessage("postSubAction", async (data) => {
    console.log("postSubAction: ");
    console.log(JSON.stringify(data));
    learningInfo.learningID = data.learningID;
    learningInfo.nativeID = data.nativeID;
    learningInfo.bilingual = data.bilingual;

    updateUI();
  });

  standaloneWindow.onMessage(
    MessageType.IndexSubAction,
    async ({ duration }) => {
      indexSubAction(duration);
      updateUI();
    },
  );

  panelLoaded = true;
}

function showLearnPanel() {
  loadPanel();
  standaloneWindow.open();
}

// sidebar.loadFile("views/index.html");

sidebar.loadFile("views/index.html");

// Update learning process checkbox status
sidebar.onMessage(MessageType.PostProcessAction, async (data) => {
  console.log("postProcessAction: ");
  core.pause();
  console.log("pausexxxxxxxxxxxx");
  console.log(JSON.stringify(data));
  learningInfo.process = data;
});

sidebar.onMessage(MessageType.IndexSubAction, async ({ duration }) => {
  indexSubAction(duration);
});

menu.addItem(
  menu.item("Start Learning", async () => {
    showLearnPanel();
  }),
);

// system event

// subtitle list changed
event.on("mpv.track-list.changed", () => {
  console.log("mpv.track-list.changed");

  const track_list = mpv.getString("track-list");
  console.log(track_list);

  learningInfo.subInfos = trackListToSubList(track_list);
  console.log(JSON.stringify(learningInfo.subInfos));

  learningInfo.fileDuration = mpv.getNumber("duration");
  const selected = learningInfo.subInfos.find((subInfo) => subInfo.selected);
  if (
    (!learningInfo.learningID ||
      track_list.length <= learningInfo.learningID) &&
    selected
  ) {
    learningInfo.learningID = selected.id;
  }
  if (
    (!learningInfo.nativeID || track_list.length <= learningInfo.nativeID) &&
    selected
  ) {
    learningInfo.nativeID = selected.id;
  }
  console.log(JSON.stringify(learningInfo));

  console.log("learningInfo");
  updateSub();
});

event.on("iina.file-loaded", (url) => {
  console.log("iina.file-loaded");
  if (learningInfo.fileURL !== url) {
    learningInfo.learningID = undefined;
    learningInfo.nativeID = undefined;
  }
  learningInfo.fileURL = url;
});

export {};
