///<reference path='PluginManager.ts'/>
///<reference path='CaseViewer.ts'/>
///<reference path='CaseModel.ts'/>
///<reference path='Api.ts'/>

module AssureNote {
	export class LayoutEngine {
		constructor(public AssureNoteApp: AssureNoteApp) {
		}

		//FIXME Rename
		DoLayout(PictgramPanel: PictgramPanel, NodeView: NodeView, wx: number, wy: number) {
			//TODO
		}
	}

	//export class OldLayoutEngine extends LayoutEngine {
	//	constructor(public AssureNoteApp: AssureNoteApp) {
	//		super(AssureNoteApp);
	//	}

	//	//FIXME Rename
	//	DoLayout(PictgramPanel: PictgramPanel, Label: string, wx: number, wy: number) {
	//		var Viewer = new CaseViewer(this.AssureNoteApp.Case, this.AssureNoteApp.OldPluginManager, new ServerAPI("", "", ""), PictgramPanel.ViewPort);
	//		Viewer.Draw();
	//		var TopView = Viewer.ViewMap[Viewer.ElementTop.Label];
	//		Viewer.Screen.SetCaseCenter(TopView.AbsX, TopView.AbsY, TopView.HTMLDoc);
	//	}
	//}

	export var DefaultMargin = 32;
	export var ContextMargin = 10;
	export var LevelMargin = 32;
	export var TreeMargin = 12;

	export class SimpleLayoutEngine extends LayoutEngine {
		constructor(public AssureNoteApp: AssureNoteApp) {
			super(AssureNoteApp);
		}

		GetNodeWidth(Node: NodeView): number {
			return Node.GetShape().GetNodeWidth();
		}

		GetNodeHeight(Node: NodeView): number {
			return Node.GetShape().GetNodeHeight();
		}

		DoLayout(PictgramPanel: PictgramPanel, NodeView: NodeView, wx: number, wy: number) {
			this.Layout(NodeView);

			var DivFrag = document.createDocumentFragment();
			var SvgNodeFrag = document.createDocumentFragment();
			var SvgConnectionFrag = document.createDocumentFragment();

			var list = Object.keys(PictgramPanel.ViewMap);
			for (var i = 0; i < list.length; i++) {
				var View = PictgramPanel.ViewMap[list[i]];
				View.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
				//View.Resize();
			}

			PictgramPanel.ContentLayer.appendChild(DivFrag);
			PictgramPanel.SVGLayer.appendChild(SvgConnectionFrag);
			PictgramPanel.SVGLayer.appendChild(SvgNodeFrag);

		}

		Layout(ThisNode: NodeView): void {
			if (ThisNode.IsVisible) {
				var Shape = ThisNode.GetShape();
				var TreeWidth = this.GetNodeWidth(ThisNode);
				var TreeHeight = this.GetNodeHeight(ThisNode);
				if (ThisNode.Left != null) {
					var OffsetX = 0;
					var OffsetY = 0;
					for (var i = 0; i < ThisNode.Left.length; i++) {
						var SubNode = ThisNode.Left[i];
						if (SubNode.IsVisible) {
							SubNode.ParentX = -(this.GetNodeWidth(SubNode) + DefaultMargin);
							SubNode.ParentY = OffsetY;
							if (OffsetX > (this.GetNodeWidth(SubNode) + DefaultMargin)) {
								OffsetX = (this.GetNodeWidth(SubNode) + DefaultMargin);
							}
							OffsetY += (this.GetNodeHeight(SubNode) + ContextMargin);
						}
					}
					if (OffsetY > 0) {
						TreeWidth += OffsetX;
						if (OffsetY > TreeHeight) {
							TreeHeight = OffsetY;
						}
					}
				}
				if (ThisNode.Right != null) {
					var OffsetX = 0;
					var OffsetY = 0;
					for (var i = 0; i < ThisNode.Right.length; i++) {
						var SubNode = ThisNode.Right[i];
						if (SubNode.IsVisible) {
							SubNode.ParentX = (this.GetNodeWidth(ThisNode) + DefaultMargin);
							SubNode.ParentY = OffsetY;
							if (OffsetX > (this.GetNodeWidth(SubNode) + DefaultMargin)) {
								OffsetX = (this.GetNodeWidth(SubNode) + DefaultMargin);
							}
							OffsetY += (this.GetNodeHeight(SubNode) + ContextMargin);
						}
					}
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
				if (ThisNode.Children != null) {
					for (var i = 0; i < ThisNode.Children.length; i++) {
						var SubNode = ThisNode.Children[i];
						if (SubNode.IsVisible) {
							this.Layout(SubNode);
							var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
							var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
							SubNode.ParentX = ChildrenWidth;
							SubNode.ParentY = TreeHeight;
							ChildrenWidth += ChildTreeWidth + TreeMargin;
							if (ChildTreeHeight > ChildrenHeight) {
								ChildrenHeight = ChildTreeHeight;
							}
						}
					}
					//for (var i = 0; i < ThisNode.Children.length; i++) {
					//	var SubNode = ThisNode.Children[i];
					//	if (SubNode.IsVisible) {
					//		SubNode.ParentX -= (ChildrenWidth / 2);  //centering
					//	}
					//}
				}
				Shape.SetTreeSize((ChildrenWidth > TreeWidth) ? ChildrenWidth : TreeWidth, TreeHeight + ChildrenHeight);
			}
		}

	}


	//Deperecated
	export class LayoutPortrait {
		ElementWidth: number = 50;
		X_MARGIN: number = 200;
		Y_MARGIN: number = 150;
		Y_ADJUSTMENT_MARGIN: number = 50;
		Y_NODE_MARGIN: number = 205;
		Y_NODE_ADJUSTMENT_MARGIN: number = 70;
		X_CONTEXT_MARGIN: number = 200;
		X_OVER_MARGIN: number = 700;
		X_FOOT_MARGIN: number = 100;
		X_MULTI_ELEMENT_MARGIN: number = 20;
		footelement: string[] = [];
		contextId: number = -1;

		ViewMap: { [index: string]: OldNodeView };

		constructor(ViewMap: { [index: string]: OldNodeView }, Element: NodeModel, x: number, y: number, ElementWidth: number) {
			this.footelement = [];
			this.contextId = -1;
			this.ElementWidth = ElementWidth;
			this.ViewMap = ViewMap;
			this.ViewMap[Element.Label].AbsY += y;
			this.X_MARGIN = ElementWidth + 50;
			this.X_CONTEXT_MARGIN = ElementWidth + 50;
		}

		LayoutAllView(Element: NodeModel, x: number, y: number) {
			this.Traverse(Element, x, y);
			this.SetFootElementPosition();
			this.SetAllElementPosition(Element);
		}

		UpdateContextElementPosition(ContextElement: NodeModel): void {
			var ContextView: OldNodeView = this.ViewMap[ContextElement.Label];
			var ParentView: OldNodeView = ContextView.ParentShape;
			ContextView.IsArrowWhite = true;
			ContextView.AbsX = (ParentView.AbsX + this.X_CONTEXT_MARGIN);
			if (ParentView.Source.Type == NodeType.Evidence) {
				var ContextHeight: number = ContextView.HTMLDoc.Height;
				var ParentHeight: number = ParentView.HTMLDoc.Height;
				var HeightDiffAve: number = (ParentHeight - ContextHeight) / 2;
				ContextView.AbsY = ParentView.AbsY + HeightDiffAve;
			}
			else {
				ContextView.AbsY = ParentView.AbsY;
			}
		}

		SetAllElementPosition(Element: NodeModel): void {
			var n: number = Element.Children.length;
			var ParentView: OldNodeView = this.ViewMap[Element.Label];
			var ContextIndex: number = Element.GetContextIndex();
			if (n == 0) {
				if (Element.Type == NodeType.Goal) {
					(<GoalShape>ParentView.SVGShape).SetUndevelolpedSymbolPosition(ParentView.GetAbsoluteConnectorPosition(Direction.Bottom));
				}
				return;
			}

			if (n == 1 && ContextIndex == 0) {
				this.UpdateContextElementPosition(Element.Children[0]);
			} else {
				var xPositionSum: number = 0;

				for (var i: number = 0; i < n; i++) {
					this.SetAllElementPosition(Element.Children[i]);
					if (ContextIndex != i) {
						xPositionSum += this.ViewMap[Element.Children[i].Label].AbsX;
					}
				}

				if (ContextIndex == -1) {
					ParentView.AbsX = xPositionSum / n;
				}
				else {//set context (x, y) position
					ParentView.AbsX = xPositionSum / (n - 1);
					this.UpdateContextElementPosition(Element.Children[ContextIndex]);
				}
			}

			for (var i: number = 0; i < n; i++) {
				var ChildView = this.ViewMap[Element.Children[i].Label];
				if (ContextIndex == i) {
					var p1 = ParentView.GetAbsoluteConnectorPosition(Direction.Right);
					var p2 = ChildView.GetAbsoluteConnectorPosition(Direction.Left);
					var y = Math.min(p1.y, p2.y);
					p1.y = y;
					p2.y = y;
					ChildView.SetArrowPosition(p1, p2, Direction.Left);
					ChildView.IsArrowWhite = true;
				} else {
					var p1 = ParentView.GetAbsoluteConnectorPosition(Direction.Bottom);
					var p2 = ChildView.GetAbsoluteConnectorPosition(Direction.Top);
					ChildView.SetArrowPosition(p1, p2, Direction.Bottom);
				}
			}
		}

		CalculateMinPosition(ElementList: NodeModel[]): number {
			if (ElementList[0].Type == NodeType.Context) {
				var xPosition: number = this.ViewMap[ElementList[1].Label].AbsX;
			}
			else {
				var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			}
			var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			var n: number = ElementList.length;
			for (var i: number = 0; i < n; i++) {
				if (ElementList[i].Type == NodeType.Context) {
					continue;
				}
				if (xPosition > this.ViewMap[ElementList[i].Label].AbsX) {
					xPosition = this.ViewMap[ElementList[i].Label].AbsX;
				}
			}
			return xPosition;
		}

		CalculateMaxPosition(ElementList: NodeModel[]): number {
			if (ElementList[0].Type == NodeType.Context) {
				var xPosition: number = this.ViewMap[ElementList[1].Label].AbsX;
			}
			else {
				var xPosition: number = this.ViewMap[ElementList[0].Label].AbsX;
			}

			var n: number = ElementList.length;
			for (var i: number = 0; i < n; i++) {
				var ChildView: OldNodeView = this.ViewMap[ElementList[i].Label];
				if (ElementList[i].Type == NodeType.Context) {
					continue;
				}
				if (xPosition < ChildView.AbsX) {
					xPosition = ChildView.AbsX;
				}
			}
			return xPosition;
		}

		GetSameParentLabel(PreviousNodeView: OldNodeView, CurrentNodeView: OldNodeView): string {
			var PreviousParentShape: OldNodeView = PreviousNodeView.ParentShape;
			var CurrentParentShape: OldNodeView = CurrentNodeView.ParentShape;
			var PreviousParentArray: string[] = [];
			var CurrentParentArray: string[] = [];

			while (PreviousParentShape != null) {
				PreviousParentArray.push(PreviousParentShape.Source.Label);
				PreviousParentShape = PreviousParentShape.ParentShape;
			}
			while (CurrentParentShape != null) {
				CurrentParentArray.push(CurrentParentShape.Source.Label);
				CurrentParentShape = CurrentParentShape.ParentShape;
			}
			var PreviousParentLength: number = PreviousParentArray.length;
			var CurrentParentLength: number = CurrentParentArray.length;
			for (var i: number = 0; i < PreviousParentLength; i++) {
				for (var j: number = 0; j < CurrentParentLength; j++) {
					if (PreviousParentArray[i] == CurrentParentArray[j]) {
						return PreviousParentArray[i];
					}
				}
			}
			return null;
		}

		HasContextinParentNode(PreviousNodeView: OldNodeView, SameParentLabel: string): boolean {
			var PreviousParentShape: OldNodeView = PreviousNodeView.ParentShape;
			while (PreviousParentShape != null) {
				if (PreviousParentShape.Source.Label == SameParentLabel) {
					break;
				}
				if (PreviousParentShape.Source.GetContextIndex() != -1) {
					return true;
				}
				PreviousParentShape = PreviousParentShape.ParentShape;
			}
			return false;
		}

		SetFootElementPosition(): void {
			var n: number = this.footelement.length;
			for (var i: number = 0; i < n; i++) {
				var PreviousNodeView: OldNodeView = this.ViewMap[this.footelement[i - 1]];
				var CurrentNodeView: OldNodeView = this.ViewMap[this.footelement[i]];
				CurrentNodeView.AbsX = 0;
				if (i != 0) {
					var SameParentLabel: string = this.GetSameParentLabel(PreviousNodeView, CurrentNodeView);
					var HasContext: boolean = this.HasContextinParentNode(PreviousNodeView, SameParentLabel);
					if ((PreviousNodeView.ParentShape.Source.Label != CurrentNodeView.ParentShape.Source.Label) && HasContext) {
						var PreviousParentChildren: NodeModel[] = PreviousNodeView.ParentShape.Source.Children;
						var Min_xPosition: number = this.CalculateMinPosition(PreviousParentChildren);
						var Max_xPosition: number = this.CalculateMaxPosition(PreviousParentChildren);
						var HalfChildrenWidth: number = (Max_xPosition - Min_xPosition) / 2;
						if (HalfChildrenWidth > (this.X_CONTEXT_MARGIN - this.X_MULTI_ELEMENT_MARGIN)) {
							CurrentNodeView.AbsX += this.X_MULTI_ELEMENT_MARGIN;
						}
						else {
							CurrentNodeView.AbsX += this.X_CONTEXT_MARGIN - HalfChildrenWidth;
						}
					}
					if (PreviousNodeView.Source.GetContextIndex() != -1 && (CurrentNodeView.AbsX - PreviousNodeView.AbsX) < this.X_MARGIN) {
						CurrentNodeView.AbsX += this.X_MARGIN;
					}

					CurrentNodeView.AbsX += (PreviousNodeView.AbsX + this.X_MARGIN);
					if (CurrentNodeView.AbsX - PreviousNodeView.AbsX > this.X_OVER_MARGIN) {
						CurrentNodeView.AbsX -= this.X_MARGIN;
					}
				}
			}
			return;
		}

		Traverse(Element: NodeModel, x: number, y: number) {
			if ((Element.Children.length == 0 && Element.Type != NodeType.Context) || (Element.Children.length == 1 && Element.Children[0].Type == NodeType.Context)) {
				this.footelement.push(Element.Label);
				return;
			}

			var i: number = 0;
			i = Element.GetContextIndex();
			if (i != -1) { //emit context element data
				var ContextView: OldNodeView = this.ViewMap[Element.Children[i].Label];
				var ParentView: OldNodeView = ContextView.ParentShape;
				var h1: number = ContextView.HTMLDoc.Height;
				var h2: number = ParentView.HTMLDoc.Height;
				var h: number = (h1 - h2) / 2;
				ContextView.AbsX += x;
				ContextView.AbsY += (y - h);
				ContextView.AbsX += this.X_CONTEXT_MARGIN;
				this.EmitChildrenElement(Element, ParentView.AbsX, ParentView.AbsY, i, ((this.Y_MARGIN > Math.abs(h1 - h2)) ? h2 : Math.abs(h1 - h2)));
			} else {  //emit element data except context
				var h2: number = 0;
				var CurrentView: OldNodeView = this.ViewMap[Element.Label];
				h2 = CurrentView.HTMLDoc.Height;
				this.EmitChildrenElement(Element, x, y, i, h2);
			}
		}

		EmitChildrenElement(Node: NodeModel, x: number, y: number, ContextId: number, h: number): void {
			var n: number = Node.Children.length;
			var MaxYPostition: number = 0;
			for (var i: number = 0; i < n; i++) {
				var ElementView: OldNodeView = this.ViewMap[Node.Children[i].Label];
				var j: number = Node.Children[i].GetContextIndex();
				var ContextHeight: number = 0;
				if (j != -1) {
					ContextHeight = this.ViewMap[Node.Children[i].Children[j].Label].HTMLDoc.Height;
				}
				if (ContextId == i) {
					continue;
				}
				else {
					var height: number = (ContextHeight > ElementView.HTMLDoc.Height) ? ContextHeight : ElementView.HTMLDoc.Height;
					var ParentElementView: OldNodeView = this.ViewMap[Node.Label];
					ElementView.AbsY = y;
					ElementView.AbsY = y + this.Y_MARGIN + h;
					MaxYPostition = (ElementView.AbsY > MaxYPostition) ? ElementView.AbsY : MaxYPostition;
					this.Traverse(Node.Children[i], ElementView.AbsX, ElementView.AbsY);
				}
			}
			for (var i: number = 0; i < n; i++) {
				var ElementView: OldNodeView = this.ViewMap[Node.Children[i].Label];
				if (ContextId == i) {
					continue;
				}
				else {
					ElementView.AbsY = MaxYPostition;
				}
			}
			return;
		}
	}
}