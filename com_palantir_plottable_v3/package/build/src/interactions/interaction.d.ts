/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */
import { Component } from "../components/component";
import { Point } from "../core/interfaces";
export declare class Interaction {
    protected _componentAttachedTo: Component;
    private _anchorCallback;
    private _isAnchored;
    private _enabled;
    protected _anchor(component: Component): void;
    protected _unanchor(): void;
    /**
     * Attaches this Interaction to a Component.
     * If the Interaction was already attached to a Component, it first detaches itself from the old Component.
     *
     * @param {Component} component
     * @returns {Interaction} The calling Interaction.
     */
    attachTo(component: Component): this;
    private _connect();
    /**
     * Detaches this Interaction from the Component.
     * This Interaction can be reused.
     *
     * @param {Component} component
     * @returns {Interaction} The calling Interaction.
     */
    detachFrom(component: Component): this;
    private _disconnect();
    /**
     * Gets whether this Interaction is enabled.
     */
    enabled(): boolean;
    /**
     * Enables or disables this Interaction.
     *
     * @param {boolean} enabled Whether the Interaction should be enabled.
     * @return {Interaction} The calling Interaction.
     */
    enabled(enabled: boolean): this;
    /**
     * Translates an <svg>-coordinate-space point to Component-space coordinates.
     *
     * @param {Point} p A Point in <svg>-space coordinates.
     * @return {Point} The same location in Component-space coordinates.
     */
    protected _translateToComponentSpace(p: Point): Point;
    /**
     * Checks whether a Component-coordinate-space Point is inside the Component.
     *
     * @param {Point} p A Point in Compoennt-space coordinates.
     * @return {boolean} Whether or not the point is inside the Component.
     */
    protected _isInsideComponent(p: Point): boolean;
}
