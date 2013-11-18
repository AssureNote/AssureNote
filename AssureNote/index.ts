///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/PluginManager.ts'/>

module AssureNote {

	export class GSNRecord {
	}

	export class GSNDoc {
	}

	export class GSNNode {
	}

	export class Navigator {
		CurrentDoc: GSNDoc;
		CurrentLabel: string;
		CurrentWx: number;
		CurrentWy: number;

		Display(Label: string, Wx: number, Wy: number): void {
			//TODO
		}

		Redraw(): void {
			this.Display(this.CurrentLabel, this.CurrentWx, this.CurrentWy);
		}

		NavigateUp(): void { }
		NavigateDown(): void { }
		NavigateLeft(): void { }
		NavigateRight(): void { }
		NavigateHome(): void { }
	}

	export class ColorStyle {

	}

	export class NodeView {
		Model: GSNNode;
		IsVisible: boolean;
		Label: string;
		OffsetGx: number;
		OffsetGy: number;
		Width: number;
		Height: number;
		Color: ColorStyle;
		Parent: NodeView;
		Left: NodeView[];
		Right: NodeView[];
		Children: NodeView[];

		GetGx(): number {
			if (this.Parent == null) {
				return this.OffsetGx;
			}
			return this.GetGx() + this.OffsetGx;
		}

		GetGy(): number {
			if (this.Parent == null) {
				return this.OffsetGy;
			}
			return this.GetGy() + this.OffsetGy;
		}

		Layout(LayoutEngine: SimpleLayoutEngine): void {
			LayoutEngine.Layout(this);
			this.OffsetGx = LayoutEngine.Width / 2;
			this.OffsetGy = LevelMargin;
		}

		DisplayContent(Content: HTMLElement) {
			if (this.IsVisible) {

			}
		}
	}

	var DefaultWidth = 96;
	var DefaultMargin = 32;
	var ContextMargin = 10;
	var LevelMargin = 32;
	var TreeMargin = 12;

	export class SimpleLayoutEngine {
		Width: number;
		Height: number;
		constructor() {
			this.Width = 0;
			this.Height = 0;
		}

		GetHeight(Node: NodeView): number {
			return 72; // todo
		}

		Layout(ThisNode: NodeView): void {
			this.Width = 0;
			this.Height = 0;
			if (ThisNode.IsVisible) {
				var ParentWidth = DefaultWidth;
				var ParentHeight = this.GetHeight(ThisNode);
				if (ThisNode.Left != null) {
					var OffsetGyLeft = 0;
					for (var Node in ThisNode.Left) {
						if (Node.IsVisible) {
							Node.OffsetGx = - (DefaultWidth + DefaultMargin);
							Node.OffsetGy = OffsetGyLeft;
							OffsetGyLeft + (Node.GetHeight() + ContextMargin);
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
					for (var Node in ThisNode.Right) {
						if (Node.IsVisible) {
							Node.OffsetGx = + (DefaultWidth + DefaultMargin);
							Node.OffsetGy = OffsetGyRight;
							OffsetGyRight + (Node.GetHeight() + ContextMargin);
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
				this.Height = ParentHeight;
				if (ThisNode.Children != null) {
					for (var Node in ThisNode.Children) {
						if (Node.IsVisible) {
							var LayoutedSubBox = new SimpleLayoutEngine();
							Node.Layout(LayoutedSubBox);
							Node.OffsetGx = ChildrenWidth;
							Node.OffsetGy = ParentHeight;
							ChildrenWidth += (LayoutedSubBox.Width + TreeMargin);
							if (ParentHeight + LayoutedSubBox.Height > this.Height) {
								this.Height = ParentHeight + LayoutedSubBox.Height;
							}
						}
					}
					for (var Node in ThisNode.Children) {
						if (Node.IsVisible) {
							Node.OffsetGx -= (ChildrenWidth / 2);  //centering
						}
					}
				}
				this.Width = (ChildrenWidth > ParentWidth) ? ChildrenWidth : ParentWidth;
			}
		}

	}


}

module AssureNote {
	//Deprecated
	export class FixMeModel {
	}

}


$(() => {
	var AssureNoteApp = new AssureNote.AssureNoteApp();

	//Api.GetCase(1, 1, (CaseData: any) => {
	//	var contents = CaseData.contents;
	//	var summary = CaseData.summary;

	//	Case.SetInitialData(CaseData.DCaseName, JSON.stringify(summary), contents, CaseData.caseId, CaseData.commitId);
	//	//Case.ParseASN(contents, null);
	//	//var casedecoder = new assureit.casedecoder();
	//	//var root = casedecoder.parseasn(case0, contents, null);
	//	//case0.setelementtop(root);

	//	var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
	//	var Viewer = new AssureIt.CaseViewer(Case, pluginManager, Api, Screen);

	//	pluginManager.RegisterKeyEvents(Viewer, Case, Api);
	//	pluginManager.CreateSideMenu(Viewer, Case, Api);

	//	Viewer.Draw();
	//	var TopView = Viewer.ViewMap[Viewer.ElementTop.Label];
	//	Viewer.Screen.SetCaseCenter(TopView.AbsX, TopView.AbsY, TopView.HTMLDoc);

	//});
});