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
        export function CreateSVGElement(name: "a"): SVGAElement;
        export function CreateSVGElement(name: "circle"): SVGCircleElement;
        export function CreateSVGElement(name: "clippath"): SVGClipPathElement;
        export function CreateSVGElement(name: "componenttransferfunction"): SVGComponentTransferFunctionElement;
        export function CreateSVGElement(name: "defs"): SVGDefsElement;
        export function CreateSVGElement(name: "desc"): SVGDescElement;
        export function CreateSVGElement(name: "ellipse"): SVGEllipseElement;
        export function CreateSVGElement(name: "feblend"): SVGFEBlendElement;
        export function CreateSVGElement(name: "fecolormatrix"): SVGFEColorMatrixElement;
        export function CreateSVGElement(name: "fecomponenttransfer"): SVGFEComponentTransferElement;
        export function CreateSVGElement(name: "fecomposite"): SVGFECompositeElement;
        export function CreateSVGElement(name: "feconvolvematrix"): SVGFEConvolveMatrixElement;
        export function CreateSVGElement(name: "fediffuselighting"): SVGFEDiffuseLightingElement;
        export function CreateSVGElement(name: "fedisplacementmap"): SVGFEDisplacementMapElement;
        export function CreateSVGElement(name: "fedistantlight"): SVGFEDistantLightElement;
        export function CreateSVGElement(name: "feflood"): SVGFEFloodElement;
        export function CreateSVGElement(name: "fegaussianblur"): SVGFEGaussianBlurElement;
        export function CreateSVGElement(name: "feimage"): SVGFEImageElement;
        export function CreateSVGElement(name: "femerge"): SVGFEMergeElement;
        export function CreateSVGElement(name: "femergenode"): SVGFEMergeNodeElement;
        export function CreateSVGElement(name: "femorphology"): SVGFEMorphologyElement;
        export function CreateSVGElement(name: "feoffset"): SVGFEOffsetElement;
        export function CreateSVGElement(name: "fepointlight"): SVGFEPointLightElement;
        export function CreateSVGElement(name: "fespecularlighting"): SVGFESpecularLightingElement;
        export function CreateSVGElement(name: "fespotlight"): SVGFESpotLightElement;
        export function CreateSVGElement(name: "fetile"): SVGFETileElement;
        export function CreateSVGElement(name: "feturbulence"): SVGFETurbulenceElement;
        export function CreateSVGElement(name: "filter"): SVGFilterElement;
        export function CreateSVGElement(name: "g"): SVGGElement;
        export function CreateSVGElement(name: "gradient"): SVGGradientElement;
        export function CreateSVGElement(name: "image"): SVGImageElement;
        export function CreateSVGElement(name: "line"): SVGLineElement;
        export function CreateSVGElement(name: "marker"): SVGMarkerElement;
        export function CreateSVGElement(name: "mask"): SVGMaskElement;
        export function CreateSVGElement(name: "metadata"): SVGMetadataElement;
        export function CreateSVGElement(name: "path"): SVGPathElement;
        export function CreateSVGElement(name: "pattern"): SVGPatternElement;
        export function CreateSVGElement(name: "polygon"): SVGPolygonElement;
        export function CreateSVGElement(name: "polyline"): SVGPolylineElement;
        export function CreateSVGElement(name: "rect"): SVGRectElement;
        export function CreateSVGElement(name: "script"): SVGScriptElement;
        export function CreateSVGElement(name: "stop"): SVGStopElement;
        export function CreateSVGElement(name: "style"): SVGStyleElement;
        export function CreateSVGElement(name: "svg"): SVGSVGElement;
        export function CreateSVGElement(name: "switch"): SVGSwitchElement;
        export function CreateSVGElement(name: "symbol"): SVGSymbolElement;
        export function CreateSVGElement(name: "textcontent"): SVGTextContentElement;
        export function CreateSVGElement(name: "title"): SVGTitleElement;
        export function CreateSVGElement(name: "use"): SVGUseElement;
        export function CreateSVGElement(name: "view"): SVGViewElement;
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
		WGSNName: string;
		Commands: CommandLineBuiltinFunctions;

		constructor() {
			//var Api = new AssureNote.ServerAPI("http://", "", "");
			this.PluginManager = new PluginManager(this);
			this.PictgramPanel = new PictgramPanel(this);
			this.PluginPanel = new PluginPanel(this);
			this.Commands = new CommandLineBuiltinFunctions();
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
			var BuiltinCommand = this.Commands.GetFunction(Method);
			if (BuiltinCommand != null) {
				BuiltinCommand(this, ParsedCommand.GetArgs());
			}
			var Plugin = this.PluginManager.GetCommandPlugin(ParsedCommand.GetMethod());
			if (Plugin != null) {
				Plugin.ExecCommand(this, ParsedCommand.GetArgs());
			}
			else {
				this.DebugP("undefined command: " + ParsedCommand.GetMethod());
			}
		}

		LoadNewWGSN(Name: string, WGSN: string): void {
			this.WGSNName = Name;
			this.MasterRecord = new GSNRecord();
			this.MasterRecord.Parse(WGSN);

			var LatestDoc = this.MasterRecord.GetLatestDoc();
			var TopGoalNode = LatestDoc.TopGoal;

			this.PictgramPanel.SetView(new NodeView(TopGoalNode, true));
			this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

			this.PictgramPanel.Draw();

			var Shape = this.PictgramPanel.MasterView.GetShape();
			var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
			var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
			this.PictgramPanel.ViewPort.SetOffset(WX, WY);
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
					this.LoadNewWGSN(Name, Contents);
				};
				reader.readAsText(Files[0], 'utf-8');
			}
		}
	}

}

