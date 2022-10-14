var mustache = require("mustache");

function postProcessAction() {
  var processData = {
    listen: document.getElementById("listen-checkbox").checked,
    learning: document.getElementById("learning-checkbox").checked,
    native: document.getElementById("native-checkbox").checked,
    listen_again: document.getElementById("listen-again-checkbox").checked,
    follow: document.getElementById("follow-checkbox").checked,
  };
  iina.postMessage("postProcessAction", processData);
}

function updateSubSelectUI() {
  var status = document.getElementById("status-btn").status;
  iina.postMessage("postStatusAction", { status });
}

function postSubAction() {
  const learnSelect = document.getElementById("learn_language");
  const nativeSelect = document.getElementById("native_language");
  const learnSelectIndex = learnSelect.options.selectedIndex;
  const nativeSelectIndex = nativeSelect.options.selectedIndex;
  let postMessage = {};
  if (learnSelectIndex >= 0 && !learnSelect[learnSelectIndex].nosubtitle) {
    postMessage.learningID = learnSelect[learnSelectIndex].value;
  }
  if (nativeSelectIndex >= 0 && !nativeSelect[nativeSelectIndex].nosubtitle) {
    postMessage.nativeID = nativeSelect[nativeSelectIndex].value;
  }
  const bilingual = document.getElementById("bilingual_checkbox");
  postMessage.bilingual = !!bilingual.checked;
  console.log(postMessage);
  iina.postMessage("postSubAction", postMessage);
}

function updateSubOptionsUI(subs, select_id) {
  const template = `
  {{#subs}}
  <option value="{{id}}" {{#selected}}selected{{/selected}}>#{{id}} {{title}}</option>
  {{/subs}}
  {{^subs}}
  <option selected nosubtitle>No subtitle</option>
  {{/subs}}
  `;
  const select = document.getElementById(select_id);
  // let selectedID = undefined;
  // if (select.options.selectedIndex) {
  //   selectedID = select.options[select.options.selectedIndex].value;
  // }
  select.innerHTML = mustache.render(template, {
    subs,
  });
  // if (selectedID) {
  //   select.querySelector(`[value="${selectedID}"]`).selected = "selected";
  // }`
}

function updateSubSelectUI(message) {
  if (message.learningID) {
    document
      .getElementById("learn_language")
      .querySelector(`[value="${message.learningID}"]`).selected = "selected";
  }
  if (message.nativeID) {
    document
      .getElementById("native_language")
      .querySelector(`[value="${message.nativeID}"]`).selected = "selected";
  }
  console.log(document.getElementById("bilingual_checkbox"));
  document.getElementById("bilingual_checkbox").checked = !!message.bilingual;
}

function updateStatusBtnUI(message) {
  if (message.status === "Start") {
    document.getElementById("status-btn").status = "start";
    document.getElementById("status-btn").innerHTML = "Stop learn";
  } else {
    document.getElementById("status-btn").status = "stop";
    document.getElementById("status-btn").innerHTML = "Start learn";
  }
}

function updateProcessUI(process) {
  document.getElementById("listen-checkbox").checked = process.listen;
  document.getElementById("learning-checkbox").checked = process.learning;
  document.getElementById("native-checkbox").checked = process.native;
  document.getElementById("follow-checkbox").checked = process.follow;
}

function updateUI(message) {
  updateSubOptionsUI(message.subtitleInfos, "learn_language");
  updateSubOptionsUI(message.subtitleInfos, "native_language");
  updateSubSelectUI(message);

  updateProcessUI(message.process);
  updateStatusBtnUI(message);
}

function init() {
  iina.postMessage("requestUpdate", {});

  document
    .getElementById("listen-checkbox")
    .addEventListener("click", postProcessAction);
  document
    .getElementById("learning-checkbox")
    .addEventListener("click", postProcessAction);
  document
    .getElementById("native-checkbox")
    .addEventListener("click", postProcessAction);
  document
    .getElementById("listen-again-checkbox")
    .addEventListener("click", postProcessAction);
  document
    .getElementById("follow-checkbox")
    .addEventListener("click", postProcessAction);

  document
    .getElementById("learn_language")
    .addEventListener("change", postSubAction);
  document
    .getElementById("native_language")
    .addEventListener("change", postSubAction);
  document
    .getElementById("bilingual_checkbox")
    .addEventListener("change", postSubAction);

  document.getElementById("loading_sub_btn").addEventListener("click", () => {
    iina.postMessage("loadingSubAction");
  });
  // Update UI
  // iina.onMessage("updateProcessUI", function (message) {
  //   console.log("updateProcessUI");
  //   updateProcessUI(message);
  // });
  // iina.onMessage("updateStatusBtnUI", function (message) {
  //   console.log("message");
  //   updateStatusBtnUI(message);
  // });
  iina.onMessage("updateUI", function (message) {
    console.log("updateUI");
    updateUI(message);
  });
}

document.addEventListener("DOMContentLoaded", init);
