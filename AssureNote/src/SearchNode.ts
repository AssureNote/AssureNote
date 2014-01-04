/// <reference path="./AssureNoteParser.ts" />

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

		Search(TargetView: NodeView, IsTurn: boolean, SearchWord?: string): void {
			var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
			var ViewPort = this.AssureNoteApp.PictgramPanel.Viewport;
			if (SearchWord != null) {
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
                ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;

                this.SetAllNodesColor(ViewMap, ColorStyle.Searched);
				this.SetDestination(this.HitNodes[0], ViewMap);
                ViewMap[this.HitNodes[0].GetLabel()].Shape.ChangeColorStyle(ColorStyle.SearchHighlight);
				this.MoveToNext(ViewPort, () => {
					this.IsMoving = false;
				});
			} else {
				if (this.HitNodes.length == 1) {
					return;
				}
                if (!IsTurn) {
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
				this.SetDestination(this.HitNodes[this.NodeIndex], ViewMap);
				this.MoveToNext(this.AssureNoteApp.PictgramPanel.Viewport, () => {
                    ViewMap[this.HitNodes[this.NodeIndex].GetLabel()].Shape.ChangeColorStyle(ColorStyle.SearchHighlight);
                    var index = 0;
                    if (!IsTurn) {
                        index = (this.NodeIndex == 0) ? this.HitNodes.length - 1 : this.NodeIndex - 1;
                    } else {
                        index = (this.NodeIndex == this.HitNodes.length - 1) ? 0 : this.NodeIndex + 1;
					}
                    ViewMap[this.HitNodes[index].GetLabel()].Shape.ChangeColorStyle(ColorStyle.Searched); //Disable Highlight
					this.IsMoving = false;
				});
			}
		}

        private CreateHitNodeView(ViewMap: { [index: string]: NodeView }): void {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Node = ViewMap[this.HitNodes[i].GetLabel()];
                while (Node != null) {
                    Node.IsFolded = false;
                    Node = Node.Parent;
                }
            }

            var TopGoal = this.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode;
            var NewNodeView: NodeView = new NodeView(TopGoal, true);
            NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.SetView(NewNodeView);
            this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);
        }

        IsSearching(): boolean {
            return this.Searching;
        }

		ResetParam(): void {
            this.SetAllNodesColor(this.AssureNoteApp.PictgramPanel.ViewMap, ColorStyle.Default);
            this.HitNodes = [];
			this.NodeIndex = 0;
            this.SearchWord = "";
            this.Searching = false;
		}

        private SetAllNodesColor(ViewMap: { [index: string]: NodeView }, ColorCode: string): void {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Label: string = this.HitNodes[i].GetLabel();
                var Node = ViewMap[Label];
                if (Node != null) {
                    Node.GetShape().ChangeColorStyle(ColorCode);
                }
            }
        }

		private SetDestination(HitNode: GSNNode, ViewMap: { [index: string]: NodeView }): void {
			if (HitNode == null) {
				return;
			}
			var TargetView = ViewMap[HitNode.GetLabel()];
            var Viewport = this.AssureNoteApp.PictgramPanel.Viewport;
            this.DestinationX = Viewport.GetPageCenterX() - TargetView.GetCenterGX();
            this.DestinationY = Viewport.GetPageCenterY() - TargetView.GetCenterGY();
			return;
		}

		private MoveToNext(ViewPort: ViewportManager, Callback: () => void): void {
			this.Move(this.DestinationX, this.DestinationY, 100, ViewPort);
			Callback();
		}

		private Move(logicalOffsetX: number, logicalOffsetY: number, duration: number, ViewPort: ViewportManager): void {
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