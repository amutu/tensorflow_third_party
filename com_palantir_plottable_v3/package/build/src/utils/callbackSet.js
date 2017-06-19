/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var set_1 = require("./set");
/**
 * A set of callbacks which can be all invoked at once.
 * Each callback exists at most once in the set (based on reference equality).
 * All callbacks should have the same signature.
 */
var CallbackSet = (function (_super) {
    __extends(CallbackSet, _super);
    function CallbackSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CallbackSet.prototype.callCallbacks = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.forEach(function (callback) {
            callback.apply(_this, args);
        });
        return this;
    };
    return CallbackSet;
}(set_1.Set));
exports.CallbackSet = CallbackSet;
