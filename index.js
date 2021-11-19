/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [upload-to-kaven-file-server] /index.js
 * @create:      2021-11-18 21:09:32.138
 * @modify:      2021-11-19 15:39:08.485
 * @version:     1.0.1
 * @times:       10
 * @lines:       88
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
    logJson(process.env);

    // logJson(readdirSync(process.env.RUNNER_WORKSPACE));
    // logJson(readdirSync(process.env.GITHUB_WORKSPACE));

    console.log(__dirname, __filename);

    // inputs defined in action metadata file
    const server = core.getInput("server");
    console.log(`server: ${server}`);

    const filedName = core.getInput("field-name");
    const debug = core.getBooleanInput("debug");

    let file = core.getInput("file");
    let newFile = core.getInput("rename-file-to");

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