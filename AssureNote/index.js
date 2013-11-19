///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
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
    var GSNRecord = (function () {
        function GSNRecord() {
        }
        GSNRecord.prototype.Parse = function (file) {
        };
        return GSNRecord;
    })();
    AssureNote.GSNRecord = GSNRecord;

    var GSNDoc = (function () {
        function GSNDoc() {
        }
        return GSNDoc;
    })();
    AssureNote.GSNDoc = GSNDoc;

    var GSNNode = (function () {
        function GSNNode() {
        }
        return GSNNode;
    })();
    AssureNote.GSNNode = GSNNode;

    (function (GSNType) {
        GSNType[GSNType["Goal"] = 0] = "Goal";
        GSNType[GSNType["Context"] = 1] = "Context";
        GSNType[GSNType["Strategy"] = 2] = "Strategy";
        GSNType[GSNType["Evidence"] = 3] = "Evidence";
        GSNType[GSNType["Undefined"] = 4] = "Undefined";
    })(AssureNote.GSNType || (AssureNote.GSNType = {}));
    var GSNType = AssureNote.GSNType;

    var Navigator = (function () {
        function Navigator() {
        }
        Navigator.prototype.Display = function (Label, Wx, Wy) {
            //TODO
        };

        Navigator.prototype.Redraw = function () {
            this.Display(this.FocusedLabel, this.FocusedWx, this.FocusedWy);
        };

        Navigator.prototype.NavigateUp = function () {
        };
        Navigator.prototype.NavigateDown = function () {
        };
        Navigator.prototype.NavigateLeft = function () {
        };
        Navigator.prototype.NavigateRight = function () {
        };
        Navigator.prototype.NavigateHome = function () {
        };
        return Navigator;
    })();
    AssureNote.Navigator = Navigator;

    var ColorStyle = (function () {
        function ColorStyle() {
        }
        return ColorStyle;
    })();
    AssureNote.ColorStyle = ColorStyle;

    var NodeView = (function () {
        function NodeView() {
            this.Shape = null;
        }
        NodeView.prototype.GetShape = function () {
            if (this.Shape == null) {
                this.Shape = AssureNote.AssureNoteUtils.CreateGSNShape(this);
            }
            return this.Shape;
        };

        NodeView.prototype.GetGx = function () {
            if (this.Parent == null) {
                return this.OffsetGx;
            }
            return this.GetGx() + this.OffsetGx;
        };

        NodeView.prototype.GetGy = function () {
            if (this.Parent == null) {
                return this.OffsetGy;
            }
            return this.GetGy() + this.OffsetGy;
        };
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;

    var GSNShape = (function () {
        function GSNShape(NodeView) {
            this.NodeView = NodeView;
            this.Width = 0;
            this.Height = 0;
            this.Content = null;
        }
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
                p.innerText = this.NodeView.Label;

                div.appendChild(h4);
                div.appendChild(p);
                Content.appendChild(div);
            }
        };

        GSNShape.prototype.SetPosition = function (x, y) {
            if (this.NodeView.IsVisible) {
                var div = document.getElementById(this.NodeView.Label);
                if (div != null) {
                    div.style.left = x + "px";
                    div.style.top = y + "px";
                }
            }
        };

        GSNShape.prototype.Render = function () {
            this.ShapeGroup = document.createSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ArrowPath = document.createSVGElement("path");
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            this.ArrowPath.setAttribute("fill", "none");
            this.ArrowPath.setAttribute("stroke", "gray");
            this.ArrowPath.setAttribute("d", "M0,0 C0,0 0,0 0,0");
        };

        GSNShape.prototype.GetSVG = function () {
            return this.ShapeGroup;
        };

        GSNShape.prototype.GetSVGPath = function () {
            return this.ArrowPath;
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

        GSNShape.prototype.GetWidth = function () {
            return 0;
        };

        GSNShape.prototype.GetHeight = function () {
            return 0;
        };
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
            this.BodyRect = document.createSVGElement("rect");
            this.BodyRect.setAttribute("class", this.ColorClassName);
            this.UndevelopedSymbol = document.createSVGElement("use");
            this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");
            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize();
        };

        GSNGoalShape.prototype.Resize = function () {
            //super.Resize(CaseViewer, NodeModel, HTMLDoc);
            this.BodyRect.setAttribute("width", this.GetWidth().toString());
            this.BodyRect.setAttribute("height", this.GetHeight().toString());
        };

        GSNGoalShape.prototype.SetColor = function (key) {
            this.BodyRect.setAttribute("class", key);
        };

        GSNGoalShape.prototype.GetColor = function () {
            return this.BodyRect.getAttribute("class");
        };

        GSNGoalShape.prototype.EnableHighlight = function () {
            var CurrentColor = this.GetColor();
            if (!CurrentColor.match(/-highlight/)) {
                this.BodyRect.removeAttribute("class");
                this.BodyRect.setAttribute("class", CurrentColor + "-highlight");
            }
        };

        GSNGoalShape.prototype.DisableHighlight = function () {
            var CurrentColor = this.GetColor();
            this.BodyRect.removeAttribute("class");
            this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
        };

        GSNGoalShape.prototype.SetUndevelolpedSymbolPosition = function (point) {
            this.UndevelopedSymbol.setAttribute("x", point.x.toString());
            this.UndevelopedSymbol.setAttribute("y", point.y.toString());
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
            this.BodyRect = document.createSVGElement("rect");
            this.BodyRect.setAttribute("class", this.ColorClassName);
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
            this.Resize();
        };

        GSNContextShape.prototype.Resize = function () {
            //super.Resize();
            this.BodyRect.setAttribute("width", this.Width.toString());
            this.BodyRect.setAttribute("height", this.Height.toString());
        };

        GSNContextShape.prototype.SetColor = function (key) {
            this.BodyRect.setAttribute("class", key);
        };

        GSNContextShape.prototype.GetColor = function () {
            return this.BodyRect.getAttribute("class");
        };

        GSNContextShape.prototype.EnableHighlight = function () {
            var CurrentColor = this.GetColor();
            if (!CurrentColor.match(/-highlight/)) {
                this.BodyRect.removeAttribute("class");
                this.BodyRect.setAttribute("class", CurrentColor + "-highlight");
            }
        };

        GSNContextShape.prototype.DisableHighlight = function () {
            var CurrentColor = this.GetColor();
            this.BodyRect.removeAttribute("class");
            this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
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
            this.BodyPolygon = document.createSVGElement("polygon");
            this.BodyPolygon.setAttribute("class", this.ColorClassName);
            this.ShapeGroup.appendChild(this.BodyPolygon);
            this.Resize();
        };

        GSNStrategyShape.prototype.Resize = function () {
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + this.Width + ",0 " + (this.Width - this.delta) + "," + this.Height + " 0," + this.Height);
        };

        GSNStrategyShape.prototype.SetColor = function (key) {
            this.BodyPolygon.setAttribute("class", key);
        };

        GSNStrategyShape.prototype.GetColor = function () {
            return this.BodyPolygon.getAttribute("class");
        };

        //EnableHighlight() {
        //	var CurrentColor: string = this.GetColor();
        //	if (!CurrentColor.match(/-highlight/)) {
        //		this.BodyPolygon.removeAttribute("class");
        //		this.BodyPolygon.setAttribute("class", CurrentColor + "-highlight");
        //	}
        //}
        //DisableHighlight() {
        //	var CurrentColor: string = this.GetColor();
        //	this.BodyPolygon.removeAttribute("class");
        //	this.BodyPolygon.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
        //}
        GSNStrategyShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case AssureNote.Direction.Right:
                    return new AssureNote.Point(this.Width - this.delta / 2, this.Height / 2);
                case AssureNote.Direction.Left:
                    return new AssureNote.Point(this.delta / 2, this.Height / 2);
                case AssureNote.Direction.Top:
                    return new AssureNote.Point(this.Width / 2, 0);
                case AssureNote.Direction.Bottom:
                    return new AssureNote.Point(this.Width / 2, this.Height);
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
            this.BodyEllipse = document.createSVGElement("ellipse");
            this.BodyEllipse.setAttribute("class", this.ColorClassName);
            this.ShapeGroup.appendChild(this.BodyEllipse);
            this.Resize();
        };

        GSNEvidenceShape.prototype.Resize = function () {
            this.BodyEllipse.setAttribute("cx", (this.Width / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.Height / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.Width / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.Height / 2).toString());
        };
        return GSNEvidenceShape;
    })(GSNShape);
    AssureNote.GSNEvidenceShape = GSNEvidenceShape;
})(AssureNote || (AssureNote = {}));

$(function () {
    var AssureNoteApp = new AssureNote.AssureNoteApp();
});
//# sourceMappingURL=index.js.map
