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
var Utils = require("../utils");
var scale_1 = require("./scale");
var Color = (function (_super) {
    __extends(Color, _super);
    /**
     * A Color Scale maps string values to color hex values expressed as a string.
     *
     * @constructor
     * @param {string} [scaleType] One of "Category10"/"Category20"/"Category20b"/"Category20c".
     *   (see https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors)
     *   If not supplied, reads the colors defined using CSS -- see plottable.css.
     */
    function Color(scaleType) {
        var _this = _super.call(this) || this;
        var scale;
        switch (scaleType) {
            case null:
            case undefined:
                if (Color._plottableColorCache == null) {
                    Color._plottableColorCache = Color._getPlottableColors();
                }
                scale = d3.scaleOrdinal().range(Color._plottableColorCache);
                break;
            case "Category10":
            case "category10":
            case "10":
                scale = d3.scaleOrdinal(d3.schemeCategory10);
                break;
            case "Category20":
            case "category20":
            case "20":
                scale = d3.scaleOrdinal(d3.schemeCategory20);
                break;
            case "Category20b":
            case "category20b":
            case "20b":
                scale = d3.scaleOrdinal(d3.schemeCategory20b);
                break;
            case "Category20c":
            case "category20c":
            case "20c":
                scale = d3.scaleOrdinal(d3.schemeCategory20c);
                break;
            default:
                throw new Error("Unsupported ColorScale type");
        }
        _this._d3Scale = scale;
        return _this;
    }
    Color.prototype.extentOfValues = function (values) {
        return Utils.Array.uniq(values);
    };
    // Duplicated from OrdinalScale._getExtent - should be removed in #388
    Color.prototype._getExtent = function () {
        return Utils.Array.uniq(this._getAllIncludedValues());
    };
    Color.invalidateColorCache = function () {
        Color._plottableColorCache = null;
    };
    Color._getPlottableColors = function () {
        var plottableDefaultColors = [];
        var colorTester = d3.select("body").append("plottable-color-tester");
        var defaultColorHex = Utils.Color.colorTest(colorTester, "");
        var i = 0;
        var colorHex = Utils.Color.colorTest(colorTester, "plottable-colors-0");
        while (colorHex != null && i < this._MAXIMUM_COLORS_FROM_CSS) {
            if (colorHex === defaultColorHex && colorHex === plottableDefaultColors[plottableDefaultColors.length - 1]) {
                break;
            }
            plottableDefaultColors.push(colorHex);
            i++;
            colorHex = Utils.Color.colorTest(colorTester, "plottable-colors-" + i);
        }
        colorTester.remove();
        return plottableDefaultColors;
    };
    /**
     * Returns the color-string corresponding to a given string.
     * If there are not enough colors in the range(), a lightened version of an existing color will be used.
     *
     * @param {string} value
     * @returns {string}
     */
    Color.prototype.scale = function (value) {
        var color = this._d3Scale(value);
        var index = this.domain().indexOf(value);
        var numLooped = Math.floor(index / this.range().length);
        var modifyFactor = Math.log(numLooped * Color._LOOP_LIGHTEN_FACTOR + 1);
        return Utils.Color.lightenColor(color, modifyFactor);
    };
    Color.prototype._getDomain = function () {
        return this._backingScaleDomain();
    };
    Color.prototype._backingScaleDomain = function (values) {
        if (values == null) {
            return this._d3Scale.domain();
        }
        else {
            this._d3Scale.domain(values);
            return this;
        }
    };
    Color.prototype._getRange = function () {
        return this._d3Scale.range();
    };
    Color.prototype._setRange = function (values) {
        this._d3Scale.range(values);
    };
    return Color;
}(scale_1.Scale));
Color._LOOP_LIGHTEN_FACTOR = 1.6;
// The maximum number of colors we are getting from CSS stylesheets
Color._MAXIMUM_COLORS_FROM_CSS = 256;
exports.Color = Color;
