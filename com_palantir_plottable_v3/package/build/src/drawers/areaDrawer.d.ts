/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
import { SimpleSelection } from "../core/interfaces";
import { SVGDrawer } from "./svgDrawer";
export declare class AreaSVGDrawer extends SVGDrawer {
    constructor();
    protected _applyDefaultAttributes(selection: SimpleSelection<any>): void;
    getVisualPrimitiveAtIndex(index: number): Element;
}
