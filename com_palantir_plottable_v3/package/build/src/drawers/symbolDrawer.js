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
var canvasBuffer_1 = require("./canvasBuffer");
var canvasDrawer_1 = require("./canvasDrawer");
var svgDrawer_1 = require("./svgDrawer");
var SymbolSVGDrawer = (function (_super) {
    __extends(SymbolSVGDrawer, _super);
    function SymbolSVGDrawer() {
        return _super.call(this, "path", "symbol") || this;
    }
    return SymbolSVGDrawer;
}(svgDrawer_1.SVGDrawer));
exports.SymbolSVGDrawer = SymbolSVGDrawer;
function makeSymbolCanvasDrawStep(dataset, symbolProjector, sizeProjector, stepBuffer) {
    var _this = this;
    return function (context, data, attrToAppliedProjector) {
        var _a = context.canvas, width = _a.width, height = _a.height;
        var buffer = (stepBuffer === undefined) ? new canvasBuffer_1.CanvasBuffer(0, 0) : stepBuffer;
        var symbolAccessor = symbolProjector();
        var sizeAccessor = sizeProjector();
        var prevAttrs = null;
        var prevSymbolGenerator = null;
        var prevSymbolSize = null;
        for (var index = 0; index < data.length; index++) {
            var datum = data[index];
            // check symbol is in viewport
            var attrs = canvasDrawer_1.resolveAttributesSubsetWithStyles(attrToAppliedProjector, ["x", "y"], datum, index);
            var symbolSize = sizeAccessor(datum, index, dataset);
            if (!squareOverlapsBounds(width, height, attrs["x"], attrs["y"], symbolSize)) {
                continue;
            }
            // check attributes and symbol type
            var attrsSame = isAttributeValuesEqual(prevAttrs, attrs, Object.keys(canvasDrawer_1.ContextStyleAttrs));
            var symbolGenerator = symbolAccessor(datum, index, _this._dataset);
            if (attrsSame && prevSymbolSize == symbolSize && prevSymbolGenerator == symbolGenerator) {
            }
            else {
                // make room for bigger symbol if needed
                if (symbolSize > buffer.screenWidth || symbolSize > buffer.screenHeight) {
                    buffer.resize(symbolSize, symbolSize, true);
                }
                // draw actual symbol into buffer
                buffer.clear();
                var bufferCtx = buffer.ctx;
                bufferCtx.beginPath();
                symbolGenerator(symbolSize).context(bufferCtx)(null);
                bufferCtx.closePath();
                canvasDrawer_1.styleContext(bufferCtx, attrs);
                // save the values that are in the buffer
                prevSymbolGenerator = symbolGenerator;
                prevSymbolSize = symbolSize;
                prevAttrs = attrs;
            }
            // blit the buffer to the canvas
            buffer.blitCenter(context, attrs["x"], attrs["y"]);
        }
    };
}
exports.makeSymbolCanvasDrawStep = makeSymbolCanvasDrawStep;
function squareOverlapsBounds(width, height, x, y, size) {
    return (x + size >= 0 && x - size <= width &&
        y + size >= 0 && y - size <= height);
}
;
function isAttributeValuesEqual(prevAttrs, attrs, attrKeys) {
    if (prevAttrs == null) {
        return false;
    }
    for (var i = 0; i < attrKeys.length; i++) {
        var attrKey = attrKeys[i];
        if (prevAttrs[attrKey] != attrs[attrKey]) {
            return false;
        }
    }
    return true;
}
