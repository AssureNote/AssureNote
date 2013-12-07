
module AssureNote {
	export class LayoutEngine {
		constructor(public AssureNoteApp: AssureNoteApp) {
		}

		//FIXME Rename
		DoLayout(PictgramPanel: PictgramPanel, NodeView: NodeView): void {
			//TODO
		}
	}

	export var DefaultMargin = 32;
	export var ContextMargin = 10;
	export var LevelMargin = 32;
	export var TreeMargin = 12;

	export class SimpleLayoutEngine extends LayoutEngine {
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
                var OffsetY = -ContextMargin;
                ThisNode.ForEachVisibleLeftNodes((SubNode: NodeView) => {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += ContextMargin;
                    SubNode.RelativeX = -(this.GetNodeWidth(SubNode) + DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, this.GetNodeWidth(SubNode) + DefaultMargin);
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
                var OffsetY = -ContextMargin;
                ThisNode.ForEachVisibleRightNodes((SubNode: NodeView) => {
                    SubNode.GetShape().FitSizeToContent();
                    OffsetY += ContextMargin;
                    SubNode.RelativeX = (this.GetNodeWidth(ThisNode) + DefaultMargin);
                    SubNode.RelativeY = OffsetY;
                    OffsetX = Math.max(0, DefaultMargin + this.GetNodeWidth(SubNode));
                    OffsetY += this.GetNodeHeight(SubNode);
                });
				if (OffsetY > 0) {
					TreeWidth += OffsetX;
					if (OffsetY > TreeHeight) {
						TreeHeight = OffsetY;
					}
				}
			}
			TreeHeight += LevelMargin;
			var ChildrenWidth = 0;
            var ChildrenHeight = 0;
            var VisibleChildCount = 0;
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    this.Layout(SubNode);
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    SubNode.RelativeX = ChildrenWidth;
                    SubNode.RelativeY = TreeHeight;
                    ChildrenWidth += ChildTreeWidth + TreeMargin;
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                    VisibleChildCount++;
                });
                ChildrenWidth -= TreeMargin;

                var HeadWidth = VisibleChildCount == 1 ? TreeWidth : this.GetNodeWidth(ThisNode);
                var Shift = (ChildrenWidth - this.GetNodeWidth(ThisNode)) / 2;
                TreeLeftX = Math.min(TreeLeftX, -Shift);
                ThisNode.ForEachVisibleChildren((SubNode: NodeView) => {
                    SubNode.RelativeX -= Shift;
                    SubNode.RelativeX += -SubNode.Shape.GetTreeLeftX();
                });
            }
            Shape.SetTreeUpperLeft(TreeLeftX, 0);
            Shape.SetTreeSize(Math.max(ChildrenWidth, TreeWidth + -TreeLeftX), TreeHeight + ChildrenHeight);
            console.log(ThisNode.Label + ": " + (<any>ThisNode.Shape).TreeBoundingBox.toString());
		}

	}

}