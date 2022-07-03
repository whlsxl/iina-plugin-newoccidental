const { console, core, global, mpv, event, standaloneWindow, menu, sidebar } =
  iina;
import {
  LearningInfo,
  trackListToSubList,
  SubContents,
  SubContent,
} from "./control";

console.log("index.ts");

let panelLoaded = false;
let learningInfo = new LearningInfo();
let loadingLearningSub = undefined;
let loadingTask: string = undefined;

function updateUI() {
  if (panelLoaded) {
    standaloneWindow.postMessage("updateUI", learningInfo);
  }
  sidebar.postMessage("updateUI", learningInfo);
}

function getSub(): SubContent {
  let content = new SubContent();
  content.start = mpv.getNumber("sub-start");
  content.end = mpv.getNumber("sub-end");
  content.text = mpv.getString("sub-text");
  // console.log(JSON.stringify(content));
  return content;
}

function generateSubContent(begin: number, duration: number) {
  core.pause();
  loadingLearningSub = new SubContents();
  loadingLearningSub.beginTime = begin;
  loadingLearningSub.loadingDuration = duration;
  let lastSub: SubContent = undefined;
  let sameTime = 0;
  loadingTask = setInterval(() => {
    if (loadingLearningSub) {
      if (
        loadingLearningSub.loadingDuration !== 0 &&
        core.status.position >
          loadingLearningSub.beginTime + loadingLearningSub.loadingDuration
      ) {
        finishLoadSub();
        return;
      }
      if (sameTime > 5) {
        finishLoadSub();
      }
      const sub = getSub();

      if (lastSub && sub.start === lastSub.start) {
        sameTime++;
        mpv.command("sub-seek", ["1", "primary"]);
        return;
      }
      if (sub.text !== undefined) {
        loadingLearningSub.addLearningSub(getSub());
        mpv.command("sub-seek", ["1", "primary"]);
      }
      lastSub = sub;
      sameTime = 0;
    }
  }, 500);
}

function finishLoadSub(): boolean {
  if (loadingTask != undefined) {
    clearInterval(loadingTask);
    loadingTask = undefined;
  }
  if (!loadingLearningSub) {
    return false;
  }
  loadingLearningSub.endTime = core.status.position;
  learningInfo.subContents.push(loadingLearningSub);
  loadingLearningSub = undefined;
}

function loadPanel() {
  if (panelLoaded) {
    return;
  }
  console.log("loadPanel");
  standaloneWindow.loadFile("views/learn-panel.html");
  standaloneWindow.setProperty({ title: "Learning Panel" });
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
  standaloneWindow.onMessage("test", async () => {
    console.log("testtesttest");
    if (loadingLearningSub) {
      finishLoadSub();
      console.log("finishLoadSubxxxxx");
    } else {
      generateSubContent(core.status.position, 600);
    }
  });

  panelLoaded = true;
}

function showLearnPanel() {
  loadPanel();
  standaloneWindow.open();
}

sidebar.loadFile("views/learn-panel.html");
sidebar.onMessage("postProcessAction", async (data) => {
  console.log("postProcessAction: ");
  core.pause();
  console.log("pausexxxxxxxxxxxx");
  console.log(JSON.stringify(data));
  learningInfo.process = data;
});

console.log("index additem");

menu.addItem(
  menu.item("Start Learning", async () => {
    showLearnPanel();
  }),
);

// system event
event.on("mpv.track-list.changed", () => {
  console.log("mpv.track-list.changed");

  const track_list = mpv.getString("track-list");
  learningInfo.subInfos = trackListToSubList(track_list);
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
  updateUI();
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
