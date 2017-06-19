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
var Typesetter = require("typesettable");
var Formatters = require("../core/formatters");
var Scales = require("../scales");
var Utils = require("../utils");
var makeEnum_1 = require("../utils/makeEnum");
var axis_1 = require("./axis");
exports.TimeInterval = makeEnum_1.makeEnum([
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
]);
/**
 * Possible orientations for a Time Axis.
 */
exports.TimeAxisOrientation = makeEnum_1.makeEnum(["top", "bottom"]);
exports.TierLabelPosition = makeEnum_1.makeEnum(["between", "center"]);
var Time = (function (_super) {
    __extends(Time, _super);
    /**
     * Constructs a Time Axis.
     *
     * A Time Axis is a visual representation of a Time Scale.
     *
     * @constructor
     * @param {Scales.Time} scale
     * @param {AxisOrientation} orientation Orientation of this Time Axis. Time Axes can only have "top" or "bottom"
     * orientations.
     */
    function Time(scale, orientation) {
        var _this = _super.call(this, scale, orientation) || this;
        _this._maxTimeIntervalPrecision = null;
        _this._tierLabelPositions = [];
        _this.addClass("time-axis");
        _this.tickLabelPadding(5);
        _this.axisConfigurations(Time._DEFAULT_TIME_AXIS_CONFIGURATIONS);
        _this.annotationFormatter(Formatters.time("%a %b %d, %Y"));
        return _this;
    }
    Time.prototype.tierLabelPositions = function (newPositions) {
        if (newPositions == null) {
            return this._tierLabelPositions;
        }
        else {
            if (!newPositions.every(function (pos) { return pos.toLowerCase() === "between" || pos.toLowerCase() === "center"; })) {
                throw new Error("Unsupported position for tier labels");
            }
            this._tierLabelPositions = newPositions;
            this.redraw();
            return this;
        }
    };
    Time.prototype.maxTimeIntervalPrecision = function (newPrecision) {
        if (newPrecision == null) {
            return this._maxTimeIntervalPrecision;
        }
        else {
            this._maxTimeIntervalPrecision = newPrecision;
            this.redraw();
            return this;
        }
    };
    /**
     * Returns the current `TimeAxisConfiguration` used to render the axes.
     *
     * Note that this is only valid after the axis had been rendered and the
     * most precise valid configuration is determined from the available space
     * and maximum precision constraints.
     *
     * @returns {TimeAxisConfiguration} The currently used `TimeAxisConfiguration` or `undefined`.
     */
    Time.prototype.currentAxisConfiguration = function () {
        return this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex];
    };
    Time.prototype.axisConfigurations = function (configurations) {
        if (configurations == null) {
            return this._possibleTimeAxisConfigurations;
        }
        this._possibleTimeAxisConfigurations = configurations;
        this._numTiers = Utils.Math.max(this._possibleTimeAxisConfigurations.map(function (config) { return config.length; }), 0);
        if (this._isAnchored) {
            this._setupDomElements();
        }
        var oldLabelPositions = this.tierLabelPositions();
        var newLabelPositions = [];
        for (var i = 0; i < this._numTiers; i++) {
            newLabelPositions.push(oldLabelPositions[i] || "between");
        }
        this.tierLabelPositions(newLabelPositions);
        this.redraw();
        return this;
    };
    /**
     * Gets the index of the most precise TimeAxisConfiguration that will fit in the current width.
     */
    Time.prototype._getMostPreciseConfigurationIndex = function () {
        var _this = this;
        var mostPreciseIndex = this._possibleTimeAxisConfigurations.length;
        this._possibleTimeAxisConfigurations.forEach(function (interval, index) {
            if (index < mostPreciseIndex && interval.every(function (tier) {
                return _this._checkTimeAxisTierConfiguration(tier);
            })) {
                mostPreciseIndex = index;
            }
        });
        if (mostPreciseIndex === this._possibleTimeAxisConfigurations.length) {
            Utils.Window.warn("zoomed out too far: could not find suitable interval to display labels");
            --mostPreciseIndex;
        }
        return mostPreciseIndex;
    };
    Time.prototype.orientation = function (orientation) {
        if (orientation && (orientation.toLowerCase() === "right" || orientation.toLowerCase() === "left")) {
            throw new Error(orientation + " is not a supported orientation for TimeAxis - only horizontal orientations are supported");
        }
        return _super.prototype.orientation.call(this, orientation); // maintains getter-setter functionality
    };
    Time.prototype._computeHeight = function () {
        var textHeight = this._measurer.measure().height;
        this._tierHeights = [];
        for (var i = 0; i < this._numTiers; i++) {
            this._tierHeights.push(textHeight + this.tickLabelPadding() +
                ((this._tierLabelPositions[i]) === "between" ? 0 : this._maxLabelTickLength()));
        }
        return d3.sum(this._tierHeights);
    };
    Time.prototype._getIntervalLength = function (config) {
        var startDate = this._scale.domain()[0];
        var d3Interval = Scales.Time.timeIntervalToD3Time(config.interval);
        var endDate = d3Interval.offset(startDate, config.step);
        if (endDate > this._scale.domain()[1]) {
            // this offset is too large, so just return available width
            return this.width();
        }
        // measure how much space one date can get
        var stepLength = Math.abs(this._scale.scale(endDate) - this._scale.scale(startDate));
        return stepLength;
    };
    Time.prototype._maxWidthForInterval = function (config) {
        return this._measurer.measure(config.formatter(Time._LONG_DATE)).width;
    };
    /**
     * Check if tier configuration fits in the current width and satisfied the
     * max TimeInterval precision limit.
     */
    Time.prototype._checkTimeAxisTierConfiguration = function (config) {
        // Use the sorted index to determine if the teir configuration contains a
        // time interval that is too precise for the maxTimeIntervalPrecision
        // setting (if set).
        if (this._maxTimeIntervalPrecision != null) {
            var precisionLimit = Time._SORTED_TIME_INTERVAL_INDEX[this._maxTimeIntervalPrecision];
            var configPrecision = Time._SORTED_TIME_INTERVAL_INDEX[config.interval];
            if (precisionLimit != null && configPrecision != null && configPrecision < precisionLimit) {
                return false;
            }
        }
        var worstWidth = this._maxWidthForInterval(config) + 2 * this.tickLabelPadding();
        return Math.min(this._getIntervalLength(config), this.width()) >= worstWidth;
    };
    Time.prototype._sizeFromOffer = function (availableWidth, availableHeight) {
        // Makes sure that the size it requires is a multiple of tier sizes, such that
        // we have no leftover tiers
        var size = _super.prototype._sizeFromOffer.call(this, availableWidth, availableHeight);
        var tierHeights = this._tierHeights.reduce(function (prevValue, currValue, index, arr) {
            return (prevValue + currValue > size.height) ? prevValue : (prevValue + currValue);
        });
        var nonCoreHeight = this.margin() + (this.annotationsEnabled() ? this.annotationTierCount() * this._annotationTierHeight() : 0);
        size.height = Math.min(size.height, tierHeights + nonCoreHeight);
        return size;
    };
    Time.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._setupDomElements();
    };
    Time.prototype._setupDomElements = function () {
        this.content().selectAll("." + Time.TIME_AXIS_TIER_CLASS).remove();
        this._tierLabelContainers = [];
        this._tierMarkContainers = [];
        this._tierBaselines = [];
        this._tickLabelContainer.remove();
        this._baseline.remove();
        for (var i = 0; i < this._numTiers; ++i) {
            var tierContainer = this.content().append("g").classed(Time.TIME_AXIS_TIER_CLASS, true);
            this._tierLabelContainers.push(tierContainer.append("g").classed(axis_1.Axis.TICK_LABEL_CLASS + "-container", true));
            this._tierMarkContainers.push(tierContainer.append("g").classed(axis_1.Axis.TICK_MARK_CLASS + "-container", true));
            this._tierBaselines.push(tierContainer.append("line").classed("baseline", true));
        }
        var context = new Typesetter.SvgContext(this._tierLabelContainers[0].node());
        this._measurer = new Typesetter.CacheMeasurer(context);
    };
    Time.prototype._getTickIntervalValues = function (config) {
        return this._scale.tickInterval(config.interval, config.step);
    };
    Time.prototype._getTickValues = function () {
        var _this = this;
        return this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex].reduce(function (ticks, config) { return ticks.concat(_this._getTickIntervalValues(config)); }, []);
    };
    Time.prototype._cleanTiers = function () {
        for (var index = 0; index < this._tierLabelContainers.length; index++) {
            this._tierLabelContainers[index].selectAll("." + axis_1.Axis.TICK_LABEL_CLASS).remove();
            this._tierMarkContainers[index].selectAll("." + axis_1.Axis.TICK_MARK_CLASS).remove();
            this._tierBaselines[index].style("visibility", "hidden");
        }
    };
    Time.prototype._getTickValuesForConfiguration = function (config) {
        var tickPos = this._scale.tickInterval(config.interval, config.step);
        var domain = this._scale.domain();
        var tickPosValues = tickPos.map(function (d) { return d.valueOf(); }); // can't indexOf with objects
        if (tickPosValues.indexOf(domain[0].valueOf()) === -1) {
            tickPos.unshift(domain[0]);
        }
        if (tickPosValues.indexOf(domain[1].valueOf()) === -1) {
            tickPos.push(domain[1]);
        }
        return tickPos;
    };
    Time.prototype._renderTierLabels = function (container, config, index) {
        var _this = this;
        var tickPos = this._getTickValuesForConfiguration(config);
        var labelPos = [];
        if (this._tierLabelPositions[index] === "between" && config.step === 1) {
            tickPos.map(function (datum, i) {
                if (i + 1 >= tickPos.length) {
                    return;
                }
                labelPos.push(new Date((tickPos[i + 1].valueOf() - tickPos[i].valueOf()) / 2 + tickPos[i].valueOf()));
            });
        }
        else {
            labelPos = tickPos;
        }
        var tickLabelsUpdate = container.selectAll("." + axis_1.Axis.TICK_LABEL_CLASS).data(labelPos, function (d) { return String(d.valueOf()); });
        var tickLabelsEnter = tickLabelsUpdate
            .enter()
            .append("g")
            .classed(axis_1.Axis.TICK_LABEL_CLASS, true);
        tickLabelsEnter.append("text");
        var xTranslate = (this._tierLabelPositions[index] === "center" || config.step === 1) ? 0 : this.tickLabelPadding();
        var yTranslate;
        if (this.orientation() === "bottom") {
            yTranslate = d3.sum(this._tierHeights.slice(0, index + 1)) - this.tickLabelPadding();
        }
        else {
            if (this._tierLabelPositions[index] === "center") {
                yTranslate = this.height() - d3.sum(this._tierHeights.slice(0, index)) - this.tickLabelPadding() - this._maxLabelTickLength();
            }
            else {
                yTranslate = this.height() - d3.sum(this._tierHeights.slice(0, index)) - this.tickLabelPadding();
            }
        }
        var tickLabels = tickLabelsUpdate.merge(tickLabelsEnter);
        var textSelection = tickLabels.selectAll("text");
        if (textSelection.size() > 0) {
            textSelection.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")");
        }
        tickLabelsUpdate.exit().remove();
        tickLabels.attr("transform", function (d) { return "translate(" + _this._scale.scale(d) + ",0)"; });
        var anchor = (this._tierLabelPositions[index] === "center" || config.step === 1) ? "middle" : "start";
        tickLabels.selectAll("text").text(config.formatter).style("text-anchor", anchor);
    };
    Time.prototype._renderTickMarks = function (tickValues, index) {
        var tickMarksUpdate = this._tierMarkContainers[index].selectAll("." + axis_1.Axis.TICK_MARK_CLASS).data(tickValues);
        var tickMarks = tickMarksUpdate
            .enter()
            .append("line")
            .classed(axis_1.Axis.TICK_MARK_CLASS, true)
            .merge(tickMarksUpdate);
        var attr = this._generateTickMarkAttrHash();
        var offset = this._tierHeights.slice(0, index).reduce(function (translate, height) { return translate + height; }, 0);
        if (this.orientation() === "bottom") {
            attr["y1"] = offset;
            attr["y2"] = offset + (this._tierLabelPositions[index] === "center" ? this.innerTickLength() : this._tierHeights[index]);
        }
        else {
            attr["y1"] = this.height() - offset;
            attr["y2"] = this.height() - (offset + (this._tierLabelPositions[index] === "center" ?
                this.innerTickLength() : this._tierHeights[index]));
        }
        tickMarks.attrs(attr);
        if (this.orientation() === "bottom") {
            attr["y1"] = offset;
            attr["y2"] = offset + (this._tierLabelPositions[index] === "center" ? this.endTickLength() : this._tierHeights[index]);
        }
        else {
            attr["y1"] = this.height() - offset;
            attr["y2"] = this.height() - (offset + (this._tierLabelPositions[index] === "center" ?
                this.endTickLength() : this._tierHeights[index]));
        }
        d3.select(tickMarks.nodes()[0]).attrs(attr);
        d3.select(tickMarks.nodes()[tickMarks.size() - 1]).attrs(attr);
        // Add end-tick classes to first and last tick for CSS customization purposes
        d3.select(tickMarks.nodes()[0]).classed(axis_1.Axis.END_TICK_MARK_CLASS, true);
        d3.select(tickMarks.nodes()[tickMarks.size() - 1]).classed(axis_1.Axis.END_TICK_MARK_CLASS, true);
        tickMarksUpdate.exit().remove();
    };
    Time.prototype._renderLabellessTickMarks = function (tickValues) {
        var tickMarksUpdate = this._tickMarkContainer.selectAll("." + axis_1.Axis.TICK_MARK_CLASS).data(tickValues);
        var tickMarks = tickMarksUpdate
            .enter()
            .append("line")
            .classed(axis_1.Axis.TICK_MARK_CLASS, true)
            .merge(tickMarksUpdate);
        var attr = this._generateTickMarkAttrHash();
        attr["y2"] = (this.orientation() === "bottom") ? this.tickLabelPadding() : this.height() - this.tickLabelPadding();
        tickMarks.attrs(attr);
        tickMarksUpdate.exit().remove();
    };
    Time.prototype._generateLabellessTicks = function () {
        if (this._mostPreciseConfigIndex < 1) {
            return [];
        }
        return this._getTickIntervalValues(this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex - 1][0]);
    };
    Time.prototype.renderImmediately = function () {
        var _this = this;
        this._mostPreciseConfigIndex = this._getMostPreciseConfigurationIndex();
        var tierConfigs = this._possibleTimeAxisConfigurations[this._mostPreciseConfigIndex];
        this._cleanTiers();
        tierConfigs.forEach(function (config, i) {
            return _this._renderTierLabels(_this._tierLabelContainers[i], config, i);
        });
        var tierTicks = tierConfigs.map(function (config, i) {
            return _this._getTickValuesForConfiguration(config);
        });
        var baselineOffset = 0;
        for (var i = 0; i < Math.max(tierConfigs.length, 1); ++i) {
            var attr = this._generateBaselineAttrHash();
            attr["y1"] += (this.orientation() === "bottom") ? baselineOffset : -baselineOffset;
            attr["y2"] = attr["y1"];
            this._tierBaselines[i].attrs(attr).style("visibility", "inherit");
            baselineOffset += this._tierHeights[i];
        }
        var labelLessTicks = [];
        var domain = this._scale.domain();
        var totalLength = this._scale.scale(domain[1]) - this._scale.scale(domain[0]);
        if (this._getIntervalLength(tierConfigs[0]) * 1.5 >= totalLength) {
            labelLessTicks = this._generateLabellessTicks();
        }
        this._renderLabellessTickMarks(labelLessTicks);
        this._hideOverflowingTiers();
        for (var i = 0; i < tierConfigs.length; ++i) {
            this._renderTickMarks(tierTicks[i], i);
            this._hideOverlappingAndCutOffLabels(i);
        }
        if (this.annotationsEnabled()) {
            this._drawAnnotations();
        }
        else {
            this._removeAnnotations();
        }
        return this;
    };
    Time.prototype._hideOverflowingTiers = function () {
        var _this = this;
        var availableHeight = this.height();
        var usedHeight = 0;
        this.content()
            .selectAll("." + Time.TIME_AXIS_TIER_CLASS)
            .attr("visibility", function (d, i) {
            usedHeight += _this._tierHeights[i];
            return usedHeight <= availableHeight ? "inherit" : "hidden";
        });
    };
    Time.prototype._hideOverlappingAndCutOffLabels = function (index) {
        var _this = this;
        var boundingBox = this.element().node().getBoundingClientRect();
        var isInsideBBox = function (tickBox) {
            return (Math.floor(boundingBox.left) <= Math.ceil(tickBox.left) &&
                Math.floor(boundingBox.top) <= Math.ceil(tickBox.top) &&
                Math.floor(tickBox.right) <= Math.ceil(boundingBox.left + _this.width()) &&
                Math.floor(tickBox.bottom) <= Math.ceil(boundingBox.top + _this.height()));
        };
        var visibleTickMarks = this._tierMarkContainers[index]
            .selectAll("." + axis_1.Axis.TICK_MARK_CLASS)
            .filter(function (d, i) {
            var visibility = d3.select(this).style("visibility");
            return visibility === "visible" || visibility === "inherit";
        });
        // We use the ClientRects because x1/x2 attributes are not comparable to ClientRects of labels
        var visibleTickMarkRects = visibleTickMarks.nodes().map(function (mark) { return mark.getBoundingClientRect(); });
        var visibleTickLabels = this._tierLabelContainers[index]
            .selectAll("." + axis_1.Axis.TICK_LABEL_CLASS)
            .filter(function (d, i) {
            var visibility = d3.select(this).style("visibility");
            return visibility === "visible" || visibility === "inherit";
        });
        var lastLabelClientRect;
        visibleTickLabels.each(function (d, i) {
            var clientRect = this.getBoundingClientRect();
            var tickLabel = d3.select(this);
            var leadingTickMark = visibleTickMarkRects[i];
            var trailingTickMark = visibleTickMarkRects[i + 1];
            var isOverlappingLastLabel = (lastLabelClientRect != null && Utils.DOM.clientRectsOverlap(clientRect, lastLabelClientRect));
            var isOverlappingLeadingTickMark = (leadingTickMark != null && Utils.DOM.clientRectsOverlap(clientRect, leadingTickMark));
            var isOverlappingTrailingTickMark = (trailingTickMark != null && Utils.DOM.clientRectsOverlap(clientRect, trailingTickMark));
            if (!isInsideBBox(clientRect) || isOverlappingLastLabel || isOverlappingLeadingTickMark || isOverlappingTrailingTickMark) {
                tickLabel.style("visibility", "hidden");
            }
            else {
                lastLabelClientRect = clientRect;
                tickLabel.style("visibility", "inherit");
            }
        });
    };
    Time.prototype.invalidateCache = function () {
        _super.prototype.invalidateCache.call(this);
        this._measurer.reset();
    };
    return Time;
}(axis_1.Axis));
/**
 * The CSS class applied to each Time Axis tier
 */
Time.TIME_AXIS_TIER_CLASS = "time-axis-tier";
Time._SORTED_TIME_INTERVAL_INDEX = (_a = {},
    _a[exports.TimeInterval.second] = 0,
    _a[exports.TimeInterval.minute] = 1,
    _a[exports.TimeInterval.hour] = 2,
    _a[exports.TimeInterval.day] = 3,
    _a[exports.TimeInterval.week] = 4,
    _a[exports.TimeInterval.month] = 5,
    _a[exports.TimeInterval.year] = 6,
    _a);
Time._DEFAULT_TIME_AXIS_CONFIGURATIONS = [
    [
        { interval: exports.TimeInterval.second, step: 1, formatter: Formatters.time("%I:%M:%S %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.second, step: 5, formatter: Formatters.time("%I:%M:%S %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.second, step: 10, formatter: Formatters.time("%I:%M:%S %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.second, step: 15, formatter: Formatters.time("%I:%M:%S %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.second, step: 30, formatter: Formatters.time("%I:%M:%S %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.minute, step: 1, formatter: Formatters.time("%I:%M %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.minute, step: 5, formatter: Formatters.time("%I:%M %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.minute, step: 10, formatter: Formatters.time("%I:%M %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.minute, step: 15, formatter: Formatters.time("%I:%M %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.minute, step: 30, formatter: Formatters.time("%I:%M %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.hour, step: 1, formatter: Formatters.time("%I %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.hour, step: 3, formatter: Formatters.time("%I %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.hour, step: 6, formatter: Formatters.time("%I %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.hour, step: 12, formatter: Formatters.time("%I %p") },
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%B %e, %Y") },
    ],
    [
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%a %e") },
        { interval: exports.TimeInterval.month, step: 1, formatter: Formatters.time("%B %Y") },
    ],
    [
        { interval: exports.TimeInterval.day, step: 1, formatter: Formatters.time("%e") },
        { interval: exports.TimeInterval.month, step: 1, formatter: Formatters.time("%B %Y") },
    ],
    [
        { interval: exports.TimeInterval.month, step: 1, formatter: Formatters.time("%B") },
        { interval: exports.TimeInterval.year, step: 1, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.month, step: 1, formatter: Formatters.time("%b") },
        { interval: exports.TimeInterval.year, step: 1, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.month, step: 3, formatter: Formatters.time("%b") },
        { interval: exports.TimeInterval.year, step: 1, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.month, step: 6, formatter: Formatters.time("%b") },
        { interval: exports.TimeInterval.year, step: 1, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 1, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 1, formatter: Formatters.time("%y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 5, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 25, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 50, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 100, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 200, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 500, formatter: Formatters.time("%Y") },
    ],
    [
        { interval: exports.TimeInterval.year, step: 1000, formatter: Formatters.time("%Y") },
    ],
];
Time._LONG_DATE = new Date(9999, 8, 29, 12, 59, 9999);
exports.Time = Time;
var _a;
