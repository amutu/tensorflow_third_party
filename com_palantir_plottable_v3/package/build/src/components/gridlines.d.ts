/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
import { Point } from "../core/interfaces";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { Component } from "./component";
export declare class Gridlines extends Component {
    private _xScale;
    private _yScale;
    private _xLinesContainer;
    private _yLinesContainer;
    private _renderCallback;
    /**
     * @constructor
     * @param {QuantitativeScale} xScale The scale to base the x gridlines on. Pass null if no gridlines are desired.
     * @param {QuantitativeScale} yScale The scale to base the y gridlines on. Pass null if no gridlines are desired.
     */
    constructor(xScale: QuantitativeScale<any>, yScale: QuantitativeScale<any>);
    destroy(): this;
    protected _setup(): void;
    renderImmediately(): this;
    computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
    private _redrawXLines();
    private _redrawYLines();
}
