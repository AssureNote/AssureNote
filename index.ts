///<reference path='src/Api.ts'/>
///<reference path='src/DragFile.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
module AssureNote {
	//Deprecated
	export class FixMeModel {
	}

	//TODO
	export class LayoutEngine {
		constructor() {
		}

		//FIXME Rename
		Do(PictgramPanel: PictgramPanel, Label: string, wx: number, wy: number) {
			//TODO
		}
	}

	export class PictgramPanel {
		LayoutEngine: LayoutEngine;
		SVGLayer: SVGGElement;
		EventMapLayer: HTMLDivElement;
		ContentLayer: HTMLDivElement;
		ControlLayer: HTMLDivElement;
		ViewPort: ViewportManager;

		constructor(public AssureNoteApp: AssureNoteApp) {
			this.SVGLayer = <SVGGElement>(<any>document.getElementById("svg-layer"));
			this.EventMapLayer = <HTMLDivElement>(document.getElementById("eventmap-layer"));
			this.ContentLayer = <HTMLDivElement>(document.getElementById("content-layer"));
			this.ControlLayer = <HTMLDivElement>(document.getElementById("control-layer"));

			this.ViewPort = new ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ContentLayer);
			this.ContentLayer.onclick = (ev: MouseEvent) => {
				//ここで、ノード名に変換してイベントオブジェクトをラップ
				alert("Hi!");
				return false;
			};
			this.ContentLayer.ondblclick = (ev: MouseEvent) => {
			};
			var cmdline = "";
			document.onkeydown = (ev: KeyboardEvent) => {
				if (this.AssureNoteApp.PluginPanel.IsVisible) {
					return false;
				}
				//今までに押したキーの列を作って渡す
				if (ev.keyCode == 186/*:*/) {
					cmdline = "";
				}
				//else if (ev.keyCode == 13/*Enter*/ && cmdline.length > 0) {
				//	this.AssureNoteApp.ExecCommand(cmdline);
				//}
				//else {
				//	cmdline += String.fromCharCode(ev.keyCode);
				//}
				return false;
			};
			this.ContentLayer.onmouseover = (event: MouseEvent) => {
				if (this.AssureNoteApp.PluginPanel.IsVisible) {
					return;
				}
				if ((<HTMLElement>event.srcElement).id) {
				}
			};

			var DragHandler = (e) => {
				if (this.AssureNoteApp.PluginPanel.IsVisible) {
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
					if (this.AssureNoteApp.PluginPanel.IsVisible) {
						ev.stopPropagation();
						ev.preventDefault();
						this.AssureNoteApp.ProcessDroppedFiles((<any>ev.originalEvent.dataTransfer).files);
						return false;
					}
				});
		}


		DisplayPictgram(): void {
			this.AssureNoteApp.PluginPanel.Clear();
		}

		Draw(Label: string, wx: number, wy: number): void {
			this.LayoutEngine.Do(this, Label, wx, wy);
		}

		DisplayPluginPanel(PluginName: string, Label?: string): void {
			var Plugin = this.AssureNoteApp.PluginManager.GetPanelPlugin(PluginName, Label);
			Plugin.Display(this.AssureNoteApp.PluginPanel, this.AssureNoteApp.FixMeModel, Label);
		}
	}

	export class PluginPanel {
		IsVisible: boolean;

		constructor(public AssureNoteApp: AssureNoteApp) {
			//Editor, etc.
		}

		Clear(): void {
		}
	}

	export class Plugin {
		constructor() {
		}

		ExecCommand(AssureNote: AssureNoteApp, CommandLine: string) {
		}

		Display(PluginPanel: PluginPanel, FixMeModel: FixMeModel, Label: string) {
		}
	}

	export class PluginManager {

		constructor(public AssureNoteApp: AssureNoteApp) {
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