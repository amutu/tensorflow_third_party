import { Point, SpaceRequest } from "../core/interfaces";
import * as Scales from "../scales";
import { Axis, AxisOrientation } from "./axis";
export interface IDownsampleInfo {
    domain: string[];
    stepWidth: number;
}
export declare class Category extends Axis<string> {
    /**
     * How many pixels to give labels at minimum before downsampling takes effect.
     */
    private static _MINIMUM_WIDTH_PER_LABEL_PX;
    /**
     * The rotation angle of tick label text. Only 0, 90, -90 are supported
     */
    private _tickLabelAngle;
    /**
     * The shear angle of the tick label text. Only values -80 <= x <= 80 are supported
     */
    private _tickLabelShearAngle;
    /**
     * Maximum allowable px width of tick labels.
     */
    private _tickLabelMaxWidth;
    /**
     * Maximum allowable number of wrapped lines for tick labels.
     */
    private _tickLabelMaxLines;
    private _measurer;
    private _typesetterContext;
    /**
     * A Wrapper configured according to the other properties on this axis.
     * @returns {Typesetter.Wrapper}
     */
    private readonly _wrapper;
    /**
     * A Writer attached to this measurer and wrapper.
     * @returns {Typesetter.Writer}
     */
    private readonly _writer;
    /**
     * Constructs a Category Axis.
     *
     * A Category Axis is a visual representation of a Category Scale.
     *
     * @constructor
     * @param {Scales.Category} scale
     * @param {AxisOrientation} [orientation="bottom"] Orientation of this Category Axis.
     */
    constructor(scale: Scales.Category, orientation?: AxisOrientation);
    protected _setup(): void;
    protected _rescale(): this;
    /**
     * Compute space requirements for this Category Axis. Category Axes have two primary space requirements:
     *
     * 1) width/height needed by the tick lines (including annotations, padding, and margins).
     * 2) width/height needed by the tick text.
     *
     * We requested space is the sum of the lines and text.
     * @param offeredWidth
     * @param offeredHeight
     * @returns {any}
     */
    requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
    protected _coreSize(): number;
    protected _getTickValues(): string[];
    protected _sizeFromOffer(availableWidth: number, availableHeight: number): any;
    /**
     * Take the scale and drop ticks at regular intervals such that the resultant ticks are all a reasonable minimum
     * distance apart. Return the resultant ticks to render, as well as the new stepWidth between them.
     *
     * @param {Scales.Category} scale - The scale being downsampled. Defaults to this Axis' scale.
     * @return {DownsampleInfo} an object holding the resultant domain and new stepWidth.
     */
    getDownsampleInfo(scale?: Scales.Category, domain?: string[]): IDownsampleInfo;
    /**
     * Gets the tick label angle in degrees.
     */
    tickLabelAngle(): number;
    /**
     * Sets the tick label angle in degrees.
     * Right now only -90/0/90 are supported. 0 is horizontal.
     *
     * @param {number} angle
     * @returns {Category} The calling Category Axis.
     */
    tickLabelAngle(angle: number): this;
    /**
     * Gets the tick label shear angle in degrees.
     */
    tickLabelShearAngle(): number;
    /**
     * Sets the tick label shear angle in degrees.
     * Only angles between -80 and 80 are supported.
     *
     * @param {number} angle
     * @returns {Category} The calling Category Axis.
     */
    tickLabelShearAngle(angle: number): this;
    tickLabelMaxWidth(): number;
    tickLabelMaxWidth(maxWidth: number): this;
    tickLabelMaxLines(): number;
    tickLabelMaxLines(maxLines: number): this;
    /**
     * Return the space required by the ticks, padding included.
     * @returns {number}
     */
    private _tickSpaceRequired();
    /**
     * Write ticks to the DOM.
     * @param {Plottable.Scales.Category} scale The scale this axis is representing.
     * @param {d3.Selection} ticks The tick elements to write.
     */
    private _drawTicks(stepWidth, ticks);
    /**
     * Measures the size of the tick labels without making any (permanent) DOM changes.
     *
     * @param {number} axisWidth Width available for this axis.
     * @param {number} axisHeight Height available for this axis.
     * @param {Plottable.Scales.Category} scale The scale this axis is representing.
     * @param {string[]} ticks The strings that will be printed on the ticks.
     */
    private _measureTickLabels(axisWidth, axisHeight);
    renderImmediately(): this;
    computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number): this;
    invalidateCache(): void;
}
