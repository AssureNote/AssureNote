///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/AssureNoteParser.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/PluginManager.ts'/>
///<reference path='src/CaseViewer.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var ColorStyle = (function () {
        function ColorStyle() {
        }
        return ColorStyle;
    })();
    AssureNote.ColorStyle = ColorStyle;

    var NodeView = (function () {
        function NodeView(Model, IsRecursive) {
            this.Model = Model;
            this.RelativeX = 0;
            this.RelativeY = 0;
            this.Left = null;
            this.Right = null;
            this.Children = null;
            this.Shape = null;
            this.Label = Model.GetLabel();
            this.NodeDoc = Model.NodeDoc;
            this.IsVisible = true;
            if (IsRecursive && Model.SubNodeList != null) {
                for (var i = 0; i < Model.SubNodeList.length; i++) {
                    var SubNode = Model.SubNodeList[i];
                    var SubView = new NodeView(SubNode, IsRecursive);
                    if (SubNode.NodeType == GSNType.Context) {
                        // Layout Engine allowed to move a node left-side
                        this.AppendRightNode(SubView);
                    } else {
                        this.AppendChild(SubView);
                    }
                }
            }
        }
        NodeView.prototype.UpdateViewMap = function (ViewMap) {
            ViewMap[this.Label] = this;
            if (this.Left != null) {
                for (var i = 0; i < this.Left.length; i++) {
                    this.Left[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Right != null) {
                for (var i = 0; i < this.Right.length; i++) {
                    this.Right[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Children != null) {
                for (var i = 0; i < this.Children.length; i++) {
                    this.Children[i].UpdateViewMap(ViewMap);
                }
            }
        };

        NodeView.prototype.AppendChild = function (SubNode) {
            if (this.Children == null) {
                this.Children = [];
            }
            this.Children.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.AppendLeftNode = function (SubNode) {
            if (this.Left == null) {
                this.Left = [];
            }
            this.Left.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.AppendRightNode = function (SubNode) {
            if (this.Right == null) {
                this.Right = [];
            }
            this.Right.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.GetShape = function () {
            if (this.Shape == null) {
                this.Shape = AssureNote.AssureNoteUtils.CreateGSNShape(this);
            }
            return this.Shape;
        };

        NodeView.prototype.GetDocumentWx = function (wx) {
            if (this.Parent == null) {
                return wx + this.RelativeX;
            }
            return this.Parent.GetDocumentWx(wx) + this.RelativeX;
        };

        NodeView.prototype.GetDocumentWy = function (wy) {
            if (this.Parent == null) {
                return wy + this.RelativeY;
            }
            return this.Parent.GetDocumentWy(wy) + this.RelativeY;
        };

        NodeView.prototype.GetNodeType = function () {
            return this.Model.NodeType;
        };

        NodeView.prototype.CreateElement = function () {
        };

        NodeView.prototype.Render = function (DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            this.Shape.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
        };

        NodeView.prototype.Update = function (Model) {
            //TODO
            this.Model = Model;
            throw "Update is under construction.";
        };

        //deprecated
        NodeView.prototype.Resize = function () {
            //this.Shape.Resize();
        };

        NodeView.prototype.GetDocumentConnectorPosition = function (Dir, wx, wy) {
            var p = this.Shape.GetConnectorPosition(Dir);

            p.x += this.GetDocumentWx(wx);
            p.y += this.GetDocumentWy(wy);
            return p;
        };

        NodeView.prototype.SetArrowPosition = function (p1, p2, dir) {
            this.Shape.SetArrowPosition(p1, p2, dir);
        };

        NodeView.prototype.SetDocumentPosition = function (wx, wy) {
            if (this.IsVisible) {
                AssureNote.AssureNoteApp.Assert((this.Shape != null));
                this.Shape.SetPosition(this.GetDocumentWx(wx), this.GetDocumentWy(wy));
                if (this.Children != null) {
                    for (var i = 0; i < this.Children.length; i++) {
                        var SubNode = this.Children[i];
                        SubNode.SetDocumentPosition(wx, wy);
                        var P1 = this.GetDocumentConnectorPosition(AssureNote.Direction.Bottom, wx, wy);
                        var P2 = SubNode.GetDocumentConnectorPosition(AssureNote.Direction.Top, wx, wy);
                        SubNode.SetArrowPosition(P1, P2, AssureNote.Direction.Bottom);
                    }
                }
                if (this.Right != null) {
                    for (var i = 0; i < this.Right.length; i++) {
                        var SubNode = this.Right[i];
                        SubNode.SetDocumentPosition(wx, wy);
                        var P1 = this.GetDocumentConnectorPosition(AssureNote.Direction.Right, wx, wy);
                        var P2 = SubNode.GetDocumentConnectorPosition(AssureNote.Direction.Left, wx, wy);
                        SubNode.SetArrowPosition(P1, P2, AssureNote.Direction.Left);
                    }
                }
                if (this.Left != null) {
                    for (var i = 0; i < this.Left.length; i++) {
                        var SubNode = this.Left[i];
                        SubNode.SetDocumentPosition(wx, wy);
                        var P1 = this.GetDocumentConnectorPosition(AssureNote.Direction.Left, wx, wy);
                        var P2 = SubNode.GetDocumentConnectorPosition(AssureNote.Direction.Right, wx, wy);
                        SubNode.SetArrowPosition(P1, P2, AssureNote.Direction.Right);
                    }
                }
            }
        };
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;

    var Rect = (function () {
        function Rect(X, Y, Width, Height) {
            this.X = X;
            this.Y = Y;
            this.Width = Width;
            this.Height = Height;
        }
        Rect.prototype.toString = function () {
            return "(" + [this.X, this.Y, this.Width, this.Height].join(", ") + ")";
        };
        return Rect;
    })();
    AssureNote.Rect = Rect;

    var GSNShape = (function () {
        function GSNShape(NodeView) {
            this.NodeView = NodeView;
            this.ColorClassName = AssureNote.Color.Default;
            this.Content = null;
            this.NodeWidth = 250;
            this.NodeHeight = 0;
            this.TreeBoundingBox = new Rect(0, 0, 0, 0);
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

        GSNShape.prototype.GetTreeLeftX = function () {
            return this.TreeBoundingBox.X;
        };

        GSNShape.prototype.GetTreeUpperY = function () {
            return this.TreeBoundingBox.Y;
        };

        GSNShape.prototype.SetTreeUpperLeft = function (X, Y) {
            this.TreeBoundingBox.X = X;
            this.TreeBoundingBox.Y = Y;
        };

        GSNShape.prototype.UpdateHtmlClass = function () {
            switch (this.NodeView.Model.NodeType) {
                case GSNType.Goal:
                    this.Content.className = "node node-goal";
                    break;
                case GSNType.Context:
                    this.Content.className = "node node-context";
                    break;
                case GSNType.Strategy:
                    this.Content.className = "node node-strategy";
                    break;
                case GSNType.Evidence:
                default:
                    this.Content.className = "node node-evidence";
                    break;
            }
        };

        GSNShape.prototype.PrerenderHTMLContent = function () {
            if (this.Content == null) {
                var div = document.createElement("div");
                this.Content = div;

                div.style.position = "absolute";
                div.id = this.NodeView.Label;

                var h4 = document.createElement("h4");
                h4.innerText = this.NodeView.Label;

                var p = document.createElement("p");
                p.innerText = this.NodeView.NodeDoc;

                this.UpdateHtmlClass();

                div.appendChild(h4);
                div.appendChild(p);
            }
        };

        GSNShape.prototype.PrerenderContent = function () {
            this.PrerenderHTMLContent();
            this.PrerenderSVGContent();
        };

        GSNShape.prototype.Render = function (HtmlContentFragment, SvgNodeFragment, SvgConnectionFragment) {
            SvgNodeFragment.appendChild(this.ShapeGroup);
            if (this.ArrowPath != null && this.NodeView.Parent != null) {
                SvgConnectionFragment.appendChild(this.ArrowPath);
            }
            HtmlContentFragment.appendChild(this.Content);
            this.Resize();
        };

        GSNShape.prototype.Resize = function () {
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
        };

        GSNShape.prototype.PrerenderSVGContent = function () {
            this.ShapeGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = GSNShape.CreateArrowPath();
        };

        GSNShape.prototype.SetArrowPosition = function (p1, p2, dir) {
            var start = this.ArrowPath.pathSegList.getItem(0);
            var curve = this.ArrowPath.pathSegList.getItem(1);
            start.x = p1.x;
            start.y = p1.y;
            curve.x = p2.x;
            curve.y = p2.y;
            if (dir == AssureNote.Direction.Bottom || dir == AssureNote.Direction.Top) {
                curve.x1 = (9 * p1.x + p2.x) / 10;
                curve.y1 = (p1.y + p2.y) / 2;
                curve.x2 = (9 * p2.x + p1.x) / 10;
                curve.y2 = (p1.y + p2.y) / 2;
            } else {
                curve.x1 = (p1.x + p2.x) / 2;
                curve.y1 = (9 * p1.y + p2.y) / 10;
                curve.x2 = (p1.x + p2.x) / 2;
                curve.y2 = (9 * p2.y + p1.y) / 10;
            }
        };

        GSNShape.prototype.SetArrowColorWhite = function (white) {
            if (white) {
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
        GSNShape.ArrowPathMaster = null;
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

            //this.BodyRect = AssureNoteUtils.CreateSVGElement("use");
            //this.BodyRect.setAttribute("xlink:href", "#goal-masterhoge");
            this.BodyRect.setAttribute("class", this.ColorClassName);

            //this.UndevelopedSymbol = AssureNoteUtils.CreateSVGElement("use");
            //this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");
            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize();
        };

        GSNGoalShape.prototype.Resize = function () {
            //super.Resize(CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
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
            this.BodyRect.setAttribute("class", this.ColorClassName);
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize();
        };

        GSNContextShape.prototype.Resize = function () {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
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

            //this.BodyPolygon = AssureNoteUtils.CreateSVGElement("use");
            this.BodyPolygon.setAttribute("class", this.ColorClassName);

            //this.BodyPolygon.setAttribute("xlink:href", "#strategy-master");
            this.ShapeGroup.appendChild(this.BodyPolygon);
            this.Resize();
        };

        GSNStrategyShape.prototype.Resize = function () {
            var w = this.GetNodeWidth();
            var h = this.GetNodeHeight();
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + w + ",0 " + (w - this.delta) + "," + h + " 0," + h);
        };

        //SetColor(key: string) {
        //	this.BodyPolygon.setAttribute("class", key);
        //}
        //GetColor() {
        //	return this.BodyPolygon.getAttribute("class");
        //}
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

            //this.BodyEllipse = AssureNoteUtils.CreateSVGElement("use");
            this.BodyEllipse.setAttribute("class", this.ColorClassName);

            //this.BodyEllipse.setAttribute("xlink:href", "#evidence-master");
            this.ShapeGroup.appendChild(this.BodyEllipse);
            this.Resize();
        };

        GSNEvidenceShape.prototype.Resize = function () {
            this.BodyEllipse.setAttribute("cx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.GetNodeHeight() / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.GetNodeHeight() / 2).toString());
        };
        return GSNEvidenceShape;
    })(GSNShape);
    AssureNote.GSNEvidenceShape = GSNEvidenceShape;
})(AssureNote || (AssureNote = {}));

$(function () {
    var AssureNoteApp = new AssureNote.AssureNoteApp();

    var Menu = [];
    Menu.push(new AssureNote.SideMenuContent("#", "Download", "download-wgsn", "glyphicon-floppy-disk", function (ev) {
        var Writer = new StringWriter();
        AssureNoteApp.MasterRecord.FormatRecord(Writer);
        AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), "downlaod.wgsn");
    }));
    AssureNote.SideMenu.Create(Menu);
});
//# sourceMappingURL=index.js.map
