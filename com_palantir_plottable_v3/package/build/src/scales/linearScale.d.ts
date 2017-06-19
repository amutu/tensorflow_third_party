import { QuantitativeScale } from "./quantitativeScale";
export declare class Linear extends QuantitativeScale<number> {
    private _d3Scale;
    /**
     * @constructor
     */
    constructor();
    protected _defaultExtent(): number[];
    protected _expandSingleValueDomain(singleValueDomain: number[]): number[];
    scale(value: number): number;
    scaleTransformation(value: number): number;
    invertedTransformation(value: number): number;
    getTransformationDomain(): [number, number];
    protected _getDomain(): number[];
    protected _backingScaleDomain(): number[];
    protected _backingScaleDomain(values: number[]): this;
    protected _getRange(): number[];
    protected _setRange(values: number[]): void;
    invert(value: number): number;
    defaultTicks(): number[];
    protected _niceDomain(domain: number[], count?: number): number[];
}
