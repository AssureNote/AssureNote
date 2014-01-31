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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='./AssureNote.ts'/>
///<reference path='./CommandLine.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='./Editor.ts'/>
///<reference path='./NodeView.ts'/>
///<reference path='./AssureNoteUtils.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>
var AssureNote;
(function (AssureNote) {
    var GSNShape = (function () {
        function GSNShape(NodeView) {
            this.NodeView = NodeView;
            this.ColorStyle = AssureNote.ColorStyle.Default;
            this.GX = null;
            this.GY = null;
            this.AnimationFrameTimerHandle = 0;
            this.ArrowAnimationFrameTimerHandle = 0;
            this.Content = null;
            this.NodeWidth = 250;
            this.NodeHeight = 0;
            this.HeadBoundingBox = new AssureNote.Rect(0, 0, 0, 0);
            this.TreeBoundingBox = new AssureNote.Rect(0, 0, 0, 0);
        }
        GSNShape.CreateArrowPath = function () {
            if (!GSNShape.ArrowPathMaster) {
                GSNShape.ArrowPathMaster = AssureNote.AssureNoteUtils.CreateSVGElement("path");
                GSNShape.ArrowPathMaster.setAttribute("marker-end", "url(#Triangle-black)");
                GSNShape.ArrowPathMaster.setAttribute("fill", "none");
                GSNShape.ArrowPathMaster.setAttribute("stroke", "gray");
                GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
                GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
            }
            return GSNShape.ArrowPathMaster.cloneNode();
        };

        GSNShape.prototype.SetTreeRect = function (LocalX, LocalY, Width, Height) {
            this.SetTreeUpperLeft(LocalX, LocalY);
            this.SetTreeSize(Width, Height);
        };

        GSNShape.prototype.SetHeadRect = function (LocalX, LocalY, Width, Height) {
            this.SetHeadUpperLeft(LocalX, LocalY);
            this.SetHeadSize(Width, Height);
        };

        GSNShape.prototype.SetTreeSize = function (Width, Height) {
            this.TreeBoundingBox.Width = Width;
            this.TreeBoundingBox.Height = Height;
        };

        GSNShape.prototype.SetHeadSize = function (Width, Height) {
            this.HeadBoundingBox.Width = Width;
            this.HeadBoundingBox.Height = Height;
        };

        GSNShape.prototype.GetNodeWidth = function () {
            return this.NodeWidth;
        };

        GSNShape.prototype.GetNodeHeight = function () {
            if (this.NodeHeight == 0) {
                this.NodeHeight = this.Content.clientHeight;
            }
            return this.NodeHeight;
        };

        GSNShape.prototype.GetTreeWidth = function () {
            if (this.TreeBoundingBox.Width == 0) {
                this.TreeBoundingBox.Width = 250; //FIXME
            }
            return this.TreeBoundingBox.Width;
        };

        GSNShape.prototype.GetTreeHeight = function () {
            if (this.TreeBoundingBox.Height == 0) {
                this.TreeBoundingBox.Height = 100; //FIXME
            }
            return this.TreeBoundingBox.Height;
        };

        GSNShape.prototype.GetHeadWidth = function () {
            if (this.HeadBoundingBox.Width == 0) {
                this.HeadBoundingBox.Width = 250; //FIXME
            }
            return this.HeadBoundingBox.Width;
        };

        GSNShape.prototype.GetHeadHeight = function () {
            if (this.HeadBoundingBox.Height == 0) {
                this.HeadBoundingBox.Height = 100; //FIXME
            }
            return this.HeadBoundingBox.Height;
        };

        GSNShape.prototype.GetTreeLeftLocalX = function () {
            return this.TreeBoundingBox.X;
        };

        GSNShape.prototype.GetHeadLeftLocalX = function () {
            return this.HeadBoundingBox.X;
        };

        GSNShape.prototype.SetTreeUpperLeft = function (LocalX, LocalY) {
            this.TreeBoundingBox.X = LocalX;
            this.TreeBoundingBox.Y = LocalY;
        };

        GSNShape.prototype.SetHeadUpperLeft = function (LocalX, LocalY) {
            this.HeadBoundingBox.X = LocalX;
            this.HeadBoundingBox.Y = LocalY;
        };

        GSNShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node";
        };

        GSNShape.prototype.FormatNewLine = function (doc) {
            return doc.replace(/\n/g, '<br>');
        };

        GSNShape.prototype.PrerenderHTMLContent = function (manager) {
            if (this.Content == null) {
                var div = document.createElement("div");
                this.Content = div;

                div.style.position = "absolute";
                div.id = this.NodeView.Label;

                var h4 = document.createElement("h4");
                h4.textContent = this.NodeView.Label;

                var p = document.createElement("p");
                var encoded = AssureNote.AssureNoteUtils.HTMLEncode(this.NodeView.NodeDoc.trim());
                p.innerHTML = this.FormatNewLine(manager.InvokeHTMLRenderPlugin(encoded, this.NodeView.Model));

                this.UpdateHtmlClass();
                div.appendChild(h4);
                div.appendChild(p);
            }
        };

        GSNShape.prototype.PrerenderContent = function (manager) {
            this.PrerenderHTMLContent(manager);
            this.PrerenderSVGContent(manager);
        };

        GSNShape.prototype.Render = function (HtmlContentFragment, SvgNodeFragment, SvgConnectionFragment) {
            SvgNodeFragment.appendChild(this.ShapeGroup);
            if (this.ArrowPath != null && this.NodeView.Parent != null) {
                SvgConnectionFragment.appendChild(this.ArrowPath);
            }
            HtmlContentFragment.appendChild(this.Content);
        };

        GSNShape.prototype.FitSizeToContent = function () {
        };

        GSNShape.prototype.RemoveAnimateElement = function (Animate) {
            if (Animate) {
                var Parent = Animate.parentNode;
                if (Parent) {
                    Parent.removeChild(Animate);
                }
            }
        };

        GSNShape.prototype.SetPosition = function (x, y) {
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
        };

        GSNShape.prototype.SetOpacity = function (Opacity) {
            this.Content.style.opacity = Opacity.toString();
            this.ShapeGroup.style.opacity = Opacity.toString();
        };

        GSNShape.prototype.Fadein = function (Duration) {
            var _this = this;
            if (this.AnimationFrameTimerHandle) {
                cancelAnimationFrame(this.AnimationFrameTimerHandle);
                this.AnimationFrameTimerHandle = 0;
            }
            var lastTime = performance.now();
            var startTime = lastTime;

            var V = 1 / Duration;
            var Opacity = 0;

            var update = function () {
                var currentTime = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    _this.AnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                Opacity += V * deltaT;
                _this.SetOpacity(Opacity);
                lastTime = currentTime;
            };
            update();
        };

        GSNShape.prototype.MoveTo = function (x, y, Duration) {
            var _this = this;
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
            var lastTime = performance.now();
            var startTime = lastTime;

            var VX = (x - this.GX) / Duration;
            var VY = (y - this.GY) / Duration;

            this.SetOpacity(1);

            var update = function () {
                var currentTime = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    _this.AnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                _this.SetPosition(_this.GX + VX * deltaT, _this.GY + VY * deltaT);
                lastTime = currentTime;
            };
            update();
        };

        GSNShape.prototype.ClearAnimationCache = function () {
            this.GX = null;
            this.GY = null;
        };

        GSNShape.prototype.PrerenderSVGContent = function (manager) {
            this.ShapeGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ShapeGroup.setAttribute("class", this.ColorStyle);
            this.ArrowPath = GSNShape.CreateArrowPath();
            manager.InvokeSVGRenderPlugin(this.ShapeGroup, this.NodeView);
        };

        GSNShape.prototype.SetArrowPosition = function (P1, P2, Dir) {
            var start = this.ArrowPath.pathSegList.getItem(0);
            var curve = this.ArrowPath.pathSegList.getItem(1);
            start.x = P1.X;
            start.y = P1.Y;
            curve.x = P2.X;
            curve.y = P2.Y;
            if (Dir == 3 /* Bottom */ || Dir == 1 /* Top */) {
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
        };

        GSNShape.prototype.SetArrowOpacity = function (Opacity) {
            this.ArrowPath.style.opacity = Opacity.toString();
        };

        GSNShape.prototype.FadeinArrow = function (Duration) {
            var _this = this;
            if (this.ArrowAnimationFrameTimerHandle) {
                cancelAnimationFrame(this.ArrowAnimationFrameTimerHandle);
                this.ArrowAnimationFrameTimerHandle = 0;
            }
            var lastTime = performance.now();
            var startTime = lastTime;

            var V = 1 / Duration;
            var Opacity = 0;

            var update = function () {
                var currentTime = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    _this.ArrowAnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                Opacity += V * deltaT;
                _this.SetArrowOpacity(Opacity);
                lastTime = currentTime;
            };
            update();
        };

        GSNShape.prototype.MoveArrowTo = function (P1, P2, Dir, Duration) {
            var _this = this;
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
            var lastTime = performance.now();
            var startTime = lastTime;

            this.SetArrowOpacity(1);

            var update = function () {
                var currentTime = performance.now();
                var deltaT = currentTime - lastTime;
                if (currentTime - startTime < Duration) {
                    _this.ArrowAnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = Duration - (lastTime - startTime);
                }
                var CurrentP1 = _this.ArrowP1.Clone();
                var CurrentP2 = _this.ArrowP2.Clone();
                CurrentP1.X += P1VX * deltaT;
                CurrentP1.Y += P1VY * deltaT;
                CurrentP2.X += P2VX * deltaT;
                CurrentP2.Y += P2VY * deltaT;
                _this.SetArrowPosition(CurrentP1, CurrentP2, Dir);
                lastTime = currentTime;
            };
            update();
        };

        GSNShape.prototype.SetArrowColorWhite = function (IsWhite) {
            if (IsWhite) {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            } else {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            }
        };

        GSNShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case 2 /* Right */:
                    return new AssureNote.Point(this.GetNodeWidth(), this.GetNodeHeight() / 2);
                case 0 /* Left */:
                    return new AssureNote.Point(0, this.GetNodeHeight() / 2);
                case 1 /* Top */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, 0);
                case 3 /* Bottom */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
                default:
                    return new AssureNote.Point(0, 0);
            }
        };

        GSNShape.prototype.AddColorStyle = function (ColorStyleCode) {
            if (ColorStyleCode) {
                var Styles = this.ColorStyle.split(" ");
                if (Styles.indexOf(ColorStyleCode) < 0) {
                    Styles.push(ColorStyleCode);
                }
                if (Styles.indexOf(AssureNote.ColorStyle.Default) < 0) {
                    Styles.unshift(AssureNote.ColorStyle.Default);
                }
                this.ColorStyle = Styles.join(" ");
                this.ShapeGroup.setAttribute("class", this.ColorStyle);
            }
        };

        GSNShape.prototype.RemoveColorStyle = function (ColorStyleCode) {
            if (ColorStyleCode) {
                var Styles = this.ColorStyle.split(" ");
                var Index = Styles.indexOf(ColorStyleCode);
                if (Index > 0) {
                    Styles.splice(Index, 1);
                }
                if (Styles.indexOf(AssureNote.ColorStyle.Default) < 0) {
                    Styles.unshift(AssureNote.ColorStyle.Default);
                }
                this.ColorStyle = Styles.join(" ");
                this.ShapeGroup.setAttribute("class", this.ColorStyle);
            }
        };

        GSNShape.prototype.ClearColorStyle = function () {
            this.ColorStyle = AssureNote.ColorStyle.Default;
            this.ShapeGroup.setAttribute("class", this.ColorStyle);
        };
        GSNShape.ArrowPathMaster = null;
        return GSNShape;
    })();
    AssureNote.GSNShape = GSNShape;

    var GSNGoalShape = (function (_super) {
        __extends(GSNGoalShape, _super);
        function GSNGoalShape() {
            _super.apply(this, arguments);
        }
        GSNGoalShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            this.ShapeGroup.appendChild(this.BodyRect);
            if (this.NodeView.IsFolded) {
                this.ModuleRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
                this.ModuleRect.setAttribute("width", "80px");
                this.ModuleRect.setAttribute("height", "13px");
                this.ModuleRect.setAttribute("y", "-13px");
                this.ShapeGroup.appendChild(this.ModuleRect);
            }
            if (this.NodeView.Children == null && !this.NodeView.IsFolded) {
                this.UndevelopedSymbol = AssureNote.AssureNoteUtils.CreateSVGElement("polygon");
                this.UndevelopedSymbol.setAttribute("points", "0 -20 -20 0 0 20 20 0");
                this.ShapeGroup.appendChild(this.UndevelopedSymbol);
            }
        };

        GSNGoalShape.prototype.FitSizeToContent = function () {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
            if (this.NodeView.Children == null && !this.NodeView.IsFolded) {
                var x = (this.GetNodeWidth() / 2).toString();
                var y = (this.GetNodeHeight() + 20).toString();
                this.UndevelopedSymbol.setAttribute("transform", "translate(" + x + "," + y + ")");
                this.UndevelopedSymbol.setAttribute("y", y + "px");
            }
        };

        GSNGoalShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-goal";
        };
        return GSNGoalShape;
    })(GSNShape);
    AssureNote.GSNGoalShape = GSNGoalShape;

    var GSNContextShape = (function (_super) {
        __extends(GSNContextShape, _super);
        function GSNContextShape() {
            _super.apply(this, arguments);
        }
        GSNContextShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
        };

        GSNContextShape.prototype.FitSizeToContent = function () {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
        };

        GSNContextShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-context";
        };
        return GSNContextShape;
    })(GSNShape);
    AssureNote.GSNContextShape = GSNContextShape;

    var GSNStrategyShape = (function (_super) {
        __extends(GSNStrategyShape, _super);
        function GSNStrategyShape() {
            _super.apply(this, arguments);
            this.delta = 20;
        }
        GSNStrategyShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyPolygon = AssureNote.AssureNoteUtils.CreateSVGElement("polygon");
            this.ShapeGroup.appendChild(this.BodyPolygon);
        };

        GSNStrategyShape.prototype.FitSizeToContent = function () {
            var w = this.GetNodeWidth();
            var h = this.GetNodeHeight();
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + w + ",0 " + (w - this.delta) + "," + h + " 0," + h);
        };

        GSNStrategyShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-strategy";
        };

        GSNStrategyShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case 2 /* Right */:
                    return new AssureNote.Point(this.GetNodeWidth() - this.delta / 2, this.GetNodeHeight() / 2);
                case 0 /* Left */:
                    return new AssureNote.Point(this.delta / 2, this.GetNodeHeight() / 2);
                case 1 /* Top */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, 0);
                case 3 /* Bottom */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
            }
        };
        return GSNStrategyShape;
    })(GSNShape);
    AssureNote.GSNStrategyShape = GSNStrategyShape;

    var GSNEvidenceShape = (function (_super) {
        __extends(GSNEvidenceShape, _super);
        function GSNEvidenceShape() {
            _super.apply(this, arguments);
        }
        GSNEvidenceShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyEllipse = AssureNote.AssureNoteUtils.CreateSVGElement("ellipse");
            this.ShapeGroup.appendChild(this.BodyEllipse);
        };

        GSNEvidenceShape.prototype.FitSizeToContent = function () {
            this.BodyEllipse.setAttribute("cx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.GetNodeHeight() / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.GetNodeHeight() / 2).toString());
        };

        GSNEvidenceShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-evidence";
        };
        return GSNEvidenceShape;
    })(GSNShape);
    AssureNote.GSNEvidenceShape = GSNEvidenceShape;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=GSNShape.js.map
