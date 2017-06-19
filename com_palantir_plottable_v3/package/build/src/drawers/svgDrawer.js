/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
var d3 = require("d3");
var Utils = require("../utils");
/**
 * An SVGDrawer draws data by creating DOM elements and setting specific attributes on them
 * to accurately reflect the data being passed in.
 *
 * This class is immutable (but has internal state).
 */
var SVGDrawer = (function () {
    /**
     * @param svgElementName an HTML/SVG tag name to be created, one per datum.
     * @param className CSS classes to be applied to the drawn primitives.
     * @param applyDefaultAttributes
     */
    function SVGDrawer(svgElementName, className) {
        this._root = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "g"));
        this._className = className;
        this._svgElementName = svgElementName;
    }
    SVGDrawer.prototype.draw = function (data, appliedDrawSteps) {
        var _this = this;
        /*
         * Draw to the DOM by clearing old DOM elements, adding new DOM elements,
         * and then passing those DOM elements to the animator, which will set the
         * appropriate attributes on the DOM.
         */
        this._createAndDestroyDOMElements(data);
        var delay = 0;
        appliedDrawSteps.forEach(function (drawStep, i) {
            Utils.Window.setTimeout(function () { return _this._drawStep(drawStep); }, delay);
            delay += drawStep.animator.totalTime(data.length);
        });
    };
    SVGDrawer.prototype.getVisualPrimitives = function () {
        if (this._cachedVisualPrimitivesNodes == null) {
            this._cachedVisualPrimitivesNodes = this._selection.nodes();
        }
        return this._cachedVisualPrimitivesNodes;
    };
    SVGDrawer.prototype.getVisualPrimitiveAtIndex = function (index) {
        return this.getVisualPrimitives()[index];
    };
    SVGDrawer.prototype.remove = function () {
        this._root.remove();
    };
    SVGDrawer.prototype.attachTo = function (parent) {
        parent.node().appendChild(this._root.node());
    };
    // public for testing
    SVGDrawer.prototype.getRoot = function () {
        return this._root;
    };
    /**
     * Returns the CSS selector for this Drawer's visual elements.
     */
    SVGDrawer.prototype.selector = function () {
        return this._svgElementName;
    };
    SVGDrawer.prototype._applyDefaultAttributes = function (selection) {
        // subclasses may override
    };
    SVGDrawer.prototype._createAndDestroyDOMElements = function (data) {
        var dataElementsUpdate = this._root.selectAll(this.selector()).data(data);
        this._selection =
            dataElementsUpdate
                .enter()
                .append(this._svgElementName)
                .merge(dataElementsUpdate);
        dataElementsUpdate.exit().remove();
        this._cachedVisualPrimitivesNodes = null;
        if (this._className != null) {
            this._selection.classed(this._className, true);
        }
        this._applyDefaultAttributes(this._selection);
    };
    /**
     * Draws data using one step
     *
     * @param{AppliedDrawStep} step The step, how data should be drawn.
     */
    SVGDrawer.prototype._drawStep = function (step) {
        var _this = this;
        var colorAttributes = ["fill", "stroke"];
        colorAttributes.forEach(function (colorAttribute) {
            if (step.attrToAppliedProjector[colorAttribute] != null) {
                _this._selection.attr(colorAttribute, step.attrToAppliedProjector[colorAttribute]);
            }
        });
        step.animator.animate(this._selection, step.attrToAppliedProjector);
        if (this._className != null) {
            this._selection.classed(this._className, true);
        }
    };
    return SVGDrawer;
}());
exports.SVGDrawer = SVGDrawer;
