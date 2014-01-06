// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************

module AssureNote{
    export module AssureNoteUtils {

        export function SaveAs(ContentString: string, FileName: string): void {
            var blob = new Blob([ContentString], { type: 'text/plain; charset=UTF-8' });
            saveAs(blob, FileName);
        }

        export function GetNodeLabelFromEvent(event: Event): string {
            var element = <HTMLElement>event.target || <HTMLElement>event.srcElement;
            while (element != null) {
                if (element.id != "") {
                    return element.id;
                }
                element = element.parentElement;
            }
            return "";
        }

        export function GetNodePosition(Label: string): Point {
            var element = document.getElementById(Label);
            var view = element.getBoundingClientRect();
            return new Point(view.left, view.top);
        }

        export function CreateGSNShape(NodeView: NodeView): GSNShape {
            switch (NodeView.GetNodeType()) {
                case GSNType.Goal:
                    return new GSNGoalShape(NodeView);
                case GSNType.Context:
                    return new GSNContextShape(NodeView);
                case GSNType.Strategy:
                    return new GSNStrategyShape(NodeView);
                case GSNType.Evidence:
                    return new GSNEvidenceShape(NodeView);
            }
        }

        export function CreateSVGElement(name: string): SVGElement;
        export function CreateSVGElement(name: "a"): SVGAElement;
        export function CreateSVGElement(name: "circle"): SVGCircleElement;
        export function CreateSVGElement(name: "clippath"): SVGClipPathElement;
        export function CreateSVGElement(name: "componenttransferfunction"): SVGComponentTransferFunctionElement;
        export function CreateSVGElement(name: "defs"): SVGDefsElement;
        export function CreateSVGElement(name: "desc"): SVGDescElement;
        export function CreateSVGElement(name: "ellipse"): SVGEllipseElement;
        export function CreateSVGElement(name: "feblend"): SVGFEBlendElement;
        export function CreateSVGElement(name: "fecolormatrix"): SVGFEColorMatrixElement;
        export function CreateSVGElement(name: "fecomponenttransfer"): SVGFEComponentTransferElement;
        export function CreateSVGElement(name: "fecomposite"): SVGFECompositeElement;
        export function CreateSVGElement(name: "feconvolvematrix"): SVGFEConvolveMatrixElement;
        export function CreateSVGElement(name: "fediffuselighting"): SVGFEDiffuseLightingElement;
        export function CreateSVGElement(name: "fedisplacementmap"): SVGFEDisplacementMapElement;
        export function CreateSVGElement(name: "fedistantlight"): SVGFEDistantLightElement;
        export function CreateSVGElement(name: "feflood"): SVGFEFloodElement;
        export function CreateSVGElement(name: "fegaussianblur"): SVGFEGaussianBlurElement;
        export function CreateSVGElement(name: "feimage"): SVGFEImageElement;
        export function CreateSVGElement(name: "femerge"): SVGFEMergeElement;
        export function CreateSVGElement(name: "femergenode"): SVGFEMergeNodeElement;
        export function CreateSVGElement(name: "femorphology"): SVGFEMorphologyElement;
        export function CreateSVGElement(name: "feoffset"): SVGFEOffsetElement;
        export function CreateSVGElement(name: "fepointlight"): SVGFEPointLightElement;
        export function CreateSVGElement(name: "fespecularlighting"): SVGFESpecularLightingElement;
        export function CreateSVGElement(name: "fespotlight"): SVGFESpotLightElement;
        export function CreateSVGElement(name: "fetile"): SVGFETileElement;
        export function CreateSVGElement(name: "feturbulence"): SVGFETurbulenceElement;
        export function CreateSVGElement(name: "filter"): SVGFilterElement;
        export function CreateSVGElement(name: "g"): SVGGElement;
        export function CreateSVGElement(name: "gradient"): SVGGradientElement;
        export function CreateSVGElement(name: "image"): SVGImageElement;
        export function CreateSVGElement(name: "line"): SVGLineElement;
        export function CreateSVGElement(name: "marker"): SVGMarkerElement;
        export function CreateSVGElement(name: "mask"): SVGMaskElement;
        export function CreateSVGElement(name: "metadata"): SVGMetadataElement;
        export function CreateSVGElement(name: "path"): SVGPathElement;
        export function CreateSVGElement(name: "pattern"): SVGPatternElement;
        export function CreateSVGElement(name: "polygon"): SVGPolygonElement;
        export function CreateSVGElement(name: "polyline"): SVGPolylineElement;
        export function CreateSVGElement(name: "rect"): SVGRectElement;
        export function CreateSVGElement(name: "script"): SVGScriptElement;
        export function CreateSVGElement(name: "stop"): SVGStopElement;
        export function CreateSVGElement(name: "style"): SVGStyleElement;
        export function CreateSVGElement(name: "svg"): SVGSVGElement;
        export function CreateSVGElement(name: "switch"): SVGSwitchElement;
        export function CreateSVGElement(name: "symbol"): SVGSymbolElement;
        export function CreateSVGElement(name: "textcontent"): SVGTextContentElement;
        export function CreateSVGElement(name: "title"): SVGTitleElement;
        export function CreateSVGElement(name: "use"): SVGUseElement;
        export function CreateSVGElement(name: "view"): SVGViewElement;
        export function CreateSVGElement(name: string): SVGElement {
            return <SVGElement>document.createElementNS('http://www.w3.org/2000/svg', name);
        }

        var SVGMoveAnimateElementMaster: SVGElement = null;
        var SVGArrowAnimateElementMaster: SVGElement = null;
        var SVGFadeinAnimateElementMaster: SVGElement = null;

        export function CreateSVGMoveAnimateElement(Duration: number, FromGX: number, FromGY: number): SVGElement {
            if (SVGMoveAnimateElementMaster == null) {
                SVGMoveAnimateElementMaster = AssureNoteUtils.CreateSVGElement("animateTransform");
                SVGMoveAnimateElementMaster.setAttribute("attributeName", "transform");
                SVGMoveAnimateElementMaster.setAttribute("attributeType", "XML");
                SVGMoveAnimateElementMaster.setAttribute("type", "translate");
                SVGMoveAnimateElementMaster.setAttribute("calcMode", "linear");
                SVGMoveAnimateElementMaster.setAttribute("keyTimes", "0;1");
                SVGMoveAnimateElementMaster.setAttribute("keySplines", "0.0 0.0 0.58 1.0");
                SVGMoveAnimateElementMaster.setAttribute("restart", "never");
                SVGMoveAnimateElementMaster.setAttribute("begin", "indefinite");
                SVGMoveAnimateElementMaster.setAttribute("repeatCount", "1");
                SVGMoveAnimateElementMaster.setAttribute("additive", "sum");
                SVGMoveAnimateElementMaster.setAttribute("to", "0,0");
            }
            var AnimateElement = <SVGElement>SVGMoveAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            AnimateElement.setAttribute("from", "" + FromGX + "," + FromGY);
            return AnimateElement;
        }

        export function CreateSVGArrowAnimateElement(Duration: number, OldPath: string, NewPath: string): SVGElement {
            if (SVGArrowAnimateElementMaster == null) {
                SVGArrowAnimateElementMaster = AssureNoteUtils.CreateSVGElement("animate");
                SVGArrowAnimateElementMaster.setAttribute("attributeName", "d");
                SVGArrowAnimateElementMaster.setAttribute("attributeType", "XML");
                SVGArrowAnimateElementMaster.setAttribute("calcMode", "linear");
                SVGArrowAnimateElementMaster.setAttribute("keyTimes", "0;1");
                SVGArrowAnimateElementMaster.setAttribute("keySplines", "0.0 0.0 0.58 1.0");
                SVGArrowAnimateElementMaster.setAttribute("restart", "never");
                SVGArrowAnimateElementMaster.setAttribute("begin", "indefinite");
                SVGArrowAnimateElementMaster.setAttribute("repeatCount", "1");
            }
            var AnimateElement = <SVGElement>SVGArrowAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            if (OldPath) {
                AnimateElement.setAttribute("from", OldPath);
            }
            AnimateElement.setAttribute("to", NewPath);
            return AnimateElement;
        }

        export function CreateSVGFadeinAnimateElement(Duration: number): SVGElement {
            if (SVGFadeinAnimateElementMaster == null) {
                SVGFadeinAnimateElementMaster = AssureNoteUtils.CreateSVGElement("animate");
                SVGFadeinAnimateElementMaster.setAttribute("attributeName", "fill-opacity");
                SVGFadeinAnimateElementMaster.setAttribute("attributeType", "XML");
                SVGFadeinAnimateElementMaster.setAttribute("calcMode", "linear");
                SVGFadeinAnimateElementMaster.setAttribute("keyTimes", "0;1");
                SVGFadeinAnimateElementMaster.setAttribute("keySplines", "0.0 0.0 0.58 1.0");
                SVGFadeinAnimateElementMaster.setAttribute("restart", "never");
                SVGFadeinAnimateElementMaster.setAttribute("begin", "indefinite");
                SVGFadeinAnimateElementMaster.setAttribute("repeatCount", "1");
                SVGFadeinAnimateElementMaster.setAttribute("from", "0");
                SVGFadeinAnimateElementMaster.setAttribute("to", "1");
            }
            var AnimateElement = <SVGElement>SVGFadeinAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            return AnimateElement;
        }

        export function CreateCSSMoveAnimationDefinition(Prefix: string, Name: string, FromGX: number, FromGY: number): string {
            return "@" + Prefix + "keyframes " + Name + " { 0% { left: " + FromGX + "px; top: " + FromGY + "px; } }";
        }

        export function CreateCSSFadeinAnimationDefinition(Prefix: string, Name: string): string {
            return "@" + Prefix + "keyframes " + Name + " { 0% { opacity: 0; } }";
        }

        var element: HTMLDivElement = document.createElement('div');
        export function HTMLEncode(text: string): string {
            element.innerText = text;
            return element.innerHTML;
        }
    }

    export class ColorStyle {
        static Default: string = "assurenote-default";
        static ToDo: string = "assurenote-todo";
        static Searched: string = "assurenote-search";
        static SearchHighlight: string = "assurenote-search-highlight";
        static Danger: string = "assurenote-danger";
    }

    export class Rect {
        constructor(public X: number, public Y: number, public Width: number, public Height: number) {
        }
        toString(): string {
            return "(" + [this.X, this.Y, this.Width, this.Height].join(", ") + ")";
        }
        Clone(): Rect {
            return new Rect(this.X, this.Y, this.Width, this.Height);
        }
    }

    export class Point {
        constructor(public X: number, public Y: number) { }
        public Clone(): Point {
            return new Point(this.X, this.Y);
        }
        public toString() {
            return "(" + this.X + ", " + this.Y + ")";
        }
    }

    export enum Direction {
        Left, Top, Right, Bottom
    }

    export function ReverseDirection(Dir: Direction): Direction {
        return (Dir + 2) & 3;
    }
}
