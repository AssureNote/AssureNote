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
var AssureNote;
(function (AssureNote) {
    (function (AssureNoteUtils) {
        function postJsonRPC(methodName, params, Callback, ErrorCallback/*FIXME*/ ) {
            $.ajax({
                type: "POST",
                url: "/api/1.0",
                data: JSON.stringify({ jsonrpc: "2.0", id: "1", method: methodName, params: params }),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    Callback(response.result);
                },
                error: function (req, status, errorThrown) {
                    console.log("========== Ajax Error ==========");
                    console.log(status);
                    if (ErrorCallback != null) {
                        ErrorCallback();
                    }
                    console.log("================================");
                }
            });
        }
        AssureNoteUtils.postJsonRPC = postJsonRPC;

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
                case AssureNote.GSNType.Goal:
                    return new AssureNote.GSNGoalShape(NodeView);
                case AssureNote.GSNType.Context:
                    return new AssureNote.GSNContextShape(NodeView);
                case AssureNote.GSNType.Strategy:
                    return new AssureNote.GSNStrategyShape(NodeView);
                case AssureNote.GSNType.Evidence:
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
            element.textContent = text;
            return element.innerHTML;
        }
        AssureNoteUtils.HTMLEncode = HTMLEncode;

        function ForeachLine(Text, LineWidth, Callback) {
            if (!Callback)
                return;
            var rest = Text;
            var maxLength = LineWidth || 20;
            maxLength = maxLength < 1 ? 1 : maxLength;
            var length = 0;
            var i = 0;
            for (var pos = 0; pos < rest.length; ++pos) {
                var code = rest.charCodeAt(pos);
                length += code < 128 ? 1 : 2;
                if (length > maxLength || rest.charAt(pos) == "\n") {
                    Callback(rest.substr(0, pos), i);
                    if (rest.charAt(pos) == "\n") {
                        pos++;
                    }
                    rest = rest.substr(pos, rest.length - pos);
                    pos = -1;
                    length = 0;
                    i++;
                }
            }
            Callback(rest, i);
        }
        AssureNoteUtils.ForeachLine = ForeachLine;

        function GenerateUID() {
            return Math.floor(Math.random() * 2147483647);
        }
        AssureNoteUtils.GenerateUID = GenerateUID;
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
