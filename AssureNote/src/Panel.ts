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
		ViewMap: { [index: string]: NodeView };
		MasterView: NodeView;
		CmdLine: CommandLine;

		CurrentDoc: GSNDoc;// Convert to caseview
		FocusedLabel: string;
		FocusedWx: number;
		FocusedWy: number;

		constructor(public AssureNoteApp: AssureNoteApp) {
			this.SVGLayer = <SVGGElement>(<any>document.getElementById("svg-layer"));
			this.EventMapLayer = <HTMLDivElement>(document.getElementById("eventmap-layer"));
			this.ContentLayer = <HTMLDivElement>(document.getElementById("content-layer"));
			this.ControlLayer = <HTMLDivElement>(document.getElementById("control-layer"));
			this.ViewPort = new ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ContentLayer);
			this.LayoutEngine = new SimpleLayoutEngine(this.AssureNoteApp);

			var Bar = new MenuBar(AssureNoteApp);
			this.ContentLayer.onclick = (event: MouseEvent) => {
				var Label: string = AssureNoteUtils.GetNodeLabel(event);
				this.AssureNoteApp.DebugP("click:" + Label);
				if (Bar.IsEnable) {
					Bar.Remove();
				}
				var NodeView = this.ViewMap[Label];
				if (NodeView != null) {
					this.FocusedLabel = Label;
					if (!Bar.IsEnable) {
						Bar.Create(this.ViewMap[Label], this.ControlLayer);
					}
				} else {
					this.FocusedLabel = null;
				}
				return false;
			};

			//FIXME
			this.EventMapLayer.onclick = (event: MouseEvent) => {
				this.FocusedLabel = null;
				if(Bar.IsEnable) {
					Bar.Remove();
				}
			}

			this.ContentLayer.ondblclick = (event: MouseEvent) => {
				var Label: string = AssureNoteUtils.GetNodeLabel(event);
				var NodeView = this.ViewMap[Label];
				this.AssureNoteApp.DebugP("double click:" + Label);
				return false;
			};

			this.CmdLine = new CommandLine();
			document.onkeydown = (event: KeyboardEvent) => {
				if (!this.AssureNoteApp.PluginPanel.IsVisible) {
					return false;
				}

				if (event.keyCode == 186/*:*/) {
					this.CmdLine.Show();
				}
				else if (event.keyCode == 13/*Enter*/ && this.CmdLine.IsVisible && this.CmdLine.IsEnable) {
					this.AssureNoteApp.ExecCommand(this.CmdLine.GetValue());
					this.CmdLine.Hide();
					this.CmdLine.Clear();
					return false;
				}
			};

			this.ContentLayer.onmouseover = (event: MouseEvent) => {
				if (!this.AssureNoteApp.PluginPanel.IsVisible) {
					return;
				}
				var Label = AssureNoteUtils.GetNodeLabel(event);
				if (Label) {
					this.AssureNoteApp.DebugP("mouseover:"+Label);
				}
			};

			var DragHandler = (e) => {
				if (this.AssureNoteApp.PluginPanel.IsVisible) {
					e.stopPropagation();
					e.preventDefault();
				}
			};
			$(this.EventMapLayer)
				.on('dragenter', DragHandler)
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

		SetView(NodeView: NodeView): void {
			this.MasterView = NodeView;
			this.ViewMap = {};
			this.MasterView.UpdateViewMap(this.ViewMap);
		}

		DisplayPictgram(): void {
			this.AssureNoteApp.PluginPanel.Clear();
		}

		Draw(Label: string, wx: number, wy: number): void {
			if (wx == null) {
				wx = 100; //FIXME
			}
			if (wy == null) {
				wy = 100; //FIXME
			}

			var TargetView = this.ViewMap[Label];
			if (TargetView == null) {
				TargetView = this.MasterView;
			}

			this.LayoutEngine.DoLayout(this, TargetView, wx, wy);
			TargetView.SetDocumentPosition(wx, wy);
		}

		Redraw(): void {
			this.Draw(this.FocusedLabel, this.FocusedWx, this.FocusedWy);
		}

		DisplayPluginPanel(PluginName: string, Label?: string): void {
			var Plugin = this.AssureNoteApp.PluginManager.GetPanelPlugin(PluginName, Label);
			Plugin.Display(this.AssureNoteApp.PluginPanel, this.AssureNoteApp.MasterRecord.GetLatestDoc(), Label);
		}

		//TODO
		NavigateUp(): void { }
		NavigateDown(): void { }
		NavigateLeft(): void { }
		NavigateRight(): void { }
		NavigateHome(): void { }

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
			$('#editor-wrapper').css({ display: 'none', opacity: '1.0' });
		}

		Clear(): void {
		}
	}

}