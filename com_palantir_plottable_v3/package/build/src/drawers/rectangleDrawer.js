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
var RectangleSVGDrawer = (function (_super) {
    __extends(RectangleSVGDrawer, _super);
    function RectangleSVGDrawer(_rootClassName) {
        if (_rootClassName === void 0) { _rootClassName = ""; }
        var _this = _super.call(this, "rect", "") || this;
        _this._rootClassName = _rootClassName;
        _this._root.classed(_this._rootClassName, true);
        return _this;
    }
    return RectangleSVGDrawer;
}(svgDrawer_1.SVGDrawer));
exports.RectangleSVGDrawer = RectangleSVGDrawer;
exports.RectangleCanvasDrawStep = function (context, data, attrToAppliedProjector) {
    context.save();
    data.forEach(function (datum, index) {
        var attrs = canvasDrawer_1.resolveAttributesSubsetWithStyles(attrToAppliedProjector, ["x", "y", "width", "height"], datum, index);
        context.beginPath();
        context.rect(attrs["x"], attrs["y"], attrs["width"], attrs["height"]);
        canvasDrawer_1.styleContext(context, attrs);
    });
    context.restore();
};
