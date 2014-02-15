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
    var VisitableNodeList = (function () {
        function VisitableNodeList(Panel) {
            this.NodeIndex = 0;
            this.NodeList = [];
            this.Visiting = false;
            this.ColorStyle = AssureNote.ColorStyle.Searched;
            this.Panel = Panel;
        }
        VisitableNodeList.prototype.StartVisit = function (NodeList) {
            if (this.IsVisiting()) {
                this.FinishVisit();
            }
            this.NodeList = NodeList;
            if (this.NodeList.length > 0) {
                this.Visiting = true;
                this.UnfoldAllFoundNode();
                this.AddColorToAllHitNodes(this.ColorStyle);
                this.Panel.FocusAndMoveToNode(this.NodeList[0].GetLabel());
            }
        };

        VisitableNodeList.prototype.VisitNext = function (IsReversed) {
            if (this.IsVisiting() && this.NodeList.length > 1) {
                var Length = this.NodeList.length;
                this.NodeIndex = (Length + this.NodeIndex + (IsReversed ? -1 : 1)) % Length;
                this.Panel.FocusAndMoveToNode(this.NodeList[this.NodeIndex].GetLabel());
            }
        };

        VisitableNodeList.prototype.UnfoldAllFoundNode = function () {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                while (Node != null) {
                    Node.SetIsFolded(false);
                    Node = Node.Parent;
                }
            }
            this.Panel.Draw(this.Panel.MasterView.Label, 300);
        };

        VisitableNodeList.prototype.IsVisiting = function () {
            return this.Visiting;
        };

        VisitableNodeList.prototype.FinishVisit = function () {
            this.RemoveColorFromAllHitNodes(this.ColorStyle);
            this.NodeList = [];
            this.NodeIndex = 0;
            this.Visiting = false;
        };

        VisitableNodeList.prototype.AddColorToAllHitNodes = function (ColorStyle) {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().AddColorStyle(ColorStyle);
                }
            }
        };

        VisitableNodeList.prototype.RemoveColorFromAllHitNodes = function (ColorStyle) {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().RemoveColorStyle(ColorStyle);
                }
            }
        };
        return VisitableNodeList;
    })();
    AssureNote.VisitableNodeList = VisitableNodeList;

    var SearchResultNodeList = (function (_super) {
        __extends(SearchResultNodeList, _super);
        function SearchResultNodeList(Panel) {
            _super.call(this, Panel);
        }
        SearchResultNodeList.prototype.Search = function (TargetView, SearchWord) {
            this.StartVisit(TargetView.Model.SearchNode(SearchWord));
        };
        return SearchResultNodeList;
    })(VisitableNodeList);
    AssureNote.SearchResultNodeList = SearchResultNodeList;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=SearchNode.js.map
