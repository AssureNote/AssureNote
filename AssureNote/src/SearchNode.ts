/// <reference path="./AssureNoteParser.ts" />

module AssureNote {
	//class SearchWordKeyPlugIn extends AssureIt.ShortcutKeyPlugIn {

	//	constructor(public plugInManager: AssureIt.PlugInManager) {
	//		super(plugInManager);
	//	}

	//	RegisterKeyEvents(caseViewer: AssureIt.CaseViewer, Case0: AssureIt.Case, serverApi: AssureIt.ServerAPI): boolean {

	//		$("body").keydown((e) => {
	//		});

	//		$('#searchbtn').click((ev: JQueryEventObject) => {
	//			ev.preventDefault();
	//			if (!Target.MoveFlag && $('.form-control').val() != "") {
	//				Target.Search(Target.CheckInput(caseViewer), ev.shiftKey, caseViewer, Case0);
	//			} else {
	//				Target.SetAllNodesColor(Target.HitNodes, caseViewer, "Default");
	//				Target.ResetParam();
	//			}
	//		});
	//		return true;
	//	}
	//}

	export class Search {

		SearchWord: string;
		DestinationX: number;
		DestinationY: number;
		NodeIndex: number;
		MoveFlag: boolean;
		HitNodes: GSNNode[];

		constructor(public AssureNoteApp: AssureNoteApp) {
			this.SearchWord = "";
			this.DestinationX = 0;
			this.DestinationY = 0;
			this.NodeIndex = 0;
			this.MoveFlag = false;
			this.HitNodes = [];
		}

		Search(TargetView: NodeView, SearchWord?: string): void {
			var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
			var ViewPort = this.AssureNoteApp.PictgramPanel.ViewPort;
			this.AssureNoteApp.DebugP("Keyword is "+ SearchWord);
			if (SearchWord != null) {
				this.SearchWord = SearchWord;

				if (this.SearchWord == "") {
					return;
				}
				this.HitNodes = TargetView.Model.SearchNode(this.SearchWord);

				if (this.HitNodes.length == 0) {
					this.SearchWord = "";
					return;
				}

				this.MoveFlag = true;
				this.SetAllNodesColor(this.HitNodes, TargetView, "Search");
				this.SetDestination(this.HitNodes[0], TargetView);
				ViewMap[this.HitNodes[0].GetLabel()].Shape;//.EnableHighlight(); //TODO
				this.MoveToNext(ViewPort, () => {
					this.MoveFlag = false;
				});
			} else {
				if (this.HitNodes.length == 1) {
					return;
				}
				//if (!ShiftKey) {
				//	this.NodeIndex++;
				//	if (this.NodeIndex == this.HitNodes.length) {
				//		this.NodeIndex = 0;
				//	}
				//} else {
				//	this.NodeIndex--;
				//	if (this.NodeIndex == -1) {
				//		this.NodeIndex = this.HitNodes.length - 1;
				//	}
				//}


				this.MoveFlag = true;
				this.SetDestination(this.HitNodes[this.NodeIndex], ViewMap);
				this.MoveToNext(this.AssureNoteApp.PictgramPanel.ViewPort, () => {
					//ViewMap[this.HitNodes[this.NodeIndex].GetLabel()].Shape.EnableHighlight();
					//if (!ShiftKey) {
					//	if (this.NodeIndex == 0) {
					//		CaseViewer.ViewMap[this.HitNodes[this.HitNodes.length - 1].Label].SVGShape.DisableHighlight();
					//	} else {
					//		CaseViewer.ViewMap[this.HitNodes[this.NodeIndex - 1].Label].SVGShape.DisableHighlight();
					//	}
					//} else {
					//	if (this.NodeIndex == this.HitNodes.length - 1) {
					//		CaseViewer.ViewMap[this.HitNodes[0].Label].SVGShape.DisableHighlight();
					//	} else {
					//		CaseViewer.ViewMap[this.HitNodes[this.NodeIndex + 1].Label].SVGShape.DisableHighlight();
					//	}
					//}
					this.MoveFlag = false;
				});
			}
		}

		ResetParam(): void {
			this.HitNodes = [];
			this.NodeIndex = 0;
			this.SearchWord = "";
		}

		CheckInput(ViewMap: { [index: string]: NodeView }): boolean {
			if ($('.form-control').val() == this.SearchWord && this.HitNodes.length > 1) {
				return false;
			} else {
				this.SetAllNodesColor(this.HitNodes, ViewMap, "Default");
				this.HitNodes = [];
				return true;
			}
		}

		SetAllNodesColor(HitNodes: GSNNode[], ViewMap: {[index: string]: NodeView}, ColorTheme: string): void {
			switch (ColorTheme) {
				case "Default":
					for (var i = 0; i < HitNodes.length; i++) {
						var Label: string = HitNodes[i].GetLabel();
						//TODO
						//ViewMap[Label].Shape.SetColor(Color.Default);
						//ViewMap[Label].Shape.DisableHighlight();
					}
					break;
				case "Search":
					for (var i = 0; i < HitNodes.length; i++) {
						var thisNodeLabel: string = this.HitNodes[i].GetLabel();
						//ViewMap[thisNodeLabel].Shape.SetColor(Color.Searched);
					}
					break;
			}
		}

		SetDestination(HitNode: GSNNode, ViewMap: { [index: string]: NodeView }): void {
			if (HitNode == undefined) {
				return;
			}
			var TargetView = ViewMap[HitNode.GetLabel()];
			//var screenManager: AssureIt.ScreenManager = ViewMap.Screen;
			//var NodePosX: number = CaseMap.AbsX;
			//var NodePosY: number = CaseMap.AbsY;
			//this.DestinationX = screenManager.ConvertX(NodePosX, currentHTML);
			//this.DestinationY = screenManager.ConvertY(NodePosY, currentHTML);
			return;
		}

		MoveToNext(ViewPort: ViewportManager, callback: () => void): void {
			this.Move(this.DestinationX, this.DestinationY, 100, ViewPort);
			callback();
		}

		Move(logicalOffsetX: number, logicalOffsetY: number, duration: number, ViewPort: ViewportManager): void {
			var cycle = 1000 / 30;
			var cycles = duration / cycle;
			var initialX = ViewPort.GetOffsetX();
			var initialY = ViewPort.GetOffsetY();

			var deltaX = (logicalOffsetX - initialX) / cycles;
			var deltaY = (logicalOffsetY - initialY) / cycles;

			var currentX = initialX;
			var currentY = initialY;
			var count = 0;

			var move = () => {
				if (count < cycles) {
					count += 1;
					currentX += deltaX;
					currentY += deltaY;
					ViewPort.SetLogicalOffset(currentX, currentY, 1);
					setTimeout(move, cycle);
				} else {
					ViewPort.SetLogicalOffset(logicalOffsetX, logicalOffsetY, 1);
					return;
				}
			}
		move();
		}
	}
}