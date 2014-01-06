var AssureNote;
(function (AssureNote) {
    (function (AssureNoteUtils) {
        function SaveAs(ContentString, FileName) {
            var blob = new Blob([ContentString], { type: 'text/plain; charset=UTF-8' });
            saveAs(blob, FileName);
        }
        AssureNoteUtils.SaveAs = SaveAs;

        function GetNodeLabelFromEvent(event) {
            var element = event.target || event.srcElement;
            while (element != null) {
                if (element.id != "") {
                    return element.id;
                }
                element = element.parentElement;
            }
            return "";
        }
        AssureNoteUtils.GetNodeLabelFromEvent = GetNodeLabelFromEvent;

        function GetNodePosition(Label) {
            var element = document.getElementById(Label);
            var view = element.getBoundingClientRect();
            return new AssureNote.Point(view.left, view.top);
        }
        AssureNoteUtils.GetNodePosition = GetNodePosition;

        function CreateGSNShape(NodeView) {
            switch (NodeView.GetNodeType()) {
                case GSNType.Goal:
                    return new AssureNote.GSNGoalShape(NodeView);
                case GSNType.Context:
                    return new AssureNote.GSNContextShape(NodeView);
                case GSNType.Strategy:
                    return new AssureNote.GSNStrategyShape(NodeView);
                case GSNType.Evidence:
                    return new AssureNote.GSNEvidenceShape(NodeView);
            }
        }
        AssureNoteUtils.CreateGSNShape = CreateGSNShape;

        function CreateSVGElement(name) {
            return document.createElementNS('http://www.w3.org/2000/svg', name);
        }
        AssureNoteUtils.CreateSVGElement = CreateSVGElement;

        var SVGMoveAnimateElementMaster = null;
        var SVGArrowAnimateElementMaster = null;
        var SVGFadeinAnimateElementMaster = null;

        function CreateSVGMoveAnimateElement(Duration, FromGX, FromGY) {
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
            var AnimateElement = SVGMoveAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            AnimateElement.setAttribute("from", "" + FromGX + "," + FromGY);
            return AnimateElement;
        }
        AssureNoteUtils.CreateSVGMoveAnimateElement = CreateSVGMoveAnimateElement;

        function CreateSVGArrowAnimateElement(Duration, OldPath, NewPath) {
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
            var AnimateElement = SVGArrowAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            if (OldPath) {
                AnimateElement.setAttribute("from", OldPath);
            }
            AnimateElement.setAttribute("to", NewPath);
            return AnimateElement;
        }
        AssureNoteUtils.CreateSVGArrowAnimateElement = CreateSVGArrowAnimateElement;

        function CreateSVGFadeinAnimateElement(Duration) {
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
            var AnimateElement = SVGFadeinAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            return AnimateElement;
        }
        AssureNoteUtils.CreateSVGFadeinAnimateElement = CreateSVGFadeinAnimateElement;

        function CreateCSSMoveAnimationDefinition(Prefix, Name, FromGX, FromGY) {
            return "@" + Prefix + "keyframes " + Name + " { 0% { left: " + FromGX + "px; top: " + FromGY + "px; } }";
        }
        AssureNoteUtils.CreateCSSMoveAnimationDefinition = CreateCSSMoveAnimationDefinition;

        function CreateCSSFadeinAnimationDefinition(Prefix, Name) {
            return "@" + Prefix + "keyframes " + Name + " { 0% { opacity: 0; } }";
        }
        AssureNoteUtils.CreateCSSFadeinAnimationDefinition = CreateCSSFadeinAnimationDefinition;

        var element = document.createElement('div');
        function HTMLEncode(text) {
            element.innerText = text;
            return element.innerHTML;
        }
        AssureNoteUtils.HTMLEncode = HTMLEncode;
    })(AssureNote.AssureNoteUtils || (AssureNote.AssureNoteUtils = {}));
    var AssureNoteUtils = AssureNote.AssureNoteUtils;

    var ColorStyle = (function () {
        function ColorStyle() {
        }
        ColorStyle.Default = "assurenote-default";
        ColorStyle.ToDo = "assurenote-todo";
        ColorStyle.Searched = "assurenote-search";
        ColorStyle.SearchHighlight = "assurenote-search-highlight";
        ColorStyle.Danger = "assurenote-danger";
        return ColorStyle;
    })();
    AssureNote.ColorStyle = ColorStyle;

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
        Rect.prototype.Clone = function () {
            return new Rect(this.X, this.Y, this.Width, this.Height);
        };
        return Rect;
    })();
    AssureNote.Rect = Rect;

    var Point = (function () {
        function Point(X, Y) {
            this.X = X;
            this.Y = Y;
        }
        Point.prototype.Clone = function () {
            return new Point(this.X, this.Y);
        };
        Point.prototype.toString = function () {
            return "(" + this.X + ", " + this.Y + ")";
        };
        return Point;
    })();
    AssureNote.Point = Point;

    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Top"] = 1] = "Top";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Bottom"] = 3] = "Bottom";
    })(AssureNote.Direction || (AssureNote.Direction = {}));
    var Direction = AssureNote.Direction;

    function ReverseDirection(Dir) {
        return (Dir + 2) & 3;
    }
    AssureNote.ReverseDirection = ReverseDirection;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNoteUtils.js.map
