import { Formatter } from "../core/formatters";
import * as Scales from "../scales";
import { Axis } from "./axis";
export declare const TimeInterval: {
    second: "second";
    minute: "minute";
    hour: "hour";
    day: "day";
    week: "week";
    month: "month";
    year: "year";
};
export declare type TimeInterval = keyof typeof TimeInterval;
/**
 * Defines a configuration for a Time Axis tier.
 * For details on how ticks are generated see: https://github.com/mbostock/d3/wiki/Time-Scales#ticks
 * interval - A time unit associated with this configuration (seconds, minutes, hours, etc).
 * step - number of intervals between each tick.
 * formatter - formatter used to format tick labels.
 */
export declare type TimeAxisTierConfiguration = {
    interval: string;
    step: number;
    formatter: Formatter;
};
/**
 * An array of linked TimeAxisTierConfigurations.
 * Each configuration will be shown on a different tier.
 * Currently, up to two tiers are supported.
 */
export declare type TimeAxisConfiguration = TimeAxisTierConfiguration[];
/**
 * Possible orientations for a Time Axis.
 */
export declare const TimeAxisOrientation: {
    top: "top";
    bottom: "bottom";
};
export declare type TimeAxisOrientation = keyof typeof TimeAxisOrientation;
export declare const TierLabelPosition: {
    center: "center";
    between: "between";
};
export declare type TierLabelPosition = keyof typeof TierLabelPosition;
export declare class Time extends Axis<Date> {
    /**
     * The CSS class applied to each Time Axis tier
     */
    static TIME_AXIS_TIER_CLASS: string;
    private static _SORTED_TIME_INTERVAL_INDEX;
    private static _DEFAULT_TIME_AXIS_CONFIGURATIONS;
    private _tierLabelContainers;
    private _tierMarkContainers;
    private _tierBaselines;
    private _tierHeights;
    private _possibleTimeAxisConfigurations;
    private _numTiers;
    private _measurer;
    private _maxTimeIntervalPrecision;
    private _mostPreciseConfigIndex;
    private _tierLabelPositions;
    private static _LONG_DATE;
    /**
     * Constructs a Time Axis.
     *
     * A Time Axis is a visual representation of a Time Scale.
     *
     * @constructor
     * @param {Scales.Time} scale
     * @param {AxisOrientation} orientation Orientation of this Time Axis. Time Axes can only have "top" or "bottom"
     * orientations.
     */
    constructor(scale: Scales.Time, orientation: TimeAxisOrientation);
    /**
     * Gets the label positions for each tier.
     */
    tierLabelPositions(): TierLabelPosition[];
    /**
     * Sets the label positions for each tier.
     *
     * @param {string[]} newPositions The positions for each tier. "between" and "center" are the only supported values.
     * @returns {Axes.Time} The calling Time Axis.
     */
    tierLabelPositions(newPositions: TierLabelPosition[]): this;
    /**
     * Gets the maximum TimeInterval precision
     */
    maxTimeIntervalPrecision(): TimeInterval;
    /**
     * Sets the maximum TimeInterval precision. This limits the display to not
     * show time intervals above this precision. For example, if this is set to
     * `TimeInterval.day` or `"day"` then no hours or minute ticks will be
     * displayed in the axis.
     *
     * @param {TimeInterval} newPrecision The new maximum precision.
     * @returns {Axes.Time} The calling Time Axis.
     */
    maxTimeIntervalPrecision(newPrecision: TimeInterval): this;
    /**
     * Returns the current `TimeAxisConfiguration` used to render the axes.
     *
     * Note that this is only valid after the axis had been rendered and the
     * most precise valid configuration is determined from the available space
     * and maximum precision constraints.
     *
     * @returns {TimeAxisConfiguration} The currently used `TimeAxisConfiguration` or `undefined`.
     */
    currentAxisConfiguration(): TimeAxisConfiguration;
    /**
     * Gets the possible TimeAxisConfigurations.
     */
    axisConfigurations(): TimeAxisConfiguration[];
    /**
     * Sets the possible TimeAxisConfigurations.
     * The Time Axis will choose the most precise configuration that will display in the available space.
     *
     * @param {TimeAxisConfiguration[]} configurations
     * @returns {Axes.Time} The calling Time Axis.
     */
    axisConfigurations(configurations: TimeAxisConfiguration[]): this;
    /**
     * Gets the index of the most precise TimeAxisConfiguration that will fit in the current width.
     */
    private _getMostPreciseConfigurationIndex();
    orientation(): TimeAxisOrientation;
    orientation(orientation: TimeAxisOrientation): this;
    protected _computeHeight(): number;
    private _getIntervalLength(config);
    private _maxWidthForInterval(config);
    /**
     * Check if tier configuration fits in the current width and satisfied the
     * max TimeInterval precision limit.
     */
    private _checkTimeAxisTierConfiguration(config);
    protected _sizeFromOffer(availableWidth: number, availableHeight: number): {
        width: number;
        height: number;
    };
    protected _setup(): void;
    private _setupDomElements();
    private _getTickIntervalValues(config);
    protected _getTickValues(): any[];
    private _cleanTiers();
    private _getTickValuesForConfiguration(config);
    private _renderTierLabels(container, config, index);
    private _renderTickMarks(tickValues, index);
    private _renderLabellessTickMarks(tickValues);
    private _generateLabellessTicks();
    renderImmediately(): this;
    private _hideOverflowingTiers();
    private _hideOverlappingAndCutOffLabels(index);
    invalidateCache(): void;
}
