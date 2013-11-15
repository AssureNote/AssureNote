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
				//return false;
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

}