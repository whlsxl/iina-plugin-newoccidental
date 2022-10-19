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
import {
  finishLoadSub,
  indexSubAction,
  isStandaloneWindowloaded,
  learningInfo,
  postToAll,
  standaloneWindowloaded,
} from "./tool";

console.log("index.ts");

function updateUI() {
  // if (panelLoaded) {
  //   standaloneWindow.postMessage("updateUI", learningInfo);
  // }
  // sidebar.postMessage("updateUI", learningInfo);
}

function updateSub() {
  const data: SubMessage = {
    learningSub: learningInfo.getLearningSub(),
    nativeSub: learningInfo.subInfos,
  };
  postToAll(MessageType.UpdateSub, data);
}

// Binding onMessage
function bingdingOnMessage(window, type: "standaloneWindow" | "sidebar") {
  window.onMessage(MessageType.StopIndexSubAction, async (data) => {
    finishLoadSub();

    postToAll(MessageType.PostNotification, {
      type: "warning",
      title: "Index Subtitle termined",
    });
  });

  // frontend request update UI
  window.onMessage(MessageType.RequestUpdateUIAction, async () => {
    console.log("window RequestUpdateUIAction");
    window.postMessage("updateUI", learningInfo);
    // TODO
  });

  window.onMessage(MessageType.ChangeConfigurationAction, async (data) => {
    if (data.process) {
      Object.keys(learningInfo.process).forEach((key) => {
        learningInfo.process[key] = data.process.includes(key);
      });
    }
    if (data.bilingual) {
      learningInfo.bilingual = data.bilingual;
    }
    const process = Object.keys(learningInfo.process).filter((key) => {
      return learningInfo.process[key];
    });
    postToAll(MessageType.UpdateConfiguration, {
      process,
      bilingual: learningInfo.bilingual,
    });
  });

  // standaloneWindow.onMessage("postProcessAction", async (data) => {
  //   console.log("postProcessAction: ");
  //   learningInfo.process = data;
  //   updateUI();
  // });

  // standaloneWindow.onMessage("postStatusAction", async (data) => {
  //   console.log("postStatusAction: " + data);
  //   learningInfo.status = data.status;
  //   updateUI();
  // });
  // standaloneWindow.onMessage("postSubAction", async (data) => {
  //   console.log("postSubAction: ");
  //   console.log(JSON.stringify(data));
  //   learningInfo.learningID = data.learningID;
  //   learningInfo.nativeID = data.nativeID;
  //   learningInfo.bilingual = data.bilingual;

  //   updateUI();
  // });

  window.onMessage(MessageType.IndexSubAction, async ({ duration }) => {
    indexSubAction(duration);
    // updateUI();
  });
}

function loadPanel() {
  if (isStandaloneWindowloaded()) {
    return;
  }
  console.log("loadPanel");
  // standaloneWindow.loadFile("views/index.html");
  standaloneWindow.loadFile("views/index.html");
  standaloneWindow.setProperty({ title: "Learning Panel", resizable: false });
  standaloneWindow.setFrame(400, 840);
  bingdingOnMessage(standaloneWindow, "standaloneWindow");
  standaloneWindowloaded();
}

function showLearnPanel() {
  loadPanel();
  standaloneWindow.open();
}

// sidebar.loadFile("views/index.html");

sidebar.loadFile("views/index.html");
bingdingOnMessage(sidebar, "sidebar");

// Update learning process checkbox status
sidebar.onMessage(MessageType.PostProcessAction, async (data) => {
  console.log("postProcessAction: ");
  core.pause();
  console.log("pausexxxxxxxxxxxx");
  console.log(JSON.stringify(data));
  learningInfo.process = data;
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
