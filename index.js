/********************************************************************
 * @author:      Kaven
 * @email:       kaven@wuwenkai.com
 * @website:     http://blog.kaven.xyz
 * @file:        [kaven-github-action] /index.js
 * @create:      2021-11-18 21:09:32.138
 * @modify:      2021-11-18 21:17:07.889
 * @version:     1.0.1
 * @times:       2
 * @lines:       30
 * @copyright:   Copyright © 2021 Kaven. All Rights Reserved.
 * @description: [description]
 * @license:     [license]
 ********************************************************************/

const core = require("@actions/core");
const github = require("@actions/github");

try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput("who-to-greet");
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}