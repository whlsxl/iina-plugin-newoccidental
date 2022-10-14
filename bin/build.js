#!/usr/bin/env node
"use strict";

var shell = require("shelljs");
shell.pushd("pages");
shell.rm("-rf", "build");
shell.exec("npm run build");
shell.popd();
shell.rm("-rf", "views");
shell.exec("sleep 1");
shell.mkdir("views");
shell.exec("sleep 1");
shell.cp("-rf", "pages/build/*", "views/");
if (shell.env["DEBUG"]) {
  shell.cp("debug/eruda.js", "views/");
}
shell.rm("-rf", "dist");
shell.mkdir("dist");
shell.exec("parcel build .");
