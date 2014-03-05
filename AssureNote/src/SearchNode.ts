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

///<reference path='./AssureNoteParser.ts'/>

module AssureNote {
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

    export class NodeListPanel extends Panel {
        private Element: JQuery;
        private NodeIndex: number;
        private NodeList: GSNNode[];
        private Visiting: boolean;
        private ColorStyle: string;
        private Panel: PictgramPanel;

        constructor(public App: AssureNoteApp) {
            super(App);
            this.Element = $("#nodelist");
            this.Element.hide();
            this.NodeIndex = 0;
            this.NodeList = [];
            this.Visiting = false;
            this.ColorStyle = ColorStyle.Searched;
            this.Panel = App.PictgramPanel;
        }

        StartVisit(NodeList: GSNNode[], Title?: string): void {
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
        }

        VisitNext(IsReversed: boolean): void {
            var Length = this.NodeList.length;
            this.Visit((Length + this.NodeIndex + (IsReversed ? -1 : 1)) % Length);
        }

        Visit(Index: number) {
            if (this.IsVisiting() && Index >= 0 && Index < this.NodeList.length) {
                this.NodeIndex = Index;
                this.Panel.FocusAndMoveToNode(this.NodeList[this.NodeIndex].GetLabel());
                this.Element.find(".active").removeClass("active");
                var li = this.Element.find(".nodelist-listbody li")[Index];
                li.className = "active";
                li.scrollIntoView();
            }
        }

        private UnfoldAllFoundNode(): void {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                while (Node != null) {
                    Node.SetIsFolded(false);
                    Node = Node.Parent;
                }
            }
            this.Panel.Draw(this.Panel.TopNodeView.Label, 300);
        }

        IsVisiting(): boolean {
            return this.Visiting;
        }

        FinishVisit(): void {
            this.RemoveColorFromAllHitNodes(this.ColorStyle);
            this.NodeList = [];
            this.NodeIndex = 0;
            this.Visiting = false;
            if (this.IsVisible) {
                this.Hide();
            }
        }

        private AddColorToAllHitNodes(ColorStyle: string): void {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().AddColorStyle(ColorStyle);
                }
            }
        }

        private RemoveColorFromAllHitNodes(ColorStyle: string): void {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().RemoveColorStyle(ColorStyle);
                }
            }
        }

        Show(): void {
            this.Element.show();
            this.IsVisible = true;
        }

        Hide(): void {
            this.Element.empty();
            this.Element.hide();
            this.IsVisible = false;
            if (this.IsVisiting) {
                this.FinishVisit();
            }
        }

        private Open(Title: string): void {
            this.Element.empty();
            var Shorten = (Value: string): string => {
                return Value.length > 10 ? Value.substr(0, 10) + "..." : Value;
            };

            var nodes = this.NodeList.map((Node) => {
                return {
                    Label: Node.GetLabel(), Type: Node.NodeType, Content: Shorten(Node.NodeDoc)
                };
            });
            var t = <any>{
                Message: Title,
                Count: {
                    All: nodes.length,
                    Goal: 0,
                    Evidence: 0,
                    Context: 0,
                    Strategy: 0,
                },
                Nodes: nodes,
            };
            $("#nodelist_tmpl").tmpl([t]).appendTo(this.Element);
            this.Element.find(".nodelist-panel-count").tooltip({
                html: true,
                title:
                "Goal: " + t.Count.Goal + ""
                + "<br>Evidence: " + t.Count.Evidence + ""
                + "<br>Context: " + t.Count.Context + ""
                + "<br>Strategy: " + t.Count.Strategy + ""
            });

            this.Element.find(".nodelist-listbody").click((e) => {
                var li = <HTMLLIElement>e.srcElement.parentNode;
                this.Visit(parseInt(li.getAttribute("data-index")));
            });

            this.Element.find("button.close").click(() => {
                this.Hide();
                this.FinishVisit();
            });

            this.Element.find(".prev-item").click(() => {
                this.VisitNext(true);
            });

            this.Element.find(".next-item").click(() => {
                this.VisitNext(false);
            });
            this.Show();
        }
    }
}
