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
var Typesetter = require("typesettable");
var Utils = require("../utils");
var barPlot_1 = require("./barPlot");
var StackedBar = (function (_super) {
    __extends(StackedBar, _super);
    /**
     * A StackedBar Plot stacks bars across Datasets based on the primary value of the bars.
     *   On a vertical StackedBar Plot, the bars with the same X value are stacked.
     *   On a horizontal StackedBar Plot, the bars with the same Y value are stacked.
     *
     * @constructor
     * @param {Scale} xScale
     * @param {Scale} yScale
     * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
     */
    function StackedBar(orientation) {
        if (orientation === void 0) { orientation = "vertical"; }
        var _this = _super.call(this, orientation) || this;
        _this.addClass("stacked-bar-plot");
        _this._stackingOrder = "bottomup";
        _this._stackingResult = new Utils.Map();
        _this._stackedExtent = [];
        return _this;
    }
    StackedBar.prototype.x = function (x, xScale) {
        if (x == null) {
            return _super.prototype.x.call(this);
        }
        if (xScale == null) {
            _super.prototype.x.call(this, x);
        }
        else {
            _super.prototype.x.call(this, x, xScale);
        }
        this._updateStackExtentsAndOffsets();
        return this;
    };
    StackedBar.prototype.y = function (y, yScale) {
        if (y == null) {
            return _super.prototype.y.call(this);
        }
        if (yScale == null) {
            _super.prototype.y.call(this, y);
        }
        else {
            _super.prototype.y.call(this, y, yScale);
        }
        this._updateStackExtentsAndOffsets();
        return this;
    };
    StackedBar.prototype.stackingOrder = function (stackingOrder) {
        if (stackingOrder == null) {
            return this._stackingOrder;
        }
        this._stackingOrder = stackingOrder;
        this._onDatasetUpdate();
        return this;
    };
    StackedBar.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._labelArea = this._renderArea.append("g").classed(barPlot_1.Bar._LABEL_AREA_CLASS, true);
        var context = new Typesetter.SvgContext(this._labelArea.node());
        this._measurer = new Typesetter.CacheMeasurer(context);
        this._writer = new Typesetter.Writer(this._measurer, context);
    };
    StackedBar.prototype._drawLabels = function () {
        var _this = this;
        _super.prototype._drawLabels.call(this);
        // remove all current labels before redrawing
        this._labelArea.selectAll("g").remove();
        var baselineValue = +this.baselineValue();
        var primaryScale = this._isVertical ? this.x().scale : this.y().scale;
        var secondaryScale = this._isVertical ? this.y().scale : this.x().scale;
        var _a = Utils.Stacking.stackedExtents(this._stackingResult), maximumExtents = _a.maximumExtents, minimumExtents = _a.minimumExtents;
        var barWidth = this._getBarPixelWidth();
        var anyTooWide = [];
        var drawLabel = function (text, measurement, labelPosition) {
            var x = labelPosition.x, y = labelPosition.y;
            var height = measurement.height, width = measurement.width;
            var tooWide = _this._isVertical
                ? (width > barWidth - (2 * StackedBar._LABEL_PADDING))
                : (height > barWidth - (2 * StackedBar._LABEL_PADDING));
            var hideLabel = x < 0
                || y < 0
                || x + width > _this.width()
                || y + height > _this.height()
                || tooWide;
            if (!hideLabel) {
                var labelContainer = _this._labelArea.append("g").attr("transform", "translate(" + x + ", " + y + ")");
                labelContainer.classed("stacked-bar-label", true);
                var writeOptions = {
                    xAlign: "center",
                    yAlign: "center",
                };
                _this._writer.write(text, measurement.width, measurement.height, writeOptions, labelContainer.node());
            }
            return tooWide;
        };
        maximumExtents.forEach(function (maximum) {
            if (maximum.extent !== baselineValue) {
                // only draw sums for values not at the baseline
                var text = _this.labelFormatter()(maximum.extent);
                var measurement = _this._measurer.measure(text);
                var primaryTextMeasurement = _this._isVertical ? measurement.width : measurement.height;
                var secondaryTextMeasurement = _this._isVertical ? measurement.height : measurement.width;
                var x = _this._isVertical
                    ? primaryScale.scale(maximum.axisValue) - primaryTextMeasurement / 2
                    : secondaryScale.scale(maximum.extent) + StackedBar._STACKED_BAR_LABEL_PADDING;
                var y = _this._isVertical
                    ? secondaryScale.scale(maximum.extent) - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING
                    : primaryScale.scale(maximum.axisValue) - primaryTextMeasurement / 2;
                anyTooWide.push(drawLabel(text, measurement, { x: x, y: y }));
            }
        });
        minimumExtents.forEach(function (minimum) {
            if (minimum.extent !== baselineValue) {
                var text = _this.labelFormatter()(minimum.extent);
                var measurement = _this._measurer.measure(text);
                var primaryTextMeasurement = _this._isVertical ? measurement.width : measurement.height;
                var secondaryTextMeasurement = _this._isVertical ? measurement.height : measurement.width;
                var x = _this._isVertical
                    ? primaryScale.scale(minimum.axisValue) - primaryTextMeasurement / 2
                    : secondaryScale.scale(minimum.extent) - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING;
                var y = _this._isVertical
                    ? secondaryScale.scale(minimum.extent) + StackedBar._STACKED_BAR_LABEL_PADDING
                    : primaryScale.scale(minimum.axisValue) - primaryTextMeasurement / 2;
                anyTooWide.push(drawLabel(text, measurement, { x: x, y: y }));
            }
        });
        if (anyTooWide.some(function (d) { return d; })) {
            this._labelArea.selectAll("g").remove();
        }
    };
    StackedBar.prototype._generateAttrToProjector = function () {
        var _this = this;
        var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
        var valueAttr = this._isVertical ? "y" : "x";
        var keyAttr = this._isVertical ? "x" : "y";
        var primaryScale = this._isVertical ? this.y().scale : this.x().scale;
        var primaryAccessor = this._propertyBindings.get(valueAttr).accessor;
        var keyAccessor = this._propertyBindings.get(keyAttr).accessor;
        var normalizedKeyAccessor = function (datum, index, dataset) {
            return Utils.Stacking.normalizeKey(keyAccessor(datum, index, dataset));
        };
        var getStart = function (d, i, dataset) {
            return primaryScale.scale(_this._stackingResult.get(dataset).get(normalizedKeyAccessor(d, i, dataset)).offset);
        };
        var getEnd = function (d, i, dataset) {
            return primaryScale.scale(+primaryAccessor(d, i, dataset) +
                _this._stackingResult.get(dataset).get(normalizedKeyAccessor(d, i, dataset)).offset);
        };
        var heightF = function (d, i, dataset) {
            return Math.abs(getEnd(d, i, dataset) - getStart(d, i, dataset));
        };
        attrToProjector[this._isVertical ? "height" : "width"] = heightF;
        var attrFunction = function (d, i, dataset) {
            return +primaryAccessor(d, i, dataset) < 0 ? getStart(d, i, dataset) : getEnd(d, i, dataset);
        };
        attrToProjector[valueAttr] = function (d, i, dataset) {
            return _this._isVertical ? attrFunction(d, i, dataset) : attrFunction(d, i, dataset) - heightF(d, i, dataset);
        };
        return attrToProjector;
    };
    StackedBar.prototype._onDatasetUpdate = function () {
        this._updateStackExtentsAndOffsets();
        _super.prototype._onDatasetUpdate.call(this);
        return this;
    };
    StackedBar.prototype._updateExtentsForProperty = function (property) {
        _super.prototype._updateExtentsForProperty.call(this, property);
        if ((property === "x" || property === "y") && this._projectorsReady()) {
            this._updateStackExtentsAndOffsets();
        }
    };
    StackedBar.prototype._extentsForProperty = function (attr) {
        var primaryAttr = this._isVertical ? "y" : "x";
        if (attr === primaryAttr) {
            return [this._stackedExtent];
        }
        else {
            return _super.prototype._extentsForProperty.call(this, attr);
        }
    };
    StackedBar.prototype._updateStackExtentsAndOffsets = function () {
        if (!this._projectorsReady()) {
            return;
        }
        var datasets = this.datasets();
        var keyAccessor = this._isVertical ? this.x().accessor : this.y().accessor;
        var valueAccessor = this._isVertical ? this.y().accessor : this.x().accessor;
        var filter = this._filterForProperty(this._isVertical ? "y" : "x");
        this._stackingResult = Utils.Stacking.stack(datasets, keyAccessor, valueAccessor, this._stackingOrder);
        this._stackedExtent = Utils.Stacking.stackedExtent(this._stackingResult, keyAccessor, filter);
    };
    StackedBar.prototype.invalidateCache = function () {
        _super.prototype.invalidateCache.call(this);
        this._measurer.reset();
    };
    return StackedBar;
}(barPlot_1.Bar));
StackedBar._STACKED_BAR_LABEL_PADDING = 5;
exports.StackedBar = StackedBar;
