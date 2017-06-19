"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const http = require('http');
const _ = require('lodash');
const socketIO = require('socket.io');
const browserrunner_1 = require('./browserrunner');
const config = require('./config');
const webserver_1 = require('./webserver');
// Steps (& Hooks)
function setupOverrides(context) {
    return __awaiter(this, void 0, Promise, function* () {
        if (context.options.registerHooks) {
            context.options.registerHooks(context);
        }
    });
}
exports.setupOverrides = setupOverrides;
function loadPlugins(context) {
    return __awaiter(this, void 0, Promise, function* () {
        context.emit('log:debug', 'step: loadPlugins');
        const plugins = yield context.plugins();
        // built in quasi-plugin.
        webserver_1.webserver(context);
        // Actual plugins.
        yield Promise.all(plugins.map(plugin => plugin.execute(context)));
        return plugins;
    });
}
exports.loadPlugins = loadPlugins;
function configure(context) {
    return __awaiter(this, void 0, Promise, function* () {
        context.emit('log:debug', 'step: configure');
        const options = context.options;
        _.defaults(options, config.defaults());
        yield config.expand(context);
        // Note that we trigger the configure hook _after_ filling in the `options`
        // object.
        //
        // If you want to modify options prior to this; do it during plugin init.
        yield context.emitHook('configure');
        // Even if the options don't validate; useful debugging info.
        const cleanOptions = _.omit(options, 'output');
        context.emit('log:debug', 'configuration:', cleanOptions);
        yield config.validate(options);
    });
}
exports.configure = configure;
/**
 * The prepare step is where a lot of the runner's initialization occurs. This
 * is also typically where a plugin will want to spin up any long-running
 * process it requires.
 *
 * Note that some "plugins" are also built directly into WCT (webserver).
 */
function prepare(context) {
    return __awaiter(this, void 0, Promise, function* () {
        yield context.emitHook('prepare');
    });
}
exports.prepare = prepare;
function runTests(context) {
    return __awaiter(this, void 0, Promise, function* () {
        context.emit('log:debug', 'step: runTests');
        const failed = false;
        const result = runBrowsers(context);
        const runners = result.runners;
        context._testRunners = runners;
        context._socketIOServer = socketIO(context._httpServer);
        context._socketIOServer.on('connection', function (socket) {
            context.emit('log:debug', 'Test client opened sideband socket');
            socket.on('client-event', function (data) {
                const runner = runners[data.browserId];
                if (!runner) {
                    throw new Error(`Unable to find browser runner for ` +
                        `browser with id: ${data.browserId}`);
                }
                runner.onEvent(data.event, data.data);
            });
        });
        yield result.completionPromise;
    });
}
exports.runTests = runTests;
function cancelTests(context) {
    if (!context._testRunners) {
        return;
    }
    context._testRunners.forEach(function (tr) {
        tr.quit();
    });
}
exports.cancelTests = cancelTests;
// Helpers
function runBrowsers(context) {
    const options = context.options;
    const numActiveBrowsers = options.activeBrowsers.length;
    if (numActiveBrowsers === 0) {
        throw new Error('No browsers configured to run');
    }
    // TODO(nevir): validate browser definitions.
    // Up the socket limit so that we can maintain more active requests.
    // TODO(nevir): We should be queueing the browsers above some limit too.
    http.globalAgent.maxSockets =
        Math.max(http.globalAgent.maxSockets, numActiveBrowsers * 2);
    context.emit('run-start', options);
    const errors = [];
    const promises = [];
    const runners = options.activeBrowsers.map(function (browser, id) {
        // Needed by both `BrowserRunner` and `CliReporter`.
        browser.id = id;
        _.defaults(browser, options.browserOptions);
        const runner = new browserrunner_1.BrowserRunner(context, browser, options);
        promises.push(runner.donePromise.then(() => {
            context.emit('log:debug', browser, 'BrowserRunner complete');
        }, (error) => {
            context.emit('log:debug', browser, 'BrowserRunner complete');
            errors.push(error);
        }));
        return runner;
    });
    return {
        runners: runners,
        completionPromise: (function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(promises);
                const error = errors.length > 0 ? _.union(errors).join(', ') : null;
                context.emit('run-end', error);
                // TODO(nevir): Better rationalize run-end and hook.
                yield context.emitHook('cleanup');
                if (error) {
                    throw new Error(error);
                }
            });
        }())
    };
}