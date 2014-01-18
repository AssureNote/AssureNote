// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************

///<reference path='./AssureNote.ts'/>
///<reference path='./AssureNoteUtils.ts'/>
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

            var Bar = new NodeMenu(AssureNoteApp);
            this.ContentLayer.addEventListener("click", (event: MouseEvent) => {
				var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
				this.AssureNoteApp.DebugP("click:" + Label);
				if (Bar.IsEnable) {
					Bar.Remove();
				}
                event.preventDefault();
			});

            //FIXME
            this.EventMapLayer.addEventListener("pointerdown", (event: MouseEvent) => {
                //this.FocusedLabel = null;
                if (Bar.IsEnable) {
                    Bar.Remove();
                }
            });

            this.ContentLayer.addEventListener("contextmenu", (event: MouseEvent) => {
                var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = this.ViewMap[Label];
                if (NodeView != null) {
                    this.FocusedLabel = Label;
                    if (Bar.IsEnable) {
                        Bar.Remove();
                    }
                    var Buttons = this.AssureNoteApp.PluginManager.GetMenuBarButtons(NodeView);
                    Bar.Create(this.ViewMap[Label], this.ControlLayer, Buttons);
                } else {
                    this.FocusedLabel = null;
                }
                event.preventDefault();
            });

            this.ContentLayer.addEventListener("dblclick", (event: MouseEvent) => {
				var Label: string = AssureNoteUtils.GetNodeLabelFromEvent(event);
				var NodeView = this.ViewMap[Label];
				this.AssureNoteApp.DebugP("double click:" + Label);
				if (Bar.IsEnable) { //TODO cancel click event
					Bar.Remove();
				}
				this.AssureNoteApp.ExecDoubleClicked(NodeView);
                event.preventDefault();
			});

            this.CmdLine = new CommandLine();
            this.Search = new Search(AssureNoteApp);
            document.addEventListener("keydown", (event: KeyboardEvent) => {
				if (!this.AssureNoteApp.PluginPanel.IsVisible) {
					return;
				}
                switch (event.keyCode) {
					case 58: /*: in Firefox*/
						if (window.navigator.userAgent.toLowerCase().match("firefox").length == 0) {
							break;
						}
					case 186: /*:*/
					case 191: /*/*/
                    case 219: /*@*/
                        if (this.Search.IsSearching()) {
                            this.Search.ResetParam();
                        }
                        this.CmdLine.Show();
                        break;
					case 13: /*Enter*/
                        if (this.CmdLine.IsVisible && this.CmdLine.IsEnable) {
                            var ParsedCommand = new CommandParser();
                            ParsedCommand.Parse(this.CmdLine.GetValue());
                            if (ParsedCommand.GetMethod() == "search") {
                                this.Search.Search(this.MasterView, true/*FIXME*/, ParsedCommand.GetArgs()[0]);
                            }
                            this.AssureNoteApp.ExecCommand(ParsedCommand);
                            this.CmdLine.AddHistory(ParsedCommand.GetRawString());
                            this.CmdLine.Hide();
                            this.CmdLine.Clear();
                            return false;
                        } else if (!this.CmdLine.IsVisible && this.Search.IsSearching()) {
                            this.Search.Search(this.MasterView, event.shiftKey);
                        }
                        break;
                    case 27: /*Esc*/
                        if (this.Search.IsSearching()) {
                            this.Search.ResetParam();
                        }
                        if (this.CmdLine.IsVisible) {
                            this.CmdLine.Hide();
                            this.CmdLine.Clear();
                        }
                        break;
                    case 38: /*up*/
                        if(this.CmdLine.IsVisible) {
                            this.CmdLine.ShowPrevHistory();
                        }
                        break;
                    case 40: /*down*/
                        if(this.CmdLine.IsVisible) {
                            this.CmdLine.ShowNextHistory();
                        }
                        break;
				}
			});

			this.ContentLayer.addEventListener("mouseover", (event: MouseEvent) => {
				if (!this.AssureNoteApp.PluginPanel.IsVisible) {
					return;
				}
				var Label = AssureNoteUtils.GetNodeLabelFromEvent(event);
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
						this.AssureNoteApp.LoadFiles((<any>(<any>event.originalEvent).dataTransfer).files);
					}
                });

            this.Viewport.ScrollManager.OnDragged = (Viewport: ViewportManager) => {
                if (!this.MasterView) {
                    return;
                }
                var HitBoxCenter = new Point(Viewport.GXFromPageX(Viewport.GetPageCenterX()), Viewport.GYFromPageY(Viewport.GetPageHeight() / 3));
                this.MasterView.TraverseVisibleNode((Node: NodeView) => {
                    if (Node.IsFolded) {
                        var DX = HitBoxCenter.X - Node.GetCenterGX();
                        var DY = HitBoxCenter.Y - Node.GetCenterGY();
                        var R = 150 / this.Viewport.GetCameraScale();
                        if (DX * DX + DY * DY < R * R) {
                            this.AssureNoteApp.ExecDoubleClicked(Node);
                        }
                        return false;
                    }
                });
            };
            this.Viewport.ScrollManager.OnStartDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").show(100);
                (<any>$(".dropdown.open > .dropdown-toggle")).dropdown("toggle");
            };
            this.Viewport.ScrollManager.OnEndDrag = (Viewport: ViewportManager) => {
                $("#auto-expand-area").hide(100);
            };

            $("#top-menu").click((event: MouseEvent) => {
                var target = (<any>event.target) || (<any>event.srcElement);
                var id = target.id;
                if (id == "" || id == null) {
                    return;
                }
                this.AssureNoteApp.ExecTopMenu(id);
            });

            (<any>$(".dropdown-toggle")).dropdown();
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

        Draw(Label?: string, Duration?: number): void {

            this.Clear();
            var TargetView = this.ViewMap[Label];

			if (TargetView == null) {
				TargetView = this.MasterView;
			}
            this.LayoutEngine.DoLayout(this, TargetView);
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";
            NodeView.SetGlobalPositionCacheEnabled(true);

            TargetView.UpdateDocumentPosition(Duration);
            TargetView.ClearAnimationCache();

            NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
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

        GetFocusedView(): NodeView {
            if (this.ViewMap) {
                return this.ViewMap[this.FocusedLabel];
            }
            return null;
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
            this.FullScreenEditor = new FullScreenEditorPlugin(AssureNoteApp, textarea, '#editor-wrapper');
            AssureNoteApp.PluginManager.SetPlugin("open", this.FullScreenEditor);
            $("#plugin-layer").on('mousewheel', (event: MouseWheelEvent) => { event.stopPropagation(); });
        }

		Clear(): void {
		}
	}

}
