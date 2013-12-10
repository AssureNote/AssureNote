
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

		private GetNodeWidth(Node: NodeView): number {
			return Node.GetShape().GetNodeWidth();
		}

		private GetNodeHeight(Node: NodeView): number {
			return Node.GetShape().GetNodeHeight();
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
			var TreeWidth = this.GetNodeWidth(ThisNode);
			var TreeHeight = this.GetNodeHeight(ThisNode);
			if (ThisNode.Left != null) {
				var OffsetX = 0;
                var OffsetY = -SimpleLayoutEngine.ContextMargin;
                ThisNode.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += SimpleLayoutEngine.ContextMargin;
                    SubNode.RelativeX = -(this.GetNodeWidth(SubNode) + SimpleLayoutEngine.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, this.GetNodeWidth(SubNode) + SimpleLayoutEngine.DefaultMargin);
                    OffsetY += this.GetNodeHeight(SubNode);
                });
				if (OffsetY > 0) {
                    TreeWidth += OffsetX;
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
                    SubNode.RelativeX = (this.GetNodeWidth(ThisNode) + SimpleLayoutEngine.DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, SimpleLayoutEngine.DefaultMargin + this.GetNodeWidth(SubNode));
                    OffsetY += this.GetNodeHeight(SubNode);
                });
				if (OffsetY > 0) {
					TreeWidth += OffsetX;
					if (OffsetY > TreeHeight) {
						TreeHeight = OffsetY;
					}
				}
			}
            TreeHeight += SimpleLayoutEngine.LevelMargin;

            var ChildrenWidth = 0;
            var ChildrenHeight = 0;
            var VisibleChildCount = 0;
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                var TopRightX = 0;
                var BottomRightX = 0;
                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    this.Layout(SubNode);
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    SubNode.RelativeY = TreeHeight;
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                    var ChildNodeWidth = SubNode.Shape.GetNodeWidth();
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    if (SubNode.IsFolded || SubNode.Children != null) {
                        SubNode.RelativeX = TopRightX;
                        TopRightX += ChildTreeWidth + SimpleLayoutEngine.TreeMargin;
                    }                            
                    else {
                        var TopLeftWidth = (SubNode.Left != null) ? ChildNodeWidth : 0;
                        TopLeftWidth += SimpleLayoutEngine.ContextMargin;
                        if (TopRightX + ChildNodeWidth > BottomRightX + (ChildTreeWidth / 2)) {
                            BottomRightX = TopRightX;
                        }
                        SubNode.RelativeX = BottomRightX;
                        TopRightX = BottomRightX;
                        BottomRightX += ChildTreeWidth + SimpleLayoutEngine.TreeMargin;
                        var TopWidth = ChildNodeWidth;
                        if (SubNode.Left != null) {
                            TopWidth += ChildNodeWidth + SimpleLayoutEngine.ContextMargin;
                        }
                        if (SubNode.Left != null) {
                            TopWidth += ChildNodeWidth + SimpleLayoutEngine.ContextMargin;
                        }
                        TopRightX = BottomRightX - TopWidth;
                    }
                    VisibleChildCount++;
                });
                ChildrenWidth = Math.max(TopRightX, BottomRightX);
                var HeadWidth = VisibleChildCount == 1 ? TreeWidth : this.GetNodeWidth(ThisNode);
                var Shift = (ChildrenWidth - this.GetNodeWidth(ThisNode)) / 2;
                TreeLeftX = Math.min(TreeLeftX, -Shift);
                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    SubNode.RelativeX -= Shift;
                    SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
                });
            }

            //var ChildrenWidth = 0;
            //var ChildrenHeight = 0;
            //var VisibleChildCount = 0;
            //if (ThisNode.Children != null && ThisNode.Children.length > 0) {
            //    ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
            //        this.Layout(SubNode);
            //        var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
            //        var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
            //        SubNode.RelativeX = ChildrenWidth;
            //        SubNode.RelativeY = TreeHeight;
            //        ChildrenWidth += ChildTreeWidth + SimpleLayoutEngine.TreeMargin;
            //        ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
            //        VisibleChildCount++;
            //    });
            //    ChildrenWidth -= SimpleLayoutEngine.TreeMargin;
            //    // FIXME: compaction algorithm
            //    for (var i = 0; i < ThisNode.Children.length - 1; i++) {
            //        var LeftSubNode = ThisNode.Children[i];
            //        if (LeftSubNode.IsFolded) {
            //            LeftSubNode
            //        }
            //        var RightSubNode = ThisNode.Children[i + 1];

            //        LeftSubNode.Shape.GetTreeWidth();

            //        if (LeftSubNode.IsFolded == RightSubNode.IsFolded) {
            //            continue;
            //        }
            //        if (LeftSubNode.IsFolded) {
            //            var W = RightSubNode.GetShape().GetNodeWidth();
            //            if (RightSubNode.Left != null) {
            //                W = W * 1.5 + SimpleLayoutEngine.ContextMargin;
            //            } else {
            //                W += SimpleLayoutEngine.ContextMargin;
            //            }
            //            var Shift = RightSubNode.GetShape().GetTreeWidth() / 2 - W;
            //            for (var j = i + 1; j < ThisNode.Children.length; j++) {
            //                ThisNode.Children[j].RelativeX -= Shift;
            //            }
            //            //ChildrenWidth -= Shift;
            //        }
            //        if (RightSubNode.IsFolded) {
            //            var W = LeftSubNode.GetShape().GetNodeWidth();
            //            if (LeftSubNode.Right != null) {
            //                W = W * 1.5 + SimpleLayoutEngine.ContextMargin;
            //            } else {
            //                W += SimpleLayoutEngine.ContextMargin;
            //            }
            //            var Shift = RightSubNode.GetShape().GetTreeWidth() / 2 - W;
            //            for (var j = i + 1; j < ThisNode.Children.length; j++) {
            //                ThisNode.Children[j].RelativeX += Shift;
            //            }
            //            //ChildrenWidth -= Shift;
            //        }
            //    }
            //    var HeadWidth = VisibleChildCount == 1 ? TreeWidth : this.GetNodeWidth(ThisNode);
            //    var Shift = (ChildrenWidth - this.GetNodeWidth(ThisNode)) / 2;
            //    TreeLeftX = Math.min(TreeLeftX, -Shift);
            //    ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
            //        SubNode.RelativeX -= Shift;
            //        SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
            //    });
            //}
            Shape.SetTreeUpperLeft(TreeLeftX, 0);
            Shape.SetTreeSize(Math.max(ChildrenWidth, TreeWidth + -TreeLeftX), TreeHeight + ChildrenHeight);
            console.log(ThisNode.Label + ": " + (<any>ThisNode.Shape).TreeBoundingBox.toString());
		}

	}

}