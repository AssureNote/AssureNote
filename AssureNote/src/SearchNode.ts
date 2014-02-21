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

    export class VisitableNodeList {
        private NodeIndex: number;
        private NodeList: GSNNode[];
        private Visiting: boolean;
        private ColorStyle: string;
        private Panel: PictgramPanel;

        constructor(Panel: PictgramPanel) {
            this.NodeIndex = 0;
            this.NodeList = [];
            this.Visiting = false;
            this.ColorStyle = ColorStyle.Searched;
            this.Panel = Panel;
        }

        StartVisit(NodeList: GSNNode[]): void {
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
        }

        VisitNext(IsReversed: boolean): void {
            if (this.IsVisiting() && this.NodeList.length > 1) {
                var Length = this.NodeList.length;
                this.NodeIndex = (Length + this.NodeIndex + (IsReversed ? -1 : 1)) % Length;
                this.Panel.FocusAndMoveToNode(this.NodeList[this.NodeIndex].GetLabel());
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
    }

    export class SearchResultNodeList extends VisitableNodeList {

        constructor(Panel: PictgramPanel) {
            super(Panel);
        }

        Search(TargetView: NodeView, SearchWord: string): void {
            this.StartVisit(TargetView.Model.SearchNode(SearchWord));
        }
    }
}
