import { CanvasDrawStep } from "./canvasDrawer";
import { SVGDrawer } from "./svgDrawer";
export declare class RectangleSVGDrawer extends SVGDrawer {
    private _rootClassName;
    constructor(_rootClassName?: string);
}
export declare const RectangleCanvasDrawStep: CanvasDrawStep;
