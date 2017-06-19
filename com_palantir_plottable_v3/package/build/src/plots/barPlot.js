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
var Animators = require("../animators");
var Formatters = require("../core/formatters");
var drawer_1 = require("../drawers/drawer");
var rectangleDrawer_1 = require("../drawers/rectangleDrawer");
var Scales = require("../scales");
var quantitativeScale_1 = require("../scales/quantitativeScale");
var Utils = require("../utils");
var makeEnum_1 = require("../utils/makeEnum");
var Plots = require("./");
var plot_1 = require("./plot");
var xyPlot_1 = require("./xyPlot");
exports.BarOrientation = makeEnum_1.makeEnum(["vertical", "horizontal"]);
exports.LabelsPosition = makeEnum_1.makeEnum(["start", "middle", "end", "outside"]);
exports.BarAlignment = makeEnum_1.makeEnum(["start", "middle", "end"]);
var Bar = (function (_super) {
    __extends(Bar, _super);
    /**
     * A Bar Plot draws bars growing out from a baseline to some value
     *
     * @constructor
     * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
     */
    function Bar(orientation) {
        if (orientation === void 0) { orientation = "vertical"; }
        var _this = _super.call(this) || this;
        _this._labelFormatter = Formatters.identity();
        _this._labelsEnabled = false;
        _this._labelsPosition = exports.LabelsPosition.end;
        _this._hideBarsIfAnyAreTooWide = true;
        _this._barAlignment = "middle";
        _this._fixedWidth = true;
        _this._barPixelWidth = 0;
        _this.addClass("bar-plot");
        if (orientation !== "vertical" && orientation !== "horizontal") {
            throw new Error(orientation + " is not a valid orientation for Plots.Bar");
        }
        _this._isVertical = orientation === "vertical";
        _this.animator("baseline", new Animators.Null());
        _this.attr("fill", new Scales.Color().range()[0]);
        _this.attr("width", function () { return _this._barPixelWidth; });
        _this._labelConfig = new Utils.Map();
        _this._baselineValueProvider = function () { return [_this.baselineValue()]; };
        _this._updateBarPixelWidthCallback = function () { return _this._updateBarPixelWidth(); };
        return _this;
    }
    Bar.prototype.x = function (x, xScale) {
        if (x == null) {
            return _super.prototype.x.call(this);
        }
        if (xScale == null) {
            _super.prototype.x.call(this, x);
        }
        else {
            _super.prototype.x.call(this, x, xScale);
            xScale.onUpdate(this._updateBarPixelWidthCallback);
        }
        this._updateWidthAccesor();
        this._updateValueScale();
        return this;
    };
    Bar.prototype.y = function (y, yScale) {
        if (y == null) {
            return _super.prototype.y.call(this);
        }
        if (yScale == null) {
            _super.prototype.y.call(this, y);
        }
        else {
            _super.prototype.y.call(this, y, yScale);
            yScale.onUpdate(this._updateBarPixelWidthCallback);
        }
        this._updateValueScale();
        return this;
    };
    /**
     * Sets the accessor for the bar "end", which is used to compute the width of
     * each bar on the x axis (y axis if horizontal).
     *
     * If a `Scale` has been set for the independent axis via the `x` method (`y`
     * if horizontal), it will also be used to scale `barEnd`.
     *
     * Additionally, calling this setter will set `barAlignment` to `"start"`,
     * indicating that `x` and `barEnd` now define the left and right x
     * coordinates of a bar (bottom/top if horizontal).
     *
     * Normally, a single bar width for all bars is determined by how many bars
     * can fit in the given space (minus some padding). Settings this accessor
     * will override this behavior and manually set the start and end coordinates
     * for each bar.
     *
     * This means it will totally ignore the range band width of category scales,
     * so this probably doesn't make sense to use with category axes.
     */
    Bar.prototype.barEnd = function (end) {
        if (end == null) {
            return this._propertyBindings.get(Bar._BAR_END_KEY);
        }
        var binding = (this._isVertical) ? this.x() : this.y();
        var scale = binding && binding.scale;
        this._bindProperty(Bar._BAR_END_KEY, end, scale);
        this._updateWidthAccesor();
        this._updateValueScale();
        this.render();
        return this;
    };
    /**
     * Sets the bar alignment. Valid values are `"start"`, `"middle"`, and
     * `"end"`, which determines the meaning of the accessor of the bar's scale
     * coordinate (e.g. "x" for vertical bars).
     *
     * For example, a value of "start" means the x coordinate accessor sets the
     * left hand side of the rect.
     *
     * The default value is "middle", which aligns to rect so that it centered on
     * the x coordinate
     */
    Bar.prototype.barAlignment = function (align) {
        if (align == null) {
            return this._barAlignment;
        }
        this._barAlignment = align;
        this.render();
        return this;
    };
    /**
     * Gets the orientation of the plot
     *
     * @return "vertical" | "horizontal"
     */
    Bar.prototype.orientation = function () {
        return this._isVertical ? "vertical" : "horizontal";
    };
    Bar.prototype.render = function () {
        this._updateBarPixelWidth();
        this._updateExtents();
        _super.prototype.render.call(this);
        return this;
    };
    Bar.prototype._createDrawer = function () {
        return new drawer_1.ProxyDrawer(function () { return new rectangleDrawer_1.RectangleSVGDrawer(Bar._BAR_AREA_CLASS); }, rectangleDrawer_1.RectangleCanvasDrawStep);
    };
    Bar.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._baseline = this._renderArea.append("line").classed("baseline", true);
    };
    Bar.prototype.baselineValue = function (value) {
        if (value == null) {
            if (this._baselineValue != null) {
                return this._baselineValue;
            }
            if (!this._projectorsReady()) {
                return 0;
            }
            var valueScale = this._isVertical ? this.y().scale : this.x().scale;
            if (!valueScale) {
                return 0;
            }
            if (valueScale instanceof Scales.Time) {
                return new Date(0);
            }
            return 0;
        }
        this._baselineValue = value;
        this._updateValueScale();
        this.render();
        return this;
    };
    Bar.prototype.addDataset = function (dataset) {
        _super.prototype.addDataset.call(this, dataset);
        this._updateBarPixelWidth();
        return this;
    };
    Bar.prototype._addDataset = function (dataset) {
        dataset.onUpdate(this._updateBarPixelWidthCallback);
        _super.prototype._addDataset.call(this, dataset);
        return this;
    };
    Bar.prototype.removeDataset = function (dataset) {
        dataset.offUpdate(this._updateBarPixelWidthCallback);
        _super.prototype.removeDataset.call(this, dataset);
        this._updateBarPixelWidth();
        return this;
    };
    Bar.prototype._removeDataset = function (dataset) {
        dataset.offUpdate(this._updateBarPixelWidthCallback);
        _super.prototype._removeDataset.call(this, dataset);
        return this;
    };
    Bar.prototype.datasets = function (datasets) {
        if (datasets == null) {
            return _super.prototype.datasets.call(this);
        }
        _super.prototype.datasets.call(this, datasets);
        this._updateBarPixelWidth();
        return this;
    };
    Bar.prototype.labelsEnabled = function (enabled, labelsPosition) {
        if (enabled == null) {
            return this._labelsEnabled;
        }
        else {
            this._labelsEnabled = enabled;
            if (labelsPosition != null) {
                this._labelsPosition = labelsPosition;
            }
            this.render();
            return this;
        }
    };
    Bar.prototype.labelFormatter = function (formatter) {
        if (formatter == null) {
            return this._labelFormatter;
        }
        else {
            this._labelFormatter = formatter;
            this.render();
            return this;
        }
    };
    Bar.prototype._createNodesForDataset = function (dataset) {
        var drawer = _super.prototype._createNodesForDataset.call(this, dataset);
        var labelArea = this._renderArea.append("g").classed(Bar._LABEL_AREA_CLASS, true);
        var context = new Typesetter.SvgContext(labelArea.node());
        var measurer = new Typesetter.CacheMeasurer(context);
        var writer = new Typesetter.Writer(measurer, context);
        this._labelConfig.set(dataset, { labelArea: labelArea, measurer: measurer, writer: writer });
        return drawer;
    };
    Bar.prototype._removeDatasetNodes = function (dataset) {
        _super.prototype._removeDatasetNodes.call(this, dataset);
        var labelConfig = this._labelConfig.get(dataset);
        if (labelConfig != null) {
            labelConfig.labelArea.remove();
            this._labelConfig.delete(dataset);
        }
    };
    /**
     * Returns the PlotEntity nearest to the query point according to the following algorithm:
     *   - If the query point is inside a bar, returns the PlotEntity for that bar.
     *   - Otherwise, gets the nearest PlotEntity by the primary direction (X for vertical, Y for horizontal),
     *     breaking ties with the secondary direction.
     * Returns undefined if no PlotEntity can be found.
     *
     * @param {Point} queryPoint
     * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
     */
    Bar.prototype.entityNearest = function (queryPoint) {
        var _this = this;
        var minPrimaryDist = Infinity;
        var minSecondaryDist = Infinity;
        var queryPtPrimary = this._isVertical ? queryPoint.x : queryPoint.y;
        var queryPtSecondary = this._isVertical ? queryPoint.y : queryPoint.x;
        // SVGRects are positioned with sub-pixel accuracy (the default unit
        // for the x, y, height & width attributes), but user selections (e.g. via
        // mouse events) usually have pixel accuracy. We add a tolerance of 0.5 pixels.
        var tolerance = 0.5;
        var chartBounds = this.bounds();
        var closest;
        this._getEntityStore().entities().forEach(function (entity) {
            if (!_this._entityVisibleOnPlot(entity, chartBounds)) {
                return;
            }
            var primaryDist = 0;
            var secondaryDist = 0;
            var plotPt = _this._pixelPoint(entity.datum, entity.index, entity.dataset);
            // if we're inside a bar, distance in both directions should stay 0
            var barBBox = Utils.DOM.elementBBox(d3.select(entity.drawer.getVisualPrimitiveAtIndex(entity.validDatumIndex)));
            if (!Utils.DOM.intersectsBBox(queryPoint.x, queryPoint.y, barBBox, tolerance)) {
                var plotPtPrimary = _this._isVertical ? plotPt.x : plotPt.y;
                primaryDist = Math.abs(queryPtPrimary - plotPtPrimary);
                // compute this bar's min and max along the secondary axis
                var barMinSecondary = _this._isVertical ? barBBox.y : barBBox.x;
                var barMaxSecondary = barMinSecondary + (_this._isVertical ? barBBox.height : barBBox.width);
                if (queryPtSecondary >= barMinSecondary - tolerance && queryPtSecondary <= barMaxSecondary + tolerance) {
                    // if we're within a bar's secondary axis span, it is closest in that direction
                    secondaryDist = 0;
                }
                else {
                    var plotPtSecondary = _this._isVertical ? plotPt.y : plotPt.x;
                    secondaryDist = Math.abs(queryPtSecondary - plotPtSecondary);
                }
            }
            // if we find a closer bar, record its distance and start new closest lists
            if (primaryDist < minPrimaryDist
                || primaryDist === minPrimaryDist && secondaryDist < minSecondaryDist) {
                closest = entity;
                minPrimaryDist = primaryDist;
                minSecondaryDist = secondaryDist;
            }
        });
        if (closest !== undefined) {
            return this._lightweightPlotEntityToPlotEntity(closest);
        }
        else {
            return undefined;
        }
    };
    Bar.prototype._entityVisibleOnPlot = function (entity, bounds) {
        var chartWidth = bounds.bottomRight.x - bounds.topLeft.x;
        var chartHeight = bounds.bottomRight.y - bounds.topLeft.y;
        var xRange = { min: 0, max: chartWidth };
        var yRange = { min: 0, max: chartHeight };
        var attrToProjector = this._generateAttrToProjector();
        var datum = entity.datum, index = entity.index, dataset = entity.dataset;
        var barBBox = {
            x: attrToProjector["x"](datum, index, dataset),
            y: attrToProjector["y"](datum, index, dataset),
            width: attrToProjector["width"](datum, index, dataset),
            height: attrToProjector["height"](datum, index, dataset),
        };
        return Utils.DOM.intersectsBBox(xRange, yRange, barBBox);
    };
    /**
     * Gets the Entities at a particular Point.
     *
     * @param {Point} p
     * @returns {PlotEntity[]}
     */
    Bar.prototype.entitiesAt = function (p) {
        return this._entitiesIntersecting(p.x, p.y);
    };
    Bar.prototype.entitiesIn = function (xRangeOrBounds, yRange) {
        var dataXRange;
        var dataYRange;
        if (yRange == null) {
            var bounds = xRangeOrBounds;
            dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
            dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
        }
        else {
            dataXRange = xRangeOrBounds;
            dataYRange = yRange;
        }
        return this._entitiesIntersecting(dataXRange, dataYRange);
    };
    Bar.prototype._entitiesIntersecting = function (xValOrRange, yValOrRange) {
        var _this = this;
        var intersected = [];
        this._getEntityStore().entities().forEach(function (entity) {
            var selection = d3.select(entity.drawer.getVisualPrimitiveAtIndex(entity.validDatumIndex));
            if (Utils.DOM.intersectsBBox(xValOrRange, yValOrRange, Utils.DOM.elementBBox(selection))) {
                intersected.push(_this._lightweightPlotEntityToPlotEntity(entity));
            }
        });
        return intersected;
    };
    Bar.prototype._updateValueScale = function () {
        if (!this._projectorsReady()) {
            return;
        }
        var valueScale = this._isVertical ? this.y().scale : this.x().scale;
        if (valueScale instanceof quantitativeScale_1.QuantitativeScale) {
            var qscale = valueScale;
            qscale.addPaddingExceptionsProvider(this._baselineValueProvider);
            qscale.addIncludedValuesProvider(this._baselineValueProvider);
        }
    };
    Bar.prototype._additionalPaint = function (time) {
        var _this = this;
        var primaryScale = this._isVertical ? this.y().scale : this.x().scale;
        var scaledBaseline = primaryScale.scale(this.baselineValue());
        var baselineAttr = {
            "x1": this._isVertical ? 0 : scaledBaseline,
            "y1": this._isVertical ? scaledBaseline : 0,
            "x2": this._isVertical ? this.width() : scaledBaseline,
            "y2": this._isVertical ? scaledBaseline : this.height(),
        };
        this._getAnimator("baseline").animate(this._baseline, baselineAttr);
        this.datasets().forEach(function (dataset) { return _this._labelConfig.get(dataset).labelArea.selectAll("g").remove(); });
        if (this._labelsEnabled) {
            Utils.Window.setTimeout(function () { return _this._drawLabels(); }, time);
        }
    };
    /**
     * Makes sure the extent takes into account the widths of the bars
     */
    Bar.prototype._extentsForProperty = function (property) {
        var _this = this;
        var extents = _super.prototype._extentsForProperty.call(this, property);
        var accScaleBinding;
        if (property === "x" && this._isVertical) {
            accScaleBinding = this.x();
        }
        else if (property === "y" && !this._isVertical) {
            accScaleBinding = this.y();
        }
        else {
            return extents;
        }
        if (!(accScaleBinding && accScaleBinding.scale && accScaleBinding.scale instanceof quantitativeScale_1.QuantitativeScale)) {
            return extents;
        }
        var scale = accScaleBinding.scale;
        var width = this._barPixelWidth;
        // To account for inverted domains
        extents = extents.map(function (extent) { return d3.extent([
            scale.invert(_this._getAlignedX(scale.scale(extent[0]), width)),
            scale.invert(_this._getAlignedX(scale.scale(extent[0]), width) + width),
            scale.invert(_this._getAlignedX(scale.scale(extent[1]), width)),
            scale.invert(_this._getAlignedX(scale.scale(extent[1]), width) + width),
        ]); });
        return extents;
    };
    Bar.prototype._getAlignedX = function (x, width) {
        // account for flipped vertical axis
        if (!this._isVertical) {
            x -= width;
            width *= -1;
        }
        switch (this._barAlignment) {
            case "start":
                return x;
            case "end":
                return x - width;
            case "middle":
            default:
                return x - width / 2;
        }
    };
    Bar.prototype._drawLabels = function () {
        var _this = this;
        var dataToDraw = this._getDataToDraw();
        var attrToProjector = this._generateAttrToProjector();
        var anyLabelTooWide = this.datasets().some(function (dataset) {
            return dataToDraw.get(dataset).some(function (datum, index) {
                return _this._drawLabel(datum, index, dataset, attrToProjector);
            });
        });
        if (this._hideBarsIfAnyAreTooWide && anyLabelTooWide) {
            this.datasets().forEach(function (dataset) { return _this._labelConfig.get(dataset).labelArea.selectAll("g").remove(); });
        }
    };
    Bar.prototype._drawLabel = function (datum, index, dataset, attrToProjector) {
        var _a = this._labelConfig.get(dataset), labelArea = _a.labelArea, measurer = _a.measurer, writer = _a.writer;
        var valueAccessor = this._isVertical ? this.y().accessor : this.x().accessor;
        var value = valueAccessor(datum, index, dataset);
        var valueScale = this._isVertical ? this.y().scale : this.x().scale;
        var scaledValue = valueScale != null ? valueScale.scale(value) : value;
        var scaledBaseline = valueScale != null ? valueScale.scale(this.baselineValue()) : this.baselineValue();
        var barCoordinates = { x: attrToProjector["x"](datum, index, dataset), y: attrToProjector["y"](datum, index, dataset) };
        var barDimensions = { width: attrToProjector["width"](datum, index, dataset), height: attrToProjector["height"](datum, index, dataset) };
        var text = this._labelFormatter(valueAccessor(datum, index, dataset));
        var measurement = measurer.measure(text);
        var showLabelOnBar = this._getShowLabelOnBar(barCoordinates, barDimensions, measurement);
        // show label on right when value === baseline for horizontal plots
        var aboveOrLeftOfBaseline = this._isVertical ? scaledValue <= scaledBaseline : scaledValue < scaledBaseline;
        var _b = this._calculateLabelProperties(barCoordinates, barDimensions, measurement, showLabelOnBar, aboveOrLeftOfBaseline), containerDimensions = _b.containerDimensions, labelContainerOrigin = _b.labelContainerOrigin, labelOrigin = _b.labelOrigin, alignment = _b.alignment;
        var color = attrToProjector["fill"](datum, index, dataset);
        var labelContainer = this._createLabelContainer(labelArea, labelContainerOrigin, labelOrigin, measurement, showLabelOnBar, color);
        var writeOptions = { xAlign: alignment.x, yAlign: alignment.y };
        writer.write(text, containerDimensions.width, containerDimensions.height, writeOptions, labelContainer.node());
        var tooWide = this._isVertical
            ? barDimensions.width < (measurement.width + Bar._LABEL_PADDING * 2)
            : barDimensions.height < (measurement.height + Bar._LABEL_PADDING * 2);
        return tooWide;
    };
    Bar.prototype._getShowLabelOnBar = function (barCoordinates, barDimensions, measurement) {
        if (this._labelsPosition === exports.LabelsPosition.outside) {
            return false;
        }
        var barCoordinate = this._isVertical ? barCoordinates.y : barCoordinates.x;
        var barDimension = this._isVertical ? barDimensions.height : barDimensions.width;
        var plotDimension = this._isVertical ? this.height() : this.width();
        var measurementDimension = this._isVertical ? measurement.height : measurement.width;
        var effectiveBarDimension = barDimension;
        if (barCoordinate + barDimension > plotDimension) {
            effectiveBarDimension = plotDimension - barCoordinate;
        }
        else if (barCoordinate < 0) {
            effectiveBarDimension = barCoordinate + barDimension;
        }
        return (measurementDimension + 2 * Bar._LABEL_PADDING <= effectiveBarDimension);
    };
    Bar.prototype._calculateLabelProperties = function (barCoordinates, barDimensions, measurement, showLabelOnBar, aboveOrLeftOfBaseline) {
        var _this = this;
        var barCoordinate = this._isVertical ? barCoordinates.y : barCoordinates.x;
        var barDimension = this._isVertical ? barDimensions.height : barDimensions.width;
        var measurementDimension = this._isVertical ? measurement.height : measurement.width;
        var alignmentDimension = "center";
        var containerDimension = barDimension;
        var labelContainerOriginCoordinate = barCoordinate;
        var labelOriginCoordinate = barCoordinate;
        var updateCoordinates = function (position) {
            switch (position) {
                case "topLeft":
                    alignmentDimension = _this._isVertical ? "top" : "left";
                    labelContainerOriginCoordinate += Bar._LABEL_PADDING;
                    labelOriginCoordinate += Bar._LABEL_PADDING;
                    return;
                case "center":
                    labelOriginCoordinate += (barDimension + measurementDimension) / 2;
                    return;
                case "bottomRight":
                    alignmentDimension = _this._isVertical ? "bottom" : "right";
                    labelContainerOriginCoordinate -= Bar._LABEL_PADDING;
                    labelOriginCoordinate += containerDimension - Bar._LABEL_PADDING - measurementDimension;
                    return;
            }
        };
        if (showLabelOnBar) {
            switch (this._labelsPosition) {
                case exports.LabelsPosition.start:
                    aboveOrLeftOfBaseline ? updateCoordinates("bottomRight") : updateCoordinates("topLeft");
                    break;
                case exports.LabelsPosition.middle:
                    updateCoordinates("center");
                    break;
                case exports.LabelsPosition.end:
                    aboveOrLeftOfBaseline ? updateCoordinates("topLeft") : updateCoordinates("bottomRight");
                    break;
            }
        }
        else {
            if (aboveOrLeftOfBaseline) {
                alignmentDimension = this._isVertical ? "top" : "left";
                containerDimension = barDimension + Bar._LABEL_PADDING + measurementDimension;
                labelContainerOriginCoordinate -= Bar._LABEL_PADDING + measurementDimension;
                labelOriginCoordinate -= Bar._LABEL_PADDING + measurementDimension;
            }
            else {
                alignmentDimension = this._isVertical ? "bottom" : "right";
                containerDimension = barDimension + Bar._LABEL_PADDING + measurementDimension;
                labelOriginCoordinate += barDimension + Bar._LABEL_PADDING;
            }
        }
        return {
            containerDimensions: {
                width: this._isVertical ? barDimensions.width : containerDimension,
                height: this._isVertical ? containerDimension : barDimensions.height,
            },
            labelContainerOrigin: {
                x: this._isVertical ? barCoordinates.x : labelContainerOriginCoordinate,
                y: this._isVertical ? labelContainerOriginCoordinate : barCoordinates.y,
            },
            labelOrigin: {
                x: this._isVertical ? (barCoordinates.x + barDimensions.width / 2 - measurement.width / 2) : labelOriginCoordinate,
                y: this._isVertical ? labelOriginCoordinate : (barCoordinates.y + barDimensions.height / 2 - measurement.height / 2),
            },
            alignment: {
                x: this._isVertical ? "center" : alignmentDimension,
                y: this._isVertical ? alignmentDimension : "center",
            },
        };
    };
    Bar.prototype._createLabelContainer = function (labelArea, labelContainerOrigin, labelOrigin, measurement, showLabelOnBar, color) {
        var labelContainer = labelArea.append("g").attr("transform", "translate(" + labelContainerOrigin.x + ", " + labelContainerOrigin.y + ")");
        if (showLabelOnBar) {
            labelContainer.classed("on-bar-label", true);
            var dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
            labelContainer.classed(dark ? "dark-label" : "light-label", true);
        }
        else {
            labelContainer.classed("off-bar-label", true);
        }
        var hideLabel = labelOrigin.x < 0 ||
            labelOrigin.y < 0 ||
            labelOrigin.x + measurement.width > this.width() ||
            labelOrigin.y + measurement.height > this.height();
        labelContainer.style("visibility", hideLabel ? "hidden" : "inherit");
        return labelContainer;
    };
    Bar.prototype._generateDrawSteps = function () {
        var drawSteps = [];
        if (this._animateOnNextRender()) {
            var resetAttrToProjector = this._generateAttrToProjector();
            var primaryScale = this._isVertical ? this.y().scale : this.x().scale;
            var scaledBaseline_1 = primaryScale.scale(this.baselineValue());
            var positionAttr = this._isVertical ? "y" : "x";
            var dimensionAttr = this._isVertical ? "height" : "width";
            resetAttrToProjector[positionAttr] = function () { return scaledBaseline_1; };
            resetAttrToProjector[dimensionAttr] = function () { return 0; };
            drawSteps.push({ attrToProjector: resetAttrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
        }
        drawSteps.push({
            attrToProjector: this._generateAttrToProjector(),
            animator: this._getAnimator(Plots.Animator.MAIN),
        });
        return drawSteps;
    };
    Bar.prototype._generateAttrToProjector = function () {
        var _this = this;
        // Primary scale/direction: the "length" of the bars
        // Secondary scale/direction: the "width" of the bars
        var attrToProjector = _super.prototype._generateAttrToProjector.call(this);
        var primaryScale = this._isVertical ? this.y().scale : this.x().scale;
        var primaryAttr = this._isVertical ? "y" : "x";
        var secondaryAttr = this._isVertical ? "x" : "y";
        var scaledBaseline = primaryScale.scale(this.baselineValue());
        var positionF = this._isVertical ? plot_1.Plot._scaledAccessor(this.x()) : plot_1.Plot._scaledAccessor(this.y());
        var widthF = attrToProjector["width"];
        var originalPositionFn = this._isVertical ? plot_1.Plot._scaledAccessor(this.y()) : plot_1.Plot._scaledAccessor(this.x());
        var heightF = function (d, i, dataset) {
            return Math.abs(scaledBaseline - originalPositionFn(d, i, dataset));
        };
        var gapF = attrToProjector["gap"];
        var widthMinusGap = gapF == null ? widthF : function (d, i, dataset) {
            return widthF(d, i, dataset) - gapF(d, i, dataset);
        };
        attrToProjector["width"] = this._isVertical ? widthMinusGap : heightF;
        attrToProjector["height"] = this._isVertical ? heightF : widthMinusGap;
        attrToProjector[secondaryAttr] = function (d, i, dataset) {
            return _this._getAlignedX(positionF(d, i, dataset), widthF(d, i, dataset));
        };
        attrToProjector[primaryAttr] = function (d, i, dataset) {
            var originalPos = originalPositionFn(d, i, dataset);
            // If it is past the baseline, it should start at the baselin then width/height
            // carries it over. If it's not past the baseline, leave it at original position and
            // then width/height carries it to baseline
            return (originalPos > scaledBaseline) ? scaledBaseline : originalPos;
        };
        return attrToProjector;
    };
    Bar.prototype._updateWidthAccesor = function () {
        var _this = this;
        var startProj = this._isVertical ? this.x() : this.y();
        var endProj = this.barEnd();
        if (startProj != null && endProj != null) {
            this._fixedWidth = false;
            this.attr("width", function (d, i, data) {
                var v1 = startProj.accessor(d, i, data);
                var v2 = endProj.accessor(d, i, data);
                v1 = startProj.scale ? startProj.scale.scale(v1) : v1;
                v2 = endProj.scale ? endProj.scale.scale(v2) : v2;
                return Math.abs(v2 - v1);
            });
        }
        else {
            this._fixedWidth = true;
            this._updateBarPixelWidth();
            this.attr("width", function () { return _this._barPixelWidth; });
        }
    };
    /**
     * Computes the barPixelWidth of all the bars in the plot.
     *
     * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
     * If the position scale of the plot is a QuantitativeScale, then the bar width is equal to the smallest distance between
     * two adjacent data points, padded for visualisation.
     */
    Bar.prototype._getBarPixelWidth = function () {
        if (!this._projectorsReady()) {
            return 0;
        }
        var barPixelWidth;
        var barScale = this._isVertical ? this.x().scale : this.y().scale;
        if (barScale instanceof Scales.Category) {
            barPixelWidth = barScale.rangeBand();
        }
        else {
            var barAccessor_1 = this._isVertical ? this.x().accessor : this.y().accessor;
            var numberBarAccessorData = d3.set(Utils.Array.flatten(this.datasets().map(function (dataset) {
                return dataset.data().map(function (d, i) { return barAccessor_1(d, i, dataset); })
                    .filter(function (d) { return d != null; })
                    .map(function (d) { return d.valueOf(); });
            }))).values().map(function (value) { return +value; });
            numberBarAccessorData.sort(function (a, b) { return a - b; });
            var scaledData = numberBarAccessorData.map(function (datum) { return barScale.scale(datum); });
            var barAccessorDataPairs = d3.pairs(scaledData);
            var barWidthDimension = this._isVertical ? this.width() : this.height();
            barPixelWidth = Utils.Math.min(barAccessorDataPairs, function (pair, i) {
                return Math.abs(pair[1] - pair[0]);
            }, barWidthDimension * Bar._SINGLE_BAR_DIMENSION_RATIO);
            barPixelWidth *= Bar._BAR_WIDTH_RATIO;
        }
        return barPixelWidth;
    };
    Bar.prototype._updateBarPixelWidth = function () {
        if (this._fixedWidth) {
            this._barPixelWidth = this._getBarPixelWidth();
        }
    };
    Bar.prototype.entities = function (datasets) {
        if (datasets === void 0) { datasets = this.datasets(); }
        if (!this._projectorsReady()) {
            return [];
        }
        var entities = _super.prototype.entities.call(this, datasets);
        return entities;
    };
    Bar.prototype._pixelPoint = function (datum, index, dataset) {
        var attrToProjector = this._generateAttrToProjector();
        var rectX = attrToProjector["x"](datum, index, dataset);
        var rectY = attrToProjector["y"](datum, index, dataset);
        var rectWidth = attrToProjector["width"](datum, index, dataset);
        var rectHeight = attrToProjector["height"](datum, index, dataset);
        var x;
        var y;
        var originalPosition = (this._isVertical ? plot_1.Plot._scaledAccessor(this.y()) : plot_1.Plot._scaledAccessor(this.x()))(datum, index, dataset);
        var scaledBaseline = (this._isVertical ? this.y().scale : this.x().scale).scale(this.baselineValue());
        if (this._isVertical) {
            x = rectX + rectWidth / 2;
            y = originalPosition <= scaledBaseline ? rectY : rectY + rectHeight;
        }
        else {
            x = originalPosition >= scaledBaseline ? rectX + rectWidth : rectX;
            y = rectY + rectHeight / 2;
        }
        return { x: x, y: y };
    };
    Bar.prototype._uninstallScaleForKey = function (scale, key) {
        scale.offUpdate(this._updateBarPixelWidthCallback);
        _super.prototype._uninstallScaleForKey.call(this, scale, key);
    };
    Bar.prototype._getDataToDraw = function () {
        var dataToDraw = new Utils.Map();
        var attrToProjector = this._generateAttrToProjector();
        this.datasets().forEach(function (dataset) {
            var data = dataset.data().filter(function (d, i) { return Utils.Math.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
                Utils.Math.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
                Utils.Math.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
                Utils.Math.isValidNumber(attrToProjector["height"](d, i, dataset)); });
            dataToDraw.set(dataset, data);
        });
        return dataToDraw;
    };
    return Bar;
}(xyPlot_1.XYPlot));
Bar._BAR_WIDTH_RATIO = 0.95;
Bar._SINGLE_BAR_DIMENSION_RATIO = 0.4;
Bar._BAR_AREA_CLASS = "bar-area";
Bar._BAR_END_KEY = "barEnd";
Bar._LABEL_AREA_CLASS = "bar-label-text-area";
Bar._LABEL_PADDING = 10;
exports.Bar = Bar;
