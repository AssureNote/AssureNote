///<reference path='src/Api.ts'/>
///<reference path='src/DragFile.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
module AssureNote {
	//TODO
	var AssureNoteUtils: any;

	//Deprecated
	export class FixMeModel {
	}

	export class LayoutEngine {
	}

	export class AssureNote {
		PluginManager: PluginManager;
		PictgramPanel: PictgramPanel;
		PluginPanel: PluginPanel;
		IsDebugMode: boolean;
		FixMeModel: FixMeModel;

		constructor() {
			//var Api = new AssureNote.ServerAPI("http://", "", "");
			this.PluginManager = new PluginManager(this);
			this.PictgramPanel = new PictgramPanel(this);
			this.PluginPanel = new PluginPanel(this);
		}
		
		DebugP(Message: string): void {
			console.log(Message);
		}

		ExecCommand(CommandLine: string): void {
			this.DebugP(CommandLine);
			var Plugin = this.PluginManager.GetCommandPlugin(CommandLine);
			if (!Plugin) {
				Plugin.ExecCommand(this, CommandLine);
			}
			else {
				this.DebugP("undefined command: " + CommandLine);
			}
		}

		LoadFile() {
			this.FixMeModel = AssureNoteUtils.LoadFile();
		}

		ProcessDroppedFiles(Files: File[]): void {
			if (Files[0]) {
				var reader = new FileReader();
				reader.onerror = (e) => {
					console.log('error', (<any>e.target).error.code);
				};
				reader.onload = (e) => {
					var dcaseFile = new DCaseFile((<any>e.target).result, Files[0].name);
				};
				reader.readAsText(Files[0], 'utf-8');
			}
		}
	}

	export class PictgramPanel {
		LayoutEngine: LayoutEngine;
		SVGLayer: SVGGElement;
		EventMapLayer: HTMLDivElement;
		ContentLayer: HTMLDivElement;
		ControlLayer: HTMLDivElement;
		ViewPort: ViewportManager;

		constructor(public AssureNote: AssureNote) {
			this.SVGLayer = <SVGGElement>(<any>document.getElementById("layer0"));
			this.EventMapLayer = <HTMLDivElement>(document.getElementById("background"));
			this.ContentLayer = <HTMLDivElement>(document.getElementById("layer1"));
			this.ControlLayer = <HTMLDivElement>(document.getElementById("layer2"));

			this.ViewPort = new ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ContentLayer);
			this.ContentLayer.onclick = (ev: MouseEvent) => {
				//ここで、ノード名に変換してイベントオブジェクトをラップ
				alert("Hi!");
				return false;
			};
			this.ContentLayer.ondblclick = (ev: MouseEvent) => {
			};
			var cmdline = "";
			this.ContentLayer.onkeydown = (ev: KeyboardEvent) => {
				if (this.AssureNote.PluginPanel.IsVisible) {
					return false;
				}
				//今までに押したキーの列を作って渡す
				if (ev.keyCode == 186/*:*/) {
					cmdline = "";
				}

				if (ev.keyCode == 13/*Enter*/ && cmdline.length > 0) {
					AssureNote.ExecCommand(cmdline);
				}
				else {
					cmdline += ev.keyCode;
				}

			};
			this.ContentLayer.onmouseover = (event: MouseEvent) => {
				if (this.AssureNote.PluginPanel.IsVisible) {
					return;
				}
				if ((<HTMLElement>event.srcElement).id) {
				}
			};

			var DragHandler = (e) => {
				if (this.AssureNote.PluginPanel.IsVisible) {
					e.stopPropagation();
					e.preventDefault();
					return false;
				}
			};
			$(this.EventMapLayer)
				.on('dragenter', DragHandler)
				.on('dragover', DragHandler)
				.on('dragleave', DragHandler)
				.on('drop', (ev) => {
					if (this.AssureNote.PluginPanel.IsVisible) {
						ev.stopPropagation();
						ev.preventDefault();
						AssureNote.ProcessDroppedFiles((<any>ev.originalEvent.dataTransfer).files);
						return false;
					}
				});
		}


		DisplayPictgram(): void {
			this.AssureNote.PluginPanel.Clear();
		}

		Draw(Label: string, wx: number, wy: number): void {
			this.LayoutEngine.DoBababababa(this, Label, wx, wy);
		}

		DisplayPluginPanel(PluginName: string, Label?: string): void {
			var Plugin = this.AssureNote.PluginManager.GetPanelPlugin(PluginName, Label);
			Plugin.Display(this.AssureNote.PluginPanel, this.AssureNote.FixMeModel, Label);
		}
	}

	export class PluginPanel {
		IsVisible: boolean;

		constructor(public AssureNote: AssureNote) {
			//Editor, etc.
		}

		Clear(): void {
		}
	}

	export class Plugin {
		constructor() {
		}

		ExecCommand(AssureNote: AssureNote, CommandLine: string) {
		}

		Display(PluginPanel: PluginPanel, FixMeModel: FixMeModel, Label: string) {
		}
	}

	export class PluginManager {
		constructor(public AssureNote: AssureNote) {
			//Editor, etc.
		}
		GetPanelPlugin(Name: string, Label?: string): Plugin {
			return null;
		}
		GetCommandPlugin(CommandLine: string): Plugin {
			return null;
		}
	}

}


window.onload = () => {


	//Importer.read((file: AssureNote.DCaseFile, )
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
};