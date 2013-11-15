///<reference path='./AssureNote.ts'/>
///<reference path='./CommandLine.ts'/>

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
				//¡‚Ü‚Å‚É‰Ÿ‚µ‚½ƒL[‚Ì—ñ‚ðì‚Á‚Ä“n‚·
				if (ev.keyCode == 186/*:*/) {
					CmdLine.Show();
					//return false;
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
				//return false;
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
		Editor: any;
		IsVisible: boolean;

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