import { Bounds, Point } from "../core/interfaces";
/**
 * Checks if x is between a and b.
 *
 * @param {number} x The value to test if in range
 * @param {number} a The beginning of the (inclusive) range
 * @param {number} b The ending of the (inclusive) range
 * @return {boolean} Whether x is in [a, b]
 */
export declare function inRange(x: number, a: number, b: number): boolean;
/**
 * Clamps x to the range [min, max].
 *
 * @param {number} x The value to be clamped.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @return {number} A clamped value in the range [min, max].
 */
export declare function clamp(x: number, min: number, max: number): number;
/**
 * Applies the accessor, if provided, to each element of `array` and returns the maximum value.
 * If no maximum value can be computed, returns defaultValue.
 */
export declare function max<C>(array: C[], defaultValue: C): C;
export declare function max<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
/**
 * Applies the accessor, if provided, to each element of `array` and returns the minimum value.
 * If no minimum value can be computed, returns defaultValue.
 */
export declare function min<C>(array: C[], defaultValue: C): C;
export declare function min<T, C>(array: T[], accessor: (t?: T, i?: number) => C, defaultValue: C): C;
/**
 * Returns true **only** if x is NaN
 */
export declare function isNaN(n: any): boolean;
/**
 * Returns true if the argument is a number, which is not NaN
 * Numbers represented as strings do not pass this function
 */
export declare function isValidNumber(n: any): boolean;
/**
 * Generates an array of consecutive, strictly increasing numbers
 * in the range [start, stop) separeted by step
 */
export declare function range(start: number, stop: number, step?: number): number[];
/**
 * Returns the square of the distance between two points
 *
 * @param {Point} p1
 * @param {Point} p2
 * @return {number} dist(p1, p2)^2
 */
export declare function distanceSquared(p1: Point, p2: Point): number;
export declare function degreesToRadians(degree: number): number;
/**
 * Returns if the point is within the bounds. Points along
 * the bounds are considered "within" as well.
 * @param {Point} p Point in considerations.
 * @param {Bounds} bounds Bounds within which to check for inclusion.
 */
export declare function within(p: Point, bounds: Bounds): boolean;
