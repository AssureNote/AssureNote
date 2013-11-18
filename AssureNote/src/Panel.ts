///<reference path='./AssureNote.ts'/>
///<reference path='./CommandLine.ts'/>
declare var CodeMirror: any;

module AssureNote {
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
			this.LayoutEngine = new OldLayoutEngine(this.AssureNoteApp);

			this.ContentLayer.onclick = (event: MouseEvent) => {
				var Label: string = AssureNoteUtils.GetNodeLabel(event);
				return false;
			};

			this.ContentLayer.ondblclick = (ev: MouseEvent) => {
			};
			var CmdLine = new CommandLine();
			document.onkeydown = (ev: KeyboardEvent) => {
				if (this.AssureNoteApp.PluginPanel.IsVisible) {
					return false;
				}

				if (ev.keyCode == 186/*:*/) {
					CmdLine.Show();
				}
				else if (ev.keyCode == 13/*Enter*/ && CmdLine.IsEnable()) {
					this.AssureNoteApp.ExecCommand(CmdLine.GetValue());
					CmdLine.Hide();
					CmdLine.Clear();
					return false;
				}
				//else {
				//	cmdline += String.fromCharCode(ev.keyCode);
				//}
			};
			this.ContentLayer.onmouseover = (event: MouseEvent) => {
				if (this.AssureNoteApp.PluginPanel.IsVisible) {
					return;
				}
				if (AssureNoteUtils.GetNodeLabel(event)) {
				}
			};

			var DragHandler = (e) => {
				if (this.AssureNoteApp.PluginPanel.IsVisible) {
					e.stopPropagation();
					e.preventDefault();
					//return false;
				}
			};
			$(this.EventMapLayer)
				.on('dragenter', (e) => { console.log("o"); })
				.on('dragover', DragHandler)
				.on('dragleave', DragHandler)
				.on('drop', (event: JQueryEventObject) => {
					if (this.AssureNoteApp.PluginPanel.IsVisible) {
						event.stopPropagation();
						event.preventDefault();
						this.AssureNoteApp.ProcessDroppedFiles((<any>(<any>event.originalEvent).dataTransfer).files);
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
		Editor: any;
		IsVisible: boolean = true;

		constructor(public AssureNoteApp: AssureNoteApp) {
			this.Editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
				lineNumbers: false,
				mode: "text/x-asn",
				lineWrapping: true,
			});
			this.Editor.setSize("300px", "200px"); //FIXME
			$('#editor-wrapper').css({ display: 'none', opacity: '1.0' });
		}

		Clear(): void {
		}
	}

}