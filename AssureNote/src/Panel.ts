///<reference path='./AssureNote.ts'/>
///<reference path='./CommandLine.ts'/>
///<reference path='./SearchNode.ts'/>
///<reference path='./LayoutEngine.ts'/>
///<reference path='./Editor.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>

///<reference path='../plugin/FullScreenEditor/FullScreenEditor.ts'/>

module AssureNote {
	export class PictgramPanel {
		LayoutEngine: LayoutEngine;
        SVGLayer: SVGGElement;
        EventMapLayer: HTMLDivElement;
		ContentLayer: HTMLDivElement;
		ControlLayer: HTMLDivElement;
		Viewport: ViewportManager;
		ViewMap: { [index: string]: NodeView };
		MasterView: NodeView;
        CmdLine: CommandLine;
        Search: Search;

		CurrentDoc: GSNDoc;// Convert to caseview
		FocusedLabel: string;
		FocusedWx: number;
		FocusedWy: number;

		constructor(public AssureNoteApp: AssureNoteApp) {
			this.SVGLayer = <SVGGElement>(<any>document.getElementById("svg-layer"));
			this.EventMapLayer = <HTMLDivElement>(document.getElementById("eventmap-layer"));
			this.ContentLayer = <HTMLDivElement>(document.getElementById("content-layer"));
			this.ControlLayer = <HTMLDivElement>(document.getElementById("control-layer"));
			this.Viewport = new ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new SimpleLayoutEngine(this.AssureNoteApp);

            var Bar = new MenuBar(AssureNoteApp);
            this.ContentLayer.addEventListener("click", (event: MouseEvent) => {
				var Label: string = AssureNoteUtils.GetNodeLabel(event);
				this.AssureNoteApp.DebugP("click:" + Label);
				if (Bar.IsEnable) {
					Bar.Remove();
				}
				var NodeView = this.ViewMap[Label];
				if (NodeView != null) {
					this.FocusedLabel = Label;
					if (!Bar.IsEnable) {
						var Buttons = this.AssureNoteApp.PluginManager.GetMenuBarButtons(NodeView);
						Bar.Create(this.ViewMap[Label], this.ControlLayer, Buttons);
					}
				} else {
					this.FocusedLabel = null;
                }
				return false;
			});

            //FIXME
            this.EventMapLayer.addEventListener("pointerdown", (event: MouseEvent) => {
                //this.FocusedLabel = null;
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
            });

            this.ContentLayer.addEventListener("dblclick", (event: MouseEvent) => {
				var Label: string = AssureNoteUtils.GetNodeLabel(event);
				var NodeView = this.ViewMap[Label];
				this.AssureNoteApp.DebugP("double click:" + Label);
				if (Bar.IsEnable) { //TODO cancel click event
					Bar.Remove();
				}
				this.AssureNoteApp.ExecDoubleClicked(NodeView);
				return false;
			});

			this.CmdLine = new CommandLine();
            this.Search = new Search(AssureNoteApp);
            document.addEventListener("keydown", (event: KeyboardEvent) => {
				if (!this.AssureNoteApp.PluginPanel.IsVisible) {
					return;
				}
                console.log(event.keyCode);
                switch (event.keyCode) {
					case 58: /*: in Firefox*/
						if (window.navigator.userAgent.toLowerCase().match("firefox").length == 0) {
							break;
						}
					case 186: /*:*/
						this.CmdLine.Show();
						break;
					case 191: /*/*/
						this.CmdLine.Show();
                        break;
                    case 219: /*@*/
                        this.CmdLine.Show();
                        break;
					case 13: /*Enter*/
						if (this.CmdLine.IsVisible && this.CmdLine.IsEnable) {
							var ParsedCommand = new CommandParser();
							ParsedCommand.Parse(this.CmdLine.GetValue());
							if (ParsedCommand.GetMethod() == "search") {
								this.Search.Search(this.MasterView, ParsedCommand.GetArgs()[0]);
							}
							this.AssureNoteApp.ExecCommand(ParsedCommand);
							this.CmdLine.Hide();
							this.CmdLine.Clear();
							return false;
						}
						break;
				}
			});

			this.ContentLayer.addEventListener("mouseover", (event: MouseEvent) => {
				if (!this.AssureNoteApp.PluginPanel.IsVisible) {
					return;
				}
				var Label = AssureNoteUtils.GetNodeLabel(event);
				if (Label) {
					//this.AssureNoteApp.DebugP("mouseover:"+Label);
				}
			});

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

            this.Viewport.ScrollManager.OnDragged = (Viewport: ViewportManager) => {
                var HitBoxCenter = new Point(Viewport.GXFromPageX(Viewport.GetPageCenterX()), Viewport.GYFromPageY(Viewport.GetHeight() / 3));
                this.MasterView.TraverseVisibleNode((Node: NodeView) => {
                    if (Node.IsFolded) {
                        var DX = HitBoxCenter.X - Node.GetCenterGX();
                        var DY = HitBoxCenter.Y - Node.GetCenterGY();
                        var R = 150 / this.Viewport.GetScale();
                        console.log(new Point(DX, DY));
                        if (DX * DX + DY * DY < R * R) {
                            this.AssureNoteApp.ExecDoubleClicked(Node);
                        }
                        return false;
                    }
                });
            };
            this.Viewport.ScrollManager.OnStartDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").show(300);
            };
            this.Viewport.ScrollManager.OnEndDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").hide(300);
            };
		}

		SetFoldedAllGoalNode(NodeView: NodeView): void {
			NodeView.ForEachVisibleChildren((SubNode: NodeView) => {
				this.SetFoldedAllGoalNode(SubNode);
				if (SubNode.GetNodeType() == GSNType.Goal && SubNode.Children != null) {
					if (SubNode.Children.length != 1 || SubNode.Children[0].GetNodeType() != GSNType.Evidence) {
						SubNode.IsFolded = true;
					}
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

        private static GSNNodeAnimationDefinitionMaster :HTMLStyleElement;

        private AppendCSSAnimationDefinition(Definitions: string[]) {
            var Id = "GSNNodeAnimationDefinition";
            if (PictgramPanel.GSNNodeAnimationDefinitionMaster == null) {
                PictgramPanel.GSNNodeAnimationDefinitionMaster = document.createElement("style");
                PictgramPanel.GSNNodeAnimationDefinitionMaster.id = Id;
                PictgramPanel.GSNNodeAnimationDefinitionMaster.type = "text/css"
            }
            var StyleElement = <HTMLStyleElement>PictgramPanel.GSNNodeAnimationDefinitionMaster.cloneNode();
            StyleElement.innerHTML = Definitions.join("\n");
            var OldDefinition = document.getElementById(Id);
            if (OldDefinition) {
                OldDefinition.parentElement.removeChild(OldDefinition);
            }
            document.head.appendChild(StyleElement);
        }

        Draw(Label?: string, wx?/*window x of the forcused node*/: number, wy?/*window y*/: number, Duration?: number): void {

            this.Clear();
            var TargetView = this.ViewMap[Label];

			if (TargetView == null) {
				TargetView = this.MasterView;
			}
            this.LayoutEngine.DoLayout(this, TargetView);
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";
            NodeView.SetGlobalPositionCacheEnabled(true);

            var CSSAnimationBuffer: string[] = [];
            TargetView.UpdateDocumentPosition(Duration, CSSAnimationBuffer);
            this.AppendCSSAnimationDefinition(CSSAnimationBuffer);

            TargetView.ClearAnimationCache();

            NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
            // Do scroll
            if (wx != null && wy != null) {
                this.Viewport.SetOffset(wx, wy);
            }
        }

        private Clear(): void {
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";
            for (var i = this.ContentLayer.childNodes.length - 1; i >= 0; i--) {
                this.ContentLayer.removeChild(this.ContentLayer.childNodes[i]);
            }
            for (var i = this.SVGLayer.childNodes.length - 1; i >= 0; i--) {
                this.SVGLayer.removeChild(this.SVGLayer.childNodes[i]);
            }
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
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
		FullScreenEditor: Plugin;
		IsVisible: boolean = true;

		constructor(public AssureNoteApp: AssureNoteApp) {
			var textarea = CodeMirror.fromTextArea(<HTMLTextAreaElement>document.getElementById('editor'), {
				lineNumbers: true,
				mode: "text/x-asn",
				lineWrapping: true,
            });
            console.log(textarea);
            this.FullScreenEditor = new FullScreenEditorPlugin(AssureNoteApp, textarea, '#editor-wrapper');
            AssureNoteApp.PluginManager.SetPlugin("open", this.FullScreenEditor);
        }

		Clear(): void {
		}
	}

}