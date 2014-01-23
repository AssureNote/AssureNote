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
        private DestinationX: number;
        private DestinationY: number;
        private NodeIndex: number;
        private IsMoving: boolean;
        private HitNodes: GSNNode[];
        private Searching: boolean;

        constructor(public AssureNoteApp: AssureNoteApp) {
            this.SearchWord = "";
            this.DestinationX = 0;
            this.DestinationY = 0;
            this.NodeIndex = 0;
            this.IsMoving = false;
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

            this.IsMoving = true;
            this.Searching = true;
            this.CreateHitNodeView(ViewMap);

            this.SetDestination(this.HitNodes[0]);
            this.AddAllHitNodesColor(ViewMap, ColorStyle.Searched);
            ViewMap[this.HitNodes[0].GetLabel()].Shape.AddColorStyle(ColorStyle.SearchHighlight);
            this.MoveToNext(ViewPort, () => {
                this.IsMoving = false;
            });
        }

        SearchNext(TargetView: NodeView, IsReversed: boolean): void {
            var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
            var ViewPort = this.AssureNoteApp.PictgramPanel.Viewport;
            if (this.HitNodes.length == 1) {
                return;
            }
            var OldIndex = this.NodeIndex;
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


            this.IsMoving = true;
            this.SetDestination(this.HitNodes[this.NodeIndex]);
            this.MoveToNext(this.AssureNoteApp.PictgramPanel.Viewport, () => {
                ViewMap[this.HitNodes[OldIndex].GetLabel()].Shape.RemoveColorStyle(ColorStyle.SearchHighlight);
                ViewMap[this.HitNodes[this.NodeIndex].GetLabel()].Shape.AddColorStyle(ColorStyle.SearchHighlight);
                this.IsMoving = false;
            });
        }

        private CreateHitNodeView(ViewMap: { [index: string]: NodeView }): void {
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

        ResetParam(): void {
            this.RemoveAllHitNodesColor(this.AssureNoteApp.PictgramPanel.ViewMap, ColorStyle.Searched);
            this.AssureNoteApp.PictgramPanel.ViewMap[this.HitNodes[this.NodeIndex].GetLabel()].Shape.RemoveColorStyle(ColorStyle.SearchHighlight);
            this.HitNodes = [];
            this.NodeIndex = 0;
            this.SearchWord = "";
            this.Searching = false;
        }

        private AddAllHitNodesColor(ViewMap: { [index: string]: NodeView }, ColorCode: string): void {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Label: string = this.HitNodes[i].GetLabel();
                var Node = ViewMap[Label];
                if (Node != null) {
                    Node.GetShape().AddColorStyle(ColorCode);
                }
            }
        }

        private RemoveAllHitNodesColor(ViewMap: { [index: string]: NodeView }, ColorCode: string): void {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Label: string = this.HitNodes[i].GetLabel();
                var Node = ViewMap[Label];
                if (Node != null) {
                    Node.GetShape().RemoveColorStyle(ColorCode);
                }
            }
        }

        private SetDestination(HitNode: GSNNode): void {
            if (HitNode == null) {
                return;
            }
            var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
            var TargetView = ViewMap[HitNode.GetLabel()];
            this.DestinationX = TargetView.GetCenterGX();
            this.DestinationY = TargetView.GetCenterGY();
        }

        private MoveToNext(ViewPort: ViewportManager, Callback: () => void): void {
            ViewPort.MoveTo(this.DestinationX, this.DestinationY, ViewPort.GetCameraScale(), 100);
            Callback();
        }


    }
}
