/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
var d3 = require("d3");
var Utils = require("./");
var makeEnum_1 = require("./makeEnum");
/**
 * Option type for stacking direction. By default, stacked bar and area charts
 * put the first data series at the bottom of the axis ("bottomup"), but this
 * can be reversed with the "topdown" option, which produces a stacking order
 * that matches the order of series in the legend.
 */
exports.IStackingOrder = makeEnum_1.makeEnum(["topdown", "bottomup"]);
var nativeMath = window.Math;
/**
 * Computes the StackingResult (value and offset) for each data point in each Dataset.
 *
 * @param {Dataset[]} datasets The Datasets to be stacked on top of each other in the order of stacking
 * @param {Accessor<any>} keyAccessor Accessor for the key of the data
 * @param {Accessor<number>} valueAccessor Accessor for the value of the data
 * @param {IStackingOrder} stackingOrder The order of stacking (default "bottomup")
 * @return {StackingResult} value and offset for each datapoint in each Dataset
 */
function stack(datasets, keyAccessor, valueAccessor, stackingOrder) {
    if (stackingOrder === void 0) { stackingOrder = "bottomup"; }
    var positiveOffsets = d3.map();
    var negativeOffsets = d3.map();
    var datasetToKeyToStackedDatum = new Utils.Map();
    if (stackingOrder === "topdown") {
        datasets = datasets.slice();
        datasets.reverse();
    }
    datasets.forEach(function (dataset) {
        var keyToStackedDatum = new Utils.Map();
        dataset.data().forEach(function (datum, index) {
            var key = normalizeKey(keyAccessor(datum, index, dataset));
            var value = +valueAccessor(datum, index, dataset);
            var offset;
            var offsetMap = (value >= 0) ? positiveOffsets : negativeOffsets;
            if (offsetMap.has(key)) {
                offset = offsetMap.get(key);
                offsetMap.set(key, offset + value);
            }
            else {
                offset = 0;
                offsetMap.set(key, value);
            }
            keyToStackedDatum.set(key, {
                offset: offset,
                value: value,
                axisValue: keyAccessor(datum, index, dataset),
            });
        });
        datasetToKeyToStackedDatum.set(dataset, keyToStackedDatum);
    });
    return datasetToKeyToStackedDatum;
}
exports.stack = stack;
/**
 * Computes the maximum and minimum extents of each stack individually.
 *
 * @param {GenericStackingResult} stackingResult The value and offset information for each datapoint in each dataset
 * @return { { maximumExtents: Utils.Map<D, number>, minimumExtents: Utils.Map<D, number> } } The maximum and minimum extents
 * of each individual stack.
 */
function stackedExtents(stackingResult) {
    var maximumExtents = new Utils.Map();
    var minimumExtents = new Utils.Map();
    stackingResult.forEach(function (stack) {
        stack.forEach(function (datum, key) {
            // correctly handle negative bar stacks
            var maximalValue = Utils.Math.max([datum.offset + datum.value, datum.offset], datum.offset);
            var minimalValue = Utils.Math.min([datum.offset + datum.value, datum.offset], datum.offset);
            if (!maximumExtents.has(key)) {
                maximumExtents.set(key, { extent: maximalValue, axisValue: datum.axisValue });
            }
            else if (maximumExtents.get(key).extent < maximalValue) {
                maximumExtents.set(key, { extent: maximalValue, axisValue: datum.axisValue });
            }
            if (!minimumExtents.has(key)) {
                minimumExtents.set(key, { extent: minimalValue, axisValue: datum.axisValue });
            }
            else if (minimumExtents.get(key).extent > (minimalValue)) {
                minimumExtents.set(key, { extent: minimalValue, axisValue: datum.axisValue });
            }
        });
    });
    return { maximumExtents: maximumExtents, minimumExtents: minimumExtents };
}
exports.stackedExtents = stackedExtents;
/**
 * Computes the total extent over all data points in all Datasets, taking stacking into consideration.
 *
 * @param {StackingResult} stackingResult The value and offset information for each datapoint in each dataset
 * @param {Accessor<any>} keyAccessor Accessor for the key of the data existent in the stackingResult
 * @param {Accessor<boolean>} filter A filter for data to be considered when computing the total extent
 * @return {[number, number]} The total extent
 */
function stackedExtent(stackingResult, keyAccessor, filter) {
    var extents = [];
    stackingResult.forEach(function (stackedDatumMap, dataset) {
        dataset.data().forEach(function (datum, index) {
            if (filter != null && !filter(datum, index, dataset)) {
                return;
            }
            var stackedDatum = stackedDatumMap.get(normalizeKey(keyAccessor(datum, index, dataset)));
            extents.push(stackedDatum.value + stackedDatum.offset);
        });
    });
    var maxStackExtent = Utils.Math.max(extents, 0);
    var minStackExtent = Utils.Math.min(extents, 0);
    return [nativeMath.min(minStackExtent, 0), nativeMath.max(0, maxStackExtent)];
}
exports.stackedExtent = stackedExtent;
/**
 * Normalizes a key used for stacking
 *
 * @param {any} key The key to be normalized
 * @return {string} The stringified key
 */
function normalizeKey(key) {
    return String(key);
}
exports.normalizeKey = normalizeKey;
