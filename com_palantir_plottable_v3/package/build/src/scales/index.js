/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var TickGenerators = require("./tickGenerators");
exports.TickGenerators = TickGenerators;
__export(require("./categoryScale"));
__export(require("./colorScale"));
__export(require("./interpolatedColorScale"));
__export(require("./linearScale"));
__export(require("./modifiedLogScale"));
__export(require("./timeScale"));
// ---------------------------------------------------------
var categoryScale_1 = require("./categoryScale");
var quantitativeScale_1 = require("./quantitativeScale");
/**
 * Type guarded function to check if the scale implements the
 * `TransformableScale` interface. Unfortunately, there is no way to do
 * runtime interface typechecking, so we have to explicitly list all classes
 * that implement the interface.
 */
function isTransformable(scale) {
    return (scale instanceof quantitativeScale_1.QuantitativeScale ||
        scale instanceof categoryScale_1.Category);
}
exports.isTransformable = isTransformable;
