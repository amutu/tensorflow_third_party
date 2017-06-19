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
var Typesetter = require("typesettable");
var component_1 = require("./component");
var Label = (function (_super) {
    __extends(Label, _super);
    /**
     * A Label is a Component that displays a single line of text.
     *
     * @constructor
     * @param {string} [displayText=""] The text of the Label.
     * @param {number} [angle=0] The angle of the Label in degrees (-90/0/90). 0 is horizontal.
     */
    function Label(displayText, angle) {
        if (displayText === void 0) { displayText = ""; }
        if (angle === void 0) { angle = 0; }
        var _this = _super.call(this) || this;
        _this.addClass("label");
        _this.text(displayText);
        _this.angle(angle);
        _this.xAlignment("center").yAlignment("center");
        _this._padding = 0;
        return _this;
    }
    Label.prototype.requestedSpace = function (offeredWidth, offeredHeight) {
        var desiredWH = this._measurer.measure(this._text);
        var desiredWidth = (this.angle() === 0 ? desiredWH.width : desiredWH.height) + 2 * this.padding();
        var desiredHeight = (this.angle() === 0 ? desiredWH.height : desiredWH.width) + 2 * this.padding();
        return {
            minWidth: desiredWidth,
            minHeight: desiredHeight,
        };
    };
    Label.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._textContainer = this.content().append("g");
        var context = new Typesetter.SvgContext(this._textContainer.node());
        this._measurer = new Typesetter.CacheMeasurer(context);
        this._wrapper = new Typesetter.Wrapper();
        this._writer = new Typesetter.Writer(this._measurer, context, this._wrapper);
        this.text(this._text);
    };
    Label.prototype.text = function (displayText) {
        if (displayText == null) {
            return this._text;
        }
        else {
            if (typeof displayText !== "string") {
                throw new Error("Label.text() only takes strings as input");
            }
            this._text = displayText;
            this.redraw();
            return this;
        }
    };
    Label.prototype.angle = function (angle) {
        if (angle == null) {
            return this._angle;
        }
        else {
            angle %= 360;
            if (angle > 180) {
                angle -= 360;
            }
            else if (angle < -180) {
                angle += 360;
            }
            if (angle === -90 || angle === 0 || angle === 90) {
                this._angle = angle;
            }
            else {
                throw new Error(angle + " is not a valid angle for Label");
            }
            this.redraw();
            return this;
        }
    };
    Label.prototype.padding = function (padAmount) {
        if (padAmount == null) {
            return this._padding;
        }
        else {
            padAmount = +padAmount;
            if (padAmount < 0) {
                throw new Error(padAmount + " is not a valid padding value. Cannot be less than 0.");
            }
            this._padding = padAmount;
            this.redraw();
            return this;
        }
    };
    Label.prototype.fixedWidth = function () {
        return true;
    };
    Label.prototype.fixedHeight = function () {
        return true;
    };
    Label.prototype.renderImmediately = function () {
        _super.prototype.renderImmediately.call(this);
        // HACKHACK Typesetter.remove existing content - #21 on Typesetter.
        this._textContainer.selectAll("g").remove();
        var textMeasurement = this._measurer.measure(this._text);
        var heightPadding = Math.max(Math.min((this.height() - textMeasurement.height) / 2, this.padding()), 0);
        var widthPadding = Math.max(Math.min((this.width() - textMeasurement.width) / 2, this.padding()), 0);
        this._textContainer.attr("transform", "translate(" + widthPadding + "," + heightPadding + ")");
        var writeWidth = this.width() - 2 * widthPadding;
        var writeHeight = this.height() - 2 * heightPadding;
        var writeOptions = {
            xAlign: this.xAlignment(),
            yAlign: this.yAlignment(),
            textRotation: this.angle(),
        };
        this._writer.write(this._text, writeWidth, writeHeight, writeOptions);
        return this;
    };
    Label.prototype.invalidateCache = function () {
        _super.prototype.invalidateCache.call(this);
        this._measurer.reset();
    };
    return Label;
}(component_1.Component));
exports.Label = Label;
var TitleLabel = (function (_super) {
    __extends(TitleLabel, _super);
    /**
     * @constructor
     * @param {string} [text]
     * @param {number} [angle] One of -90/0/90. 0 is horizontal.
     */
    function TitleLabel(text, angle) {
        var _this = _super.call(this, text, angle) || this;
        _this.addClass(TitleLabel.TITLE_LABEL_CLASS);
        return _this;
    }
    return TitleLabel;
}(Label));
TitleLabel.TITLE_LABEL_CLASS = "title-label";
exports.TitleLabel = TitleLabel;
var AxisLabel = (function (_super) {
    __extends(AxisLabel, _super);
    /**
     * @constructor
     * @param {string} [text]
     * @param {number} [angle] One of -90/0/90. 0 is horizontal.
     */
    function AxisLabel(text, angle) {
        var _this = _super.call(this, text, angle) || this;
        _this.addClass(AxisLabel.AXIS_LABEL_CLASS);
        return _this;
    }
    return AxisLabel;
}(Label));
AxisLabel.AXIS_LABEL_CLASS = "axis-label";
exports.AxisLabel = AxisLabel;
