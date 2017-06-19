/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
"use strict";
function makeEnum(values) {
    return values.reduce(function (obj, v) {
        obj[v] = v;
        return obj;
    }, {});
}
exports.makeEnum = makeEnum;
