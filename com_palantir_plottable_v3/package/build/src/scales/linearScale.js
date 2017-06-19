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
var d3 = require("d3");
var quantitativeScale_1 = require("./quantitativeScale");
var Linear = (function (_super) {
    __extends(Linear, _super);
    /**
     * @constructor
     */
    function Linear() {
        var _this = _super.call(this) || this;
        _this._d3Scale = d3.scaleLinear();
        return _this;
    }
    Linear.prototype._defaultExtent = function () {
        return [0, 1];
    };
    Linear.prototype._expandSingleValueDomain = function (singleValueDomain) {
        if (singleValueDomain[0] === singleValueDomain[1]) {
            return [singleValueDomain[0] - 1, singleValueDomain[1] + 1];
        }
        return singleValueDomain;
    };
    Linear.prototype.scale = function (value) {
        return this._d3Scale(value);
    };
    Linear.prototype.scaleTransformation = function (value) {
        return this.scale(value);
    };
    Linear.prototype.invertedTransformation = function (value) {
        return this.invert(value);
    };
    Linear.prototype.getTransformationDomain = function () {
        return this.domain();
    };
    Linear.prototype._getDomain = function () {
        return this._backingScaleDomain();
    };
    Linear.prototype._backingScaleDomain = function (values) {
        if (values == null) {
            return this._d3Scale.domain();
        }
        else {
            this._d3Scale.domain(values);
            return this;
        }
    };
    Linear.prototype._getRange = function () {
        return this._d3Scale.range();
    };
    Linear.prototype._setRange = function (values) {
        this._d3Scale.range(values);
    };
    Linear.prototype.invert = function (value) {
        return this._d3Scale.invert(value);
    };
    Linear.prototype.defaultTicks = function () {
        return this._d3Scale.ticks(Linear._DEFAULT_NUM_TICKS);
    };
    Linear.prototype._niceDomain = function (domain, count) {
        return this._d3Scale.copy().domain(domain).nice(count).domain();
    };
    return Linear;
}(quantitativeScale_1.QuantitativeScale));
exports.Linear = Linear;
