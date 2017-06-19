import { Component } from "../components/component";
import { Point } from "../core/interfaces";
import { TransformableScale } from "../scales/scale";
import { Interaction } from "./interaction";
export declare type PanCallback = () => void;
export declare type ZoomCallback = () => void;
/**
 * Performs a zoom transformation of the `value` argument scaled by the
 * `zoom` argument about the point defined by the `center` argument.
 */
export declare function zoomAt(value: number, zoom: number, center: number): number;
export declare class PanZoom extends Interaction {
    /**
     * The number of pixels occupied in a line.
     */
    private static _PIXELS_PER_LINE;
    private _xScales;
    private _yScales;
    private _dragInteraction;
    private _mouseDispatcher;
    private _touchDispatcher;
    private _touchIds;
    private _wheelCallback;
    private _touchStartCallback;
    private _touchMoveCallback;
    private _touchEndCallback;
    private _touchCancelCallback;
    private _minDomainExtents;
    private _maxDomainExtents;
    private _minDomainValues;
    private _maxDomainValues;
    private _panEndCallbacks;
    private _zoomEndCallbacks;
    /**
     * A PanZoom Interaction updates the domains of an x-scale and/or a y-scale
     * in response to the user panning or zooming.
     *
     * @constructor
     * @param {TransformableScale} [xScale] The x-scale to update on panning/zooming.
     * @param {TransformableScale} [yScale] The y-scale to update on panning/zooming.
     */
    constructor(xScale?: TransformableScale<any, number>, yScale?: TransformableScale<any, number>);
    /**
     * Pans the chart by a specified amount
     *
     * @param {Plottable.Point} [translateAmount] The amount by which to translate the x and y scales.
     */
    pan(translateAmount: Point): void;
    /**
     * Zooms the chart by a specified amount around a specific point
     *
     * @param {number} [maginfyAmount] The percentage by which to zoom the x and y scale.
     * A value of 0.9 zooms in by 10%. A value of 1.1 zooms out by 10%. A value of 1 has
     * no effect.
     * @param {Plottable.Point} [centerValue] The center in pixels around which to zoom.
     * By default, `centerValue` is the center of the x and y range of each scale.
     */
    zoom(zoomAmount: number, centerValue?: Point): void;
    protected _anchor(component: Component): void;
    protected _unanchor(): void;
    private _handleTouchStart(ids, idToPoint, e);
    private _handlePinch(ids, idToPoint, e);
    static centerPoint(point1: Point, point2: Point): {
        x: number;
        y: number;
    };
    private static _pointDistance(point1, point2);
    private _handleTouchEnd(ids, idToPoint, e);
    private _handleWheelEvent(p, e);
    /**
     * When scale ranges are reversed (i.e. range[1] < range[0]), we must alter the
     * the calculations we do in screen space to constrain pan and zoom. This method
     * returns `true` if the scale is reversed.
     */
    private _isRangeReversed(scale);
    private _constrainedZoom(scale, zoomAmount, centerPoint);
    private _constrainZoomExtents(scale, zoomAmount);
    private _constrainZoomValues(scale, zoomAmount, centerPoint);
    /**
     * Returns the `center` value to be used with `zoomAt` that will produce the
     * `target` value given the same `value` and `zoom` arguments. Algebra
     * brought to you by Wolfram Alpha.
     */
    private _getZoomCenterForTarget(value, zoom, target);
    private _setupDragInteraction();
    /**
     * Returns a new translation value that respects domain min/max value
     * constraints.
     */
    private _constrainedTranslation(scale, translation);
    private _nonLinearScaleWithExtents(scale);
    /**
     * Gets the x scales for this PanZoom Interaction.
     */
    xScales(): TransformableScale<any, number>[];
    /**
     * Sets the x scales for this PanZoom Interaction.
     *
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    xScales(xScales: TransformableScale<any, number>[]): this;
    /**
     * Gets the y scales for this PanZoom Interaction.
     */
    yScales(): TransformableScale<any, number>[];
    /**
     * Sets the y scales for this PanZoom Interaction.
     *
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    yScales(yScales: TransformableScale<any, number>[]): this;
    /**
     * Adds an x scale to this PanZoom Interaction
     *
     * @param {TransformableScale} An x scale to add
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    addXScale(xScale: TransformableScale<any, number>): this;
    /**
     * Removes an x scale from this PanZoom Interaction
     *
     * @param {TransformableScale} An x scale to remove
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    removeXScale(xScale: TransformableScale<any, number>): this;
    /**
     * Adds a y scale to this PanZoom Interaction
     *
     * @param {TransformableScale} A y scale to add
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    addYScale(yScale: TransformableScale<any, number>): this;
    /**
     * Removes a y scale from this PanZoom Interaction
     *
     * @param {TransformableScale} A y scale to remove
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    removeYScale(yScale: TransformableScale<any, number>): this;
    /**
     * Gets the minimum domain extent for the scale, specifying the minimum
     * allowable amount between the ends of the domain.
     *
     * Note that extents will mainly work on scales that work linearly like
     * Linear Scale and Time Scale
     *
     * @param {TransformableScale} scale The scale to query
     * @returns {number} The minimum numerical domain extent for the scale.
     */
    minDomainExtent(scale: TransformableScale<any, number>): number;
    /**
     * Sets the minimum domain extent for the scale, specifying the minimum
     * allowable amount between the ends of the domain.
     *
     * Note that extents will mainly work on scales that work linearly like
     * Linear Scale and Time Scale
     *
     * @param {TransformableScale} scale The scale to query
     * @param {number} minDomainExtent The minimum numerical domain extent for
     * the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    minDomainExtent(scale: TransformableScale<any, number>, minDomainExtent: number): this;
    /**
     * Gets the maximum domain extent for the scale, specifying the maximum
     * allowable amount between the ends of the domain.
     *
     * Note that extents will mainly work on scales that work linearly like
     * Linear Scale and Time Scale
     *
     * @param {TransformableScale} scale The scale to query
     * @returns {number} The maximum numerical domain extent for the scale.
     */
    maxDomainExtent(scale: TransformableScale<any, number>): number;
    /**
     * Sets the maximum domain extent for the scale, specifying the maximum
     * allowable amount between the ends of the domain.
     *
     * For example, if the scale's transformation domain is `[500, 600]` and the
     * `maxDomainExtent` is set to `50`, then the user will only be able to zoom
     * out to see an interval like `[500, 550]` or `[520, 570]`.
     *
     * Note that extents will mainly work on scales that work linearly like
     * Linear Scale and Time Scale
     *
     * @param {TransformableScale} scale The scale to query
     * @param {number} minDomainExtent The maximum numerical domain extent for
     * the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    maxDomainExtent(scale: TransformableScale<any, number>, maxDomainExtent: number): this;
    /**
     * Gets the minimum domain value for the scale, constraining the pan/zoom
     * interaction to a minimum value in the domain.
     *
     * Note that this differs from minDomainExtent/maxDomainExtent, in that
     * those methods provide constraints such as showing at least 2 but no more
     * than 5 values at a time.
     *
     * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
     * the user cannot pan/zoom.
     *
     * @param {TransformableScale} scale The scale to query
     * @returns {number} The minimum domain value for the scale.
     */
    minDomainValue(scale: TransformableScale<any, number>): number;
    /**
     * Sets the minimum domain value for the scale, constraining the pan/zoom
     * interaction to a minimum value in the domain.
     *
     * Note that this differs from minDomainExtent/maxDomainExtent, in that
     * those methods provide constraints such as showing at least 2 but no more
     * than 5 values at a time.
     *
     * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
     * the user cannot pan/zoom.
     *
     * @param {TransformableScale} scale The scale to query
     * @param {number} minDomainExtent The minimum domain value for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    minDomainValue(scale: TransformableScale<any, number>, minDomainValue: number): this;
    /**
     * Gets the maximum domain value for the scale, constraining the pan/zoom
     * interaction to a maximum value in the domain.
     *
     * Note that this differs from minDomainExtent/maxDomainExtent, in that
     * those methods provide constraints such as showing at least 2 but no more
     * than 5 values at a time.
     *
     * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
     * the user cannot pan/zoom.
     *
     * @param {TransformableScale} scale The scale to query
     * @returns {number} The maximum domain value for the scale.
     */
    maxDomainValue(scale: TransformableScale<any, number>): number;
    /**
     * Sets the maximum domain value for the scale, constraining the pan/zoom
     * interaction to a maximum value in the domain.
     *
     * Note that this differs from minDomainExtent/maxDomainExtent, in that
     * those methods provide constraints such as showing at least 2 but no more
     * than 5 values at a time.
     *
     * By contrast, minDomainValue/maxDomainValue set a boundary beyond which
     * the user cannot pan/zoom.
     *
     * @param {TransformableScale} scale The scale to query
     * @param {number} maxDomainExtent The maximum domain value for the scale.
     * @returns {Interactions.PanZoom} The calling PanZoom Interaction.
     */
    maxDomainValue(scale: TransformableScale<any, number>, maxDomainValue: number): this;
    /**
     * Uses the current domain of the scale to apply a minimum and maximum
     * domain value for that scale.
     *
     * This constrains the pan/zoom interaction to show no more than the domain
     * of the scale.
     */
    setMinMaxDomainValuesTo(scale: TransformableScale<any, number>): this;
    /**
     * Adds a callback to be called when panning ends.
     *
     * @param {PanCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    onPanEnd(callback: PanCallback): this;
    /**
     * Removes a callback that would be called when panning ends.
     *
     * @param {PanCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    offPanEnd(callback: PanCallback): this;
    /**
     * Adds a callback to be called when zooming ends.
     *
     * @param {ZoomCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    onZoomEnd(callback: ZoomCallback): this;
    /**
     * Removes a callback that would be called when zooming ends.
     *
     * @param {ZoomCallback} callback
     * @returns {this} The calling PanZoom Interaction.
     */
    offZoomEnd(callback: ZoomCallback): this;
}
