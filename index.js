/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [github-action-http-upload-file] /index.js
 * @create:      2021-11-18 21:09:32.138
 * @modify:      2022-11-11 11:29:26.477
 * @version:     1.0.1
 * @times:       20
 * @lines:       140
 * @copyright:   Copyright © 2021-2022 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

/* eslint-disable no-console */

const { existsSync, createReadStream, renameSync, statSync } = require("fs");
const { join, dirname } = require("path");

const core = require("@actions/core");
const github = require("@actions/github");

const FormData = require("form-data");
const { FileSize } = require("kaven-basic");


function logJson(data) {
    console.log(JSON.stringify(data, undefined, 2));
}

/**
 * 
 * @param {String} server 
 * @param {import("form-data")} form 
 * @param {Number} fileSize 
 */
function upload(server, form, fileSize = 0) {
    let progress = 0;

    // (available to req handler)
    const expectedLength = form._lastBoundary().length + form._overheadLength + fileSize;
    // const expectedLength = form.getLengthSync() + fileSize;

    const R = form.submit(server, function(err, res) {
        if (err) {
            core.setFailed(err.message);
        }

        console.log("statusCode:", res.statusCode);

        // unstuck new streams
        res.resume();
    });

    // augment into request
    const oWrite = R.write;
    R.write = function(chunk) {
        return oWrite.call(this, chunk, function() {
            form.emit("progress", chunk);
        });
    };

    // track progress
    form.on("progress", function(chunk) {
        progress += chunk.length;

        console.log(`progress: ${(progress / expectedLength * 100).toFixed(2)}%, ${FileSize(progress)} of ${FileSize(expectedLength)}`);
    });
}

try {
    // inputs defined in action metadata file
    const debug = core.getBooleanInput("debug");
    const server = core.getInput("server");
    const filedName = core.getInput("field-name");
    const json_stringify_form_data = core.getInput("json_stringify_form_data");

    let file = core.getInput("file");
    let newFile = core.getInput("rename-file-to");

    if (debug) {
        logJson(process.env);

        console.log(__dirname, __filename);
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

    const fileSize = statSync(file).size;

    const form = new FormData();
    form.append("runId", github.context.runId);
    form.append("runNumber", github.context.runNumber);    

    try {
        const json_form_data = JSON.parse(json_stringify_form_data);

        if (debug) {
            console.log(json_form_data);
        }

        for (const item of json_form_data) {
            form.append(item.key, item.value);
        }
    } catch (e) {
        console.warn(json_stringify_form_data, e);
    }

    form.append(filedName, createReadStream(file));

    console.log(`upload file: ${file}, size: ${FileSize(fileSize)}`);
    upload(server, form, fileSize);

    core.setOutput("file", file);

    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}