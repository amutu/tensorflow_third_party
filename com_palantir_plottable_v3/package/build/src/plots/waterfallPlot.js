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
var Utils = require("../utils");
var barPlot_1 = require("./barPlot");
var plot_1 = require("./plot");
var Waterfall = (function (_super) {
    __extends(Waterfall, _super);
    function Waterfall() {
        var _this = _super.call(this) || this;
        _this._connectorsEnabled = false;
        _this.addClass("waterfall-plot");
        return _this;
    }
    Waterfall.prototype.connectorsEnabled = function (enabled) {
        if (enabled == null) {
            return this._connectorsEnabled;
        }
        this._connectorsEnabled = enabled;
        return this;
    };
    Waterfall.prototype.total = function (total) {
        if (total == null) {
            return this._propertyBindings.get(Waterfall._TOTAL_KEY);
        }
        this._bindProperty(Waterfall._TOTAL_KEY, total, null);
        return this;
    };
    Waterfall.prototype._additionalPaint = function (time) {
        var _this = this;
        this._connectorArea.selectAll("line").remove();
        if (this._connectorsEnabled) {
            Utils.Window.setTimeout(function () { return _this._drawConnectors(); }, time);
        }
    };
    Waterfall.prototype._createNodesForDataset = function (dataset) {
        var drawer = _super.prototype._createNodesForDataset.call(this, dataset);
        this._connectorArea = this._renderArea.append("g").classed(Waterfall._CONNECTOR_AREA_CLASS, true);
        return drawer;
    };
    Waterfall.prototype._extentsForProperty = function (attr) {
        var primaryAttr = "y";
        if (attr === primaryAttr) {
            return [this._extent];
        }
        else {
            return _super.prototype._extentsForProperty.call(this, attr);
        }
    };
    Waterfall.prototype._generateAttrToProjector = function () {
        var _this = this;
        var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
        var yScale = this.y().scale;
        var totalAccessor = plot_1.Plot._scaledAccessor(this.total());
        var yAttr = this.attr("y");
        if (yAttr == null) {
            attrToProjector["y"] = function (d, i, dataset) {
                var currentValue = _this.y().accessor(d, i, dataset);
                var isTotal = totalAccessor(d, i, dataset);
                if (isTotal) {
                    return Math.min(yScale.scale(currentValue), yScale.scale(0));
                }
                else {
                    var currentSubtotal = _this._subtotals[i];
                    if (i === 0) {
                        if (currentValue < 0) {
                            return yScale.scale(currentSubtotal - currentValue);
                        }
                        else {
                            return yScale.scale(currentSubtotal);
                        }
                    }
                    var priorSubtotal = _this._subtotals[i - 1];
                    if (currentSubtotal > priorSubtotal) {
                        return yScale.scale(currentSubtotal);
                    }
                    else {
                        return yScale.scale(priorSubtotal);
                    }
                }
            };
        }
        var heightAttr = this.attr("height");
        if (heightAttr == null) {
            attrToProjector["height"] = function (d, i, dataset) {
                var isTotal = totalAccessor(d, i, dataset);
                var currentValue = _this.y().accessor(d, i, dataset);
                if (isTotal) {
                    return Math.abs(yScale.scale(currentValue) - yScale.scale(0));
                }
                else {
                    var currentSubtotal = _this._subtotals[i];
                    if (i === 0) {
                        return Math.abs(yScale.scale(currentSubtotal) - yScale.scale(currentSubtotal - currentValue));
                    }
                    else {
                        var priorSubtotal = _this._subtotals[i - 1];
                        return Math.abs(yScale.scale(currentSubtotal) - yScale.scale(priorSubtotal));
                    }
                }
            };
        }
        attrToProjector["class"] = function (d, i, dataset) {
            var baseClass = "";
            if (_this.attr("class") != null) {
                baseClass = _this.attr("class").accessor(d, i, dataset) + " ";
            }
            var isTotal = totalAccessor(d, i, dataset);
            if (isTotal) {
                return baseClass + Waterfall._BAR_TOTAL_CLASS;
            }
            else {
                var delta = _this.y().accessor(d, i, dataset);
                return baseClass + (delta > 0 ? Waterfall._BAR_GROWTH_CLASS : Waterfall._BAR_DECLINE_CLASS);
            }
        };
        return attrToProjector;
    };
    Waterfall.prototype._onDatasetUpdate = function () {
        this._updateSubtotals();
        _super.prototype._onDatasetUpdate.call(this);
        return this;
    };
    Waterfall.prototype._calculateSubtotalsAndExtent = function (dataset) {
        var _this = this;
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        var total = 0;
        var hasStarted = false;
        dataset.data().forEach(function (datum, index) {
            var currentValue = _this.y().accessor(datum, index, dataset);
            var isTotal = _this.total().accessor(datum, index, dataset);
            if (!isTotal || index === 0) {
                total += currentValue;
            }
            _this._subtotals.push(total);
            if (total < min) {
                min = total;
            }
            if (total > max) {
                max = total;
            }
            if (isTotal) {
                if (currentValue < min) {
                    min = currentValue;
                }
                if (currentValue > max) {
                    max = currentValue;
                }
            }
            if (!hasStarted && isTotal) {
                var startTotal = currentValue - total;
                for (var i = 0; i < _this._subtotals.length; i++) {
                    _this._subtotals[i] += startTotal;
                }
                hasStarted = true;
                total += startTotal;
                min += startTotal;
                max += startTotal;
            }
        });
        this._extent = [min, max];
    };
    Waterfall.prototype._drawConnectors = function () {
        var attrToProjector = this._generateAttrToProjector();
        var dataset = this.datasets()[0];
        for (var datumIndex = 1; datumIndex < dataset.data().length; datumIndex++) {
            var prevIndex = datumIndex - 1;
            var datum = dataset.data()[datumIndex];
            var prevDatum = dataset.data()[prevIndex];
            var x = attrToProjector["x"](prevDatum, prevIndex, dataset);
            var x2 = attrToProjector["x"](datum, datumIndex, dataset) + attrToProjector["width"](datum, datumIndex, dataset);
            var y = attrToProjector["y"](datum, datumIndex, dataset);
            if ((this._subtotals[datumIndex] > 0 && this._subtotals[datumIndex] > this._subtotals[prevIndex]) ||
                (this._subtotals[datumIndex] < 0 && this._subtotals[datumIndex] >= this._subtotals[prevIndex])) {
                y = attrToProjector["y"](datum, datumIndex, dataset) + attrToProjector["height"](datum, datumIndex, dataset);
            }
            this._connectorArea.append("line").classed(Waterfall._CONNECTOR_CLASS, true)
                .attr("x1", x).attr("x2", x2).attr("y1", y).attr("y2", y);
        }
    };
    Waterfall.prototype._updateSubtotals = function () {
        var datasets = this.datasets();
        if (datasets.length > 0) {
            var dataset = datasets[datasets.length - 1];
            this._subtotals = new Array();
            this._calculateSubtotalsAndExtent(dataset);
        }
    };
    return Waterfall;
}(barPlot_1.Bar));
Waterfall._BAR_DECLINE_CLASS = "waterfall-decline";
Waterfall._BAR_GROWTH_CLASS = "waterfall-growth";
Waterfall._BAR_TOTAL_CLASS = "waterfall-total";
Waterfall._CONNECTOR_CLASS = "connector";
Waterfall._CONNECTOR_AREA_CLASS = "connector-area";
Waterfall._TOTAL_KEY = "total";
exports.Waterfall = Waterfall;
