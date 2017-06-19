import { Point } from "../";
import { Component } from "../components/component";
import { SimpleSelection } from "../core/interfaces";
export declare function getTranslator(component: Component): Translator;
export declare class Translator {
    private static SAMPLE_DISTANCE;
    private _measurementElement;
    constructor(measurementElement: SimpleSelection<void>);
    /**
     * Computes the position relative to the component. Converts screen clientX/clientY
     * coordinates to the coordinates relative to the measurementElement, taking into
     * account transform() factors from CSS or SVG up the DOM tree.
     */
    computePosition(clientX: number, clientY: number): Point;
    isInside(component: Component, e: Event): boolean;
}
