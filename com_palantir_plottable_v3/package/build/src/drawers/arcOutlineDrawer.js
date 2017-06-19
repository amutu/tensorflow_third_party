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
var ArcOutlineSVGDrawer = (function (_super) {
    __extends(ArcOutlineSVGDrawer, _super);
    function ArcOutlineSVGDrawer() {
        return _super.call(this, "path", "arc outline") || this;
    }
    ArcOutlineSVGDrawer.prototype._applyDefaultAttributes = function (selection) {
        selection.style("fill", "none");
    };
    return ArcOutlineSVGDrawer;
}(svgDrawer_1.SVGDrawer));
exports.ArcOutlineSVGDrawer = ArcOutlineSVGDrawer;
