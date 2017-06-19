/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
var d3 = require("d3");
var mathUtils_1 = require("./mathUtils");
/**
 * Implementation of {IEntityStore} that uses an array for easy iteration as
 * well as a quad tree for fast nearest-point queries.
 *
 * Note that if the position of your entities changes, you MUST rebuild the
 * entity store for the `entityNearest` method to work since the quadtree does
 * not know that its nodes have moved.
 */
var EntityStore = (function () {
    function EntityStore() {
        this._entities = [];
        this._tree = d3.quadtree()
            .x(function (d) { return Math.floor(d.position.x); })
            .y(function (d) { return Math.floor(d.position.y); });
    }
    EntityStore.prototype.addAll = function (entities, bounds) {
        (_a = this._entities).push.apply(_a, entities);
        // filter out of bounds entities if bounds is defined
        if (bounds !== undefined) {
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (mathUtils_1.within(entity.position, bounds)) {
                    this._tree.add(entity);
                }
            }
        }
        else {
            this._tree.addAll(entities);
        }
        var _a;
    };
    EntityStore.prototype.entityNearest = function (queryPoint) {
        return this._tree.find(queryPoint.x, queryPoint.y);
    };
    EntityStore.prototype.entities = function () {
        return this._entities;
    };
    return EntityStore;
}());
exports.EntityStore = EntityStore;
