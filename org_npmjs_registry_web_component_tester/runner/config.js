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
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const findup = require('findup-sync');
const fs = require('fs');
const _ = require('lodash');
const nomnom = require('nomnom');
const path = require('path');
const serveWaterfall = require('serve-waterfall');
const paths = require('./paths');
const HOME_DIR = path.resolve(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE);
const JSON_MATCHER = 'wct.conf.json';
const CONFIG_MATCHER = 'wct.conf.*';
const WCT_ROOT = path.resolve(__dirname, '..');
// The full set of options, as a reference.
function defaults() {
    return {
        // The test suites that should be run.
        suites: ['test/'],
        // Output stream to write log messages to.
        output: process.stdout,
        // Whether the output stream should be treated as a TTY (and be given more
        // complex output formatting). Defaults to `output.isTTY`.
        ttyOutput: undefined,
        // Spew all sorts of debugging messages.
        verbose: false,
        // Silence output
        quiet: false,
        // Display test results in expanded form. Verbose implies expanded.
        expanded: false,
        // The on-disk path where tests & static files should be served from. Paths
        // (such as `suites`) are evaluated relative to this.
        //
        // Defaults to the project directory.
        root: undefined,
        // Idle timeout for tests.
        testTimeout: 90 * 1000,
        // Whether the browser should be closed after the tests run.
        persistent: false,
        // Additional .js files to include in *generated* test indexes.
        extraScripts: [],
        // Configuration options passed to the browser client.
        clientOptions: {
            // Also see `webserver.pathMappings` below.
            root: '/components/',
        },
        // Webdriver capabilities objects for each browser that should be run.
        //
        // Capabilities can also contain a `url` value which is either a string URL
        // for the webdriver endpoint, or {hostname:, port:, user:, pwd:}.
        //
        // Most of the time you will want to rely on the WCT browser plugins to fill
        // this in for you (e.g. via `--local`, `--sauce`, etc).
        activeBrowsers: [],
        // Default capabilities to use when constructing webdriver connections (for
        // each browser specified in `activeBrowsers`). A handy place to hang common
        // configuration.
        //
        // Selenium: https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
        // Sauce:    https://docs.saucelabs.com/reference/test-configuration/
        browserOptions: {},
        // The plugins that should be loaded, and their configuration.
        //
        // When an array, the named plugins will be loaded with their default
        // configuration. When an object, each key maps to a plugin, and values are
        // configuration values to be merged.
        //
        //   plugins: {
        //     local: {browsers: ['firefox', 'chrome']},
        //   }
        //
        plugins: ['local', 'sauce'],
        // Callback that allows you to perform advanced configuration of the WCT
        // runner.
        //
        // The hook is given the WCT context, and can generally be written like a
        // plugin. For example, to serve custom content via the internal webserver:
        //
        //     registerHooks: function(wct) {
        //       wct.hook('prepare:webserver', function(app) {
        //         app.use(...);
        //         return Promise.resolve();
        //       });
        //     }
        //
        registerHooks: function (wct) { },
        // Whether `wct.conf.*` is allowed, or only `wct.conf.json`.
        //
        // Handy for CI suites that want to be locked down.
        enforceJsonConf: false,
        // Configuration options for the webserver that serves up your test files
        // and dependencies.
        //
        // Typically, you will not need to modify these values.
        webserver: {
            // The port that the webserver should run on. A port will be determined at
            // runtime if none is provided.
            port: undefined,
            // The hostname used when generating URLs for the webdriver client.
            hostname: 'localhost',
            // mappings of URL prefix to on disk paths that the web server should
            // serve via https://github.com/PolymerLabs/serve-waterfall
            pathMappings: serveWaterfall.mappings.WEB_COMPONENT.concat([
                // We also expose built in WCT dependencies, but with lower priority
                // than the project's components.
                {
                    '/components/sinonjs': path.join(WCT_ROOT, 'node_modules', 'sinon', 'pkg')
                },
                {
                    '/components/lodash/lodash.js': path.join(WCT_ROOT, 'node_modules', 'lodash', 'index.js')
                },
                { '/components': path.join(WCT_ROOT, 'node_modules') },
                // npm 3 paths
                { '/components/sinonjs': path.join(WCT_ROOT, '..', 'sinon', 'pkg') }, {
                    '/components/lodash/lodash.js': path.join(WCT_ROOT, '..', 'lodash', 'index.js')
                },
                { '/components/': path.join(WCT_ROOT, '..') }
            ]),
            // The URL prefix that serves contents from the project root.
            urlPrefix: '/components/<basename>',
        },
    };
}
exports.defaults = defaults;
/** nomnom configuration for command line arguments.
 *
 * This might feel like duplication with `defaults()`, and out of place (why not
 * in `cli.js`?). But, not every option matches a configurable value, and it is
 * best to keep the configuration for these together to help keep them in sync.
 */
const ARG_CONFIG = {
    persistent: {
        help: 'Keep browsers active (refresh to rerun tests).',
        abbr: 'p',
        flag: true,
    },
    root: {
        help: 'The root directory to serve tests from.',
        transform: path.resolve,
    },
    plugins: {
        help: 'Plugins that should be loaded.',
        metavar: 'NAME',
        full: 'plugin',
        list: true,
    },
    skipPlugins: {
        help: 'Configured plugins that should _not_ be loaded.',
        metavar: 'NAME',
        full: 'skip-plugin',
        list: true,
    },
    expanded: {
        help: 'Log a status line for each test run.',
        flag: true,
    },
    verbose: {
        help: 'Turn on debugging output.',
        flag: true,
    },
    quiet: {
        help: 'Silence output.',
        flag: true,
    },
    simpleOutput: {
        help: 'Avoid fancy terminal output.',
        flag: true,
    },
    skipUpdateCheck: {
        help: 'Don\'t check for updates.',
        full: 'skip-update-check',
        flag: true,
    },
    'webserver.port': {
        help: 'A port to use for the test webserver.',
        full: 'webserver-port',
    },
    'webserver.hostname': {
        full: 'webserver-hostname',
        hidden: true,
    },
    // Managed by supports-color; let's not freak out if we see it.
    color: { flag: true },
    // Deprecated
    browsers: {
        abbr: 'b',
        hidden: true,
        list: true,
    },
    remote: {
        abbr: 'r',
        hidden: true,
        flag: true,
    },
};
// Values that should be extracted when pre-parsing args.
const PREPARSE_ARGS = ['plugins', 'skipPlugins', 'simpleOutput', 'skipUpdateCheck'];
/**
 * Discovers appropriate config files (global, and for the project), merging
 * them, and returning them.
 *
 * @param {boolean} jsonOnly
 * @param {string} root
 * @return {!Object} The merged configuration.
 */
function fromDisk(jsonOnly, root) {
    const matcher = jsonOnly ? JSON_MATCHER : CONFIG_MATCHER;
    const globalFile = path.join(HOME_DIR, matcher);
    const projectFile = findup(matcher, { nocase: true, cwd: root });
    // Load a shared config from the user's home dir, if they have one, and then
    // try the project-specific path (starting at the current working directory).
    const paths = _.union([globalFile, projectFile]);
    const configs = _.filter(paths, fs.existsSync).map(loadProjectFile);
    const options = merge.apply(null, configs);
    if (!options.root && projectFile && projectFile !== globalFile) {
        options.root = path.dirname(projectFile);
    }
    return options;
}
exports.fromDisk = fromDisk;
/**
 * @param {string} file
 * @return {Object?}
 */
function loadProjectFile(file) {
    // If there are _multiple_ configs at this path, prefer `json`
    if (path.extname(file) === '.js' && fs.existsSync(file + 'on')) {
        file = file + 'on';
    }
    try {
        if (path.extname(file) === '.json') {
            return JSON.parse(fs.readFileSync(file, 'utf-8'));
        }
        else {
            return require(file);
        }
    }
    catch (error) {
        throw new Error(`Failed to load WCT config "${file}": ' + error.message`);
    }
}
/**
 * Runs a simplified options parse over the command line arguments, extracting
 * any values that are necessary for a full parse.
 *
 * At the moment, the only values extracted are `--plugin` and `--simpleOutput`.
 *
 * @param {!Array<string>} args
 * @return {!Object}
 */
function preparseArgs(args) {
    // Don't let it short circuit on help.
    args = _.difference(args, ['--help', '-h']);
    const parser = nomnom();
    parser.options(ARG_CONFIG);
    parser.printer(function () { }); // No-op output & errors.
    const options = parser.parse(args);
    return _expandOptionPaths(_.pick(options, PREPARSE_ARGS));
}
exports.preparseArgs = preparseArgs;
/**
 * Runs a complete options parse over the args, respecting plugin options.
 *
 * @param {!Context} context The context, containing plugin state and any base
 *     options to merge into.
 * @param {!Array<string>} args The args to parse.
 */
function parseArgs(context, args) {
    return __awaiter(this, void 0, Promise, function* () {
        const parser = nomnom();
        parser.script('wct');
        parser.options(ARG_CONFIG);
        const plugins = yield context.plugins();
        plugins.forEach(_configurePluginOptions.bind(null, parser));
        const options = _expandOptionPaths(normalize(parser.parse(args)));
        if (options._ && options._.length > 0) {
            options.suites = options._;
        }
        context.options = merge(context.options, options);
    });
}
exports.parseArgs = parseArgs;
function _configurePluginOptions(parser, plugin) {
    /** HACK(rictic): this looks wrong, cliConfig shouldn't have a length. */
    if (!plugin.cliConfig || plugin.cliConfig.length === 0) {
        return;
    }
    // Group options per plugin. It'd be nice to also have a header, but that ends
    // up shifting all the options over.
    parser.option('plugins.' + plugin.name + '.', { string: ' ' });
    _.each(plugin.cliConfig, function (config, key) {
        // Make sure that we don't expose the name prefixes.
        if (!config.full) {
            config.full = key;
        }
        parser.option('plugins.' + plugin.name + '.' + key, config);
    });
}
function _expandOptionPaths(options) {
    const result = {};
    _.each(options, function (value, key) {
        let target = result;
        const parts = key.split('.');
        for (const part of parts.slice(0, -1)) {
            target = target[part] = target[part] || {};
        }
        target[_.last(parts)] = value;
    });
    return result;
}
function merge() {
    let configs = Array.prototype.slice.call(arguments);
    const result = {};
    configs = configs.map(normalize);
    _.merge.apply(_, [result].concat(configs));
    // false plugin configs are preserved.
    configs.forEach(function (config) {
        _.each(config.plugins, function (value, key) {
            if (value === false) {
                result.plugins[key] = false;
            }
        });
    });
    return result;
}
exports.merge = merge;
function normalize(config) {
    if (_.isArray(config.plugins)) {
        const pluginConfigs = {};
        for (let i = 0, name; name = config.plugins[i]; i++) {
            // A named plugin is explicitly enabled (e.g. --plugin foo).
            pluginConfigs[name] = { disabled: false };
        }
        config.plugins = pluginConfigs;
    }
    // Always wins.
    if (config.skipPlugins) {
        config.plugins = config.plugins || {};
        for (let i = 0, name; name = config.skipPlugins[i]; i++) {
            config.plugins[name] = false;
        }
    }
    return config;
}
exports.normalize = normalize;
/**
 * Expands values within the configuration based on the current environment.
 *
 * @param {!Context} context The context for the current run.
 */
function expand(context) {
    return __awaiter(this, void 0, Promise, function* () {
        const options = context.options;
        let root = context.options.root || process.cwd();
        context.options.root = root = path.resolve(root);
        options.origSuites = _.clone(options.suites);
        expandDeprecated(context);
        options.suites = yield paths.expand(root, options.suites);
    });
}
exports.expand = expand;
/**
 * Expands any options that have been deprecated, and warns about it.
 *
 * @param {!Context} context The context for the current run.
 */
function expandDeprecated(context) {
    const options = context.options;
    // We collect configuration fragments to be merged into the options object.
    const fragments = [];
    let browsers = (_.isArray(options.browsers) ? options.browsers : [options.browsers]);
    browsers = _.compact(browsers);
    if (browsers.length > 0) {
        context.emit('log:warn', 'The --browsers flag/option is deprecated. Please use ' +
            '--local and --sauce instead, or configure via plugins.' +
            '[local|sauce].browsers.');
        const fragment = { plugins: { sauce: {}, local: {} } };
        fragments.push(fragment);
        for (const browser of browsers) {
            const name = browser.browserName || browser;
            const plugin = browser.platform || name.indexOf('/') !== -1 ?
                'sauce' :
                'local';
            fragment.plugins[plugin].browsers =
                fragment.plugins[plugin].browsers || [];
            fragment.plugins[plugin].browsers.push(browser);
        }
        delete options.browsers;
    }
    if (options.sauce) {
        context.emit('log:warn', 'The sauce configuration key is deprecated. Please use ' +
            'plugins.sauce instead.');
        fragments.push({
            plugins: { sauce: options.sauce },
        });
        delete options.sauce;
    }
    if (options.remote) {
        context.emit('log:warn', 'The --remote flag is deprecated. Please use ' +
            '--sauce default instead.');
        fragments.push({
            plugins: { sauce: { browsers: ['default'] } },
        });
        delete options.remote;
    }
    if (fragments.length > 0) {
        // We are careful to modify context.options in place.
        _.merge(context.options, merge.apply(null, fragments));
    }
}
/**
 * @param {!Object} options The configuration to validate.
 */
function validate(options) {
    return __awaiter(this, void 0, Promise, function* () {
        if (options['webRunner']) {
            throw new Error('webRunner is no longer a supported configuration option. ' +
                'Please list the files you wish to test as arguments, ' +
                'or as `suites` in a configuration object.');
        }
        if (options['component']) {
            throw new Error('component is no longer a supported configuration option. ' +
                'Please list the files you wish to test as arguments, ' +
                'or as `suites` in a configuration object.');
        }
        if (options.activeBrowsers.length === 0) {
            throw new Error('No browsers configured to run');
        }
        if (options.suites.length === 0) {
            const root = options.root || process.cwd();
            const globs = options.origSuites.join(', ');
            throw new Error('No test suites were found matching your configuration\n' +
                '\n' +
                '  WCT searched for .js and .html files matching: ' + globs + '\n' +
                '\n' +
                '  Relative paths were resolved against: ' + root);
        }
    });
}
exports.validate = validate;