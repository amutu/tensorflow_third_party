import { AttributeToAppliedProjector } from "../core/interfaces";
import { IDrawer } from "./drawer";
import { AppliedDrawStep } from "./drawStep";
export declare type CanvasDrawStep = (context: CanvasRenderingContext2D, data: any[], attrToAppliedProjector: AttributeToAppliedProjector) => void;
/**
 * A CanvasDrawer draws data onto a supplied Canvas Context.
 *
 * This class is immutable (but has internal state) and shouldn't be extended.
 */
export declare class CanvasDrawer implements IDrawer {
    private _context;
    private _drawStep;
    /**
     * @param _context The context for a canvas that this drawer will draw to.
     * @param _drawStep The draw step logic that actually draws.
     */
    constructor(_context: CanvasRenderingContext2D, _drawStep: CanvasDrawStep);
    getDrawStep(): CanvasDrawStep;
    draw(data: any[], appliedDrawSteps: AppliedDrawStep[]): void;
    getVisualPrimitives(): Element[];
    getVisualPrimitiveAtIndex(index: number): Element;
    remove(): void;
}
export declare const ContextStyleAttrs: {
    strokeWidth: string;
    stroke: string;
    opacity: string;
    fill: string;
};
export declare function resolveAttributesSubsetWithStyles(projector: AttributeToAppliedProjector, extraKeys: string[], datum: any, index: number): {
    [key: string]: any;
};
export declare function styleContext(context: CanvasRenderingContext2D, attrs: {
    [key: string]: any;
}): void;
