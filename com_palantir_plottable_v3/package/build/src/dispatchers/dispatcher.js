/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
var Utils = require("../utils");
var Dispatcher = (function () {
    function Dispatcher() {
        this._eventToProcessingFunction = {};
        this._eventNameToCallbackSet = {};
        this._connected = false;
    }
    Dispatcher.prototype._hasNoCallbacks = function () {
        var eventNames = Object.keys(this._eventNameToCallbackSet);
        for (var i = 0; i < eventNames.length; i++) {
            if (this._eventNameToCallbackSet[eventNames[i]].size !== 0) {
                return false;
            }
        }
        return true;
    };
    Dispatcher.prototype._connect = function () {
        var _this = this;
        if (this._connected) {
            return;
        }
        Object.keys(this._eventToProcessingFunction).forEach(function (event) {
            var processingFunction = _this._eventToProcessingFunction[event];
            document.addEventListener(event, processingFunction);
        });
        this._connected = true;
    };
    Dispatcher.prototype._disconnect = function () {
        var _this = this;
        if (this._connected && this._hasNoCallbacks()) {
            Object.keys(this._eventToProcessingFunction).forEach(function (event) {
                var processingFunction = _this._eventToProcessingFunction[event];
                document.removeEventListener(event, processingFunction);
            });
            this._connected = false;
        }
    };
    Dispatcher.prototype._addCallbackForEvent = function (eventName, callback) {
        if (this._eventNameToCallbackSet[eventName] == null) {
            this._eventNameToCallbackSet[eventName] = new Utils.CallbackSet();
        }
        this._eventNameToCallbackSet[eventName].add(callback);
        this._connect();
    };
    Dispatcher.prototype._removeCallbackForEvent = function (eventName, callback) {
        if (this._eventNameToCallbackSet[eventName] != null) {
            this._eventNameToCallbackSet[eventName].delete(callback);
        }
        this._disconnect();
    };
    Dispatcher.prototype._callCallbacksForEvent = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var callbackSet = this._eventNameToCallbackSet[eventName];
        if (callbackSet != null) {
            callbackSet.callCallbacks.apply(callbackSet, args);
        }
    };
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
