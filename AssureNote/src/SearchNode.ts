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

    export class Search {

        private SearchWord: string;
        private NodeIndex: number;
        private HitNodes: GSNNode[];
        private Searching: boolean;

        constructor(public AssureNoteApp: AssureNoteApp) {
            this.SearchWord = "";
            this.NodeIndex = 0;
            this.HitNodes = [];
            this.Searching = false;
        }

        Search(TargetView: NodeView, SearchWord: string): void {
            var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
            var ViewPort = this.AssureNoteApp.PictgramPanel.Viewport;
            this.SearchWord = SearchWord;

            if (this.SearchWord == "") {
                return;
            }
            this.HitNodes = TargetView.Model.SearchNode(this.SearchWord);
            this.AssureNoteApp.DebugP(<any>this.HitNodes);

            if (this.HitNodes.length == 0) {
                this.SearchWord = "";
                return;
            }

            this.Searching = true;
            this.UnfoldAllFoundNode(ViewMap);
            this.AddColorToAllHitNodes(ViewMap, ColorStyle.Searched);
            this.AssureNoteApp.PictgramPanel.FocusAndMoveToNode(this.HitNodes[0].GetLabel());
        }

        SearchNext(TargetView: NodeView, IsReversed: boolean): void {
            var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
            var ViewPort = this.AssureNoteApp.PictgramPanel.Viewport;
            if (this.HitNodes.length == 1) {
                return;
            }

            if (!IsReversed) {
                this.NodeIndex++;
                if (this.NodeIndex >= this.HitNodes.length) {
                    this.NodeIndex = 0;
                }
            } else {
                this.NodeIndex--;
                if (this.NodeIndex < 0) {
                    this.NodeIndex = this.HitNodes.length - 1;
                }
            }

            this.AssureNoteApp.PictgramPanel.FocusAndMoveToNode(this.HitNodes[this.NodeIndex].GetLabel());
        }

        private UnfoldAllFoundNode(ViewMap: { [index: string]: NodeView }): void {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Node = ViewMap[this.HitNodes[i].GetLabel()];
                while (Node != null) {
                    Node.IsFolded = false;
                    Node = Node.Parent;
                }
            }
            this.AssureNoteApp.PictgramPanel.Draw(this.AssureNoteApp.PictgramPanel.MasterView.Label, 300);
        }

        IsSearching(): boolean {
            return this.Searching;
        }

        EndSearch(): void {
            this.RemoveColorFromAllHitNodes(this.AssureNoteApp.PictgramPanel.ViewMap, ColorStyle.Searched);
            this.HitNodes = [];
            this.NodeIndex = 0;
            this.SearchWord = "";
            this.Searching = false;
        }

        private AddColorToAllHitNodes(ViewMap: { [index: string]: NodeView }, ColorStyle: string): void {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Node = ViewMap[this.HitNodes[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().AddColorStyle(ColorStyle);
                }
            }
        }

        private RemoveColorFromAllHitNodes(ViewMap: { [index: string]: NodeView }, ColorStyle: string): void {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Node = ViewMap[this.HitNodes[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().RemoveColorStyle(ColorStyle);
                }
            }
        }

    }
}
