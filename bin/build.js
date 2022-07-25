#!/usr/bin/env node
"use strict";

var shell = require("shelljs");
shell.pushd("pages");
shell.rm("-rf", "build");
shell.exec("npm run build");
shell.popd();
shell.cp("-rf", "pages/build/*", "views/");
shell.rm("-rf", "dist");
shell.exec("parcel build .");
