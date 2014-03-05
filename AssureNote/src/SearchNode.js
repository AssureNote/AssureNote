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
///<reference path='./AssureNoteParser.ts'/>
var AssureNote;
(function (AssureNote) {
    /*
    
    export class VisitableNodeList {
    
    export class SearchResultNodeList extends VisitableNodeList {
    
    constructor(Panel: PictgramPanel) {
    super(Panel);
    }
    
    Search(TargetView: NodeView, SearchWord: string): void {
    this.StartVisit(TargetView.Model.SearchNode(SearchWord));
    }
    }
    */
    var NodeListPanel = (function (_super) {
        __extends(NodeListPanel, _super);
        function NodeListPanel(App) {
            _super.call(this, App);
            this.App = App;
            this.Element = $("#nodelist");
            this.Element.hide();
            this.NodeIndex = 0;
            this.NodeList = [];
            this.Visiting = false;
            this.ColorStyle = AssureNote.ColorStyle.Searched;
            this.Panel = App.PictgramPanel;
        }
        NodeListPanel.prototype.StartVisit = function (NodeList, Title) {
            if (this.IsVisiting()) {
                this.FinishVisit();
            }
            this.NodeList = NodeList;
            if (this.NodeList.length > 0) {
                this.Visiting = true;
                this.UnfoldAllFoundNode();
                this.AddColorToAllHitNodes(this.ColorStyle);
                this.Open(Title || "");
                this.Visit(0);
            }
        };

        NodeListPanel.prototype.VisitNext = function (IsReversed) {
            var Length = this.NodeList.length;
            this.Visit((Length + this.NodeIndex + (IsReversed ? -1 : 1)) % Length);
        };

        NodeListPanel.prototype.Visit = function (Index) {
            if (this.IsVisiting() && Index >= 0 && Index < this.NodeList.length) {
                this.NodeIndex = Index;
                this.Panel.FocusAndMoveToNode(this.NodeList[this.NodeIndex].GetLabel());
                this.Element.find(".active").removeClass("active");
                var li = this.Element.find(".nodelist-listbody li")[Index];
                li.className = "active";
                li.scrollIntoView();
            }
        };

        NodeListPanel.prototype.UnfoldAllFoundNode = function () {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                while (Node != null) {
                    Node.SetIsFolded(false);
                    Node = Node.Parent;
                }
            }
            this.Panel.Draw(this.Panel.TopNodeView.Label, 300);
        };

        NodeListPanel.prototype.IsVisiting = function () {
            return this.Visiting;
        };

        NodeListPanel.prototype.FinishVisit = function () {
            this.RemoveColorFromAllHitNodes(this.ColorStyle);
            this.NodeList = [];
            this.NodeIndex = 0;
            this.Visiting = false;
            if (this.IsVisible) {
                this.Hide();
            }
        };

        NodeListPanel.prototype.AddColorToAllHitNodes = function (ColorStyle) {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().AddColorStyle(ColorStyle);
                }
            }
        };

        NodeListPanel.prototype.RemoveColorFromAllHitNodes = function (ColorStyle) {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().RemoveColorStyle(ColorStyle);
                }
            }
        };

        NodeListPanel.prototype.Show = function () {
            this.Element.show();
            this.IsVisible = true;
        };

        NodeListPanel.prototype.Hide = function () {
            this.Element.empty();
            this.Element.hide();
            this.IsVisible = false;
            if (this.IsVisiting) {
                this.FinishVisit();
            }
        };

        NodeListPanel.prototype.Open = function (Title) {
            var _this = this;
            this.Element.empty();
            var Shorten = function (Value) {
                return Value.length > 10 ? Value.substr(0, 10) + "..." : Value;
            };

            var nodes = this.NodeList.map(function (Node) {
                return {
                    Label: Node.GetLabel(), Type: Node.NodeType, Content: Shorten(Node.NodeDoc)
                };
            });
            var t = {
                Message: Title,
                Count: {
                    All: nodes.length,
                    Goal: 0,
                    Evidence: 0,
                    Context: 0,
                    Strategy: 0
                },
                Nodes: nodes
            };
            $("#nodelist_tmpl").tmpl([t]).appendTo(this.Element);
            this.Element.find(".nodelist-panel-count").tooltip({
                html: true,
                title: "Goal: " + t.Count.Goal + "" + "<br>Evidence: " + t.Count.Evidence + "" + "<br>Context: " + t.Count.Context + "" + "<br>Strategy: " + t.Count.Strategy + ""
            });

            this.Element.find(".nodelist-listbody").click(function (e) {
                var li = e.srcElement.parentNode;
                _this.Visit(parseInt(li.getAttribute("data-index")));
            });

            this.Element.find("button.close").click(function () {
                _this.Hide();
                _this.FinishVisit();
            });

            this.Element.find(".prev-item").click(function () {
                _this.VisitNext(true);
            });

            this.Element.find(".next-item").click(function () {
                _this.VisitNext(false);
            });
            this.Show();
        };
        return NodeListPanel;
    })(AssureNote.Panel);
    AssureNote.NodeListPanel = NodeListPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=SearchNode.js.map
