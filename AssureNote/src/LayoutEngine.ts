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

module AssureNote {
    export class LayoutEngine {
        constructor(public AssureNoteApp: AssureNoteApp) {
        }

        //FIXME Rename
        DoLayout(PictgramPanel: PictgramPanel, NodeView: NodeView): void {
            //TODO
        }
    }

    
    export class SimpleLayoutEngine extends LayoutEngine {
        static ContextHorizontalMargin = 32;
        static ContextVerticalMargin = 10;
        static ChildrenVerticalMargin = 64;
        static ChildrenHorizontalMargin = 12;

        constructor(public AssureNoteApp: AssureNoteApp) {
            super(AssureNoteApp);
        }

        private Render(ThisNode: NodeView, DivFrag: DocumentFragment, SvgNodeFrag: DocumentFragment, SvgConnectionFrag: DocumentFragment): void {
            if (ThisNode.IsVisible) {
                ThisNode.GetShape().PrerenderContent(this.AssureNoteApp.PluginManager);
                ThisNode.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
                if (!ThisNode.IsFolded) {
                    ThisNode.ForEachVisibleAllSubNodes((SubNode: NodeView) => {
                        this.Render(SubNode, DivFrag, SvgNodeFrag, SvgConnectionFrag);
                    });
                }
            }
        }

        DoLayout(PictgramPanel: PictgramPanel, NodeView: NodeView): void {

            var DivFragment = document.createDocumentFragment();
            var SvgNodeFragment = document.createDocumentFragment();
            var SvgConnectionFragment = document.createDocumentFragment();

            this.Render(NodeView, DivFragment, SvgNodeFragment, SvgConnectionFragment);

            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayer.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayer.appendChild(SvgNodeFragment);

            this.Layout(NodeView);
        }

        private Layout(ThisNode: NodeView): void {
            if (!ThisNode.IsVisible) {
                return;
            }
            var Shape = ThisNode.GetShape();
            Shape.FitSizeToContent();
            var TreeLeftX = 0;
            var ThisNodeWidth = Shape.GetNodeWidth();
            var TreeRightX = ThisNodeWidth;
            var TreeHeight = Shape.GetNodeHeight();
            if (ThisNode.IsFolded) {
                Shape.SetHeadRect(0, 0, ThisNodeWidth, TreeHeight);
                Shape.SetTreeRect(0, 0, ThisNodeWidth, TreeHeight);
                return;
            }
            if (ThisNode.Left != null) {
                var LeftNodesWidth = 0;
                var LeftNodesHeight = -SimpleLayoutEngine.ContextVerticalMargin;
                ThisNode.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                    SubNode.GetShape().FitSizeToContent();
                    LeftNodesHeight += SimpleLayoutEngine.ContextVerticalMargin;
                    SubNode.RelativeX = -(SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.ContextHorizontalMargin);
                    SubNode.RelativeY = LeftNodesHeight;
                    LeftNodesWidth = Math.max(LeftNodesWidth, SubNode.Shape.GetNodeWidth());
                    LeftNodesHeight += SubNode.Shape.GetNodeHeight();
                });
                var LeftShift = (ThisNode.Shape.GetNodeHeight() - LeftNodesHeight) / 2;
                if (LeftShift > 0) {
                    ThisNode.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                        SubNode.RelativeY += LeftShift;
                    });
                }
                if (LeftNodesHeight > 0) {
                    TreeLeftX = -(LeftNodesWidth + SimpleLayoutEngine.ContextHorizontalMargin);
                    TreeHeight = Math.max(TreeHeight, LeftNodesHeight);
                }
            }
            if (ThisNode.Right != null) {
                var RightNodesWidth = 0;
                var RightNodesHeight = -SimpleLayoutEngine.ContextVerticalMargin;
                ThisNode.ForEachVisibleRightNodes((SubNode: NodeView) => {
                    SubNode.GetShape().FitSizeToContent();
                    RightNodesHeight += SimpleLayoutEngine.ContextVerticalMargin;
                    SubNode.RelativeX = (ThisNodeWidth + SimpleLayoutEngine.ContextHorizontalMargin);
                    SubNode.RelativeY = RightNodesHeight;
                    RightNodesWidth = Math.max(RightNodesWidth, SubNode.Shape.GetNodeWidth());
                    RightNodesHeight += SubNode.Shape.GetNodeHeight();
                });
                var RightShift = (ThisNode.Shape.GetNodeHeight() - RightNodesHeight) / 2;
                if (RightShift > 0) {
                    ThisNode.ForEachVisibleRightNodes((SubNode: NodeView) => {
                        SubNode.RelativeY += RightShift;
                    });
                }
                if (RightNodesHeight > 0) {
                    TreeRightX += RightNodesWidth + SimpleLayoutEngine.ContextHorizontalMargin;
                    TreeHeight = Math.max(TreeHeight, RightNodesHeight);
                }
            }

            var HeadRightX = TreeRightX;
            var HeadWidth = TreeRightX - TreeLeftX;
            Shape.SetHeadRect(TreeLeftX, 0, HeadWidth, TreeHeight);
            TreeHeight += SimpleLayoutEngine.ChildrenVerticalMargin;

            var ChildrenTopWidth = 0;
            var ChildrenBottomWidth = 0;
            var ChildrenHeight = 0;
            var FoldedNodeRun: NodeView[] = [];
            var VisibleChildrenCount = 0;
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                var IsPreviousChildFolded = false;

                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    VisibleChildrenCount++;
                    this.Layout(SubNode);
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    var ChildHeadWidth = SubNode.IsFolded ? SubNode.Shape.GetNodeWidth() : SubNode.Shape.GetHeadWidth();
                    var ChildHeadLeftSideMargin = SubNode.Shape.GetHeadLeftLocalX() - SubNode.Shape.GetTreeLeftLocalX();
                    var ChildHeadRightX = ChildHeadLeftSideMargin + ChildHeadWidth;
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    var HMargin = SimpleLayoutEngine.ChildrenHorizontalMargin;
                    var ShiftY = 0;

                    var IsUndeveloped = SubNode.Children == null || SubNode.Children.length == 0;
                    var IsFoldedLike = SubNode.IsFolded || IsUndeveloped;

                    if (IsFoldedLike) {
                        SubNode.RelativeX = ChildrenTopWidth;
                        ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + HMargin;
                        FoldedNodeRun.push(SubNode);
                    } else {
                        if (IsPreviousChildFolded) {
                            var WidthDiff = ChildrenTopWidth - ChildrenBottomWidth;
                            if (WidthDiff < ChildHeadLeftSideMargin) {
                                SubNode.RelativeX = ChildrenBottomWidth;
                                ChildrenTopWidth = ChildrenBottomWidth + ChildHeadRightX + HMargin;
                                ChildrenBottomWidth = ChildrenBottomWidth + ChildTreeWidth + HMargin;
                                if (SubNode.RelativeX == 0) {
                                    for (var i = 0; i < FoldedNodeRun.length; i++) {
                                        FoldedNodeRun[i].RelativeX += ChildHeadLeftSideMargin - WidthDiff;
                                    }
                                } else {
                                    var FoldedRunMargin = (ChildHeadLeftSideMargin - WidthDiff) / (FoldedNodeRun.length + 1)
                                    for (var i = 0; i < FoldedNodeRun.length; i++) {
                                        FoldedNodeRun[i].RelativeX += FoldedRunMargin * (i + 1);
                                    }
                                }
                            } else {
                                SubNode.RelativeX = ChildrenTopWidth - ChildHeadLeftSideMargin;
                                ChildrenBottomWidth = ChildrenTopWidth + ChildTreeWidth - ChildHeadLeftSideMargin + HMargin;
                                ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + HMargin;
                            }
                        } else {
                            var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth);
                            SubNode.RelativeX = ChildrenWidth;
                            ChildrenTopWidth = ChildrenWidth + ChildHeadRightX + HMargin;
                            ChildrenBottomWidth = ChildrenWidth + ChildTreeWidth + HMargin;
                        }
                        FoldedNodeRun = [];
                        SubNode.RelativeX += -SubNode.Shape.GetTreeLeftLocalX();
                    }
                    if (!SubNode.HasSideNode()) {
                        var SubNodeHeight = SubNode.Shape.GetNodeHeight();
                        var ThisHeight = ThisNode.Shape.GetNodeHeight();
                        var VMargin = SimpleLayoutEngine.ChildrenVerticalMargin;
                        if (!SubNode.HasChildren() || ThisHeight + VMargin * 2 + SubNodeHeight > TreeHeight) {
                            ShiftY = TreeHeight - (ThisHeight + VMargin);
                        } else {
                            ShiftY = SubNodeHeight + VMargin;
                        }
                    }
                    SubNode.RelativeY = TreeHeight - ShiftY;

                    IsPreviousChildFolded = IsFoldedLike;
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight - ShiftY);
                    //console.log("T" + ChildrenTopWidth + ", B" + ChildrenBottomWidth);
                });

                var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth) - SimpleLayoutEngine.ChildrenHorizontalMargin;
                var ShiftX = (ChildrenWidth - ThisNodeWidth) / 2;
                
                if (VisibleChildrenCount == 1) {
                    ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                        ShiftX = -SubNode.Shape.GetTreeLeftLocalX();
                    });
                }
                TreeLeftX = Math.min(TreeLeftX, -ShiftX);
                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    SubNode.RelativeX -= ShiftX;
                });

                TreeHeight += ChildrenHeight;
                TreeRightX = Math.max(TreeLeftX + ChildrenWidth, HeadRightX);
            }
            Shape.SetTreeRect(TreeLeftX, 0, TreeRightX - TreeLeftX, TreeHeight);
            //console.log(ThisNode.Label + ": " + (<any>ThisNode.Shape).TreeBoundingBox.toString());
        }

    }

}
