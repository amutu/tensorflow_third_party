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
var plot_1 = require("../plots/plot");
var Utils = require("../utils");
var group_1 = require("./group");
var PlotGroup = (function (_super) {
    __extends(PlotGroup, _super);
    function PlotGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlotGroup.prototype.entityNearest = function (point) {
        var closestPlotEntity;
        var minDistSquared = Infinity;
        this.components().forEach(function (plotComponent) {
            // we know it's a Plot since .append() throws a runtime error otherwise
            var plot = plotComponent;
            var candidatePlotEntity = plot.entityNearest(point);
            if (candidatePlotEntity == null) {
                return;
            }
            var distSquared = Utils.Math.distanceSquared(candidatePlotEntity.position, point);
            if (distSquared <= minDistSquared) {
                minDistSquared = distSquared;
                closestPlotEntity = candidatePlotEntity;
            }
        });
        return closestPlotEntity;
    };
    /**
     * Adds a Plot to this Plot Group.
     * The added Plot will be rendered above Plots already in the Group.
     */
    PlotGroup.prototype.append = function (plot) {
        if (plot != null && !(plot instanceof plot_1.Plot)) {
            throw new Error("Plot Group only accepts plots");
        }
        _super.prototype.append.call(this, plot);
        return this;
    };
    return PlotGroup;
}(group_1.Group));
exports.PlotGroup = PlotGroup;
