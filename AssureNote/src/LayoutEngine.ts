
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
        static DefaultMargin = 32;
        static ContextMargin = 10;
        static LevelMargin = 64;
        static TreeMargin = 12;

        constructor(public AssureNoteApp: AssureNoteApp) {
			super(AssureNoteApp);
		}

        private Render(ThisNode: NodeView, DivFrag: DocumentFragment, SvgNodeFrag: DocumentFragment, SvgConnectionFrag: DocumentFragment): void {
            if (ThisNode.IsVisible) {
                ThisNode.GetShape().PrerenderContent();
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
                Shape.SetHeadSize(ThisNodeWidth, TreeHeight);
                Shape.SetTreeSize(ThisNodeWidth, TreeHeight);
                Shape.SetHeadUpperLeft(0, 0);
                Shape.SetTreeUpperLeft(0, 0);
            }
			if (ThisNode.Left != null) {
				var OffsetX = 0;
                var OffsetY = -SimpleLayoutEngine.ContextMargin;
                ThisNode.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += SimpleLayoutEngine.ContextMargin;
                    SubNode.RelativeX = -(SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.DefaultMargin);
                    OffsetY += SubNode.Shape.GetNodeHeight();
                });
				if (OffsetY > 0) {
                    TreeRightX += OffsetX;
                    TreeLeftX = -OffsetX;
					if (OffsetY > TreeHeight) {
						TreeHeight = OffsetY;
					}
				}
			}
			if (ThisNode.Right != null) {
				var OffsetX = 0;
                var OffsetY = -SimpleLayoutEngine.ContextMargin;
                ThisNode.ForEachVisibleRightNodes((SubNode: NodeView) => {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += SimpleLayoutEngine.ContextMargin;
                    SubNode.RelativeX = (SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, SimpleLayoutEngine.DefaultMargin + SubNode.Shape.GetNodeWidth());
                    OffsetY += SubNode.Shape.GetNodeHeight();
                });
				if (OffsetY > 0) {
					TreeRightX += OffsetX;
					if (OffsetY > TreeHeight) {
						TreeHeight = OffsetY;
					}
				}
			}
            var HeadWidth = TreeRightX - TreeLeftX;
            Shape.SetHeadSize(HeadWidth, TreeHeight);
            Shape.SetHeadUpperLeft(TreeLeftX, 0);
            TreeHeight += SimpleLayoutEngine.LevelMargin;
            var ChildrenTopWidth = 0;
            var ChildrenBottomWidth = 0;
            var ChildrenHeight = 0;
            var FoldedNodeRun: NodeView[] = [];
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                var IsLastChildFolded = false;
                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    this.Layout(SubNode);
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    var ChildHeadWidth = SubNode.IsFolded ? SubNode.Shape.GetNodeWidth() : SubNode.Shape.GetHeadWidth();
                    var ChildHeadLeftSideMargin = -SubNode.Shape.GetTreeLeftX() + SubNode.Shape.GetHeadLeftX();//(ChildTreeWidth - ChildHeadWidth) * 0.5;
                    var ChildHeadRightX = ChildHeadLeftSideMargin + ChildHeadWidth;
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    var Margin = SimpleLayoutEngine.TreeMargin;

                    //var DoCompaction = true;

                    var IsUndeveloped = SubNode.Children == null || SubNode.Children.length == 0;
                    var IsFoldedLike = SubNode.IsFolded || IsUndeveloped;

                    if (/*DoCompaction && */IsFoldedLike) {
                        SubNode.RelativeX = ChildrenTopWidth;
                        ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + Margin;
                        FoldedNodeRun.push(SubNode);
                    } else {
                        if (/*DoCompaction && */IsLastChildFolded) {
                            var WidthDiff = ChildrenTopWidth - ChildrenBottomWidth;
                            if (WidthDiff < ChildHeadLeftSideMargin) {
                                SubNode.RelativeX = ChildrenBottomWidth;
                                ChildrenTopWidth = ChildrenBottomWidth + ChildHeadRightX + Margin;
                                ChildrenBottomWidth = ChildrenBottomWidth + ChildTreeWidth + Margin;
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
                                ChildrenBottomWidth = ChildrenTopWidth + ChildTreeWidth - ChildHeadLeftSideMargin + Margin;
                                ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + Margin;
                            }
                        } else {
                            var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth);
                            SubNode.RelativeX = ChildrenWidth;
                            ChildrenTopWidth = ChildrenWidth + ChildHeadRightX + Margin;
                            ChildrenBottomWidth = ChildrenWidth + ChildTreeWidth + Margin;
                        }
                        FoldedNodeRun = [];
                        SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
                    }
                    SubNode.RelativeY = TreeHeight;

                    IsLastChildFolded = IsFoldedLike;
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                    //console.log("T" + ChildrenTopWidth + ", B" + ChildrenBottomWidth);
                });

                var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth) - SimpleLayoutEngine.TreeMargin;
                var Shift = (ChildrenWidth - ThisNodeWidth) / 2;
                TreeLeftX = Math.min(TreeLeftX, -Shift);
                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    SubNode.RelativeX -= Shift;
                });

                TreeHeight += ChildrenHeight;
                TreeRightX= Math.max(ChildrenWidth, HeadWidth);
            }
            Shape.SetTreeUpperLeft(TreeLeftX, 0);
            Shape.SetTreeSize(TreeRightX, TreeHeight);
            //console.log(ThisNode.Label + ": " + (<any>ThisNode.Shape).TreeBoundingBox.toString());
		}

	}

}