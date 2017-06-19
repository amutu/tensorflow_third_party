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
var timeAxis_1 = require("../axes/timeAxis");
var quantitativeScale_1 = require("./quantitativeScale");
var Time = (function (_super) {
    __extends(Time, _super);
    /**
     * A Time Scale maps Date objects to numbers.
     *
     * @constructor
     */
    function Time() {
        var _this = _super.call(this) || this;
        _this._d3Scale = d3.scaleTime();
        _this.autoDomain();
        return _this;
    }
    /**
     * Returns an array of ticks values separated by the specified interval.
     *
     * @param {string} interval A string specifying the interval unit.
     * @param {number?} [step] The number of multiples of the interval between consecutive ticks.
     * @return {Date[]}
     */
    Time.prototype.tickInterval = function (interval, step) {
        if (step === void 0) { step = 1; }
        // temporarily creats a time scale from our linear scale into a time scale so we can get access to its api
        var tempScale = d3.scaleTime();
        var d3Interval = Time.timeIntervalToD3Time(interval).every(step);
        tempScale.domain(this.domain());
        tempScale.range(this.range());
        return tempScale.ticks(d3Interval);
    };
    Time.prototype._setDomain = function (values) {
        if (values[1] < values[0]) {
            throw new Error("Scale.Time domain values must be in chronological order");
        }
        return _super.prototype._setDomain.call(this, values);
    };
    Time.prototype._defaultExtent = function () {
        return [new Date("1970-01-01"), new Date("1970-01-02")];
    };
    Time.prototype._expandSingleValueDomain = function (singleValueDomain) {
        var startTime = singleValueDomain[0].getTime();
        var endTime = singleValueDomain[1].getTime();
        if (startTime === endTime) {
            var startDate = new Date(startTime);
            startDate.setDate(startDate.getDate() - 1);
            var endDate = new Date(endTime);
            endDate.setDate(endDate.getDate() + 1);
            return [startDate, endDate];
        }
        return singleValueDomain;
    };
    Time.prototype.scale = function (value) {
        return this._d3Scale(value);
    };
    Time.prototype.scaleTransformation = function (value) {
        return this.scale(new Date(value));
    };
    Time.prototype.invertedTransformation = function (value) {
        return this.invert(value).getTime();
    };
    Time.prototype.getTransformationDomain = function () {
        var dates = this.domain();
        return [dates[0].valueOf(), dates[1].valueOf()];
    };
    Time.prototype._getDomain = function () {
        return this._backingScaleDomain();
    };
    Time.prototype._backingScaleDomain = function (values) {
        if (values == null) {
            return this._d3Scale.domain();
        }
        else {
            this._d3Scale.domain(values);
            return this;
        }
    };
    Time.prototype._getRange = function () {
        return this._d3Scale.range();
    };
    Time.prototype._setRange = function (values) {
        this._d3Scale.range(values);
    };
    Time.prototype.invert = function (value) {
        return this._d3Scale.invert(value);
    };
    Time.prototype.defaultTicks = function () {
        return this._d3Scale.ticks(Time._DEFAULT_NUM_TICKS);
    };
    Time.prototype._niceDomain = function (domain) {
        return this._d3Scale.copy().domain(domain).nice().domain();
    };
    /**
     * Transforms the Plottable TimeInterval string into a d3 time interval equivalent.
     * If the provided TimeInterval is incorrect, the default is d3.timeYear
     */
    Time.timeIntervalToD3Time = function (timeInterval) {
        switch (timeInterval) {
            case timeAxis_1.TimeInterval.second:
                return d3.timeSecond;
            case timeAxis_1.TimeInterval.minute:
                return d3.timeMinute;
            case timeAxis_1.TimeInterval.hour:
                return d3.timeHour;
            case timeAxis_1.TimeInterval.day:
                return d3.timeDay;
            case timeAxis_1.TimeInterval.week:
                return d3.timeWeek;
            case timeAxis_1.TimeInterval.month:
                return d3.timeMonth;
            case timeAxis_1.TimeInterval.year:
                return d3.timeYear;
            default:
                throw Error("TimeInterval specified does not exist: " + timeInterval);
        }
    };
    return Time;
}(quantitativeScale_1.QuantitativeScale));
exports.Time = Time;
