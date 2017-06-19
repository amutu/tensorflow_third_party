"use strict";
var d3 = require("d3");
var Utils = require("../utils");
var _TRANSLATOR_KEY = "__Plottable_ClientTranslator";
function getTranslator(component) {
    // The Translator works by first calculating the offset to root of the chart and then calculating
    // the offset from the component to the root. It is imperative that the _measurementElement
    // be added to the root of the hierarchy and nowhere else.
    var root = component.root().rootElement().node();
    var translator = root[_TRANSLATOR_KEY];
    if (translator == null) {
        var measurer = document.createElementNS(root.namespaceURI, "svg");
        measurer.setAttribute("class", "measurer");
        measurer.setAttribute("style", "opacity: 0; visibility: hidden; position: absolute; width: 1px; height: 1px;");
        root.appendChild(measurer);
        translator = new Translator(d3.select(measurer));
        root[_TRANSLATOR_KEY] = translator;
    }
    return translator;
}
exports.getTranslator = getTranslator;
/**
 * Applies position as a style and attribute to the svg element
 * as the position of the element varies by the type of parent.
 * When nested within an SVG, the attribute position is respected.
 * When nested within an HTML, the style position is respected.
 */
function move(node, x, y) {
    node.styles({ left: x + "px", top: y + "px" });
    node.attrs({ x: "" + x, y: "" + y });
}
var Translator = (function () {
    function Translator(measurementElement) {
        this._measurementElement = measurementElement;
    }
    /**
     * Computes the position relative to the component. Converts screen clientX/clientY
     * coordinates to the coordinates relative to the measurementElement, taking into
     * account transform() factors from CSS or SVG up the DOM tree.
     */
    Translator.prototype.computePosition = function (clientX, clientY) {
        // get the origin
        move(this._measurementElement, 0, 0);
        var mrBCR = this._measurementElement.node().getBoundingClientRect();
        var origin = { x: mrBCR.left, y: mrBCR.top };
        // calculate the scale
        move(this._measurementElement, Translator.SAMPLE_DISTANCE, Translator.SAMPLE_DISTANCE);
        mrBCR = this._measurementElement.node().getBoundingClientRect();
        var testPoint = { x: mrBCR.left, y: mrBCR.top };
        // invalid measurements -- SVG might not be in the DOM
        if (origin.x === testPoint.x || origin.y === testPoint.y) {
            return null;
        }
        var scaleX = (testPoint.x - origin.x) / Translator.SAMPLE_DISTANCE;
        var scaleY = (testPoint.y - origin.y) / Translator.SAMPLE_DISTANCE;
        // get the true cursor position
        move(this._measurementElement, ((clientX - origin.x) / scaleX), ((clientY - origin.y) / scaleY));
        mrBCR = this._measurementElement.node().getBoundingClientRect();
        var trueCursorPosition = { x: mrBCR.left, y: mrBCR.top };
        var scaledPosition = {
            x: (trueCursorPosition.x - origin.x) / scaleX,
            y: (trueCursorPosition.y - origin.y) / scaleY,
        };
        return scaledPosition;
    };
    Translator.prototype.isInside = function (component, e) {
        return Utils.DOM.contains(component.root().rootElement().node(), e.target);
    };
    return Translator;
}());
Translator.SAMPLE_DISTANCE = 100;
exports.Translator = Translator;
