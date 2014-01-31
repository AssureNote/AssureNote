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

    export class GSNShape {
        ShapeGroup: SVGGElement;
        ArrowPath: SVGPathElement;
        Content: HTMLElement;
        ColorStyle: string = ColorStyle.Default;
        private NodeWidth: number;
        private NodeHeight: number;
        private HeadBoundingBox: Rect; // Head is the node and Left and Right.
        private TreeBoundingBox: Rect; // Tree is Head and Children
        private static ArrowPathMaster: SVGPathElement = null;

        constructor(public NodeView: NodeView) {
            this.Content = null;
            this.NodeWidth = 250;
            this.NodeHeight = 0;
            this.HeadBoundingBox = new Rect(0, 0, 0, 0);
            this.TreeBoundingBox = new Rect(0, 0, 0, 0);
        }

        private static CreateArrowPath(): SVGPathElement {
            if (!GSNShape.ArrowPathMaster) {
                GSNShape.ArrowPathMaster = AssureNoteUtils.CreateSVGElement("path");
                GSNShape.ArrowPathMaster.setAttribute("marker-end", "url(#Triangle-black)");
                GSNShape.ArrowPathMaster.setAttribute("fill", "none");
                GSNShape.ArrowPathMaster.setAttribute("stroke", "gray");
                GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
                GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
            }
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
            return this.NodeWidth;
        }

        GetNodeHeight(): number {
            if (this.NodeHeight == 0) {
                this.NodeHeight = this.Content.clientHeight;
            }
            return this.NodeHeight;
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

        private GX = null;
        private GY = null;

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
            this.GX = x;
            this.GY = y;
        }

        private SetOpacity(Opacity: number) {
            this.Content.style.opacity = Opacity.toString();
            this.ShapeGroup.style.opacity = Opacity.toString();
        }

        private AnimationFrameTimerHandle: number = 0;

        private Fadein(Duration: number): void {
            if (this.AnimationFrameTimerHandle) {
                cancelAnimationFrame(this.AnimationFrameTimerHandle);
                this.AnimationFrameTimerHandle = 0;
            }
            var lastTime: number = performance.now();
            var startTime = lastTime;

            var V = 1 / Duration;
            var Opacity = 0;

            var update: any = () => {
                var currentTime: number = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    this.AnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                Opacity += V * deltaT;
                this.SetOpacity(Opacity);
                lastTime = currentTime;
            }
            update();
        }

        public MoveTo(x: number, y: number, Duration: number): void {
            if (Duration <= 0) {
                this.SetPosition(x, y);
                return;
            }

            if (this.GX == null || this.GY == null) {
                this.SetPosition(x, y);
                this.Fadein(Duration);
                return;
            }

            if (this.AnimationFrameTimerHandle) {
                cancelAnimationFrame(this.AnimationFrameTimerHandle);
                this.AnimationFrameTimerHandle = 0;
            }
            var lastTime: number = performance.now();
            var startTime = lastTime;

            var VX = (x - this.GX) / Duration;
            var VY = (y - this.GY) / Duration;

            this.SetOpacity(1);

            var update: any = () => {
                var currentTime: number = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    this.AnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                this.SetPosition(this.GX + VX * deltaT, this.GY + VY * deltaT);
                lastTime = currentTime;
            }
            update();
        }

        ClearAnimationCache(): void {
            this.GX = null;
            this.GY = null;
        }

        PrerenderSVGContent(manager: PluginManager): void {
            this.ShapeGroup = AssureNoteUtils.CreateSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ShapeGroup.setAttribute("class", this.ColorStyle);
            this.ArrowPath = GSNShape.CreateArrowPath();
            manager.InvokeSVGRenderPlugin(this.ShapeGroup, this.NodeView);
        }

        private ArrowAnimationFrameTimerHandle: number = 0;

        private ArrowP1: Point;
        private ArrowP2: Point;

        SetArrowPosition(P1: Point, P2: Point, Dir: Direction) {
            var start = <SVGPathSegMovetoAbs>this.ArrowPath.pathSegList.getItem(0);
            var curve = <SVGPathSegCurvetoCubicAbs>this.ArrowPath.pathSegList.getItem(1);
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
            this.ArrowP1 = P1;
            this.ArrowP2 = P2;
        }

        private SetArrowOpacity(Opacity: number) {
            this.ArrowPath.style.opacity = Opacity.toString();
        }

        private FadeinArrow(Duration: number): void {
            if (this.ArrowAnimationFrameTimerHandle) {
                cancelAnimationFrame(this.ArrowAnimationFrameTimerHandle);
                this.ArrowAnimationFrameTimerHandle = 0;
            }
            var lastTime: number = performance.now();
            var startTime = lastTime;

            var V = 1 / Duration;
            var Opacity = 0;

            var update: any = () => {
                var currentTime: number = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    this.ArrowAnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                Opacity += V * deltaT;
                this.SetArrowOpacity(Opacity);
                lastTime = currentTime;
            }
            update();
        }

        MoveArrowTo(P1: Point, P2: Point, Dir: Direction, Duration: number) {
            if (Duration <= 0) {
                this.SetArrowPosition(P1, P2, Dir);
                return;
            }

            if (this.GX == null || this.GY == null) {
                this.SetArrowPosition(P1, P2, Dir);
                this.FadeinArrow(Duration);
                return;
            }

            var P1VX = (P1.X - this.ArrowP1.X) / Duration;
            var P1VY = (P1.Y - this.ArrowP1.Y) / Duration;
            var P2VX = (P2.X - this.ArrowP2.X) / Duration;
            var P2VY = (P2.Y - this.ArrowP2.Y) / Duration;

            if (this.ArrowAnimationFrameTimerHandle) {
                cancelAnimationFrame(this.ArrowAnimationFrameTimerHandle);
                this.ArrowAnimationFrameTimerHandle = 0;
            }
            var lastTime: number = performance.now();
            var startTime = lastTime;
            
            this.SetArrowOpacity(1);

            var update: any = () => {
                var currentTime: number = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    this.ArrowAnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                var CurrentP1 = this.ArrowP1.Clone();
                var CurrentP2 = this.ArrowP2.Clone();
                CurrentP1.X += P1VX * deltaT;
                CurrentP1.Y += P1VY * deltaT;
                CurrentP2.X += P2VX * deltaT;
                CurrentP2.Y += P2VY * deltaT;
                this.SetArrowPosition(CurrentP1, CurrentP2, Dir);
                lastTime = currentTime;
            }
            update();
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
                var Styles: string[] = this.ColorStyle.split(" ");
                if (Styles.indexOf(ColorStyleCode) < 0) {
                    Styles.push(ColorStyleCode);
                }
                if (Styles.indexOf(ColorStyle.Default) < 0) {
                    Styles.unshift(ColorStyle.Default);
                }
                this.ColorStyle = Styles.join(" ");
                this.ShapeGroup.setAttribute("class", this.ColorStyle);
            }
        }

        RemoveColorStyle(ColorStyleCode: string): void {
            if (ColorStyleCode) {
                var Styles: string[] = this.ColorStyle.split(" ");
                var Index = Styles.indexOf(ColorStyleCode);
                if (Index > 0) {
                    Styles.splice(Index, 1);
                }
                if (Styles.indexOf(ColorStyle.Default) < 0) {
                    Styles.unshift(ColorStyle.Default);
                }
                this.ColorStyle = Styles.join(" ");
                this.ShapeGroup.setAttribute("class", this.ColorStyle);
            }
        }

        ClearColorStyle(): void {
            this.ColorStyle = ColorStyle.Default;
            this.ShapeGroup.setAttribute("class", this.ColorStyle);
        }
    }

    export class GSNGoalShape extends GSNShape {
        BodyRect: SVGRectElement;
        ModuleRect: SVGRectElement;
        UndevelopedSymbol: SVGPolygonElement;

        PrerenderSVGContent(manager: PluginManager): void {
            super.PrerenderSVGContent(manager);
            this.BodyRect = AssureNoteUtils.CreateSVGElement("rect");
            this.ShapeGroup.appendChild(this.BodyRect);
            if (this.NodeView.IsFolded) {
                this.ModuleRect = AssureNoteUtils.CreateSVGElement("rect");
                this.ModuleRect.setAttribute("width", "80px");
                this.ModuleRect.setAttribute("height", "13px");
                this.ModuleRect.setAttribute("y", "-13px");
                this.ShapeGroup.appendChild(this.ModuleRect);
            }
            if (this.NodeView.Children == null && !this.NodeView.IsFolded) {
                this.UndevelopedSymbol = AssureNoteUtils.CreateSVGElement("polygon");
                this.UndevelopedSymbol.setAttribute("points", "0 -20 -20 0 0 20 20 0");
                this.ShapeGroup.appendChild(this.UndevelopedSymbol);
            }
        }

        FitSizeToContent(): void {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
            if (this.NodeView.Children == null && !this.NodeView.IsFolded) {
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
