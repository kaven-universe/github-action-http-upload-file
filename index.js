/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [upload-to-kaven-file-server] /index.js
 * @create:      2021-11-18 21:09:32.138
 * @modify:      2021-11-19 17:00:49.263
 * @version:     1.0.1
 * @times:       11
 * @lines:       85
 * @copyright:   Copyright © 2021 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

const { existsSync, createReadStream, renameSync } = require("fs");
const { join, dirname } = require("path");

const core = require("@actions/core");
const github = require("@actions/github");

const FormData = require("form-data");


function logJson(data) {
    console.log(JSON.stringify(data, undefined, 2));
}

try {
    console.log(__dirname, __filename);

    // inputs defined in action metadata file
    const debug = core.getBooleanInput("debug");
    const server = core.getInput("server");
    const filedName = core.getInput("field-name");

    let file = core.getInput("file");
    let newFile = core.getInput("rename-file-to");

    if (debug) {
        logJson(process.env);
    }

    if (!existsSync(file)) {
        if (debug) {
            file = __filename;
        } else {
            core.setFailed(`file not exists: ${file}`);
            return;
        }
    }

    if (newFile) {

        const dir = dirname(file);
        newFile = join(dir, newFile);

        renameSync(file, newFile);
        console.log(`rename ${file} to ${newFile}`);

        file = newFile;
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

    core.setOutput("file", file);

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}