///<reference path='./AssureNote.ts'/>
///<reference path='./CommandLine.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='./Editor.ts'/>
///<reference path='./NodeView.ts'/>
///<reference path='./AssureNoteUtils.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>
var AssureNote;
(function (AssureNote) {
    var GSNShape = (function () {
        function GSNShape(NodeView) {
            this.NodeView = NodeView;
            this.ColorStyle = "";
            this.GX = null;
            this.GY = null;
            this.PreviousAnimateElement = null;
            this.PreviousArrowAnimateElement = null;
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
                this.TreeBoundingBox.Width = 250;
            }
            return this.TreeBoundingBox.Width;
        };

        GSNShape.prototype.GetTreeHeight = function () {
            if (this.TreeBoundingBox.Height == 0) {
                this.TreeBoundingBox.Height = 100;
            }
            return this.TreeBoundingBox.Height;
        };

        GSNShape.prototype.GetHeadWidth = function () {
            if (this.HeadBoundingBox.Width == 0) {
                this.HeadBoundingBox.Width = 250;
            }
            return this.HeadBoundingBox.Width;
        };

        GSNShape.prototype.GetHeadHeight = function () {
            if (this.HeadBoundingBox.Height == 0) {
                this.HeadBoundingBox.Height = 100;
            }
            return this.HeadBoundingBox.Height;
        };

        GSNShape.prototype.GetTreeLeftX = function () {
            return this.TreeBoundingBox.X;
        };

        GSNShape.prototype.GetHeadLeftX = function () {
            return this.HeadBoundingBox.X;
        };

        GSNShape.prototype.SetTreeUpperLeft = function (X, Y) {
            this.TreeBoundingBox.X = X;
            this.TreeBoundingBox.Y = Y;
        };

        GSNShape.prototype.SetHeadUpperLeft = function (X, Y) {
            this.HeadBoundingBox.X = X;
            this.HeadBoundingBox.Y = Y;
        };

        GSNShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node";
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
                p.innerHTML = manager.InvokeHTMLRenderPlugin(this.NodeView.NodeDoc.trim(), this.NodeView.Model);
                this.UpdateHtmlClass();
                div.appendChild(h4);
                div.appendChild(p);
            }
        };

        GSNShape.prototype.PrerenderContent = function (manager) {
            this.PrerenderHTMLContent(manager);
            this.PrerenderSVGContent();
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

        GSNShape.GetCSSAnimationID = function () {
            return GSNShape.CSSAnimationDefinitionCount++;
        };

        GSNShape.prototype.RemoveAnimateElement = function (Animate) {
            if (Animate) {
                var Parent = Animate.parentNode;
                if (Parent) {
                    Parent.removeChild(Animate);
                }
            }
        };

        GSNShape.prototype.SetPosition = function (x, y, Duration, CSSAnimationBuffer) {
            if (this.NodeView.IsVisible) {
                var div = this.Content;
                if (div != null) {
                    div.style.left = x + "px";
                    div.style.top = y + "px";
                    if (Duration > 0) {
                        var AnimationName = "GSNNodeCSSAnim" + GSNShape.GetCSSAnimationID();
                        if (this.PreviousAnimateElement) {
                            this.RemoveAnimateElement(this.PreviousAnimateElement);
                            this.PreviousAnimateElement = null;
                        }
                        var AnimationStyleString = AnimationName + " " + Duration / 1000 + "s ease-out";
                        this.Content.style["animation"] = AnimationStyleString;
                        this.Content.style["MozAnimation"] = AnimationStyleString;
                        this.Content.style["webkitAnimation"] = AnimationStyleString;
                        this.Content.style["msAnimation"] = AnimationStyleString;
                        var AnimateElement;
                        if (this.GX == null || this.GY == null) {
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSFadeinAnimationDefinition("-webkit-", AnimationName));
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSFadeinAnimationDefinition("-moz-", AnimationName));
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSFadeinAnimationDefinition("-ms-", AnimationName));
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSFadeinAnimationDefinition("", AnimationName));
                            AnimateElement = AssureNote.AssureNoteUtils.CreateSVGFadeinAnimateElement(Duration);
                        } else {
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSMoveAnimationDefinition("-webkit-", AnimationName, this.GX, this.GY));
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSMoveAnimationDefinition("-moz-", AnimationName, this.GX, this.GY));
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSMoveAnimationDefinition("-ms-", AnimationName, this.GX, this.GY));
                            CSSAnimationBuffer.push(AssureNote.AssureNoteUtils.CreateCSSMoveAnimationDefinition("", AnimationName, this.GX, this.GY));
                            AnimateElement = AssureNote.AssureNoteUtils.CreateSVGMoveAnimateElement(Duration, this.GX - x, this.GY - y);
                        }
                        this.ShapeGroup.appendChild(AnimateElement);
                        AnimateElement.beginElement();
                        this.PreviousAnimateElement = AnimateElement;
                    }
                }
                var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
                mat.e = x;
                mat.f = y;
            }
            this.GX = x;
            this.GY = y;
        };

        GSNShape.prototype.ClearAnimationCache = function () {
            this.GX = null;
            this.GY = null;
            if (this.Content) {
                this.Content.style.removeProperty("animation");
                this.Content.style.removeProperty("MozAnimation");
                this.Content.style.removeProperty("webkitAnimation");
                this.Content.style.removeProperty("msAnimation");
            }
            if (this.PreviousAnimateElement) {
                this.RemoveAnimateElement(this.PreviousAnimateElement);
                this.PreviousAnimateElement = null;
            }
            if (this.PreviousArrowAnimateElement) {
                this.RemoveAnimateElement(this.PreviousArrowAnimateElement);
                this.PreviousArrowAnimateElement = null;
            }
        };

        GSNShape.prototype.PrerenderSVGContent = function () {
            this.ShapeGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = GSNShape.CreateArrowPath();
        };

        GSNShape.prototype.SetArrowPosition = function (P1, P2, Dir, Duration) {
            var start = this.ArrowPath.pathSegList.getItem(0);
            var curve = this.ArrowPath.pathSegList.getItem(1);
            start.x = P1.X;
            start.y = P1.Y;
            curve.x = P2.X;
            curve.y = P2.Y;
            if (Dir == AssureNote.Direction.Bottom || Dir == AssureNote.Direction.Top) {
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
            if (Duration > 0) {
                var NewPath = this.ArrowPath.getAttribute("d");
                if (this.PreviousArrowAnimateElement) {
                    this.RemoveAnimateElement(this.PreviousArrowAnimateElement);
                    this.PreviousArrowAnimateElement = null;
                }
                if (this.GX == null || this.GY == null) {
                    var AnimateElement = AssureNote.AssureNoteUtils.CreateSVGFadeinAnimateElement(Duration);
                } else {
                    var AnimateElement = AssureNote.AssureNoteUtils.CreateSVGArrowAnimateElement(Duration, this.OldArrowPath, NewPath);
                }

                this.ArrowPath.appendChild(AnimateElement);
                AnimateElement.beginElement();
                this.PreviousArrowAnimateElement = AnimateElement;
                this.OldArrowPath = NewPath;
            }
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
                case AssureNote.Direction.Right:
                    return new AssureNote.Point(this.GetNodeWidth(), this.GetNodeHeight() / 2);
                case AssureNote.Direction.Left:
                    return new AssureNote.Point(0, this.GetNodeHeight() / 2);
                case AssureNote.Direction.Top:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, 0);
                case AssureNote.Direction.Bottom:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
                default:
                    return new AssureNote.Point(0, 0);
            }
        };

        GSNShape.prototype.ChangeColorStyle = function (ColorStyleCode) {
            this.ColorStyle = (ColorStyleCode != AssureNote.ColorStyle.Default) ? ColorStyleCode : "";
        };
        GSNShape.ArrowPathMaster = null;

        GSNShape.CSSAnimationDefinitionCount = 0;
        return GSNShape;
    })();
    AssureNote.GSNShape = GSNShape;

    var GSNGoalShape = (function (_super) {
        __extends(GSNGoalShape, _super);
        function GSNGoalShape() {
            _super.apply(this, arguments);
        }
        GSNGoalShape.prototype.PrerenderSVGContent = function () {
            _super.prototype.PrerenderSVGContent.call(this);
            this.BodyRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            this.BodyRect.setAttribute("class", AssureNote.ColorStyle.Default);
            this.ShapeGroup.appendChild(this.BodyRect);
            if (this.NodeView.IsFolded) {
                this.ModuleRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
                this.ModuleRect.setAttribute("class", AssureNote.ColorStyle.Default);
                this.ModuleRect.setAttribute("width", "80px");
                this.ModuleRect.setAttribute("height", "13px");
                this.ModuleRect.setAttribute("y", "-13px");
                this.ShapeGroup.appendChild(this.ModuleRect);
            }
            if (this.NodeView.Children == null && !this.NodeView.IsFolded) {
                this.UndevelopedSymbol = AssureNote.AssureNoteUtils.CreateSVGElement("polygon");
                this.UndevelopedSymbol.setAttribute("points", "0 -20 -20 0 0 20 20 0");
                this.UndevelopedSymbol.setAttribute("class", AssureNote.ColorStyle.Default);
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

        GSNGoalShape.prototype.ChangeColorStyle = function (ColorStyleCode) {
            _super.prototype.ChangeColorStyle.call(this, ColorStyleCode);
            this.BodyRect.setAttribute("class", AssureNote.ColorStyle.Default + " " + this.ColorStyle);
        };
        return GSNGoalShape;
    })(GSNShape);
    AssureNote.GSNGoalShape = GSNGoalShape;

    var GSNContextShape = (function (_super) {
        __extends(GSNContextShape, _super);
        function GSNContextShape() {
            _super.apply(this, arguments);
        }
        GSNContextShape.prototype.PrerenderSVGContent = function () {
            _super.prototype.PrerenderSVGContent.call(this);
            this.BodyRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            this.BodyRect.setAttribute("class", AssureNote.ColorStyle.Default);
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

        GSNContextShape.prototype.ChangeColorStyle = function (ColorStyleCode) {
            _super.prototype.ChangeColorStyle.call(this, ColorStyleCode);
            this.BodyRect.setAttribute("class", AssureNote.ColorStyle.Default + " " + this.ColorStyle);
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
        GSNStrategyShape.prototype.PrerenderSVGContent = function () {
            _super.prototype.PrerenderSVGContent.call(this);
            this.BodyPolygon = AssureNote.AssureNoteUtils.CreateSVGElement("polygon");
            this.BodyPolygon.setAttribute("class", AssureNote.ColorStyle.Default);
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
                case AssureNote.Direction.Right:
                    return new AssureNote.Point(this.GetNodeWidth() - this.delta / 2, this.GetNodeHeight() / 2);
                case AssureNote.Direction.Left:
                    return new AssureNote.Point(this.delta / 2, this.GetNodeHeight() / 2);
                case AssureNote.Direction.Top:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, 0);
                case AssureNote.Direction.Bottom:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
            }
        };

        GSNStrategyShape.prototype.ChangeColorStyle = function (ColorStyleCode) {
            _super.prototype.ChangeColorStyle.call(this, ColorStyleCode);
            this.BodyPolygon.setAttribute("class", AssureNote.ColorStyle.Default + " " + this.ColorStyle);
        };
        return GSNStrategyShape;
    })(GSNShape);
    AssureNote.GSNStrategyShape = GSNStrategyShape;

    var GSNEvidenceShape = (function (_super) {
        __extends(GSNEvidenceShape, _super);
        function GSNEvidenceShape() {
            _super.apply(this, arguments);
        }
        GSNEvidenceShape.prototype.PrerenderSVGContent = function () {
            _super.prototype.PrerenderSVGContent.call(this);
            this.BodyEllipse = AssureNote.AssureNoteUtils.CreateSVGElement("ellipse");
            this.BodyEllipse.setAttribute("class", AssureNote.ColorStyle.Default);
            this.ShapeGroup.appendChild(this.BodyEllipse);
        };

        GSNEvidenceShape.prototype.GetNodeHeight = function () {
            if (this["NodeHeight"] == 0) {
                this["NodeHeight"] = Math.max(this.Content.clientHeight, this.GetNodeWidth());
            }
            return this["NodeHeight"];
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

        GSNEvidenceShape.prototype.ChangeColorStyle = function (ColorStyleCode) {
            _super.prototype.ChangeColorStyle.call(this, ColorStyleCode);
            this.BodyEllipse.setAttribute("class", AssureNote.ColorStyle.Default + " " + this.ColorStyle);
        };
        return GSNEvidenceShape;
    })(GSNShape);
    AssureNote.GSNEvidenceShape = GSNEvidenceShape;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=GSNShape.js.map
