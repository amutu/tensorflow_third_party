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
var Typesetter = require("typesettable");
var Animators = require("../animators");
var drawer_1 = require("../drawers/drawer");
var rectangleDrawer_1 = require("../drawers/rectangleDrawer");
var Scales = require("../scales");
var Utils = require("../utils");
var plot_1 = require("./plot");
var xyPlot_1 = require("./xyPlot");
var Rectangle = (function (_super) {
    __extends(Rectangle, _super);
    /**
     * A Rectangle Plot displays rectangles based on the data.
     * The left and right edges of each rectangle can be set with x() and x2().
     *   If only x() is set the Rectangle Plot will attempt to compute the correct left and right edge positions.
     * The top and bottom edges of each rectangle can be set with y() and y2().
     *   If only y() is set the Rectangle Plot will attempt to compute the correct top and bottom edge positions.
     *
     * @constructor
     * @param {Scale.Scale} xScale
     * @param {Scale.Scale} yScale
     */
    function Rectangle() {
        var _this = _super.call(this) || this;
        _this._labelsEnabled = false;
        _this._label = null;
        _this.animator("rectangles", new Animators.Null());
        _this.addClass("rectangle-plot");
        _this.attr("fill", new Scales.Color().range()[0]);
        return _this;
    }
    Rectangle.prototype._createDrawer = function () {
        return new drawer_1.ProxyDrawer(function () { return new rectangleDrawer_1.RectangleSVGDrawer(); }, rectangleDrawer_1.RectangleCanvasDrawStep);
    };
    Rectangle.prototype._generateAttrToProjector = function () {
        var _this = this;
        var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
        // Copy each of the different projectors.
        var xAttr = plot_1.Plot._scaledAccessor(this.x());
        var x2Attr = attrToProjector[Rectangle._X2_KEY];
        var yAttr = plot_1.Plot._scaledAccessor(this.y());
        var y2Attr = attrToProjector[Rectangle._Y2_KEY];
        var xScale = this.x().scale;
        var yScale = this.y().scale;
        if (x2Attr != null) {
            attrToProjector["width"] = function (d, i, dataset) { return Math.abs(x2Attr(d, i, dataset) - xAttr(d, i, dataset)); };
            attrToProjector["x"] = function (d, i, dataset) { return Math.min(x2Attr(d, i, dataset), xAttr(d, i, dataset)); };
        }
        else {
            attrToProjector["width"] = function (d, i, dataset) { return _this._rectangleWidth(xScale); };
            attrToProjector["x"] = function (d, i, dataset) { return xAttr(d, i, dataset) - 0.5 * attrToProjector["width"](d, i, dataset); };
        }
        if (y2Attr != null) {
            attrToProjector["height"] = function (d, i, dataset) { return Math.abs(y2Attr(d, i, dataset) - yAttr(d, i, dataset)); };
            attrToProjector["y"] = function (d, i, dataset) {
                return Math.max(y2Attr(d, i, dataset), yAttr(d, i, dataset)) - attrToProjector["height"](d, i, dataset);
            };
        }
        else {
            attrToProjector["height"] = function (d, i, dataset) { return _this._rectangleWidth(yScale); };
            attrToProjector["y"] = function (d, i, dataset) { return yAttr(d, i, dataset) - 0.5 * attrToProjector["height"](d, i, dataset); };
        }
        // Clean up the attributes projected onto the SVG elements
        delete attrToProjector[Rectangle._X2_KEY];
        delete attrToProjector[Rectangle._Y2_KEY];
        return attrToProjector;
    };
    Rectangle.prototype._generateDrawSteps = function () {
        return [{ attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("rectangles") }];
    };
    Rectangle.prototype._updateExtentsForProperty = function (property) {
        _super.prototype._updateExtentsForProperty.call(this, property);
        if (property === "x") {
            _super.prototype._updateExtentsForProperty.call(this, "x2");
        }
        else if (property === "y") {
            _super.prototype._updateExtentsForProperty.call(this, "y2");
        }
    };
    Rectangle.prototype._filterForProperty = function (property) {
        if (property === "x2") {
            return _super.prototype._filterForProperty.call(this, "x");
        }
        else if (property === "y2") {
            return _super.prototype._filterForProperty.call(this, "y");
        }
        return _super.prototype._filterForProperty.call(this, property);
    };
    Rectangle.prototype.x = function (x, xScale) {
        if (x == null) {
            return _super.prototype.x.call(this);
        }
        if (xScale == null) {
            _super.prototype.x.call(this, x);
        }
        else {
            _super.prototype.x.call(this, x, xScale);
        }
        if (xScale != null) {
            var x2Binding = this.x2();
            var x2 = x2Binding && x2Binding.accessor;
            if (x2 != null) {
                this._bindProperty(Rectangle._X2_KEY, x2, xScale);
            }
        }
        // The x and y scales should render in bands with no padding for category scales
        if (xScale instanceof Scales.Category) {
            xScale.innerPadding(0).outerPadding(0);
        }
        return this;
    };
    Rectangle.prototype.x2 = function (x2) {
        if (x2 == null) {
            return this._propertyBindings.get(Rectangle._X2_KEY);
        }
        var xBinding = this.x();
        var xScale = xBinding && xBinding.scale;
        this._bindProperty(Rectangle._X2_KEY, x2, xScale);
        this.render();
        return this;
    };
    Rectangle.prototype.y = function (y, yScale) {
        if (y == null) {
            return _super.prototype.y.call(this);
        }
        if (yScale == null) {
            _super.prototype.y.call(this, y);
        }
        else {
            _super.prototype.y.call(this, y, yScale);
        }
        if (yScale != null) {
            var y2Binding = this.y2();
            var y2 = y2Binding && y2Binding.accessor;
            if (y2 != null) {
                this._bindProperty(Rectangle._Y2_KEY, y2, yScale);
            }
        }
        // The x and y scales should render in bands with no padding for category scales
        if (yScale instanceof Scales.Category) {
            yScale.innerPadding(0).outerPadding(0);
        }
        return this;
    };
    Rectangle.prototype.y2 = function (y2) {
        if (y2 == null) {
            return this._propertyBindings.get(Rectangle._Y2_KEY);
        }
        var yBinding = this.y();
        var yScale = yBinding && yBinding.scale;
        this._bindProperty(Rectangle._Y2_KEY, y2, yScale);
        this.render();
        return this;
    };
    /**
     * Gets the PlotEntities at a particular Point.
     *
     * @param {Point} point The point to query.
     * @returns {PlotEntity[]} The PlotEntities at the particular point
     */
    Rectangle.prototype.entitiesAt = function (point) {
        var attrToProjector = this._generateAttrToProjector();
        return this.entities().filter(function (entity) {
            var datum = entity.datum;
            var index = entity.index;
            var dataset = entity.dataset;
            var x = attrToProjector["x"](datum, index, dataset);
            var y = attrToProjector["y"](datum, index, dataset);
            var width = attrToProjector["width"](datum, index, dataset);
            var height = attrToProjector["height"](datum, index, dataset);
            return x <= point.x && point.x <= x + width && y <= point.y && point.y <= y + height;
        });
    };
    Rectangle.prototype.entitiesIn = function (xRangeOrBounds, yRange) {
        var dataXRange;
        var dataYRange;
        if (yRange == null) {
            var bounds = xRangeOrBounds;
            dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
            dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
        }
        else {
            dataXRange = xRangeOrBounds;
            dataYRange = yRange;
        }
        return this._entitiesIntersecting(dataXRange, dataYRange);
    };
    Rectangle.prototype._entityBBox = function (datum, index, dataset, attrToProjector) {
        return {
            x: attrToProjector["x"](datum, index, dataset),
            y: attrToProjector["y"](datum, index, dataset),
            width: attrToProjector["width"](datum, index, dataset),
            height: attrToProjector["height"](datum, index, dataset),
        };
    };
    Rectangle.prototype._entitiesIntersecting = function (xValOrRange, yValOrRange) {
        var _this = this;
        var intersected = [];
        var attrToProjector = this._generateAttrToProjector();
        this.entities().forEach(function (entity) {
            if (Utils.DOM.intersectsBBox(xValOrRange, yValOrRange, _this._entityBBox(entity.datum, entity.index, entity.dataset, attrToProjector))) {
                intersected.push(entity);
            }
        });
        return intersected;
    };
    Rectangle.prototype.label = function (label) {
        if (label == null) {
            return this._label;
        }
        this._label = label;
        this.render();
        return this;
    };
    Rectangle.prototype.labelsEnabled = function (enabled) {
        if (enabled == null) {
            return this._labelsEnabled;
        }
        else {
            this._labelsEnabled = enabled;
            this.render();
            return this;
        }
    };
    Rectangle.prototype._propertyProjectors = function () {
        var attrToProjector = _super.prototype._propertyProjectors.call(this);
        if (this.x2() != null) {
            attrToProjector["x2"] = plot_1.Plot._scaledAccessor(this.x2());
        }
        if (this.y2() != null) {
            attrToProjector["y2"] = plot_1.Plot._scaledAccessor(this.y2());
        }
        return attrToProjector;
    };
    Rectangle.prototype._pixelPoint = function (datum, index, dataset) {
        var attrToProjector = this._generateAttrToProjector();
        var rectX = attrToProjector["x"](datum, index, dataset);
        var rectY = attrToProjector["y"](datum, index, dataset);
        var rectWidth = attrToProjector["width"](datum, index, dataset);
        var rectHeight = attrToProjector["height"](datum, index, dataset);
        var x = rectX + rectWidth / 2;
        var y = rectY + rectHeight / 2;
        return { x: x, y: y };
    };
    Rectangle.prototype._rectangleWidth = function (scale) {
        if (scale instanceof Scales.Category) {
            return scale.rangeBand();
        }
        else {
            var accessor_1 = scale === this.x().scale ? this.x().accessor : this.y().accessor;
            var accessorData = d3.set(Utils.Array.flatten(this.datasets().map(function (dataset) {
                return dataset.data().map(function (d, i) { return accessor_1(d, i, dataset).valueOf(); });
            }))).values().map(function (value) { return +value; });
            // Get the absolute difference between min and max
            var min = Utils.Math.min(accessorData, 0);
            var max = Utils.Math.max(accessorData, 0);
            var scaledMin = scale.scale(min);
            var scaledMax = scale.scale(max);
            return (scaledMax - scaledMin) / Math.abs(max - min);
        }
    };
    Rectangle.prototype._getDataToDraw = function () {
        var dataToDraw = new Utils.Map();
        var attrToProjector = this._generateAttrToProjector();
        this.datasets().forEach(function (dataset) {
            var data = dataset.data().filter(function (d, i) { return Utils.Math.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
                Utils.Math.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
                Utils.Math.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
                Utils.Math.isValidNumber(attrToProjector["height"](d, i, dataset)); });
            dataToDraw.set(dataset, data);
        });
        return dataToDraw;
    };
    Rectangle.prototype._additionalPaint = function (time) {
        var _this = this;
        this._renderArea.selectAll(".label-area").remove();
        if (this._labelsEnabled && this.label() != null) {
            Utils.Window.setTimeout(function () { return _this._drawLabels(); }, time);
        }
    };
    Rectangle.prototype._drawLabels = function () {
        var _this = this;
        var dataToDraw = this._getDataToDraw();
        this.datasets().forEach(function (dataset, i) { return _this._drawLabel(dataToDraw, dataset, i); });
    };
    Rectangle.prototype._drawLabel = function (dataToDraw, dataset, datasetIndex) {
        var _this = this;
        var attrToProjector = this._generateAttrToProjector();
        var labelArea = this._renderArea.append("g").classed("label-area", true);
        var context = new Typesetter.SvgContext(labelArea.node());
        var measurer = new Typesetter.CacheMeasurer(context);
        var writer = new Typesetter.Writer(measurer, context);
        var xRange = this.x().scale.range();
        var yRange = this.y().scale.range();
        var xMin = Math.min.apply(null, xRange);
        var xMax = Math.max.apply(null, xRange);
        var yMin = Math.min.apply(null, yRange);
        var yMax = Math.max.apply(null, yRange);
        var data = dataToDraw.get(dataset);
        data.forEach(function (datum, datumIndex) {
            var label = "" + _this.label()(datum, datumIndex, dataset);
            var measurement = measurer.measure(label);
            var x = attrToProjector["x"](datum, datumIndex, dataset);
            var y = attrToProjector["y"](datum, datumIndex, dataset);
            var width = attrToProjector["width"](datum, datumIndex, dataset);
            var height = attrToProjector["height"](datum, datumIndex, dataset);
            if (measurement.height <= height && measurement.width <= width) {
                var horizontalOffset = (width - measurement.width) / 2;
                var verticalOffset = (height - measurement.height) / 2;
                x += horizontalOffset;
                y += verticalOffset;
                var xLabelRange = { min: x, max: x + measurement.width };
                var yLabelRange = { min: y, max: y + measurement.height };
                if (xLabelRange.min < xMin || xLabelRange.max > xMax || yLabelRange.min < yMin || yLabelRange.max > yMax) {
                    return;
                }
                if (_this._overlayLabel(xLabelRange, yLabelRange, datumIndex, datasetIndex, dataToDraw)) {
                    return;
                }
                var color = attrToProjector["fill"](datum, datumIndex, dataset);
                var dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
                var g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
                var className = dark ? "dark-label" : "light-label";
                g.classed(className, true);
                writer.write(label, measurement.width, measurement.height, {
                    xAlign: "center",
                    yAlign: "center",
                }, g.node());
            }
        });
    };
    Rectangle.prototype._overlayLabel = function (labelXRange, labelYRange, datumIndex, datasetIndex, dataToDraw) {
        var attrToProjector = this._generateAttrToProjector();
        var datasets = this.datasets();
        for (var i = datasetIndex; i < datasets.length; i++) {
            var dataset = datasets[i];
            var data = dataToDraw.get(dataset);
            for (var j = (i === datasetIndex ? datumIndex + 1 : 0); j < data.length; j++) {
                if (Utils.DOM.intersectsBBox(labelXRange, labelYRange, this._entityBBox(data[j], j, dataset, attrToProjector))) {
                    return true;
                }
            }
        }
        return false;
    };
    return Rectangle;
}(xyPlot_1.XYPlot));
Rectangle._X2_KEY = "x2";
Rectangle._Y2_KEY = "y2";
exports.Rectangle = Rectangle;
