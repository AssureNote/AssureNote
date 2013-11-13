///<reference path='src/Api.ts'/>
///<reference path='src/DragFile.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
module AssureNote {
	var AssureNoteUtils: any;

	export class AssureNote {
		PluginManager: OldPlugInManager;
		PictgramPanel: PictgramPanel;
		PluginPanel: PluginPanel;
		IsDebugMode: boolean;
		FixMeModel: any;

		constructor() {
			//var Api = new AssureNote.ServerAPI("http://", "", "");
			this.PluginManager = new OldPlugInManager("");
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
		SVGLayer: SVGGElement;
		EventMapLayer: HTMLDivElement;
		ContentLayer: HTMLDivElement;
		ControllLayer: HTMLDivElement;
		ViewPort: ViewportManager;

		constructor(public AssureNote: AssureNote) {
			this.SVGLayer = <SVGGElement>(<any>document.getElementById("layer0"));
			this.EventMapLayer = <HTMLDivElement>(document.getElementById("background"));
			this.ContentLayer = <HTMLDivElement>(document.getElementById("layer1"));

			this.ViewPort = new ViewportManager();
			contentlayer.onclick = (ev: any) => {
				//ここで、ノード名に変換してイベントオブジェクトをラップ
				alert("Hi!");
				return false;
			};
			contentlayer.ondblclick = (ev: any) => {
			};
			var cmdline = "";
			contentlayer.onkeydown = (ev: KeyboardEvent) => {
				if (this.PluginPanel.IsVisible) {
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
			var controllayer: HTMLDivElement = <HTMLDivElement>(document.getElementById("layer2"));
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

		}

		DisplayPluginPanel(PluginName: string, Label?: string): void {
			var Plugin = this.PluginManager.GetPanelPlugin(PluginName, Label);
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