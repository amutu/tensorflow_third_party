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
var canvasDrawer_1 = require("./canvasDrawer");
var svgDrawer_1 = require("./svgDrawer");
var LineSVGDrawer = (function (_super) {
    __extends(LineSVGDrawer, _super);
    function LineSVGDrawer() {
        return _super.call(this, "path", "line") || this;
    }
    LineSVGDrawer.prototype._applyDefaultAttributes = function (selection) {
        selection.style("fill", "none");
    };
    LineSVGDrawer.prototype.getVisualPrimitiveAtIndex = function (index) {
        return _super.prototype.getVisualPrimitiveAtIndex.call(this, 0);
    };
    return LineSVGDrawer;
}(svgDrawer_1.SVGDrawer));
exports.LineSVGDrawer = LineSVGDrawer;
/**
 * @param d3LineFactory A callback that gives this Line Drawer a d3.Line object which will be
 * used to draw with.
 *
 * TODO put the d3.Line into the attrToAppliedProjector directly
 */
function makeLineCanvasDrawStep(d3LineFactory) {
    return function (context, data, attrToAppliedProjector) {
        var d3Line = d3LineFactory();
        var attrs = canvasDrawer_1.resolveAttributesSubsetWithStyles(attrToAppliedProjector, [], data[0], 0);
        context.save();
        context.beginPath();
        d3Line.context(context);
        d3Line(data[0]);
        context.lineJoin = "round";
        canvasDrawer_1.styleContext(context, attrs);
        context.restore();
    };
}
exports.makeLineCanvasDrawStep = makeLineCanvasDrawStep;
