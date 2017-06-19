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
var Dispatchers = require("../dispatchers");
var Scales = require("../scales");
var Utils = require("../utils");
var Interactions = require("./");
var interaction_1 = require("./interaction");
/**
 * Performs a zoom transformation of the `value` argument scaled by the
 * `zoom` argument about the point defined by the `center` argument.
 */
function zoomAt(value, zoom, center) {
    return center - (center - value) * zoom;
}
exports.zoomAt = zoomAt;
var PanZoom = (function (_super) {
    __extends(PanZoom, _super);
    /**
     * A PanZoom Interaction updates the domains of an x-scale and/or a y-scale
     * in response to the user panning or zooming.
     *
     * @constructor
     * @param {TransformableScale} [xScale] The x-scale to update on panning/zooming.
     * @param {TransformableScale} [yScale] The y-scale to update on panning/zooming.
     */
    function PanZoom(xScale, yScale) {
        var _this = _super.call(this) || this;
        _this._wheelCallback = function (p, e) { return _this._handleWheelEvent(p, e); };
        _this._touchStartCallback = function (ids, idToPoint, e) { return _this._handleTouchStart(ids, idToPoint, e); };
        _this._touchMoveCallback = function (ids, idToPoint, e) { return _this._handlePinch(ids, idToPoint, e); };
        _this._touchEndCallback = function (ids, idToPoint, e) { return _this._handleTouchEnd(ids, idToPoint, e); };
        _this._touchCancelCallback = function (ids, idToPoint, e) { return _this._handleTouchEnd(ids, idToPoint, e); };
        _this._panEndCallbacks = new Utils.CallbackSet();
        _this._zoomEndCallbacks = new Utils.CallbackSet();
        _this._xScales = new Utils.Set();
        _this._yScales = new Utils.Set();
        _this._dragInteraction = new Interactions.Drag();
        _this._setupDragInteraction();
        _this._touchIds = d3.map();
        _this._minDomainExtents = new Utils.Map();
        _this._maxDomainExtents = new Utils.Map();
        _this._minDomainValues = new Utils.Map();
        _this._maxDomainValues = new Utils.Map();
        if (xScale != null) {
            _this.addXScale(xScale);
        }
        if (yScale != null) {
            _this.addYScale(yScale);
        }
        return _this;
    }
    /**
     * Pans the chart by a specified amount
     *
     * @param {Plottable.Point} [translateAmount] The amount by which to translate the x and y scales.
     */
    PanZoom.prototype.pan = function (translateAmount) {
        var _this = this;
        this.xScales().forEach(function (xScale) {
            xScale.pan(_this._constrainedTranslation(xScale, translateAmount.x));
        });
        this.yScales().forEach(function (yScale) {
            yScale.pan(_this._constrainedTranslation(yScale, translateAmount.y));
        });
    };
    /**
     * Zooms the chart by a specified amount around a specific point
     *
     * @param {number} [maginfyAmount] The percentage by which to zoom the x and y scale.
     * A value of 0.9 zooms in by 10%. A value of 1.1 zooms out by 10%. A value of 1 has
     * no effect.
     * @param {Plottable.Point} [centerValue] The center in pixels around which to zoom.
     * By default, `centerValue` is the center of the x and y range of each scale.
     */
    PanZoom.prototype.zoom = function (zoomAmount, centerValue) {
        this.xScales().forEach(function (xScale) {
            var range = xScale.range();
            var xCenter = centerValue === undefined
                ? (range[1] - range[0]) / 2
                : centerValue.x;
            xScale.zoom(zoomAmount, xCenter);
        });
        this.yScales().forEach(function (yScale) {
            var range = yScale.range();
            var yCenter = centerValue === undefined
                ? (range[1] - range[0]) / 2
                : centerValue.y;
            yScale.zoom(zoomAmount, yCenter);
        });
    };
    PanZoom.prototype._anchor = function (component) {
        _super.prototype._anchor.call(this, component);
        this._dragInteraction.attachTo(component);
        this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(this._componentAttachedTo);
        this._mouseDispatcher.onWheel(this._wheelCallback);
        this._touchDispatcher = Dispatchers.Touch.getDispatcher(this._componentAttachedTo);
        this._touchDispatcher.onTouchStart(this._touchStartCallback);
        this._touchDispatcher.onTouchMove(this._touchMoveCallback);
        this._touchDispatcher.onTouchEnd(this._touchEndCallback);
        this._touchDispatcher.onTouchCancel(this._touchCancelCallback);
    };
    PanZoom.prototype._unanchor = function () {
        _super.prototype._unanchor.call(this);
        this._mouseDispatcher.offWheel(this._wheelCallback);
        this._mouseDispatcher = null;
        this._touchDispatcher.offTouchStart(this._touchStartCallback);
        this._touchDispatcher.offTouchMove(this._touchMoveCallback);
        this._touchDispatcher.offTouchEnd(this._touchEndCallback);
        this._touchDispatcher.offTouchCancel(this._touchCancelCallback);
        this._touchDispatcher = null;
        this._dragInteraction.detachFrom(this._componentAttachedTo);
    };
    PanZoom.prototype._handleTouchStart = function (ids, idToPoint, e) {
        for (var i = 0; i < ids.length && this._touchIds.size() < 2; i++) {
            var id = ids[i];
            this._touchIds.set(id.toString(), this._translateToComponentSpace(idToPoint[id]));
        }
    };
    PanZoom.prototype._handlePinch = function (ids, idToPoint, e) {
        var _this = this;
        if (this._touchIds.size() < 2) {
            return;
        }
        var oldPoints = this._touchIds.values();
        if (!this._isInsideComponent(this._translateToComponentSpace(oldPoints[0])) || !this._isInsideComponent(this._translateToComponentSpace(oldPoints[1]))) {
            return;
        }
        var oldCornerDistance = PanZoom._pointDistance(oldPoints[0], oldPoints[1]);
        if (oldCornerDistance === 0) {
            return;
        }
        ids.forEach(function (id) {
            if (_this._touchIds.has(id.toString())) {
                _this._touchIds.set(id.toString(), _this._translateToComponentSpace(idToPoint[id]));
            }
        });
        var points = this._touchIds.values();
        var newCornerDistance = PanZoom._pointDistance(points[0], points[1]);
        if (newCornerDistance === 0) {
            return;
        }
        var magnifyAmount = oldCornerDistance / newCornerDistance;
        var normalizedPointDiffs = points.map(function (point, i) {
            return { x: (point.x - oldPoints[i].x) / magnifyAmount, y: (point.y - oldPoints[i].y) / magnifyAmount };
        });
        var oldCenterPoint = PanZoom.centerPoint(oldPoints[0], oldPoints[1]);
        var centerX = oldCenterPoint.x;
        var centerY = oldCenterPoint.y;
        this.xScales().forEach(function (xScale) {
            var constrained = _this._constrainedZoom(xScale, magnifyAmount, centerX);
            centerX = constrained.centerPoint;
            magnifyAmount = constrained.zoomAmount;
        });
        this.yScales().forEach(function (yScale) {
            var constrained = _this._constrainedZoom(yScale, magnifyAmount, centerY);
            centerY = constrained.centerPoint;
            magnifyAmount = constrained.zoomAmount;
        });
        var constrainedPoints = oldPoints.map(function (oldPoint, i) {
            return {
                x: normalizedPointDiffs[i].x * magnifyAmount + oldPoint.x,
                y: normalizedPointDiffs[i].y * magnifyAmount + oldPoint.y,
            };
        });
        var translateAmount = {
            x: centerX - ((constrainedPoints[0].x + constrainedPoints[1].x) / 2),
            y: centerY - ((constrainedPoints[0].y + constrainedPoints[1].y) / 2),
        };
        this.zoom(magnifyAmount, { x: centerX, y: centerY });
        this.pan(translateAmount);
    };
    PanZoom.centerPoint = function (point1, point2) {
        var leftX = Math.min(point1.x, point2.x);
        var rightX = Math.max(point1.x, point2.x);
        var topY = Math.min(point1.y, point2.y);
        var bottomY = Math.max(point1.y, point2.y);
        return { x: (leftX + rightX) / 2, y: (bottomY + topY) / 2 };
    };
    PanZoom._pointDistance = function (point1, point2) {
        var leftX = Math.min(point1.x, point2.x);
        var rightX = Math.max(point1.x, point2.x);
        var topY = Math.min(point1.y, point2.y);
        var bottomY = Math.max(point1.y, point2.y);
        return Math.sqrt(Math.pow(rightX - leftX, 2) + Math.pow(bottomY - topY, 2));
    };
    PanZoom.prototype._handleTouchEnd = function (ids, idToPoint, e) {
        var _this = this;
        ids.forEach(function (id) {
            _this._touchIds.remove(id.toString());
        });
        if (this._touchIds.size() > 0) {
            this._zoomEndCallbacks.callCallbacks();
        }
    };
    PanZoom.prototype._handleWheelEvent = function (p, e) {
        var _this = this;
        var translatedP = this._translateToComponentSpace(p);
        if (this._isInsideComponent(translatedP)) {
            e.preventDefault();
            var deltaPixelAmount = e.deltaY * (e.deltaMode ? PanZoom._PIXELS_PER_LINE : 1);
            var zoomAmount_1 = Math.pow(2, deltaPixelAmount * .002);
            var centerX_1 = translatedP.x;
            var centerY_1 = translatedP.y;
            this.xScales().forEach(function (xScale) {
                var constrained = _this._constrainedZoom(xScale, zoomAmount_1, centerX_1);
                centerX_1 = constrained.centerPoint;
                zoomAmount_1 = constrained.zoomAmount;
            });
            this.yScales().forEach(function (yScale) {
                var constrained = _this._constrainedZoom(yScale, zoomAmount_1, centerY_1);
                centerY_1 = constrained.centerPoint;
                zoomAmount_1 = constrained.zoomAmount;
            });
            this.zoom(zoomAmount_1, { x: centerX_1, y: centerY_1 });
            this._zoomEndCallbacks.callCallbacks();
        }
    };
    /**
     * When scale ranges are reversed (i.e. range[1] < range[0]), we must alter the
     * the calculations we do in screen space to constrain pan and zoom. This method
     * returns `true` if the scale is reversed.
     */
    PanZoom.prototype._isRangeReversed = function (scale) {
        var range = scale.range();
        return range[1] < range[0];
    };
    PanZoom.prototype._constrainedZoom = function (scale, zoomAmount, centerPoint) {
        zoomAmount = this._constrainZoomExtents(scale, zoomAmount);
        return this._constrainZoomValues(scale, zoomAmount, centerPoint);
    };
    PanZoom.prototype._constrainZoomExtents = function (scale, zoomAmount) {
        var extentIncreasing = zoomAmount > 1;
        var boundingDomainExtent = extentIncreasing ? this.maxDomainExtent(scale) : this.minDomainExtent(scale);
        if (boundingDomainExtent == null) {
            return zoomAmount;
        }
        var _a = scale.getTransformationDomain(), scaleDomainMin = _a[0], scaleDomainMax = _a[1];
        var domainExtent = Math.abs(scaleDomainMax - scaleDomainMin);
        var compareF = extentIncreasing ? Math.min : Math.max;
        return compareF(zoomAmount, boundingDomainExtent / domainExtent);
    };
    PanZoom.prototype._constrainZoomValues = function (scale, zoomAmount, centerPoint) {
        // when zooming in, we don't have to worry about overflowing domain
        if (zoomAmount <= 1) {
            return { centerPoint: centerPoint, zoomAmount: zoomAmount };
        }
        var reversed = this._isRangeReversed(scale);
        var minDomain = this.minDomainValue(scale);
        var maxDomain = this.maxDomainValue(scale);
        // if no constraints set, we're done
        if (minDomain == null && maxDomain == null) {
            return { centerPoint: centerPoint, zoomAmount: zoomAmount };
        }
        var _a = scale.getTransformationDomain(), scaleDomainMin = _a[0], scaleDomainMax = _a[1];
        if (maxDomain != null) {
            // compute max range point if zoom applied
            var maxRange = scale.scaleTransformation(maxDomain);
            var currentMaxRange = scale.scaleTransformation(scaleDomainMax);
            var testMaxRange = zoomAt(currentMaxRange, zoomAmount, centerPoint);
            // move the center point to prevent max overflow, if necessary
            if (testMaxRange > maxRange != reversed) {
                centerPoint = this._getZoomCenterForTarget(currentMaxRange, zoomAmount, maxRange);
            }
        }
        if (minDomain != null) {
            // compute min range point if zoom applied
            var minRange = scale.scaleTransformation(minDomain);
            var currentMinRange = scale.scaleTransformation(scaleDomainMin);
            var testMinRange = zoomAt(currentMinRange, zoomAmount, centerPoint);
            // move the center point to prevent min overflow, if necessary
            if (testMinRange < minRange != reversed) {
                centerPoint = this._getZoomCenterForTarget(currentMinRange, zoomAmount, minRange);
            }
        }
        // add fallback to prevent overflowing both min and max
        if (maxDomain != null && maxDomain != null) {
            var maxRange = scale.scaleTransformation(maxDomain);
            var currentMaxRange = scale.scaleTransformation(scaleDomainMax);
            var testMaxRange = zoomAt(currentMaxRange, zoomAmount, centerPoint);
            var minRange = scale.scaleTransformation(minDomain);
            var currentMinRange = scale.scaleTransformation(scaleDomainMin);
            var testMinRange = zoomAt(currentMinRange, zoomAmount, centerPoint);
            // If we overflow both, use some algebra to solve for centerPoint and
            // zoomAmount that will make the domain match the min/max exactly.
            // Algebra brought to you by Wolfram Alpha.
            if (testMaxRange > maxRange != reversed || testMinRange < minRange != reversed) {
                var denominator = (currentMaxRange - currentMinRange + minRange - maxRange);
                if (denominator === 0) {
                    // In this case the domains already match, so just return no-op values.
                    centerPoint = (currentMaxRange + currentMinRange) / 2;
                    zoomAmount = 1;
                }
                else {
                    centerPoint = (currentMaxRange * minRange - currentMinRange * maxRange) / denominator;
                    zoomAmount = (maxRange - minRange) / (currentMaxRange - currentMinRange);
                }
            }
        }
        return { centerPoint: centerPoint, zoomAmount: zoomAmount };
    };
    /**
     * Returns the `center` value to be used with `zoomAt` that will produce the
     * `target` value given the same `value` and `zoom` arguments. Algebra
     * brought to you by Wolfram Alpha.
     */
    PanZoom.prototype._getZoomCenterForTarget = function (value, zoom, target) {
        return (value * zoom - target) / (zoom - 1);
    };
    PanZoom.prototype._setupDragInteraction = function () {
        var _this = this;
        this._dragInteraction.constrainedToComponent(false);
        var lastDragPoint;
        this._dragInteraction.onDragStart(function () { return lastDragPoint = null; });
        this._dragInteraction.onDrag(function (startPoint, endPoint) {
            if (_this._touchIds.size() >= 2) {
                return;
            }
            var translateAmount = {
                x: (lastDragPoint == null ? startPoint.x : lastDragPoint.x) - endPoint.x,
                y: (lastDragPoint == null ? startPoint.y : lastDragPoint.y) - endPoint.y,
            };
            _this.pan(translateAmount);
            lastDragPoint = endPoint;
        });
        this._dragInteraction.onDragEnd(function () { return _this._panEndCallbacks.callCallbacks(); });
    };
    /**
     * Returns a new translation value that respects domain min/max value
     * constraints.
     */
    PanZoom.prototype._constrainedTranslation = function (scale, translation) {
        var _a = scale.getTransformationDomain(), scaleDomainMin = _a[0], scaleDomainMax = _a[1];
        var reversed = this._isRangeReversed(scale);
        if (translation > 0 !== reversed) {
            var bound = this.maxDomainValue(scale);
            if (bound != null) {
                var currentMaxRange = scale.scaleTransformation(scaleDomainMax);
                var maxRange = scale.scaleTransformation(bound);
                translation = (reversed ? Math.max : Math.min)(currentMaxRange + translation, maxRange) - currentMaxRange;
            }
        }
        else {
            var bound = this.minDomainValue(scale);
            if (bound != null) {
                var currentMinRange = scale.scaleTransformation(scaleDomainMin);
                var minRange = scale.scaleTransformation(bound);
                translation = (reversed ? Math.min : Math.max)(currentMinRange + translation, minRange) - currentMinRange;
            }
        }
        return translation;
    };
    PanZoom.prototype._nonLinearScaleWithExtents = function (scale) {
        return this.minDomainExtent(scale) != null && this.maxDomainExtent(scale) != null && !(scale instanceof Scales.Linear) && !(scale instanceof Scales.Time);
    };
    PanZoom.prototype.xScales = function (xScales) {
        var _this = this;
        if (xScales == null) {
            var scales_1 = [];
            this._xScales.forEach(function (xScale) {
                scales_1.push(xScale);
            });
            return scales_1;
        }
        this._xScales = new Utils.Set();
        xScales.forEach(function (xScale) {
            _this.addXScale(xScale);
        });
        return this;
    };
    PanZoom.prototype.yScales = function (yScales) {
        var _this = this;
        if (yScales == null) {
            var scales_2 = [];
            this._yScales.forEach(function (yScale) {
                scales_2.push(yScale);
            });
            return scales_2;
        }
        this._yScales = new Utils.Set();
        yScales.forEach(function (yScale) {
            _this.addYScale(yScale);
        });
        return this;
    };
    /**
     * Adds an x scale to this PanZoom Interaction
     *
     * @param {TransformableScale} An x scale to add
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    PanZoom.prototype.addXScale = function (xScale) {
        this._xScales.add(xScale);
        return this;
    };
    /**
     * Removes an x scale from this PanZoom Interaction
     *
     * @param {TransformableScale} An x scale to remove
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    PanZoom.prototype.removeXScale = function (xScale) {
        this._xScales.delete(xScale);
        this._minDomainExtents.delete(xScale);
        this._maxDomainExtents.delete(xScale);
        this._minDomainValues.delete(xScale);
        this._maxDomainValues.delete(xScale);
        return this;
    };
    /**
     * Adds a y scale to this PanZoom Interaction
     *
     * @param {TransformableScale} A y scale to add
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    PanZoom.prototype.addYScale = function (yScale) {
        this._yScales.add(yScale);
        return this;
    };
    /**
     * Removes a y scale from this PanZoom Interaction
     *
     * @param {TransformableScale} A y scale to remove
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    PanZoom.prototype.removeYScale = function (yScale) {
        this._yScales.delete(yScale);
        this._minDomainExtents.delete(yScale);
        this._maxDomainExtents.delete(yScale);
        this._minDomainValues.delete(yScale);
        this._maxDomainValues.delete(yScale);
        return this;
    };
    PanZoom.prototype.minDomainExtent = function (scale, minDomainExtent) {
        if (minDomainExtent == null) {
            return this._minDomainExtents.get(scale);
        }
        if (minDomainExtent.valueOf() < 0) {
            throw new Error("extent must be non-negative");
        }
        var maxExtentForScale = this.maxDomainExtent(scale);
        if (maxExtentForScale != null && maxExtentForScale.valueOf() < minDomainExtent.valueOf()) {
            throw new Error("minDomainExtent must be smaller than maxDomainExtent for the same Scale");
        }
        if (this._nonLinearScaleWithExtents(scale)) {
            Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
        }
        this._minDomainExtents.set(scale, minDomainExtent);
        return this;
    };
    PanZoom.prototype.maxDomainExtent = function (scale, maxDomainExtent) {
        if (maxDomainExtent == null) {
            return this._maxDomainExtents.get(scale);
        }
        if (maxDomainExtent.valueOf() <= 0) {
            throw new Error("extent must be positive");
        }
        var minExtentForScale = this.minDomainExtent(scale);
        if (minExtentForScale != null && maxDomainExtent.valueOf() < minExtentForScale.valueOf()) {
            throw new Error("maxDomainExtent must be larger than minDomainExtent for the same Scale");
        }
        if (this._nonLinearScaleWithExtents(scale)) {
            Utils.Window.warn("Panning and zooming with extents on a nonlinear scale may have unintended behavior.");
        }
        this._maxDomainExtents.set(scale, maxDomainExtent);
        return this;
    };
    PanZoom.prototype.minDomainValue = function (scale, minDomainValue) {
        if (minDomainValue == null) {
            return this._minDomainValues.get(scale);
        }
        this._minDomainValues.set(scale, minDomainValue);
        return this;
    };
    PanZoom.prototype.maxDomainValue = function (scale, maxDomainValue) {
        if (maxDomainValue == null) {
            return this._maxDomainValues.get(scale);
        }
        this._maxDomainValues.set(scale, maxDomainValue);
        return this;
    };
    /**
     * Uses the current domain of the scale to apply a minimum and maximum
     * domain value for that scale.
     *
     * This constrains the pan/zoom interaction to show no more than the domain
     * of the scale.
     */
    PanZoom.prototype.setMinMaxDomainValuesTo = function (scale) {
        this._minDomainValues.delete(scale);
        this._maxDomainValues.delete(scale);
        var _a = scale.getTransformationDomain(), domainMin = _a[0], domainMax = _a[1];
        this.minDomainValue(scale, domainMin);
        this.maxDomainValue(scale, domainMax);
        return this;
    };
    /**
     * Adds a callback to be called when panning ends.
     *
     * @param {PanCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    PanZoom.prototype.onPanEnd = function (callback) {
        this._panEndCallbacks.add(callback);
        return this;
    };
    /**
     * Removes a callback that would be called when panning ends.
     *
     * @param {PanCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    PanZoom.prototype.offPanEnd = function (callback) {
        this._panEndCallbacks.delete(callback);
        return this;
    };
    /**
     * Adds a callback to be called when zooming ends.
     *
     * @param {ZoomCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    PanZoom.prototype.onZoomEnd = function (callback) {
        this._zoomEndCallbacks.add(callback);
        return this;
    };
    /**
     * Removes a callback that would be called when zooming ends.
     *
     * @param {ZoomCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    PanZoom.prototype.offZoomEnd = function (callback) {
        this._zoomEndCallbacks.delete(callback);
        return this;
    };
    return PanZoom;
}(interaction_1.Interaction));
/**
 * The number of pixels occupied in a line.
 */
PanZoom._PIXELS_PER_LINE = 120;
exports.PanZoom = PanZoom;
