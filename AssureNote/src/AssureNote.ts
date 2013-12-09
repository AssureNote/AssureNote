///<reference path='SideMenu.ts'/>

declare function saveAs(data: Blob, filename: String): void;

module AssureNote {

	export module AssureNoteUtils {

		export function SaveAs(ContentString: string, FileName: string): void {
			var blob = new Blob([ContentString], { type: 'text/plain; charset=UTF-8' }); 
			saveAs(blob, FileName);
		}

		export function GetNodeLabel(event: Event): string {
			var element = <HTMLElement>event.srcElement;
			while (element != null) {
				if (element.id != "") {
					return element.id;
				}
				element = element.parentElement;
			}
			return "";
		}

		export function GetNodePosition(Label: string): Point {
			var element = document.getElementById(Label);
			var view = element.getBoundingClientRect();
			return new Point(view.left, view.top);
		}

		export function CreateGSNShape(NodeView: NodeView): GSNShape {
			switch (NodeView.GetNodeType()) {
				case GSNType.Goal:
					return new GSNGoalShape(NodeView);
				case GSNType.Context:
					return new GSNContextShape(NodeView);
				case GSNType.Strategy:
					return new GSNStrategyShape(NodeView);
				case GSNType.Evidence:
					return new GSNEvidenceShape(NodeView);
			}
        }

        export function CreateSVGElement(name: string): SVGElement;
        export function CreateSVGElement(name: "path"): SVGPathElement;
        export function CreateSVGElement(name: "g"): SVGGElement;
        export function CreateSVGElement(name: "rect"): SVGRectElement;
        export function CreateSVGElement(name: "ellipse"): SVGEllipseElement;
        export function CreateSVGElement(name: "circle"): SVGCircleElement;
        export function CreateSVGElement(name: "polygon"): SVGPolygonElement;
        export function CreateSVGElement(name: "polyline"): SVGPolylineElement;
        export function CreateSVGElement(name: "use"): SVGUseElement;
        export function CreateSVGElement(name: "defs"): SVGDefsElement;
        export function CreateSVGElement(name: "marker"): SVGMarkerElement;
        export function CreateSVGElement(name: string): SVGElement {
            return <SVGElement>document.createElementNS('http://www.w3.org/2000/svg', name);
        }

	}

	export class AssureNoteApp {
		PluginManager: PluginManager;
		PictgramPanel: PictgramPanel;
		PluginPanel: PluginPanel;
		IsDebugMode: boolean;
		MasterRecord: GSNRecord;

		constructor() {
			//var Api = new AssureNote.ServerAPI("http://", "", "");
			this.PluginManager = new PluginManager(this);
			this.PictgramPanel = new PictgramPanel(this);
			this.PluginPanel = new PluginPanel(this);
		}

		DebugP(Message: string): void {
			console.log(Message);
		}

		static Assert(b: boolean, message?: string): void {
			if (b == false) {
				console.log("Assert: " + message);
				throw "Assert: " + message;
			}
		}

		ExecCommand(ParsedCommand: CommandParser): void {
			var Method = ParsedCommand.GetMethod();
			if (Method == "search") {

				return;
			}
			var Plugin = this.PluginManager.GetCommandPlugin(ParsedCommand.GetMethod());
			if (Plugin != null) {
				Plugin.ExecCommand(this, ParsedCommand.GetArgs());
			}
			else {
				this.DebugP("undefined command: " + ParsedCommand.GetMethod());
			}
		}

		ProcessDroppedFiles(Files: File[]): void {
			if (Files[0]) {
				var reader = new FileReader();
				reader.onerror = (event: Event) => {
					console.log('error', (<any>event.target).error.code);
				};

				reader.onload = (event) => {
					var Contents: string = (<any>event.target).result;
					var Name: string = Files[0].name;

					this.MasterRecord = new GSNRecord();
					this.MasterRecord.Parse(Contents);

					var LatestDoc = this.MasterRecord.GetLatestDoc();
					var TopGoalNode = LatestDoc.TopGoal;

                    this.PictgramPanel.SetView(new NodeView(TopGoalNode, true));

                    this.PictgramPanel.Draw();

                    var Shape = this.PictgramPanel.MasterView.GetShape();
                    var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
                    var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
                    this.PictgramPanel.ViewPort.SetOffset(WX, WY);
				};
				reader.readAsText(Files[0], 'utf-8');
			}
		}
	}

}

