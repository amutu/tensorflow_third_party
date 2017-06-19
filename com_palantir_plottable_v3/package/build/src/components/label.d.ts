import { SpaceRequest } from "../core/interfaces";
import { Component } from "./component";
export declare class Label extends Component {
    private _textContainer;
    private _text;
    private _angle;
    private _measurer;
    private _wrapper;
    private _writer;
    private _padding;
    /**
     * A Label is a Component that displays a single line of text.
     *
     * @constructor
     * @param {string} [displayText=""] The text of the Label.
     * @param {number} [angle=0] The angle of the Label in degrees (-90/0/90). 0 is horizontal.
     */
    constructor(displayText?: string, angle?: number);
    requestedSpace(offeredWidth: number, offeredHeight: number): SpaceRequest;
    protected _setup(): void;
    /**
     * Gets the Label's text.
     */
    text(): string;
    /**
     * Sets the Label's text.
     *
     * @param {string} displayText
     * @returns {Label} The calling Label.
     */
    text(displayText: string): this;
    /**
     * Gets the angle of the Label in degrees.
     */
    angle(): number;
    /**
     * Sets the angle of the Label in degrees.
     *
     * @param {number} angle One of -90/0/90. 0 is horizontal.
     * @returns {Label} The calling Label.
     */
    angle(angle: number): this;
    /**
     * Gets the amount of padding around the Label in pixels.
     */
    padding(): number;
    /**
     * Sets the amount of padding around the Label in pixels.
     *
     * @param {number} padAmount
     * @returns {Label} The calling Label.
     */
    padding(padAmount: number): this;
    fixedWidth(): boolean;
    fixedHeight(): boolean;
    renderImmediately(): this;
    invalidateCache(): void;
}
export declare class TitleLabel extends Label {
    static TITLE_LABEL_CLASS: string;
    /**
     * @constructor
     * @param {string} [text]
     * @param {number} [angle] One of -90/0/90. 0 is horizontal.
     */
    constructor(text?: string, angle?: number);
}
export declare class AxisLabel extends Label {
    static AXIS_LABEL_CLASS: string;
    /**
     * @constructor
     * @param {string} [text]
     * @param {number} [angle] One of -90/0/90. 0 is horizontal.
     */
    constructor(text?: string, angle?: number);
}
