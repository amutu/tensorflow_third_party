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
var Animators = require("../animators");
var Utils = require("../utils");
var areaPlot_1 = require("./areaPlot");
var plot_1 = require("./plot");
var StackedArea = (function (_super) {
    __extends(StackedArea, _super);
    /**
     * @constructor
     */
    function StackedArea() {
        var _this = _super.call(this) || this;
        _this._baselineValue = 0;
        _this._stackingOrder = "bottomup";
        _this.addClass("stacked-area-plot");
        _this.attr("fill-opacity", 1);
        _this._stackingResult = new Utils.Map();
        _this._stackedExtent = [];
        _this._baselineValueProvider = function () { return [_this._baselineValue]; };
        _this.croppedRenderingEnabled(false);
        return _this;
    }
    StackedArea.prototype.croppedRenderingEnabled = function (croppedRendering) {
        if (croppedRendering == null) {
            return _super.prototype.croppedRenderingEnabled.call(this);
        }
        if (croppedRendering) {
            // HACKHACK #3032: cropped rendering doesn't currently work correctly on StackedArea
            Utils.Window.warn("Warning: Stacked Area Plot does not support cropped rendering.");
            return this;
        }
        return _super.prototype.croppedRenderingEnabled.call(this, croppedRendering);
    };
    StackedArea.prototype._getAnimator = function (key) {
        return new Animators.Null();
    };
    StackedArea.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._baseline = this._renderArea.append("line").classed("baseline", true);
    };
    StackedArea.prototype.x = function (x, xScale) {
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
    StackedArea.prototype.y = function (y, yScale) {
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
    StackedArea.prototype.stackingOrder = function (stackingOrder) {
        if (stackingOrder == null) {
            return this._stackingOrder;
        }
        this._stackingOrder = stackingOrder;
        this._onDatasetUpdate();
        return this;
    };
    StackedArea.prototype.downsamplingEnabled = function (downsampling) {
        if (downsampling == null) {
            return _super.prototype.downsamplingEnabled.call(this);
        }
        Utils.Window.warn("Warning: Stacked Area Plot does not support downsampling");
        return this;
    };
    StackedArea.prototype._additionalPaint = function () {
        var scaledBaseline = this.y().scale.scale(this._baselineValue);
        var baselineAttr = {
            "x1": 0,
            "y1": scaledBaseline,
            "x2": this.width(),
            "y2": scaledBaseline,
        };
        this._getAnimator("baseline").animate(this._baseline, baselineAttr);
    };
    StackedArea.prototype._updateYScale = function () {
        var yBinding = this.y();
        var scale = (yBinding && yBinding.scale);
        if (scale == null) {
            return;
        }
        scale.addPaddingExceptionsProvider(this._baselineValueProvider);
        scale.addIncludedValuesProvider(this._baselineValueProvider);
    };
    StackedArea.prototype._onDatasetUpdate = function () {
        this._updateStackExtentsAndOffsets();
        _super.prototype._onDatasetUpdate.call(this);
        return this;
    };
    StackedArea.prototype._updateExtentsForProperty = function (property) {
        _super.prototype._updateExtentsForProperty.call(this, property);
        if ((property === "x" || property === "y") && this._projectorsReady()) {
            this._updateStackExtentsAndOffsets();
        }
    };
    StackedArea.prototype._extentsForProperty = function (attr) {
        var primaryAttr = "y";
        if (attr === primaryAttr) {
            return [this._stackedExtent];
        }
        else {
            return _super.prototype._extentsForProperty.call(this, attr);
        }
    };
    StackedArea.prototype._updateStackExtentsAndOffsets = function () {
        if (!this._projectorsReady()) {
            return;
        }
        var datasets = this.datasets();
        var keyAccessor = this.x().accessor;
        var valueAccessor = this.y().accessor;
        var filter = this._filterForProperty("y");
        this._checkSameDomain(datasets, keyAccessor);
        this._stackingResult = Utils.Stacking.stack(datasets, keyAccessor, valueAccessor, this._stackingOrder);
        this._stackedExtent = Utils.Stacking.stackedExtent(this._stackingResult, keyAccessor, filter);
    };
    StackedArea.prototype._checkSameDomain = function (datasets, keyAccessor) {
        var keySets = datasets.map(function (dataset) {
            return d3.set(dataset.data().map(function (datum, i) { return keyAccessor(datum, i, dataset).toString(); })).values();
        });
        var domainKeys = StackedArea._domainKeys(datasets, keyAccessor);
        if (keySets.some(function (keySet) { return keySet.length !== domainKeys.length; })) {
            Utils.Window.warn("the domains across the datasets are not the same. Plot may produce unintended behavior.");
        }
    };
    /**
     * Given an array of Datasets and the accessor function for the key, computes the
     * set reunion (no duplicates) of the domain of each Dataset. The keys are stringified
     * before being returned.
     *
     * @param {Dataset[]} datasets The Datasets for which we extract the domain keys
     * @param {Accessor<any>} keyAccessor The accessor for the key of the data
     * @return {string[]} An array of stringified keys
     */
    StackedArea._domainKeys = function (datasets, keyAccessor) {
        var domainKeys = d3.set();
        datasets.forEach(function (dataset) {
            dataset.data().forEach(function (datum, index) {
                domainKeys.add(keyAccessor(datum, index, dataset));
            });
        });
        return domainKeys.values();
    };
    StackedArea.prototype._propertyProjectors = function () {
        var _this = this;
        var propertyToProjectors = _super.prototype._propertyProjectors.call(this);
        var yAccessor = this.y().accessor;
        var xAccessor = this.x().accessor;
        var normalizedXAccessor = function (datum, index, dataset) {
            return Utils.Stacking.normalizeKey(xAccessor(datum, index, dataset));
        };
        var stackYProjector = function (d, i, dataset) {
            return _this.y().scale.scale(+yAccessor(d, i, dataset) + _this._stackingResult.get(dataset).get(normalizedXAccessor(d, i, dataset)).offset);
        };
        var stackY0Projector = function (d, i, dataset) {
            return _this.y().scale.scale(_this._stackingResult.get(dataset).get(normalizedXAccessor(d, i, dataset)).offset);
        };
        propertyToProjectors["d"] = this._constructAreaProjector(plot_1.Plot._scaledAccessor(this.x()), stackYProjector, stackY0Projector);
        return propertyToProjectors;
    };
    StackedArea.prototype._pixelPoint = function (datum, index, dataset) {
        var pixelPoint = _super.prototype._pixelPoint.call(this, datum, index, dataset);
        var xValue = this.x().accessor(datum, index, dataset);
        var yValue = this.y().accessor(datum, index, dataset);
        var scaledYValue = this.y().scale.scale(+yValue + this._stackingResult.get(dataset).get(Utils.Stacking.normalizeKey(xValue)).offset);
        return { x: pixelPoint.x, y: scaledYValue };
    };
    return StackedArea;
}(areaPlot_1.Area));
exports.StackedArea = StackedArea;
