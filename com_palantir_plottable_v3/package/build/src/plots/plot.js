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
var Animators = require("../animators");
var component_1 = require("../components/component");
var drawer_1 = require("../drawers/drawer");
var svgDrawer_1 = require("../drawers/svgDrawer");
var Utils = require("../utils");
var coerceD3_1 = require("../utils/coerceD3");
var makeEnum_1 = require("../utils/makeEnum");
var Plots = require("./commons");
exports.Renderer = makeEnum_1.makeEnum(["svg", "canvas"]);
var Plot = (function (_super) {
    __extends(Plot, _super);
    /**
     * A Plot draws some visualization of the inputted Datasets.
     *
     * @constructor
     */
    function Plot() {
        var _this = _super.call(this) || this;
        /**
         * Whether the backing datasets have changed since this plot's last render.
         */
        _this._dataChanged = false;
        _this._animate = false;
        /**
         * The Animators for this plot. Each plot exposes a set of "animator key" strings that
         * define how different parts of that particular Plot animates. For instance, Rectangle
         * Plots have a "rectangles" animator key which controls how the <rect>s are animated.
         * @see animator()
         *
         * There are two common animators that most Plots respect: "main" and "reset". In general,
         * Plots draw in two steps: first they "reset" their visual elements (e.g. scatter plots set
         * all the dots to size 0), and then they do the "main" animation into the correct visualization
         * (e.g. scatter plot dots grow to their specified size).
         */
        _this._animators = {};
        _this._resetEntityStore = function () {
            _this._cachedEntityStore = undefined;
        };
        _this._overflowHidden = true;
        _this.addClass("plot");
        _this._datasetToDrawer = new Utils.Map();
        _this._attrBindings = d3.map();
        _this._attrExtents = d3.map();
        _this._includedValuesProvider = function (scale) { return _this._includedValuesForScale(scale); };
        _this._renderCallback = function (scale) { return _this.render(); };
        _this._onDatasetUpdateCallback = function () { return _this._onDatasetUpdate(); };
        _this._propertyBindings = d3.map();
        _this._propertyExtents = d3.map();
        var mainAnimator = new Animators.Easing().maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
        _this.animator(Plots.Animator.MAIN, mainAnimator);
        _this.animator(Plots.Animator.RESET, new Animators.Null());
        _this._deferredResetEntityStore = Utils.Window.debounce(Plot._DEFERRED_RENDERING_DELAY, _this._resetEntityStore);
        return _this;
    }
    Plot.getTotalDrawTime = function (data, drawSteps) {
        return drawSteps.reduce(function (time, drawStep) { return time + drawStep.animator.totalTime(data.length); }, 0);
    };
    Plot.applyDrawSteps = function (drawSteps, dataset) {
        var appliedDrawSteps = drawSteps.map(function (drawStep) {
            var attrToProjector = drawStep.attrToProjector;
            var attrToAppliedProjector = {};
            Object.keys(attrToProjector).forEach(function (attr) {
                attrToAppliedProjector[attr] =
                    function (datum, index) { return attrToProjector[attr](datum, index, dataset); };
            });
            return {
                attrToAppliedProjector: attrToAppliedProjector,
                animator: drawStep.animator,
            };
        });
        return appliedDrawSteps;
    };
    Plot.prototype.anchor = function (selection) {
        selection = coerceD3_1.coerceExternalD3(selection);
        _super.prototype.anchor.call(this, selection);
        this._dataChanged = true;
        this._resetEntityStore();
        this._updateExtents();
        return this;
    };
    Plot.prototype._setup = function () {
        var _this = this;
        if (this._isSetup) {
            return;
        }
        _super.prototype._setup.call(this);
        if (this._canvas != null) {
            this._appendCanvasNode();
        }
        this._renderArea = this.content().append("g").classed("render-area", true);
        this.datasets().forEach(function (dataset) { return _this._createNodesForDataset(dataset); });
    };
    Plot.prototype._appendCanvasNode = function () {
        var canvasContainer = this.element().select(".plot-canvas-container");
        if (canvasContainer.empty()) {
            canvasContainer = this.element().append("div").classed("plot-canvas-container", true);
            canvasContainer.node().appendChild(this._canvas.node());
        }
    };
    Plot.prototype.setBounds = function (width, height, originX, originY) {
        _super.prototype.setBounds.call(this, width, height, originX, originY);
        if (this._canvas != null) {
            var ratio = (window.devicePixelRatio != null) ? window.devicePixelRatio : 1;
            // update canvas width/height taking into account retina displays.
            // This will also clear the canvas of any drawn elements so we should
            // be sure not to computeLayout() without a render() in the future.
            this._canvas.attr("width", width * ratio);
            this._canvas.attr("height", height * ratio);
            // reset the transform then set the scale factor
            var ctx = this._canvas.node().getContext("2d");
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
        return this;
    };
    Plot.prototype.destroy = function () {
        var _this = this;
        _super.prototype.destroy.call(this);
        this._scales().forEach(function (scale) { return scale.offUpdate(_this._renderCallback); });
        this.datasets([]);
    };
    /**
     * Setup the DOM nodes for the given dataset. This is a separate
     * step from "creating the Drawer" since the element may not be setup yet
     * (in which case the _renderArea is null because the .element() and .content()
     * are null). Also because subclasses may do more than just configure one
     * single drawer (e.g. adding text drawing capabilities).
     */
    Plot.prototype._createNodesForDataset = function (dataset) {
        var drawer = this._datasetToDrawer.get(dataset);
        if (this.renderer() === "svg") {
            drawer.useSVG(this._renderArea);
        }
        else {
            drawer.useCanvas(this._canvas);
        }
        return drawer;
    };
    /**
     * Create a new Drawer. Subclasses should override this to return
     * a Drawer that draws the correct shapes for this plot.
     */
    Plot.prototype._createDrawer = function (dataset) {
        return new drawer_1.ProxyDrawer(function () { return new svgDrawer_1.SVGDrawer("path", ""); }, function () { });
    };
    Plot.prototype._getAnimator = function (key) {
        if (this._animateOnNextRender()) {
            return this._animators[key] || new Animators.Null();
        }
        else {
            return new Animators.Null();
        }
    };
    Plot.prototype._onDatasetUpdate = function () {
        this._updateExtents();
        this._dataChanged = true;
        this._resetEntityStore();
        this.render();
    };
    Plot.prototype.attr = function (attr, attrValue, scale) {
        if (attrValue == null) {
            return this._attrBindings.get(attr);
        }
        this._bindAttr(attr, attrValue, scale);
        this.render(); // queue a re-render upon changing projector
        return this;
    };
    Plot.prototype._bindProperty = function (property, valueOrFn, scale) {
        var binding = this._propertyBindings.get(property);
        var oldScale = binding != null ? binding.scale : null;
        var accessor = typeof valueOrFn === "function" ? valueOrFn : function () { return valueOrFn; };
        this._propertyBindings.set(property, { accessor: accessor, scale: scale });
        this._updateExtentsForProperty(property);
        if (oldScale != null) {
            this._uninstallScaleForKey(oldScale, property);
        }
        if (scale != null) {
            this._installScaleForKey(scale, property);
        }
    };
    Plot.prototype._bindAttr = function (attr, valueOrFn, scale) {
        var binding = this._attrBindings.get(attr);
        var oldScale = binding != null ? binding.scale : null;
        var accessor = typeof valueOrFn === "function" ? valueOrFn : function () { return valueOrFn; };
        this._attrBindings.set(attr, { accessor: accessor, scale: scale });
        this._updateExtentsForAttr(attr);
        if (oldScale != null) {
            this._uninstallScaleForKey(oldScale, attr);
        }
        if (scale != null) {
            this._installScaleForKey(scale, attr);
        }
    };
    Plot.prototype._generateAttrToProjector = function () {
        var h = {};
        this._attrBindings.each(function (binding, attr) {
            var accessor = binding.accessor;
            var scale = binding.scale;
            var fn = scale ? function (d, i, dataset) { return scale.scale(accessor(d, i, dataset)); } : accessor;
            h[attr] = fn;
        });
        var propertyProjectors = this._propertyProjectors();
        Object.keys(propertyProjectors).forEach(function (key) {
            if (h[key] == null) {
                h[key] = propertyProjectors[key];
            }
        });
        return h;
    };
    Plot.prototype.renderImmediately = function () {
        _super.prototype.renderImmediately.call(this);
        if (this._isAnchored) {
            this._paint();
            this._dataChanged = false;
        }
        return this;
    };
    Plot.prototype.animated = function (willAnimate) {
        if (willAnimate == null) {
            return this._animate;
        }
        this._animate = willAnimate;
        return this;
    };
    Plot.prototype.detach = function () {
        _super.prototype.detach.call(this);
        // make the domain resize
        this._updateExtents();
        return this;
    };
    /**
     * @returns {Scale[]} A unique array of all scales currently used by the Plot.
     */
    Plot.prototype._scales = function () {
        var scales = [];
        this._attrBindings.each(function (binding, attr) {
            var scale = binding.scale;
            if (scale != null && scales.indexOf(scale) === -1) {
                scales.push(scale);
            }
        });
        this._propertyBindings.each(function (binding, property) {
            var scale = binding.scale;
            if (scale != null && scales.indexOf(scale) === -1) {
                scales.push(scale);
            }
        });
        return scales;
    };
    /**
     * Updates the extents associated with each attribute, then autodomains all scales the Plot uses.
     */
    Plot.prototype._updateExtents = function () {
        var _this = this;
        this._resetEntityStore();
        this._attrBindings.each(function (_, attr) { return _this._updateExtentsForAttr(attr); });
        this._propertyExtents.each(function (_, property) { return _this._updateExtentsForProperty(property); });
        this._scales().forEach(function (scale) { return scale.addIncludedValuesProvider(_this._includedValuesProvider); });
    };
    Plot.prototype._updateExtentsForAttr = function (attr) {
        // Filters should never be applied to attributes
        this._updateExtentsForKey(attr, this._attrBindings, this._attrExtents, null);
    };
    Plot.prototype._updateExtentsForProperty = function (property) {
        this._updateExtentsForKey(property, this._propertyBindings, this._propertyExtents, this._filterForProperty(property));
    };
    Plot.prototype._filterForProperty = function (property) {
        return null;
    };
    Plot.prototype._updateExtentsForKey = function (key, bindings, extents, filter) {
        var _this = this;
        var accScaleBinding = bindings.get(key);
        if (accScaleBinding == null || accScaleBinding.accessor == null) {
            return;
        }
        extents.set(key, this.datasets().map(function (dataset) { return _this._computeExtent(dataset, accScaleBinding, filter); }));
    };
    Plot.prototype._computeExtent = function (dataset, accScaleBinding, filter) {
        var accessor = accScaleBinding.accessor;
        var scale = accScaleBinding.scale;
        if (scale == null) {
            return [];
        }
        var data = dataset.data();
        if (filter != null) {
            data = data.filter(function (d, i) { return filter(d, i, dataset); });
        }
        var appliedAccessor = function (d, i) { return accessor(d, i, dataset); };
        var mappedData = data.map(appliedAccessor);
        return scale.extentOfValues(mappedData);
    };
    /**
     * Override in subclass to add special extents, such as included values
     */
    Plot.prototype._extentsForProperty = function (property) {
        return this._propertyExtents.get(property);
    };
    Plot.prototype._includedValuesForScale = function (scale) {
        var _this = this;
        if (!this._isAnchored) {
            return [];
        }
        var includedValues = [];
        this._attrBindings.each(function (binding, attr) {
            if (binding.scale === scale) {
                var extents = _this._attrExtents.get(attr);
                if (extents != null) {
                    includedValues = includedValues.concat(d3.merge(extents));
                }
            }
        });
        this._propertyBindings.each(function (binding, property) {
            if (binding.scale === scale) {
                var extents = _this._extentsForProperty(property);
                if (extents != null) {
                    includedValues = includedValues.concat(d3.merge(extents));
                }
            }
        });
        return includedValues;
    };
    Plot.prototype.animator = function (animatorKey, animator) {
        if (animator === undefined) {
            return this._animators[animatorKey];
        }
        else {
            this._animators[animatorKey] = animator;
            return this;
        }
    };
    Plot.prototype.renderer = function (renderer) {
        var _this = this;
        if (renderer === undefined) {
            return this._canvas == null ? "svg" : "canvas";
        }
        else {
            if (this._canvas == null && renderer === "canvas") {
                // construct the canvas, remove drawer's renderAreas, set drawer's canvas
                this._canvas = d3.select(document.createElement("canvas")).classed("plot-canvas", true);
                if (this.element() != null) {
                    this._appendCanvasNode();
                }
                this._datasetToDrawer.forEach(function (drawer) {
                    drawer.useCanvas(_this._canvas);
                });
                this.render();
            }
            else if (this._canvas != null && renderer == "svg") {
                this._canvas.remove();
                this._canvas = null;
                this._datasetToDrawer.forEach(function (drawer) {
                    drawer.useSVG(_this._renderArea);
                });
                this.render();
            }
            return this;
        }
    };
    /**
     * Adds a Dataset to the Plot.
     *
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    Plot.prototype.addDataset = function (dataset) {
        this._addDataset(dataset);
        this._onDatasetUpdate();
        return this;
    };
    Plot.prototype._addDataset = function (dataset) {
        this._removeDataset(dataset);
        var drawer = this._createDrawer(dataset);
        this._datasetToDrawer.set(dataset, drawer);
        if (this._isSetup) {
            this._createNodesForDataset(dataset);
        }
        dataset.onUpdate(this._onDatasetUpdateCallback);
        return this;
    };
    /**
     * Removes a Dataset from the Plot.
     *
     * @param {Dataset} dataset
     * @returns {Plot} The calling Plot.
     */
    Plot.prototype.removeDataset = function (dataset) {
        this._removeDataset(dataset);
        this._onDatasetUpdate();
        return this;
    };
    Plot.prototype._removeDataset = function (dataset) {
        if (this.datasets().indexOf(dataset) === -1) {
            return this;
        }
        this._removeDatasetNodes(dataset);
        dataset.offUpdate(this._onDatasetUpdateCallback);
        this._datasetToDrawer.delete(dataset);
        return this;
    };
    Plot.prototype._removeDatasetNodes = function (dataset) {
        var drawer = this._datasetToDrawer.get(dataset);
        drawer.remove();
    };
    Plot.prototype.datasets = function (datasets) {
        var _this = this;
        var currentDatasets = [];
        this._datasetToDrawer.forEach(function (drawer, dataset) { return currentDatasets.push(dataset); });
        if (datasets == null) {
            return currentDatasets;
        }
        currentDatasets.forEach(function (dataset) { return _this._removeDataset(dataset); });
        datasets.forEach(function (dataset) { return _this._addDataset(dataset); });
        this._onDatasetUpdate();
        return this;
    };
    Plot.prototype._generateDrawSteps = function () {
        return [{ attrToProjector: this._generateAttrToProjector(), animator: new Animators.Null() }];
    };
    Plot.prototype._additionalPaint = function (time) {
        // no-op
    };
    /**
     * _buildLightweightPlotEntities constucts {LightweightPlotEntity[]} from
     * all the entities in the plot
     * @param {Dataset[]} [datasets] - datasets comprising this plot
     */
    Plot.prototype._buildLightweightPlotEntities = function (datasets) {
        var _this = this;
        var lightweightPlotEntities = [];
        datasets.forEach(function (dataset, datasetIndex) {
            var drawer = _this._datasetToDrawer.get(dataset);
            var validDatumIndex = 0;
            dataset.data().forEach(function (datum, datumIndex) {
                var position = _this._pixelPoint(datum, datumIndex, dataset);
                if (Utils.Math.isNaN(position.x) || Utils.Math.isNaN(position.y)) {
                    return;
                }
                var plot = _this;
                lightweightPlotEntities.push({
                    datum: datum,
                    get position() {
                        // only calculate position when needing to improve pan zoom performance #3159
                        return plot._pixelPoint.call(plot, datum, datumIndex, dataset);
                    },
                    index: datumIndex,
                    dataset: dataset,
                    datasetIndex: datasetIndex,
                    component: _this,
                    drawer: drawer,
                    validDatumIndex: validDatumIndex,
                });
                validDatumIndex++;
            });
        });
        return lightweightPlotEntities;
    };
    Plot.prototype._getDataToDraw = function () {
        var dataToDraw = new Utils.Map();
        this.datasets().forEach(function (dataset) { return dataToDraw.set(dataset, dataset.data()); });
        return dataToDraw;
    };
    Plot.prototype._paint = function () {
        var _this = this;
        var drawSteps = this._generateDrawSteps();
        var dataToDraw = this._getDataToDraw();
        var drawers = this.datasets().map(function (dataset) { return _this._datasetToDrawer.get(dataset); });
        if (this.renderer() === "canvas") {
            var canvas = this._canvas.node();
            var context_1 = canvas.getContext("2d");
            context_1.clearRect(0, 0, canvas.width, canvas.height);
        }
        this.datasets().forEach(function (ds, i) {
            var appliedDrawSteps = Plot.applyDrawSteps(drawSteps, ds);
            drawers[i].draw(dataToDraw.get(ds), appliedDrawSteps);
        });
        var times = this.datasets().map(function (ds, i) { return Plot.getTotalDrawTime(dataToDraw.get(ds), drawSteps); });
        var maxTime = Utils.Math.max(times, 0);
        this._additionalPaint(maxTime);
    };
    /**
     * Retrieves the drawn visual elements for the specified Datasets as a d3 Selection.
     * Not supported on canvas renderer.
     *
     * @param {Dataset[]} [datasets] The Datasets to retrieve the Selections for.
     *   If not provided, Selections will be retrieved for all Datasets on the Plot.
     * @returns {d3.Selection}
     */
    Plot.prototype.selections = function (datasets) {
        var _this = this;
        if (datasets === void 0) { datasets = this.datasets(); }
        if (this.renderer() === "canvas") {
            return d3.select(null);
        }
        else {
            var selections_1 = [];
            datasets.forEach(function (dataset) {
                var drawer = _this._datasetToDrawer.get(dataset);
                if (drawer == null) {
                    return;
                }
                var visualPrimitives = drawer.getVisualPrimitives();
                selections_1.push.apply(selections_1, visualPrimitives);
            });
            return d3.selectAll(selections_1);
        }
    };
    /**
     * Gets the Entities associated with the specified Datasets.
     *
     * @param {Dataset[]} datasets The Datasets to retrieve the Entities for.
     *   If not provided, returns defaults to all Datasets on the Plot.
     * @return {Plots.PlotEntity[]}
     */
    Plot.prototype.entities = function (datasets) {
        var _this = this;
        return this._getEntityStore(datasets).entities().map(function (entity) { return _this._lightweightPlotEntityToPlotEntity(entity); });
    };
    /**
     * _getEntityStore returns the store of all Entities associated with the specified dataset
     *
     * @param {Dataset[]} [datasets] - The datasets with which to construct the store. If no datasets
     * are specified all datasets will be used.
     */
    Plot.prototype._getEntityStore = function (datasets) {
        if (datasets !== undefined) {
            var entityStore = new Utils.EntityStore();
            entityStore.addAll(this._buildLightweightPlotEntities(datasets));
            return entityStore;
        }
        else if (this._cachedEntityStore === undefined) {
            var entityStore = new Utils.EntityStore();
            entityStore.addAll(this._buildLightweightPlotEntities(this.datasets()), this.bounds());
            this._cachedEntityStore = entityStore;
        }
        return this._cachedEntityStore;
    };
    Plot.prototype._lightweightPlotEntityToPlotEntity = function (entity) {
        var plotEntity = {
            datum: entity.datum,
            position: entity.position,
            dataset: entity.dataset,
            datasetIndex: entity.datasetIndex,
            index: entity.index,
            component: entity.component,
            selection: d3.select(entity.drawer.getVisualPrimitives()[entity.validDatumIndex]),
        };
        return plotEntity;
    };
    /**
     * Gets the PlotEntities at a particular Point.
     *
     * Each plot type determines how to locate entities at or near the query
     * point. For example, line and area charts will return the nearest entity,
     * but bar charts will only return the entities that fully contain the query
     * point.
     *
     * @param {Point} point The point to query.
     * @returns {PlotEntity[]} The PlotEntities at the particular point
     */
    Plot.prototype.entitiesAt = function (point) {
        throw new Error("plots must implement entitiesAt");
    };
    /**
     * Returns the {Plots.PlotEntity} nearest to the query point,
     * or undefined if no {Plots.PlotEntity} can be found.
     *
     * @param {Point} queryPoint
     * @param {bounds} Bounds The bounding box within which to search. By default, bounds is the bounds of
     * the chart, relative to the parent.
     * @returns {Plots.PlotEntity} The nearest PlotEntity, or undefined if no {Plots.PlotEntity} can be found.
     */
    Plot.prototype.entityNearest = function (queryPoint, bounds) {
        if (bounds === void 0) { bounds = this.bounds(); }
        var nearest = this._getEntityStore().entityNearest(queryPoint);
        return nearest === undefined ? undefined : this._lightweightPlotEntityToPlotEntity(nearest);
    };
    Plot.prototype._uninstallScaleForKey = function (scale, key) {
        scale.offUpdate(this._renderCallback);
        scale.offUpdate(this._deferredResetEntityStore);
        scale.removeIncludedValuesProvider(this._includedValuesProvider);
    };
    Plot.prototype._installScaleForKey = function (scale, key) {
        scale.onUpdate(this._renderCallback);
        scale.onUpdate(this._deferredResetEntityStore);
        scale.addIncludedValuesProvider(this._includedValuesProvider);
    };
    Plot.prototype._propertyProjectors = function () {
        return {};
    };
    Plot._scaledAccessor = function (binding) {
        return binding.scale == null ?
            binding.accessor :
            function (d, i, ds) { return binding.scale.scale(binding.accessor(d, i, ds)); };
    };
    Plot.prototype._pixelPoint = function (datum, index, dataset) {
        return { x: 0, y: 0 };
    };
    Plot.prototype._animateOnNextRender = function () {
        return this._animate && this._dataChanged;
    };
    return Plot;
}(component_1.Component));
Plot._ANIMATION_MAX_DURATION = 600;
/**
 * Debounces rendering and entityStore resets
 */
Plot._DEFERRED_RENDERING_DELAY = 200;
exports.Plot = Plot;
