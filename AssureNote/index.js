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

    var GSNViewer = (function () {
        function GSNViewer(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.ViewMap = {};
        }
        GSNViewer.prototype.CreateViewAll = function (Doc) {
            var Keys = Doc.NodeMap.keySet();
            for (var i = 0; i < Keys.length; i++) {
                this.ViewMap[Keys[i]] = new NodeView(Doc.GetNode(Keys[i]));
            }
            if (Doc.TopGoal == null) {
                this.AssureNoteApp.DebugP("Parse Error");
            }
            this.InsertRelative(this.ViewMap[Doc.TopGoal.GetLabel()]);
        };

        GSNViewer.prototype.InsertRelative = function (NodeView) {
            if (NodeView == null) {
                return;
            }
            var Children = NodeView.Model.SubNodeList;
            if (Children == null) {
                return;
            }
            for (var i = 0; i < Children.length; i++) {
                var ChildView = this.ViewMap[Children[i].GetLabel()];
                NodeView.AppendChild(ChildView);
                this.InsertRelative(ChildView);
            }
        };

        GSNViewer.prototype.CreateView = function (Node) {
            if (this.ViewMap[Node.LabelNumber] != null) {
                return false;
            }
            this.ViewMap[Node.LabelNumber] = new NodeView(Node);
            return true;
        };

        GSNViewer.prototype.UpdateView = function (Node) {
            if (this.ViewMap[Node.LabelNumber] == null) {
                return false;
            }
            this.ViewMap[Node.LabelNumber].Update(Node);
            return true;
        };

        GSNViewer.prototype.Clear = function () {
            this.ViewMap = {};
        };

        GSNViewer.prototype.GetKeyList = function () {
            return Object.keys(this.ViewMap);
        };

        GSNViewer.prototype.GetNode = function (Label) {
            return this.ViewMap[Label];
        };
        return GSNViewer;
    })();
    AssureNote.GSNViewer = GSNViewer;

    var NodeView = (function () {
        function NodeView(Model) {
            this.Model = Model;
            this.Left = [];
            this.Right = [];
            this.Children = [];
            this.Shape = null;
            this.Label = Model.GetLabel();
            this.NodeDoc = Model.NodeDoc;
        }
        NodeView.prototype.AppendParent = function (Parent) {
            this.Parent = Parent;
        };

        NodeView.prototype.AppendChild = function (Child) {
            this.Children.push(Child);
            Child.AppendParent(this);
        };

        NodeView.prototype.GetShape = function () {
            if (this.Shape == null) {
                this.IsVisible = true;
                this.Shape = AssureNote.AssureNoteUtils.CreateGSNShape(this);
            }
            return this.Shape;
        };

        NodeView.prototype.GetGx = function () {
            if (this.Parent == null) {
                return this.OffsetGx;
            }
            return this.Parent.GetGx() + this.OffsetGx;
        };

        NodeView.prototype.GetGy = function () {
            if (this.Parent == null) {
                return this.OffsetGy;
            }
            return this.Parent.GetGy() + this.OffsetGy;
        };

        NodeView.prototype.GetNodeType = function () {
            return this.Model.NodeType;
        };

        NodeView.prototype.Render = function (DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            var Shape = this.GetShape();
            Shape.Render();
            Shape.CreateSVG(SvgNodeFrag, SvgConnectionFrag);
            Shape.CreateHtmlContent(DivFrag);
        };

        NodeView.prototype.Update = function (Model) {
            //TODO
            this.Model = Model;
            throw "Update is under construction.";
        };

        NodeView.prototype.Resize = function (LayoutEngine) {
            this.GetShape().Resize(LayoutEngine);
        };
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;

    var GSNShape = (function () {
        function GSNShape(NodeView) {
            this.NodeView = NodeView;
            this.ColorClassName = AssureNote.Color.Default;
            this.Content = null;
        }
        GSNShape.CreateArrowPath = function () {
            if (!GSNShape.ArrowPathMaster) {
                GSNShape.ArrowPathMaster = AssureNote.AssureNoteUtils.CreateSVGElement("path");
                GSNShape.ArrowPathMaster.setAttribute("marker-end", "url(#Triangle-black)");
                GSNShape.ArrowPathMaster.setAttribute("fill", "none");
                GSNShape.ArrowPathMaster.setAttribute("stroke", "gray");
                GSNShape.ArrowPathMaster.setAttribute("d", "M0,0 C0,0 0,0 0,0");
            }
            return GSNShape.ArrowPathMaster.cloneNode();
        };

        GSNShape.prototype.GetWidth = function () {
            if (this.Width == null) {
                this.Width = 250;
            }
            return this.Width;
        };

        GSNShape.prototype.GetHeight = function () {
            if (this.Height == null) {
                this.Height = 100;
            }
            return this.Height;
        };

        GSNShape.prototype.Resize = function (LayoutEngine) {
            //this.Width = HTMLDoc.Width;
            //this.Height = HTMLDoc.Height;
            LayoutEngine.Layout(this.NodeView, this);
            this.NodeView.OffsetGx = this.Width / 2;
            this.NodeView.OffsetGy = AssureNote.LevelMargin;
        };

        GSNShape.prototype.CreateHtmlContent = function (Content) {
            if (this.NodeView.IsVisible) {
                var div = document.createElement("div");
                div.style.position = "absolute";
                div.id = this.NodeView.Label;

                var h4 = document.createElement("h4");
                h4.innerText = this.NodeView.Label;

                var p = document.createElement("p");
                p.innerText = this.NodeView.NodeDoc;

                div.appendChild(h4);
                div.appendChild(p);
                Content.appendChild(div);
            }
        };

        GSNShape.prototype.CreateSVG = function (SvgNodeFrag, SvgConnectionFrag) {
            SvgNodeFrag.appendChild(this.ShapeGroup);
            if (this.ArrowPath != null) {
                SvgConnectionFrag.appendChild(this.ArrowPath);
            }
        };

        GSNShape.prototype.SetPosition = function (x, y) {
            if (this.NodeView.IsVisible) {
                var div = document.getElementById(this.NodeView.Label);
                if (div != null) {
                    div.style.left = x + "px";
                    div.style.top = y + "px";
                }
                var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
                mat.e = x;
                mat.f = y;
            }
        };

        GSNShape.prototype.Render = function () {
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
                    return new AssureNote.Point(this.Width, this.Height / 2);
                case AssureNote.Direction.Left:
                    return new AssureNote.Point(0, this.Height / 2);
                case AssureNote.Direction.Top:
                    return new AssureNote.Point(this.Width / 2, 0);
                case AssureNote.Direction.Bottom:
                    return new AssureNote.Point(this.Width / 2, this.Height);
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
        GSNGoalShape.prototype.Render = function () {
            _super.prototype.Render.call(this);
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
            this.BodyRect.setAttribute("width", this.GetWidth().toString());
            this.BodyRect.setAttribute("height", this.GetHeight().toString());
        };
        return GSNGoalShape;
    })(GSNShape);
    AssureNote.GSNGoalShape = GSNGoalShape;

    var GSNContextShape = (function (_super) {
        __extends(GSNContextShape, _super);
        function GSNContextShape() {
            _super.apply(this, arguments);
        }
        GSNContextShape.prototype.Render = function () {
            _super.prototype.Render.call(this);
            this.BodyRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            this.BodyRect.setAttribute("class", this.ColorClassName);
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize();
        };

        GSNContextShape.prototype.Resize = function () {
            //super.Resize();
            this.BodyRect.setAttribute("width", this.GetWidth().toString());
            this.BodyRect.setAttribute("height", this.GetHeight().toString());
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
        GSNStrategyShape.prototype.Render = function () {
            _super.prototype.Render.call(this);
            this.BodyPolygon = AssureNote.AssureNoteUtils.CreateSVGElement("polygon");

            //this.BodyPolygon = AssureNoteUtils.CreateSVGElement("use");
            this.BodyPolygon.setAttribute("class", this.ColorClassName);

            //this.BodyPolygon.setAttribute("xlink:href", "#strategy-master");
            this.ShapeGroup.appendChild(this.BodyPolygon);
            this.Resize();
        };

        GSNStrategyShape.prototype.Resize = function () {
            var w = this.GetWidth();
            var h = this.GetHeight();
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
                    return new AssureNote.Point(this.GetWidth() - this.delta / 2, this.GetHeight() / 2);
                case AssureNote.Direction.Left:
                    return new AssureNote.Point(this.delta / 2, this.GetHeight() / 2);
                case AssureNote.Direction.Top:
                    return new AssureNote.Point(this.GetWidth() / 2, 0);
                case AssureNote.Direction.Bottom:
                    return new AssureNote.Point(this.GetWidth() / 2, this.GetHeight());
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
        GSNEvidenceShape.prototype.Render = function () {
            _super.prototype.Render.call(this);
            this.BodyEllipse = AssureNote.AssureNoteUtils.CreateSVGElement("ellipse");

            //this.BodyEllipse = AssureNoteUtils.CreateSVGElement("use");
            this.BodyEllipse.setAttribute("class", this.ColorClassName);

            //this.BodyEllipse.setAttribute("xlink:href", "#evidence-master");
            this.ShapeGroup.appendChild(this.BodyEllipse);
            this.Resize();
        };

        GSNEvidenceShape.prototype.Resize = function () {
            this.BodyEllipse.setAttribute("cx", (this.GetWidth() / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.GetHeight() / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.GetWidth() / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.GetHeight() / 2).toString());
        };
        return GSNEvidenceShape;
    })(GSNShape);
    AssureNote.GSNEvidenceShape = GSNEvidenceShape;
})(AssureNote || (AssureNote = {}));

$(function () {
    var AssureNoteApp = new AssureNote.AssureNoteApp();
    //var node = new AssureNote.GSNNode(new AssureNote.GSNDoc(), null, 1, AssureNote.GSNType.Strategy, "G1", []);
    //var nodeview = new AssureNote.NodeView(node);
    //nodeview.Render();
    //var ele = nodeview.Shape.GetSVG();
    //document.getElementById("svg-node").appendChild(ele);
    //$("#editor-wrapper").hide();
});
//# sourceMappingURL=index.js.map
