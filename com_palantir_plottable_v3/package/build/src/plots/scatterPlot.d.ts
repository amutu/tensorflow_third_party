/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
import { Dataset } from "../core/dataset";
import { AttributeToProjector, Bounds, IAccessor, Point, Range } from "../core/interfaces";
import { SymbolFactory } from "../core/symbolFactories";
import { ProxyDrawer } from "../drawers/drawer";
import { Scale } from "../scales/scale";
import * as Drawers from "../drawers";
import { IAccessorScaleBinding, ILightweightPlotEntity, IPlotEntity, ITransformableAccessorScaleBinding } from "./";
import { XYPlot } from "./xyPlot";
export interface ILightweightScatterPlotEntity extends ILightweightPlotEntity {
    diameter: number;
}
export declare class Scatter<X, Y> extends XYPlot<X, Y> {
    private static _SIZE_KEY;
    private static _SYMBOL_KEY;
    /**
     * A Scatter Plot draws a symbol at each data point.
     *
     * @constructor
     */
    constructor();
    protected _buildLightweightPlotEntities(datasets: Dataset[]): ILightweightScatterPlotEntity[];
    protected _createDrawer(dataset: Dataset): ProxyDrawer;
    /**
     * Gets the AccessorScaleBinding for the size property of the plot.
     * The size property corresponds to the area of the symbol.
     */
    size<S>(): ITransformableAccessorScaleBinding<S, number>;
    /**
     * Sets the size property to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} size
     * @returns {Plots.Scatter} The calling Scatter Plot.
     */
    size(size: number | IAccessor<number>): this;
    /**
     * Sets the size property to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {S|Accessor<S>} sectorValue
     * @param {Scale<S, number>} scale
     * @returns {Plots.Scatter} The calling Scatter Plot.
     */
    size<S>(size: S | IAccessor<S>, scale: Scale<S, number>): this;
    /**
     * Gets the AccessorScaleBinding for the symbol property of the plot.
     * The symbol property corresponds to how the symbol will be drawn.
     */
    symbol(): IAccessorScaleBinding<any, any>;
    /**
     * Sets the symbol property to an Accessor<SymbolFactory>.
     *
     * @param {Accessor<SymbolFactory>} symbol
     * @returns {Plots.Scatter} The calling Scatter Plot.
     */
    symbol(symbol: IAccessor<SymbolFactory>): this;
    protected _generateDrawSteps(): Drawers.DrawStep[];
    protected _propertyProjectors(): AttributeToProjector;
    protected _constructSymbolGenerator(): (datum: any, index: number, dataset: Dataset) => any;
    protected _entityVisibleOnPlot(entity: ILightweightScatterPlotEntity, bounds: Bounds): boolean;
    /**
     * Gets the Entities that intersect the Bounds.
     *
     * @param {Bounds} bounds
     * @returns {PlotEntity[]}
     */
    entitiesIn(bounds: Bounds): IPlotEntity[];
    /**
     * Gets the Entities that intersect the area defined by the ranges.
     *
     * @param {Range} xRange
     * @param {Range} yRange
     * @returns {PlotEntity[]}
     */
    entitiesIn(xRange: Range, yRange: Range): IPlotEntity[];
    /**
     * Gets the Entities at a particular Point.
     *
     * @param {Point} p
     * @returns {PlotEntity[]}
     */
    entitiesAt(p: Point): IPlotEntity[];
}
