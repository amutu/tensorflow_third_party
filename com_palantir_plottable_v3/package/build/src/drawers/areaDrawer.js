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
var svgDrawer_1 = require("./svgDrawer");
var AreaSVGDrawer = (function (_super) {
    __extends(AreaSVGDrawer, _super);
    function AreaSVGDrawer() {
        return _super.call(this, "path", "area") || this;
    }
    AreaSVGDrawer.prototype._applyDefaultAttributes = function (selection) {
        selection.style("stroke", "none");
    };
    AreaSVGDrawer.prototype.getVisualPrimitiveAtIndex = function (index) {
        // areas are represented by one single element; always get that element
        // regardless of the data index.
        return _super.prototype.getVisualPrimitiveAtIndex.call(this, 0);
    };
    return AreaSVGDrawer;
}(svgDrawer_1.SVGDrawer));
exports.AreaSVGDrawer = AreaSVGDrawer;
