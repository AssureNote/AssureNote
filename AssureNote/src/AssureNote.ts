///<reference path='PluginManager.ts'/>

module AssureNote {

	export module AssureNoteUtils {

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
		//Viewer: AssureNoteViewer;


		Case: Case; //Deprecated
		OldPluginManager: OldPlugInManager; //Deprecated

		constructor() {
			//var Api = new AssureNote.ServerAPI("http://", "", "");
			this.OldPluginManager = new OldPlugInManager("");
			this.PluginManager = new PluginManager(this);
			this.PictgramPanel = new PictgramPanel(this);
			this.PluginPanel = new PluginPanel(this);
			//this.GSNRecord = new GSNRecord();
		}

		DebugP(Message: string): void {
			console.log(Message);
		}

		static Assert(b: boolean, message?: string): void {
			if (b == false) {
				console.log("Assert: " + message);
			}
		}

		ExecCommand(CommandLine: string): void {
			var ParsedCommand = new CommandParser(CommandLine);
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
					// ---Deprecated--
					//var Case0: Case = new Case(Name, "{}", Contents, 0, 0, new OldPlugInManager(""));
					
					//var casedecoder = new CaseDecoder();
					//var root: NodeModel = casedecoder.ParseASN(Case0, Contents, null);
					//Case0.SetElementTop(root);
					//this.Case = Case0;
					//this.PictgramPanel.Draw(root.Label, 0, 0);
					//---
					//FIXME
					this.MasterRecord = new GSNRecord();
					this.MasterRecord.Parse(Contents);
					//this.Viewer = new AssureNoteViewer(this);
					var LatestDoc = this.MasterRecord.GetLatestDoc();
					//this.Viewer.Set(LatestDoc);
					var TopGoalNode = LatestDoc.TopGoal;
					this.PictgramPanel.SetView(new NodeView(TopGoalNode, true));
					this.PictgramPanel.Draw(TopGoalNode.GetLabel(), null, null);
				};
				reader.readAsText(Files[0], 'utf-8');
			}
		}
	}

}

