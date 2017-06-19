/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
var d3 = require("d3");
/**
 * A CanvasDrawer draws data onto a supplied Canvas Context.
 *
 * This class is immutable (but has internal state) and shouldn't be extended.
 */
var CanvasDrawer = (function () {
    /**
     * @param _context The context for a canvas that this drawer will draw to.
     * @param _drawStep The draw step logic that actually draws.
     */
    function CanvasDrawer(_context, _drawStep) {
        this._context = _context;
        this._drawStep = _drawStep;
    }
    // public for testing
    CanvasDrawer.prototype.getDrawStep = function () {
        return this._drawStep;
    };
    CanvasDrawer.prototype.draw = function (data, appliedDrawSteps) {
        // don't support animations for now; just draw the last draw step immediately
        var lastDrawStep = appliedDrawSteps[appliedDrawSteps.length - 1];
        this._context.save();
        this._drawStep(this._context, data, lastDrawStep.attrToAppliedProjector);
        this._context.restore();
    };
    CanvasDrawer.prototype.getVisualPrimitives = function () {
        return [];
    };
    CanvasDrawer.prototype.getVisualPrimitiveAtIndex = function (index) {
        return null;
    };
    CanvasDrawer.prototype.remove = function () {
        // NO op - canvas element owns the canvas; context is free
    };
    return CanvasDrawer;
}());
exports.CanvasDrawer = CanvasDrawer;
exports.ContextStyleAttrs = {
    strokeWidth: "stroke-width", stroke: "stroke", opacity: "opacity", fill: "fill",
};
function resolveAttributesSubsetWithStyles(projector, extraKeys, datum, index) {
    var attrKeys = Object.keys(exports.ContextStyleAttrs).concat(extraKeys);
    var attrs = {};
    for (var i = 0; i < attrKeys.length; i++) {
        var attrKey = attrKeys[i];
        if (projector.hasOwnProperty(attrKey)) {
            attrs[attrKey] = projector[attrKey](datum, index);
        }
    }
    return attrs;
}
exports.resolveAttributesSubsetWithStyles = resolveAttributesSubsetWithStyles;
function styleContext(context, attrs) {
    if (attrs[exports.ContextStyleAttrs.strokeWidth]) {
        context.lineWidth = parseFloat(attrs[exports.ContextStyleAttrs.strokeWidth]);
    }
    if (attrs[exports.ContextStyleAttrs.stroke]) {
        var strokeColor = d3.color(attrs[exports.ContextStyleAttrs.stroke]);
        if (attrs[exports.ContextStyleAttrs.opacity]) {
            strokeColor.opacity = attrs[exports.ContextStyleAttrs.opacity];
        }
        context.strokeStyle = strokeColor.rgb().toString();
        context.stroke();
    }
    if (attrs[exports.ContextStyleAttrs.fill]) {
        var fillColor = d3.color(attrs[exports.ContextStyleAttrs.fill]);
        if (attrs[exports.ContextStyleAttrs.opacity]) {
            fillColor.opacity = attrs[exports.ContextStyleAttrs.opacity];
        }
        context.fillStyle = fillColor.rgb().toString();
        context.fill();
    }
}
exports.styleContext = styleContext;
