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
var quantitativeScale_1 = require("../scales/quantitativeScale");
var component_1 = require("./component");
var Gridlines = (function (_super) {
    __extends(Gridlines, _super);
    /**
     * @constructor
     * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
     * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
     */
    function Gridlines(xScale, yScale) {
        var _this = this;
        if (xScale != null && !(quantitativeScale_1.QuantitativeScale.prototype.isPrototypeOf(xScale))) {
            throw new Error("xScale needs to inherit from Scale.QuantitativeScale");
        }
        if (yScale != null && !(quantitativeScale_1.QuantitativeScale.prototype.isPrototypeOf(yScale))) {
            throw new Error("yScale needs to inherit from Scale.QuantitativeScale");
        }
        _this = _super.call(this) || this;
        _this.addClass("gridlines");
        _this._xScale = xScale;
        _this._yScale = yScale;
        _this._renderCallback = function (scale) { return _this.render(); };
        if (_this._xScale) {
            _this._xScale.onUpdate(_this._renderCallback);
        }
        if (_this._yScale) {
            _this._yScale.onUpdate(_this._renderCallback);
        }
        return _this;
    }
    Gridlines.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this._xScale) {
            this._xScale.offUpdate(this._renderCallback);
        }
        if (this._yScale) {
            this._yScale.offUpdate(this._renderCallback);
        }
        return this;
    };
    Gridlines.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._xLinesContainer = this.content().append("g").classed("x-gridlines", true);
        this._yLinesContainer = this.content().append("g").classed("y-gridlines", true);
    };
    Gridlines.prototype.renderImmediately = function () {
        _super.prototype.renderImmediately.call(this);
        this._redrawXLines();
        this._redrawYLines();
        return this;
    };
    Gridlines.prototype.computeLayout = function (origin, availableWidth, availableHeight) {
        _super.prototype.computeLayout.call(this, origin, availableWidth, availableHeight);
        if (this._xScale != null) {
            this._xScale.range([0, this.width()]);
        }
        if (this._yScale != null) {
            this._yScale.range([this.height(), 0]);
        }
        return this;
    };
    Gridlines.prototype._redrawXLines = function () {
        var _this = this;
        if (this._xScale) {
            var xTicks = this._xScale.ticks();
            var getScaledXValue = function (tickVal) { return _this._xScale.scale(tickVal); };
            var xLinesUpdate = this._xLinesContainer.selectAll("line").data(xTicks);
            var xLines = xLinesUpdate.enter().append("line").merge(xLinesUpdate);
            xLines.attr("x1", getScaledXValue)
                .attr("y1", 0)
                .attr("x2", getScaledXValue)
                .attr("y2", this.height())
                .classed("zeroline", function (t) { return t === 0; });
            xLinesUpdate.exit().remove();
        }
    };
    Gridlines.prototype._redrawYLines = function () {
        var _this = this;
        if (this._yScale) {
            var yTicks = this._yScale.ticks();
            var getScaledYValue = function (tickVal) { return _this._yScale.scale(tickVal); };
            var yLinesUpdate = this._yLinesContainer.selectAll("line").data(yTicks);
            var yLines = yLinesUpdate.enter().append("line").merge(yLinesUpdate);
            yLines.attr("x1", 0)
                .attr("y1", getScaledYValue)
                .attr("x2", this.width())
                .attr("y2", getScaledYValue)
                .classed("zeroline", function (t) { return t === 0; });
            yLinesUpdate.exit().remove();
        }
    };
    return Gridlines;
}(component_1.Component));
exports.Gridlines = Gridlines;
