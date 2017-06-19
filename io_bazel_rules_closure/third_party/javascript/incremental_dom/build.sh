#!/bin/bash
#
# Copyright 2016 The Closure Rules Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Upstream Incremental DOM is written using ES6 modules. A gulp file is also
# included which uses Rollup to generate a goog.module() style closure-library
# compatible file:
#
#   https://github.com/google/incremental-dom/blob/master/gulpfile.js
#
# To avoid the runtime dependencies on gulp/node/rollup/etc this script
# converts upstream Incremental DOM ES6 sources into a goog.module() version.
# Therefore, the upstream gulpfile.js need not be used. This script must be
# kept up to date with the "js-closure" target when updating incremental_dom.

set -e
set -u

tar xfz $1 --strip 1;

echo "goog.module('incrementaldom');" > $2;
echo "Object.defineProperty(exports, '__esModule', { value: true });" >> $2;

cat src/util.js \
    src/node_data.js \
    src/nodes.js \
    src/notifications.js \
    src/context.js \
    src/assertions.js \
    src/dom_util.js \
    src/core.js \
    src/symbols.js \
    src/attributes.js \
    src/virtual_elements.js | \
    tr '\n' '\r' | \
    sed 's/export [^;]*;//g' | \
    sed 's/import [^;]*;//g' | \
    sed "s/process.env.NODE_ENV !== 'production'/goog.DEBUG/g" | \
    sed 's/const elementOpen /const coreElementOpen /' | \
    sed 's/const elementClose /const coreElementClose /' | \
    sed 's/const text /const coreText /' | \
    tr '\r' '\n' >> $2;

# TODO(jart): https://github.com/google/closure-compiler/issues/2299
cat >>$2 <<'EOF'

/**
 * Patches the document starting at node with the provided function. This
 * function may be called during an existing patch operation.
 * @param {!Element|!DocumentFragment} node The Element or Document
 *     to patch.
 * @param {!function(T)} fn A function containing elementOpen/elementClose/etc.
 *     calls that describe the DOM.
 * @param {T=} data An argument passed to fn to represent DOM state.
 * @return {!Node} The patched node.
 * @template T
 */
const patchInnerDelegate = function(node, fn, data) {
  return patchInner(node, fn, data);
};

exports.patch = patchInnerDelegate;
EOF

cat index.js | \
    sed 's/export { \([^ ]*\) } from [^;]*;/  \1/' | \
    grep "^  " | \
    sed 's/,$//' | \
    sed 's/^  \([^ ]*\) as \([^ ]*\)$//' | \
    sed 's/^  \([^ ]*\)$/exports\.\1 = \1;/' >> $2;
