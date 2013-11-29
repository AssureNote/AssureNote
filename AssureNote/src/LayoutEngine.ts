///<reference path='PluginManager.ts'/>
///<reference path='CaseViewer.ts'/>
///<reference path='CaseModel.ts'/>
///<reference path='Api.ts'/>

module AssureNote {
	export class LayoutEngine {
		constructor(public AssureNoteApp: AssureNoteApp) {
		}

		//FIXME Rename
		DoLayout(PictgramPanel: PictgramPanel, Label: string, wx: number, wy: number) {
			//TODO
		}
	}

	export class OldLayoutEngine extends LayoutEngine {
		constructor(public AssureNoteApp: AssureNoteApp) {
			super(AssureNoteApp);
		}

		//FIXME Rename
		DoLayout(PictgramPanel: PictgramPanel, Label: string, wx: number, wy: number) {
			var Viewer = new CaseViewer(this.AssureNoteApp.Case, this.AssureNoteApp.OldPluginManager, new ServerAPI("", "", ""), PictgramPanel.ViewPort);
			Viewer.Draw();
			var TopView = Viewer.ViewMap[Viewer.ElementTop.Label];
			Viewer.Screen.SetCaseCenter(TopView.AbsX, TopView.AbsY, TopView.HTMLDoc);
		}
	}

	export var DefaultWidth = 96;
	export var DefaultMargin = 32;
	export var ContextMargin = 10;
	export var LevelMargin = 32;
	export var TreeMargin = 12;

	export class SimpleLayoutEngine extends LayoutEngine {
		constructor(public AssureNoteApp: AssureNoteApp) {
			super(AssureNoteApp);
		}

		GetHeight(Node: NodeView): number {
			return 72; // todo
		}

		private SetAbsolutePosition(NodeView: NodeView, wx: number, wy: number): void {
			NodeView.Shape.SetPosition(wx, wy);
			var Children = NodeView.Children;
			if (Children == null) {
				return;
			}
			var x = wx;
			var y = wy + NodeView.Shape.Height;
			for (var i = 0; i < Children.length; i++) {
				this.SetAbsolutePosition(Children[i], x, y);
				x += Children[i].Shape.Width;
				var p1 = NodeView.GetAbsoluteConnectorPosition(Direction.Bottom);
				var p2 = Children[i].GetAbsoluteConnectorPosition(Direction.Top);
				Children[i].SetArrowPosition(p1, p2, Direction.Bottom);
			}
		}

		DoLayout(PictgramPanel: PictgramPanel, Label: string, wx: number, wy: number) {
			var NodeView = this.AssureNoteApp.GSNView.GetNode(Label);
			this.Layout(NodeView, NodeView.Shape);
			this.SetAbsolutePosition(NodeView, wx, wy);
		}

		Layout(ThisNode: NodeView, Shape: GSNShape): void {
			if (ThisNode.IsVisible) {
				var ParentWidth = DefaultWidth;
				var ParentHeight = this.GetHeight(ThisNode);
				if (ThisNode.Left != null) {
					var OffsetGyLeft = 0;
					for (var i = 0; i < ThisNode.Left.length; i++) {
						var Node = ThisNode.Left[i];
						if (Node.IsVisible) {
							Node.OffsetGx = - (DefaultWidth + DefaultMargin);
							Node.OffsetGy = OffsetGyLeft;
							OffsetGyLeft + (Node.GetShape().GetHeight() + ContextMargin);
						}
					}
					if (OffsetGyLeft > 0) {
						ParentWidth += (DefaultWidth + DefaultMargin);
						if (OffsetGyLeft > ParentHeight) {
							ParentHeight = OffsetGyLeft;
						}
					}
				}
				if (ThisNode.Right != null) {
					var OffsetGyRight = 0;
					for (var i = 0; i < ThisNode.Right.length; i++) {
						var Node = ThisNode.Right[i];
						if (Node.IsVisible) {
							Node.OffsetGx += (DefaultWidth + DefaultMargin);
							Node.OffsetGy = OffsetGyRight;
							OffsetGyRight + (Node.Shape.GetHeight() + ContextMargin);
						}
					}
					if (OffsetGyRight > 0) {
						ParentWidth += (DefaultWidth + DefaultMargin);
						if (OffsetGyRight > ParentHeight) {
							ParentHeight = OffsetGyRight;
						}
					}
				}
				var ChildrenWidth = 0;
				ParentHeight += LevelMargin;
				Shape.Height = ParentHeight;
				if (ThisNode.Children != null) {
					for (var i = 0; i < ThisNode.Children.length; i++) {
						var Node = ThisNode.Children[i];
						if (Node.IsVisible) {
							var SubShape = Node.GetShape();
							this.Layout(Node, SubShape);
							Node.OffsetGx = ChildrenWidth;
							Node.OffsetGy = ParentHeight;
							ChildrenWidth += (SubShape.Width + TreeMargin);
							if (ParentHeight + SubShape.Height > Shape.Height) {
								Shape.Height = ParentHeight + SubShape.Height;
							}
						}
					}
					for (var i = 0; i < ThisNode.Children.length; i++) {
						var Node = ThisNode.Children[i];
						if (Node.IsVisible) {
							Node.OffsetGx -= (ChildrenWidth / 2);  //centering
						}
					}
				}
				Shape.Width = (ChildrenWidth > ParentWidth) ? ChildrenWidth : ParentWidth;
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