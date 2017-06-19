import { Dataset } from "../core/dataset";
import { IAccessor } from "../core/interfaces";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";
import * as Plots from "./";
import { Bar, BarOrientation } from "./barPlot";
export declare class StackedBar<X, Y> extends Bar<X, Y> {
    protected static _STACKED_BAR_LABEL_PADDING: number;
    private _labelArea;
    private _measurer;
    private _writer;
    private _stackingOrder;
    private _stackingResult;
    private _stackedExtent;
    /**
     * A StackedBar Plot stacks bars across Datasets based on the primary value of the bars.
     *   On a vertical StackedBar Plot, the bars with the same X value are stacked.
     *   On a horizontal StackedBar Plot, the bars with the same Y value are stacked.
     *
     * @constructor
     * @param {Scale} xScale
     * @param {Scale} yScale
     * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
     */
    constructor(orientation?: BarOrientation);
    x(): Plots.ITransformableAccessorScaleBinding<X, number>;
    x(x: number | IAccessor<number>): this;
    x(x: X | IAccessor<X>, xScale: Scale<X, number>): this;
    y(): Plots.ITransformableAccessorScaleBinding<Y, number>;
    y(y: number | IAccessor<number>): this;
    y(y: Y | IAccessor<Y>, yScale: Scale<Y, number>): this;
    /**
     * Gets the stacking order of the plot.
     */
    stackingOrder(): Utils.Stacking.IStackingOrder;
    /**
     * Sets the stacking order of the plot.
     *
     * By default, stacked plots are "bottomup", meaning for positive data, the
     * first series will be placed at the bottom of the scale and subsequent
     * data series will by stacked on top. This can be reveresed by setting
     * stacking order to "topdown".
     *
     * @returns {Plots.StackedArea} This plot
     */
    stackingOrder(stackingOrder: Utils.Stacking.IStackingOrder): this;
    protected _setup(): void;
    protected _drawLabels(): void;
    protected _generateAttrToProjector(): {
        [attr: string]: (datum: any, index: number, dataset: Dataset) => any;
    };
    protected _onDatasetUpdate(): this;
    protected _updateExtentsForProperty(property: string): void;
    protected _extentsForProperty(attr: string): any[];
    private _updateStackExtentsAndOffsets();
    invalidateCache(): void;
}
