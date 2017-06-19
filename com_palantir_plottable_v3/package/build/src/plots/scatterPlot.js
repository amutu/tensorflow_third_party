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
var SymbolFactories = require("../core/symbolFactories");
var drawer_1 = require("../drawers/drawer");
var symbolDrawer_1 = require("../drawers/symbolDrawer");
var Animators = require("../animators");
var Scales = require("../scales");
var Utils = require("../utils");
var Plots = require("./");
var plot_1 = require("./plot");
var xyPlot_1 = require("./xyPlot");
var Scatter = (function (_super) {
    __extends(Scatter, _super);
    /**
     * A Scatter Plot draws a symbol at each data point.
     *
     * @constructor
     */
    function Scatter() {
        var _this = _super.call(this) || this;
        _this.addClass("scatter-plot");
        var animator = new Animators.Easing();
        animator.startDelay(5);
        animator.stepDuration(250);
        animator.maxTotalDuration(plot_1.Plot._ANIMATION_MAX_DURATION);
        _this.animator(Plots.Animator.MAIN, animator);
        _this.attr("opacity", 0.6);
        _this.attr("fill", new Scales.Color().range()[0]);
        _this.size(6);
        var circleSymbolFactory = SymbolFactories.circle();
        _this.symbol(function () { return circleSymbolFactory; });
        return _this;
    }
    Scatter.prototype._buildLightweightPlotEntities = function (datasets) {
        var _this = this;
        var lightweightPlotEntities = _super.prototype._buildLightweightPlotEntities.call(this, datasets);
        return lightweightPlotEntities.map(function (lightweightPlotEntity) {
            var diameter = plot_1.Plot._scaledAccessor(_this.size())(lightweightPlotEntity.datum, lightweightPlotEntity.index, lightweightPlotEntity.dataset);
            lightweightPlotEntity.diameter = diameter;
            return lightweightPlotEntity;
        });
    };
    Scatter.prototype._createDrawer = function (dataset) {
        var _this = this;
        return new drawer_1.ProxyDrawer(function () { return new symbolDrawer_1.SymbolSVGDrawer(); }, symbolDrawer_1.makeSymbolCanvasDrawStep(dataset, function () { return plot_1.Plot._scaledAccessor(_this.symbol()); }, function () { return plot_1.Plot._scaledAccessor(_this.size()); }));
    };
    Scatter.prototype.size = function (size, scale) {
        if (size == null) {
            return this._propertyBindings.get(Scatter._SIZE_KEY);
        }
        this._bindProperty(Scatter._SIZE_KEY, size, scale);
        this.render();
        return this;
    };
    Scatter.prototype.symbol = function (symbol) {
        if (symbol == null) {
            return this._propertyBindings.get(Scatter._SYMBOL_KEY);
        }
        this._propertyBindings.set(Scatter._SYMBOL_KEY, { accessor: symbol });
        this.render();
        return this;
    };
    Scatter.prototype._generateDrawSteps = function () {
        var drawSteps = [];
        if (this._animateOnNextRender()) {
            var attrToProjector = this._generateAttrToProjector();
            var symbolProjector_1 = plot_1.Plot._scaledAccessor(this.symbol());
            attrToProjector["d"] = function (datum, index, dataset) { return symbolProjector_1(datum, index, dataset)(0)(null); };
            drawSteps.push({ attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
        }
        drawSteps.push({
            attrToProjector: this._generateAttrToProjector(),
            animator: this._getAnimator(Plots.Animator.MAIN),
        });
        return drawSteps;
    };
    Scatter.prototype._propertyProjectors = function () {
        var propertyToProjectors = _super.prototype._propertyProjectors.call(this);
        var xProjector = plot_1.Plot._scaledAccessor(this.x());
        var yProjector = plot_1.Plot._scaledAccessor(this.y());
        propertyToProjectors["x"] = xProjector;
        propertyToProjectors["y"] = yProjector;
        propertyToProjectors["transform"] = function (datum, index, dataset) {
            return "translate(" + xProjector(datum, index, dataset) + "," + yProjector(datum, index, dataset) + ")";
        };
        propertyToProjectors["d"] = this._constructSymbolGenerator();
        return propertyToProjectors;
    };
    Scatter.prototype._constructSymbolGenerator = function () {
        var symbolProjector = plot_1.Plot._scaledAccessor(this.symbol());
        var sizeProjector = plot_1.Plot._scaledAccessor(this.size());
        return function (datum, index, dataset) {
            return symbolProjector(datum, index, dataset)(sizeProjector(datum, index, dataset))(null);
        };
    };
    Scatter.prototype._entityVisibleOnPlot = function (entity, bounds) {
        var xRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
        var yRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
        var translatedBbox = {
            x: entity.position.x - entity.diameter,
            y: entity.position.y - entity.diameter,
            width: entity.diameter,
            height: entity.diameter,
        };
        return Utils.DOM.intersectsBBox(xRange, yRange, translatedBbox);
    };
    Scatter.prototype.entitiesIn = function (xRangeOrBounds, yRange) {
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
        var xProjector = plot_1.Plot._scaledAccessor(this.x());
        var yProjector = plot_1.Plot._scaledAccessor(this.y());
        return this.entities().filter(function (entity) {
            var datum = entity.datum;
            var index = entity.index;
            var dataset = entity.dataset;
            var x = xProjector(datum, index, dataset);
            var y = yProjector(datum, index, dataset);
            return dataXRange.min <= x && x <= dataXRange.max && dataYRange.min <= y && y <= dataYRange.max;
        });
    };
    /**
     * Gets the Entities at a particular Point.
     *
     * @param {Point} p
     * @returns {PlotEntity[]}
     */
    Scatter.prototype.entitiesAt = function (p) {
        var xProjector = plot_1.Plot._scaledAccessor(this.x());
        var yProjector = plot_1.Plot._scaledAccessor(this.y());
        var sizeProjector = plot_1.Plot._scaledAccessor(this.size());
        return this.entities().filter(function (entity) {
            var datum = entity.datum;
            var index = entity.index;
            var dataset = entity.dataset;
            var x = xProjector(datum, index, dataset);
            var y = yProjector(datum, index, dataset);
            var size = sizeProjector(datum, index, dataset);
            return x - size / 2 <= p.x && p.x <= x + size / 2 && y - size / 2 <= p.y && p.y <= y + size / 2;
        });
    };
    return Scatter;
}(xyPlot_1.XYPlot));
Scatter._SIZE_KEY = "size";
Scatter._SYMBOL_KEY = "symbol";
exports.Scatter = Scatter;
