import { Dataset } from "../core/dataset";
import { Formatter } from "../core/formatters";
import { AttributeToProjector, Bounds, IAccessor, Point, Range } from "../core/interfaces";
import * as Drawers from "../drawers";
import { ProxyDrawer } from "../drawers/drawer";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";
import * as Plots from "./";
import { IPlotEntity } from "./";
import { XYPlot } from "./xyPlot";
export declare const BarOrientation: {
    vertical: "vertical";
    horizontal: "horizontal";
};
export declare type BarOrientation = keyof typeof BarOrientation;
export declare const LabelsPosition: {
    start: "start";
    end: "end";
    middle: "middle";
    outside: "outside";
};
export declare type LabelsPosition = keyof typeof LabelsPosition;
export declare const BarAlignment: {
    start: "start";
    end: "end";
    middle: "middle";
};
export declare type BarAlignment = keyof typeof BarAlignment;
export declare class Bar<X, Y> extends XYPlot<X, Y> {
    private static _BAR_WIDTH_RATIO;
    private static _SINGLE_BAR_DIMENSION_RATIO;
    private static _BAR_AREA_CLASS;
    private static _BAR_END_KEY;
    protected static _LABEL_AREA_CLASS: string;
    protected static _LABEL_PADDING: number;
    private _baseline;
    private _baselineValue;
    protected _isVertical: boolean;
    private _labelFormatter;
    private _labelsEnabled;
    private _labelsPosition;
    private _hideBarsIfAnyAreTooWide;
    private _labelConfig;
    private _baselineValueProvider;
    private _barAlignment;
    private _fixedWidth;
    private _barPixelWidth;
    private _updateBarPixelWidthCallback;
    /**
     * A Bar Plot draws bars growing out from a baseline to some value
     *
     * @constructor
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
     * Gets the accessor for the bar "end", which is used to compute the width of
     * each bar on the independent axis.
     */
    barEnd(): Plots.ITransformableAccessorScaleBinding<X, number>;
    barEnd(end: number | IAccessor<number> | X | IAccessor<X>): this;
    /**
     * Gets the current bar alignment
     */
    barAlignment(): BarAlignment;
    barAlignment(align: BarAlignment): this;
    /**
     * Gets the orientation of the plot
     *
     * @return "vertical" | "horizontal"
     */
    orientation(): BarOrientation;
    render(): this;
    protected _createDrawer(): ProxyDrawer;
    protected _setup(): void;
    /**
     * Gets the baseline value.
     * The baseline is the line that the bars are drawn from.
     *
     * @returns {X|Y}
     */
    baselineValue(): X | Y;
    /**
     * Sets the baseline value.
     * The baseline is the line that the bars are drawn from.
     *
     * @param {X|Y} value
     * @returns {Bar} The calling Bar Plot.
     */
    baselineValue(value: X | Y): this;
    addDataset(dataset: Dataset): this;
    protected _addDataset(dataset: Dataset): this;
    removeDataset(dataset: Dataset): this;
    protected _removeDataset(dataset: Dataset): this;
    datasets(): Dataset[];
    datasets(datasets: Dataset[]): this;
    /**
     * Get whether bar labels are enabled.
     *
     * @returns {boolean} Whether bars should display labels or not.
     */
    labelsEnabled(): boolean;
    /**
     * Sets whether labels are enabled. If enabled, also sets their position relative to the baseline.
     *
     * @param {boolean} labelsEnabled
     * @param {LabelsPosition} labelsPosition
     * @returns {Bar} The calling Bar Plot.
     */
    labelsEnabled(enabled: boolean): this;
    labelsEnabled(enabled: boolean, labelsPosition: LabelsPosition): this;
    /**
     * Gets the Formatter for the labels.
     */
    labelFormatter(): Formatter;
    /**
     * Sets the Formatter for the labels.
     *
     * @param {Formatter} formatter
     * @returns {Bar} The calling Bar Plot.
     */
    labelFormatter(formatter: Formatter): this;
    protected _createNodesForDataset(dataset: Dataset): ProxyDrawer;
    protected _removeDatasetNodes(dataset: Dataset): void;
    /**
     * Returns the PlotEntity nearest to the query point according to the following algorithm:
     *   - If the query point is inside a bar, returns the PlotEntity for that bar.
     *   - Otherwise, gets the nearest PlotEntity by the primary direction (X for vertical, Y for horizontal),
     *     breaking ties with the secondary direction.
     * Returns undefined if no PlotEntity can be found.
     *
     * @param {Point} queryPoint
     * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
     */
    entityNearest(queryPoint: Point): IPlotEntity;
    protected _entityVisibleOnPlot(entity: Plots.IPlotEntity | Plots.ILightweightPlotEntity, bounds: Bounds): boolean;
    /**
     * Gets the Entities at a particular Point.
     *
     * @param {Point} p
     * @returns {PlotEntity[]}
     */
    entitiesAt(p: Point): IPlotEntity[];
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
    private _entitiesIntersecting(xValOrRange, yValOrRange);
    private _updateValueScale();
    protected _additionalPaint(time: number): void;
    /**
     * Makes sure the extent takes into account the widths of the bars
     */
    protected _extentsForProperty(property: string): any[];
    protected _getAlignedX(x: number, width: number): number;
    protected _drawLabels(): void;
    private _drawLabel(datum, index, dataset, attrToProjector);
    private _getShowLabelOnBar(barCoordinates, barDimensions, measurement);
    private _calculateLabelProperties(barCoordinates, barDimensions, measurement, showLabelOnBar, aboveOrLeftOfBaseline);
    private _createLabelContainer(labelArea, labelContainerOrigin, labelOrigin, measurement, showLabelOnBar, color);
    protected _generateDrawSteps(): Drawers.DrawStep[];
    protected _generateAttrToProjector(): AttributeToProjector;
    protected _updateWidthAccesor(): void;
    /**
     * Computes the barPixelWidth of all the bars in the plot.
     *
     * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
     * If the position scale of the plot is a QuantitativeScale, then the bar width is equal to the smallest distance between
     * two adjacent data points, padded for visualisation.
     */
    protected _getBarPixelWidth(): number;
    private _updateBarPixelWidth();
    entities(datasets?: Dataset[]): IPlotEntity[];
    protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point;
    protected _uninstallScaleForKey(scale: Scale<any, number>, key: string): void;
    protected _getDataToDraw(): Utils.Map<Dataset, any[]>;
}
