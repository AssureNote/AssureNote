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
var AssureNote;
(function (AssureNote) {
    var LayoutEngine = (function () {
        function LayoutEngine(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
        }
        //FIXME Rename
        LayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView) {
            //TODO
        };
        return LayoutEngine;
    })();
    AssureNote.LayoutEngine = LayoutEngine;

    var SimpleLayoutEngine = (function (_super) {
        __extends(SimpleLayoutEngine, _super);
        function SimpleLayoutEngine(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
        }
        SimpleLayoutEngine.prototype.Render = function (ThisNode, DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            var _this = this;
            if (ThisNode.IsVisible) {
                ThisNode.GetShape().PrerenderContent(this.AssureNoteApp.PluginManager);
                ThisNode.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
                if (!ThisNode.IsFolded()) {
                    ThisNode.ForEachVisibleAllSubNodes(function (SubNode) {
                        _this.Render(SubNode, DivFrag, SvgNodeFrag, SvgConnectionFrag);
                    });
                }
            }
        };

        SimpleLayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView) {
            var DivFragment = document.createDocumentFragment();
            var SvgNodeFragment = document.createDocumentFragment();
            var SvgConnectionFragment = document.createDocumentFragment();
            var Dummy = document.createDocumentFragment();

            //var t0 = AssureNoteUtils.GetTime();
            this.Render(NodeView, DivFragment, SvgNodeFragment, SvgConnectionFragment);

            //var t1 = AssureNoteUtils.GetTime();
            //console.log("Render: " + (t1 - t0));
            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayerConnectorGroup.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayerNodeGroup.appendChild(SvgNodeFragment);
            this.PrepareNodeSize(NodeView);
            Dummy.appendChild(DivFragment);
            Dummy.appendChild(SvgConnectionFragment);
            Dummy.appendChild(SvgNodeFragment);

            //var t2 = AssureNoteUtils.GetTime();
            //console.log("NodeSize: " + (t2 - t1));
            this.Layout(NodeView);
            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayer.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayer.appendChild(SvgNodeFragment);
            //var t3 = AssureNoteUtils.GetTime();
            //console.log("Layout: " + (t3 - t2));
        };

        SimpleLayoutEngine.prototype.PrepareNodeSize = function (ThisNode) {
            var _this = this;
            var Shape = ThisNode.GetShape();
            Shape.GetNodeWidth();
            Shape.GetNodeHeight();
            if (ThisNode.IsFolded()) {
                return;
            }
            ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
                _this.PrepareNodeSize(SubNode);
            });
            ThisNode.ForEachVisibleRightNodes(function (SubNode) {
                _this.PrepareNodeSize(SubNode);
            });
            ThisNode.ForEachVisibleChildren(function (SubNode) {
                _this.PrepareNodeSize(SubNode);
            });
        };

        SimpleLayoutEngine.prototype.Layout = function (ThisNode) {
            var _this = this;
            if (!ThisNode.IsVisible) {
                return;
            }
            var Shape = ThisNode.GetShape();
            if (!ThisNode.ShouldReLayout()) {
                ThisNode.TraverseVisibleNode(function (Node) {
                    Node.Shape.FitSizeToContent();
                });
                return;
            }
            ThisNode.SetShouldReLayout(false);
            Shape.FitSizeToContent();
            var TreeLeftX = 0;
            var ThisNodeWidth = Shape.GetNodeWidth();
            var TreeRightX = ThisNodeWidth;
            var TreeHeight = Shape.GetNodeHeight();
            if (ThisNode.IsFolded()) {
                Shape.SetHeadRect(0, 0, ThisNodeWidth, TreeHeight);
                Shape.SetTreeRect(0, 0, ThisNodeWidth, TreeHeight);
                return;
            }
            if (ThisNode.Left != null) {
                var LeftNodesWidth = 0;
                var LeftNodesHeight = -SimpleLayoutEngine.ContextVerticalMargin;
                ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    LeftNodesHeight += SimpleLayoutEngine.ContextVerticalMargin;
                    SubNode.RelativeX = -(SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.ContextHorizontalMargin);
                    SubNode.RelativeY = LeftNodesHeight;
                    LeftNodesWidth = Math.max(LeftNodesWidth, SubNode.Shape.GetNodeWidth());
                    LeftNodesHeight += SubNode.Shape.GetNodeHeight();
                });
                var LeftShift = (ThisNode.Shape.GetNodeHeight() - LeftNodesHeight) / 2;
                if (LeftShift > 0) {
                    ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
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
                ThisNode.ForEachVisibleRightNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    RightNodesHeight += SimpleLayoutEngine.ContextVerticalMargin;
                    SubNode.RelativeX = (ThisNodeWidth + SimpleLayoutEngine.ContextHorizontalMargin);
                    SubNode.RelativeY = RightNodesHeight;
                    RightNodesWidth = Math.max(RightNodesWidth, SubNode.Shape.GetNodeWidth());
                    RightNodesHeight += SubNode.Shape.GetNodeHeight();
                });
                var RightShift = (ThisNode.Shape.GetNodeHeight() - RightNodesHeight) / 2;
                if (RightShift > 0) {
                    ThisNode.ForEachVisibleRightNodes(function (SubNode) {
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
            var FormarUnfoldedChildHeight = Infinity;
            var FoldedNodeRun = [];
            var VisibleChildrenCount = 0;
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                var IsPreviousChildFolded = false;

                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    VisibleChildrenCount++;
                    _this.Layout(SubNode);
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    var ChildHeadWidth = SubNode.IsFolded() ? SubNode.Shape.GetNodeWidth() : SubNode.Shape.GetHeadWidth();
                    var ChildHeadHeight = SubNode.IsFolded() ? SubNode.Shape.GetNodeHeight() : SubNode.Shape.GetHeadHeight();
                    var ChildHeadLeftSideMargin = SubNode.Shape.GetHeadLeftLocalX() - SubNode.Shape.GetTreeLeftLocalX();
                    var ChildHeadRightX = ChildHeadLeftSideMargin + ChildHeadWidth;
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    var HMargin = SimpleLayoutEngine.ChildrenHorizontalMargin;

                    var IsUndeveloped = SubNode.Children == null || SubNode.Children.length == 0;
                    var IsFoldedLike = (SubNode.IsFolded() || IsUndeveloped) && ChildHeadHeight <= FormarUnfoldedChildHeight;

                    if (IsFoldedLike) {
                        SubNode.RelativeX = ChildrenTopWidth;
                        ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + HMargin;
                        FoldedNodeRun.push(SubNode);
                    } else {
                        if (IsPreviousChildFolded) {
                            // Arrange the folded nodes between open nodes to equal distance
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
                                    var FoldedRunMargin = (ChildHeadLeftSideMargin - WidthDiff) / (FoldedNodeRun.length + 1);
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
                        FormarUnfoldedChildHeight = ChildHeadHeight;
                    }
                    SubNode.RelativeX += -SubNode.Shape.GetTreeLeftLocalX();
                    SubNode.RelativeY = TreeHeight;

                    IsPreviousChildFolded = IsFoldedLike;
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                    //console.log("T" + ChildrenTopWidth + ", B" + ChildrenBottomWidth);
                });

                var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth) - SimpleLayoutEngine.ChildrenHorizontalMargin;
                var ShiftX = (ChildrenWidth - ThisNodeWidth) / 2;

                if (VisibleChildrenCount == 1) {
                    ThisNode.ForEachVisibleChildren(function (SubNode) {
                        ShiftX = -SubNode.Shape.GetTreeLeftLocalX();
                        if (!SubNode.HasSideNode() || SubNode.IsFolded()) {
                            var ShiftY = 0;
                            var SubNodeHeight = SubNode.Shape.GetNodeHeight();
                            var ThisHeight = ThisNode.Shape.GetNodeHeight();
                            var VMargin = SimpleLayoutEngine.ChildrenVerticalMargin;
                            if (!SubNode.HasChildren() || ThisHeight + VMargin * 2 + SubNodeHeight > TreeHeight) {
                                ShiftY = TreeHeight - (ThisHeight + VMargin);
                            } else {
                                ShiftY = SubNodeHeight + VMargin;
                            }
                            SubNode.RelativeY -= ShiftY;
                            ChildrenHeight -= ShiftY;
                        }
                    });
                }
                TreeLeftX = Math.min(TreeLeftX, -ShiftX);
                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    SubNode.RelativeX -= ShiftX;
                });

                TreeHeight += ChildrenHeight;
                TreeRightX = Math.max(TreeLeftX + ChildrenWidth, HeadRightX);
            }
            Shape.SetTreeRect(TreeLeftX, 0, TreeRightX - TreeLeftX, TreeHeight);
            //console.log(ThisNode.Label + ": " + (<any>ThisNode.Shape).TreeBoundingBox.toString());
        };
        SimpleLayoutEngine.ContextHorizontalMargin = 32;
        SimpleLayoutEngine.ContextVerticalMargin = 10;
        SimpleLayoutEngine.ChildrenVerticalMargin = 64;
        SimpleLayoutEngine.ChildrenHorizontalMargin = 12;
        return SimpleLayoutEngine;
    })(LayoutEngine);
    AssureNote.SimpleLayoutEngine = SimpleLayoutEngine;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=LayoutEngine.js.map
