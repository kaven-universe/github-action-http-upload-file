/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [upload-to-kaven-file-server] /index.js
 * @create:      2021-11-18 21:09:32.138
 * @modify:      2021-11-18 23:19:28.549
 * @version:     1.0.1
 * @times:       5
 * @lines:       69
 * @copyright:   Copyright © 2021 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

const { existsSync, createReadStream } = require("fs");

const core = require("@actions/core");
const github = require("@actions/github");

const FormData = require("form-data");
const { join } = require("path");

function logJson(data) {
    console.log(JSON.stringify(data, undefined, 2));
}

try {
    logJson(process.env);

    // inputs defined in action metadata file
    const server = core.getInput("server");
    console.log(`server: ${server}`);

    const filedName = core.getInput("field-name");

    let file = core.getInput("file");
    if (!existsSync(file)) {
        file = join(process.env.GITHUB_WORKSPACE, file);

        if (!existsSync(file)) {
            core.setFailed(`file not exists: ${file}`);
            return;
        }
    }

    const form = new FormData();
    form.append("runId", github.context.runId);
    form.append("runNumber", github.context.runNumber);
    form.append(filedName, createReadStream(file));

    form.submit(server, function(err, res) {
        if (err) {
            core.setFailed(err.message);
        }

        // res – response object (http.IncomingMessage)  //
        res.resume();
    });

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}