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

///<reference path='./AssureNote.ts'/>
///<reference path='./CommandLine.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='./Editor.ts'/>
///<reference path='./NodeView.ts'/>
///<reference path='./AssureNoteUtils.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>

///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>

module AssureNote {

    export class GSNShapeSizePreFetcher {
        Queue: GSNShape[] = [];
        TimerHandle: number = 0;
        DummyDiv: HTMLDivElement = document.createElement("div");

        constructor() {
            this.DummyDiv.style.position = "absolute";
            this.DummyDiv.style.top = "1000%";
            document.body.appendChild(this.DummyDiv);

            this.TimerHandle = setInterval(() => {
                var StartTime = AssureNoteUtils.GetTime();
                while (this.Queue.length > 0 && AssureNoteUtils.GetTime() - StartTime < 16) {
                    var Shape = this.Queue.shift();
                    if (Shape.NodeView && !Shape.IsSizeCached()) {
                        Shape.PrerenderContent(AssureNoteApp.Current.PluginManager);
                        if (!Shape.Content.parentElement) {
                            this.DummyDiv.appendChild(Shape.Content);
                        }
                        Shape.GetNodeWidth();
                        Shape.FitSizeToContent();
                    }
                }
            }, 20);

            //for debug
            setInterval(() => {
                if (this.Queue.length) {
                    console.log("size prefetch: " + this.Queue.length + " nodes left");
                }
            }, 500);
        }

        AddShape(Shape: GSNShape) {
            this.Queue.push(Shape);
        }

    }

    export class GSNShape {
        ShapeGroup: SVGGElement;
        ArrowPath: SVGPathElement;
        Content: HTMLElement;
        private ColorStyles: string[] = [ColorStyle.Default];
        private NodeWidthCache: number;
        private NodeHeightCache: number;
        private HeadBoundingBox: Rect; // Head is the node and Left and Right.
        private TreeBoundingBox: Rect; // Tree is Head and Children

        private static AsyncSizePrefetcher: GSNShapeSizePreFetcher;
        private static NodeHeightCache: { [index: string]: number } = {};

        private static DefaultWidth = 250;

        private static ArrowPathMaster: SVGPathElement = (() => {
            var Master = AssureNoteUtils.CreateSVGElement("path");
            Master.setAttribute("marker-end", "url(#Triangle-black)");
            Master.setAttribute("fill", "none");
            Master.setAttribute("stroke", "gray");
            Master.setAttribute("d", "M0,0 C0,0 0,0 0,0");
            return Master;
        })();


        constructor(public NodeView: NodeView) {
            this.Content = null;
            this.NodeWidthCache = GSNShape.DefaultWidth;
            this.NodeHeightCache = 0;
            this.HeadBoundingBox = new Rect(0, 0, 0, 0);
            this.TreeBoundingBox = new Rect(0, 0, 0, 0);
            if (GSNShape.AsyncSizePrefetcher == null) {
                GSNShape.AsyncSizePrefetcher = new GSNShapeSizePreFetcher();
            }
            GSNShape.AsyncSizePrefetcher.AddShape(this);
        }

        //ClearSizeCache(): void {
        //    this.NodeWidthCache = GSNShape.DefaultWidth;
        //    this.NodeHeightCache = 0;
        //    GSNShape.AsyncSizePrefetcher.AddShape(this);
        //}

        IsSizeCached(): boolean {
            return this.NodeHeightCache != 0 && this.NodeWidthCache != 0
        }

        private static CreateArrowPath(): SVGPathElement {
            return <SVGPathElement>GSNShape.ArrowPathMaster.cloneNode();
        }

        SetTreeRect(LocalX: number, LocalY: number, Width: number, Height: number): void {
            this.SetTreeUpperLeft(LocalX, LocalY);
            this.SetTreeSize(Width, Height);
        }

        SetHeadRect(LocalX: number, LocalY: number, Width: number, Height: number): void {
            this.SetHeadUpperLeft(LocalX, LocalY);
            this.SetHeadSize(Width, Height);
        }

        SetTreeSize(Width: number, Height: number): void {
            this.TreeBoundingBox.Width = Width;
            this.TreeBoundingBox.Height = Height;
        }

        SetHeadSize(Width: number, Height: number): void {
            this.HeadBoundingBox.Width = Width;
            this.HeadBoundingBox.Height = Height;
        }

        GetNodeWidth(): number {
            return this.NodeWidthCache;
        }

        GetNodeHeight(): number {
            if (this.NodeHeightCache == 0) {
                var Cached = GSNShape.NodeHeightCache[this.Content.innerHTML];
                if (Cached) {
                    this.NodeHeightCache = Cached;
                } else {
                    GSNShape.NodeHeightCache[this.Content.innerHTML] = this.NodeHeightCache = this.Content.clientHeight;
                }
            }
            return this.NodeHeightCache;
        }

        GetTreeWidth(): number {
            if (this.TreeBoundingBox.Width == 0) {
                this.TreeBoundingBox.Width = 250; //FIXME
            }
            return this.TreeBoundingBox.Width;
        }

        GetTreeHeight(): number {
            if (this.TreeBoundingBox.Height == 0) {
                this.TreeBoundingBox.Height = 100; //FIXME
            }
            return this.TreeBoundingBox.Height;
        }

        GetHeadWidth(): number {
            if (this.HeadBoundingBox.Width == 0) {
                this.HeadBoundingBox.Width = 250; //FIXME
            }
            return this.HeadBoundingBox.Width;
        }

        GetHeadHeight(): number {
            if (this.HeadBoundingBox.Height == 0) {
                this.HeadBoundingBox.Height = 100; //FIXME
            }
            return this.HeadBoundingBox.Height;
        }

        GetTreeLeftLocalX(): number {
            return this.TreeBoundingBox.X;
        }

        GetHeadLeftLocalX(): number {
            return this.HeadBoundingBox.X;
        }

        SetTreeUpperLeft(LocalX: number, LocalY: number): void {
            this.TreeBoundingBox.X = LocalX;
            this.TreeBoundingBox.Y = LocalY;
        }

        SetHeadUpperLeft(LocalX: number, LocalY: number): void {
            this.HeadBoundingBox.X = LocalX;
            this.HeadBoundingBox.Y = LocalY;
        }

        UpdateHtmlClass() {
            this.Content.className = "node";
        }

        private FormatNewLine(doc: string) {
            return doc.replace(/\n/g, '<br>');
        }

        private PrerenderHTMLContent(manager: PluginManager): void {
            if (this.Content == null) {
                var div = document.createElement("div");
                this.Content = div;

                div.style.position = "absolute";
                div.id = this.NodeView.Label;

                var h4 = document.createElement("h4");
                h4.textContent = this.NodeView.Label;

                var p = document.createElement("p");
                var encoded: string = AssureNoteUtils.HTMLEncode(this.NodeView.NodeDoc.trim());
                p.innerHTML = this.FormatNewLine(manager.InvokeHTMLRenderPlugin(encoded, this.NodeView.Model));

                this.UpdateHtmlClass();
                div.appendChild(h4);
                div.appendChild(p);
            }
        }

        PrerenderContent(manager: PluginManager) {
            this.PrerenderHTMLContent(manager);
            this.PrerenderSVGContent(manager);
        }

        Render(HtmlContentFragment: DocumentFragment, SvgNodeFragment: DocumentFragment, SvgConnectionFragment: DocumentFragment): void {
            SvgNodeFragment.appendChild(this.ShapeGroup);
            if (this.ArrowPath != null && this.NodeView.Parent != null) {
                SvgConnectionFragment.appendChild(this.ArrowPath);
            }
            HtmlContentFragment.appendChild(this.Content);
        }

        FitSizeToContent(): void {
        }

        private willFadein = false;
        private GXCache = null;
        private GYCache = null;

        private RemoveAnimateElement(Animate: SVGElement) {
            if (Animate) {
                var Parent = Animate.parentNode;
                if (Parent) {
                    Parent.removeChild(Animate);
                }
            }
        }

        SetPosition(x: number, y: number): void {
            if (this.NodeView.IsVisible) {
                var div = this.Content;
                if (div != null) {
                    div.style.left = x + "px";
                    div.style.top = y + "px";
                }
                var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
                mat.e = x;
                mat.f = y;
            }
            this.GXCache = x;
            this.GYCache = y;
        }

        private SetOpacity(Opacity: number) {
            this.Content.style.opacity = Opacity.toString();
            this.ShapeGroup.style.opacity = Opacity.toString();
        }

        private Fadein(AnimationCallbacks: Function[], Duration: number): void {
            var V = 1 / Duration;
            var Opacity = 0;
            AnimationCallbacks.push((deltaT: number) => {
                Opacity += V * deltaT;
                this.SetOpacity(Opacity);
                this.SetArrowOpacity(Opacity);
            });
        }

        static __Debug_Animation_SkippedNodeCount;
        static __Debug_Animation_TotalNodeCount;

        public MoveTo(AnimationCallbacks: Function[], x: number, y: number, Duration: number, ScreenRect?: Rect): void {
            if (Duration <= 0) {
                this.SetPosition(x, y);
                return;
            }

            if (this.WillFadein()) {
                GSNShape.__Debug_Animation_TotalNodeCount++;
                if (ScreenRect && (y + this.GetNodeHeight() < ScreenRect.Y || y > ScreenRect.Y + ScreenRect.Height)) {
                    this.SetPosition(x, y);
                    this.willFadein = false;
                    GSNShape.__Debug_Animation_SkippedNodeCount++;
                    return;
                }
                this.Fadein(AnimationCallbacks, Duration);
                this.willFadein = false;
                if (this.GXCache == null || this.GYCache == null) {
                    this.SetPosition(x, y);
                    GSNShape.__Debug_Animation_SkippedNodeCount++;
                    return;
                }
            }

            if (ScreenRect) {
                GSNShape.__Debug_Animation_TotalNodeCount++;
                if (this.GXCache + this.GetNodeWidth() < ScreenRect.X || this.GXCache > ScreenRect.X + ScreenRect.Width) {
                    if (x + this.GetNodeWidth() < ScreenRect.X || x > ScreenRect.X + ScreenRect.Width) {
                        GSNShape.__Debug_Animation_SkippedNodeCount++;
                        this.SetPosition(x, y);
                        return;
                    }
                }
                if (this.GYCache + this.GetNodeHeight() < ScreenRect.Y || this.GYCache > ScreenRect.Y + ScreenRect.Height) {
                    GSNShape.__Debug_Animation_SkippedNodeCount++;
                    this.SetPosition(x, y);
                    return;
                }
            }

            var VX = (x - this.GXCache) / Duration;
            var VY = (y - this.GYCache) / Duration;
            
            AnimationCallbacks.push((deltaT: number) => this.SetPosition(this.GXCache + VX * deltaT, this.GYCache + VY * deltaT));
        }

        SetFadeinBasePosition(StartGX: number, StartGY: number): void {
            this.willFadein = true;
            this.GXCache = StartGX;
            this.GYCache = StartGY;
            this.ArrowP1Cache = this.ArrowP2Cache = new Point(StartGX + this.GetNodeWidth() * 0.5, StartGY + this.GetNodeHeight() * 0.5);
        }

        GetGXCache(): number {
            return this.GXCache;
        }

        GetGYCache(): number {
            return this.GYCache;
        }

        WillFadein(): boolean {
            return this.willFadein || this.GXCache == null || this.GYCache == null;
        }

        ClearAnimationCache(): void {
            this.GXCache = null;
            this.GYCache = null;
        }

        private ArrowStart: SVGPathSegMovetoAbs;
        private ArrowCurve: SVGPathSegCurvetoCubicAbs;

        PrerenderSVGContent(manager: PluginManager): void {
            this.ShapeGroup = AssureNoteUtils.CreateSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
            this.ArrowPath = GSNShape.CreateArrowPath();
            this.ArrowStart = <SVGPathSegMovetoAbs>this.ArrowPath.pathSegList.getItem(0);
            this.ArrowCurve = <SVGPathSegCurvetoCubicAbs>this.ArrowPath.pathSegList.getItem(1);
            manager.InvokeSVGRenderPlugin(this.ShapeGroup, this.NodeView);
        }

        private ArrowP1Cache: Point;
        private ArrowP2Cache: Point;

        SetArrowPosition(P1: Point, P2: Point, Dir: Direction) {
            var start = this.ArrowStart;
            var curve = this.ArrowCurve;
            start.x = P1.X;
            start.y = P1.Y;
            curve.x = P2.X;
            curve.y = P2.Y;
            if (Dir == Direction.Bottom || Dir == Direction.Top) {
                var DiffX = Math.abs(P1.X - P2.X);
                curve.x1 = (9 * P1.X + P2.X) / 10;
                curve.y1 = P2.Y;
                curve.x2 = (9 * P2.X + P1.X) / 10;
                curve.y2 = P1.Y;
                if (DiffX > 300) {
                    curve.x1 = P1.X - 10 * (P1.X - P2.X < 0 ? -1 : 1);
                    curve.x2 = P2.X + 10 * (P1.X - P2.X < 0 ? -1 : 1);
                }
                if (DiffX < 50) {
                    curve.y1 = curve.y2 = (P1.Y + P2.Y) * 0.5;
                }
            } else {
                curve.x1 = (P1.X + P2.X) / 2;
                curve.y1 = (9 * P1.Y + P2.Y) / 10;
                curve.x2 = (P1.X + P2.X) / 2;
                curve.y2 = (9 * P2.Y + P1.Y) / 10;
            }
            this.ArrowP1Cache = P1;
            this.ArrowP2Cache = P2;
        }

        private SetArrowOpacity(Opacity: number) {
            this.ArrowPath.style.opacity = Opacity.toString();
        }

        MoveArrowTo(AnimationCallbacks: Function[], P1: Point, P2: Point, Dir: Direction, Duration: number, ScreenRect?: Rect) {
            if (Duration <= 0) {
                this.SetArrowPosition(P1, P2, Dir);
                return;
            }
            if (ScreenRect) {
                var R0 = this.ArrowP1Cache.X < this.ArrowP2Cache.X ? this.ArrowP2Cache.X : this.ArrowP1Cache.X; 
                var L0 = this.ArrowP1Cache.X < this.ArrowP2Cache.X ? this.ArrowP1Cache.X : this.ArrowP2Cache.X; 
                if (R0 < ScreenRect.X || L0 > ScreenRect.X + ScreenRect.Width) {
                    var R1 = P1.X < P2.X ? P2.X : P1.X; 
                    var L1 = P1.X < P2.X ? P1.X : P2.X; 
                    if (R1  < ScreenRect.X || L1 > ScreenRect.X + ScreenRect.Width) {
                        this.SetArrowPosition(P1, P2, Dir);
                        return;
                    }
                }
                if (this.ArrowP2Cache.Y < ScreenRect.Y || this.ArrowP1Cache.Y > ScreenRect.Y + ScreenRect.Height) {
                    this.SetArrowPosition(P1, P2, Dir);
                    return;
                }
            }

            if (this.ArrowP1Cache == this.ArrowP2Cache && ScreenRect && (P2.Y + this.GetNodeHeight() < ScreenRect.Y || P1.Y > ScreenRect.Y + ScreenRect.Height)) {
                this.SetArrowPosition(P1, P2, Dir);
                return;
            }

            var P1VX = (P1.X - this.ArrowP1Cache.X) / Duration;
            var P1VY = (P1.Y - this.ArrowP1Cache.Y) / Duration;
            var P2VX = (P2.X - this.ArrowP2Cache.X) / Duration;
            var P2VY = (P2.Y - this.ArrowP2Cache.Y) / Duration;

            var CurrentP1 = this.ArrowP1Cache.Clone();
            var CurrentP2 = this.ArrowP2Cache.Clone();

            AnimationCallbacks.push((deltaT: number) => {
                CurrentP1.X += P1VX * deltaT;
                CurrentP1.Y += P1VY * deltaT;
                CurrentP2.X += P2VX * deltaT;
                CurrentP2.Y += P2VY * deltaT;
                this.SetArrowPosition(CurrentP1, CurrentP2, Dir);
            });
        }

        SetArrowColorWhite(IsWhite: boolean) {
            if (IsWhite) {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            } else {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            }
        }

        GetConnectorPosition(Dir: Direction): Point {
            switch (Dir) {
                case Direction.Right:
                    return new Point(this.GetNodeWidth(), this.GetNodeHeight() / 2);
                case Direction.Left:
                    return new Point(0, this.GetNodeHeight() / 2);
                case Direction.Top:
                    return new Point(this.GetNodeWidth() / 2, 0);
                case Direction.Bottom:
                    return new Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
                default:
                    return new Point(0, 0);
            }
        }

        AddColorStyle(ColorStyleCode: string): void {
            if (ColorStyleCode) {
                if (this.ColorStyles.indexOf(ColorStyleCode) < 0) {
                    this.ColorStyles.push(ColorStyleCode);
                }
                if (this.ShapeGroup) {
                    this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
                }
            }
        }

        RemoveColorStyle(ColorStyleCode: string): void {
            if (ColorStyleCode && ColorStyleCode != ColorStyle.Default) {
                var Index = this.ColorStyles.indexOf(ColorStyleCode);
                if (Index > 0) {
                    this.ColorStyles.splice(Index, 1);
                }
                if (this.ShapeGroup) {
                    this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
                }
            }
        }

        GetColorStyle(): string[] {
            return this.ColorStyles;
        }

        SetColorStyle(Styles: string[]): void {
            this.ColorStyles = Styles;
            if (this.ColorStyles.indexOf(ColorStyle.Default) < 0) {
                this.ColorStyles.push(ColorStyle.Default);
            }
        }

        ClearColorStyle(): void {
            this.ColorStyles = [ColorStyle.Default];
            if (this.ShapeGroup) {
                this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
            }
        }
    }

    export class GSNGoalShape extends GSNShape {
        BodyRect: SVGRectElement;
        ModuleRect: SVGRectElement;
        UndevelopedSymbol: SVGPolygonElement;

        private static ModuleSymbolMaster: SVGRectElement = (() => {
            var Master = AssureNoteUtils.CreateSVGElement("rect");
            Master.setAttribute("width", "80px");
            Master.setAttribute("height", "13px");
            Master.setAttribute("y", "-13px");
            return Master;
        })();

        private static UndevelopedSymbolMaster: SVGPolygonElement = (() => {
            var Master = AssureNoteUtils.CreateSVGElement("polygon");
            Master.setAttribute("points", "0 -20 -20 0 0 20 20 0");
            return Master;
        })();


        PrerenderSVGContent(manager: PluginManager): void {
            super.PrerenderSVGContent(manager);
            this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
            this.ShapeGroup.appendChild(this.BodyRect);
            if (this.NodeView.IsFolded()) {
                this.ShapeGroup.appendChild(GSNGoalShape.ModuleSymbolMaster.cloneNode());
            }
            if (this.NodeView.Children == null && !this.NodeView.IsFolded()) {
                this.UndevelopedSymbol = <SVGPolygonElement>GSNGoalShape.UndevelopedSymbolMaster.cloneNode();
                this.ShapeGroup.appendChild(this.UndevelopedSymbol);
            }
        }

        FitSizeToContent(): void {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
            if (this.NodeView.Children == null && !this.NodeView.IsFolded()) {
                var x = (this.GetNodeWidth() / 2).toString();
                var y = (this.GetNodeHeight() + 20).toString();
                this.UndevelopedSymbol.setAttribute("transform", "translate(" + x + "," + y + ")");
                this.UndevelopedSymbol.setAttribute("y", y + "px");
            }
        }

        UpdateHtmlClass() {
            this.Content.className = "node node-goal";
        }
    }

    export class GSNContextShape extends GSNShape {
        BodyRect: SVGRectElement;

        PrerenderSVGContent(manager: PluginManager): void {
            super.PrerenderSVGContent(manager);
            this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
        }

        FitSizeToContent(): void {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
        }

        UpdateHtmlClass() {
            this.Content.className = "node node-context";
        }
    }

    export class GSNStrategyShape extends GSNShape {
        BodyPolygon: SVGPolygonElement;
        delta: number = 20;

        PrerenderSVGContent(manager: PluginManager): void {
            super.PrerenderSVGContent(manager);
            this.BodyPolygon = AssureNoteUtils.CreateSVGElement("polygon");
            this.ShapeGroup.appendChild(this.BodyPolygon);
        }

        FitSizeToContent(): void {
            var w: number = this.GetNodeWidth();
            var h: number = this.GetNodeHeight();
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + w + ",0 " + (w - this.delta) + "," + h + " 0," + h);
        }

        UpdateHtmlClass() {
            this.Content.className = "node node-strategy";
        }

        GetConnectorPosition(Dir: Direction): Point {
            switch (Dir) {
                case Direction.Right:
                    return new Point(this.GetNodeWidth() - this.delta / 2, this.GetNodeHeight() / 2);
                case Direction.Left:
                    return new Point(this.delta / 2, this.GetNodeHeight() / 2);
                case Direction.Top:
                    return new Point(this.GetNodeWidth() / 2, 0);
                case Direction.Bottom:
                    return new Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
            }
        }
    }

    export class GSNEvidenceShape extends GSNShape {
        private BodyEllipse: SVGEllipseElement;
        private ClientHeight: number;

        PrerenderSVGContent(manager: PluginManager): void {
            super.PrerenderSVGContent(manager);
            this.BodyEllipse = AssureNoteUtils.CreateSVGElement("ellipse");
            this.ShapeGroup.appendChild(this.BodyEllipse);
        }

        FitSizeToContent(): void {
            this.BodyEllipse.setAttribute("cx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.GetNodeHeight() / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.GetNodeHeight() / 2).toString());
        }

        UpdateHtmlClass() {
            this.Content.className = "node node-evidence";
        }
    }
}
