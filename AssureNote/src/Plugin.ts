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

///<reference path="./NodeMenu.ts" />
///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

	export class Plugin {
        public HasMenuBarButton: boolean;
		public HasEditor: boolean;
		public HasDoubleClicked: boolean;

		constructor() {
            this.HasMenuBarButton = false;
			this.HasEditor = false;
			this.HasDoubleClicked = false;
		}

		ExecCommand(AssureNote: AssureNoteApp, Args: string[]): void {
		}

		Display(PluginPanel: PluginPanel, GSNDoc: GSNDoc, Label: string): void {
		}

		ExecDoubleClicked(NodeView: NodeView): void {
		}

		CreateMenuBarButton(NodeView: NodeView): NodeMenuItem {
			return null;
        }

        EditorEnableCallback(): () => void {
            return null;
        }

        EditorDisableCallback(): () => void {
            return null;
        }

        RenderHTML(NodeDoc: string, Model: GSNNode): string {
            /* Do nothing */
            return NodeDoc;
        }

        RenderSVG(ShapeGroup: SVGGElement, NodeView: NodeView): void {
            /* Do nothing */
        }
    }


	//export class SamplePlugin extends Plugin {
	//	constructor() {
	//		super();
	//		this.HasMenuBarButton = true;
	//	}

	//	CreateMenuBarButton(): MenuBarButton {
	//		return new MenuBarButton("sample-id", "images/copy.png", "sample", (event: Event, TargetView: NodeView) => {
	//			alert(TargetView.Label);
	//		});
	//	}
    //}

    export function OnLoadPlugin(Callback: (App: AssureNoteApp) => void) {
        PluginManager.OnLoadPlugin.push(Callback);
        if (PluginManager.Current != null) {
            PluginManager.Current.LoadPlugin();
        }
    }

	export class PluginManager {
		private PluginMap: {[index: string]: Plugin};
		constructor(public AssureNoteApp: AssureNoteApp) {
            this.PluginMap = {};
            PluginManager.Current = this;
        }

        static Current: PluginManager;

        static OnLoadPlugin: Array<(App: AssureNoteApp) => void> = [];

        LoadPlugin() {
            for (var i = 0; i < PluginManager.OnLoadPlugin.length; i++) {
                PluginManager.OnLoadPlugin[i](this.AssureNoteApp);
            }
            PluginManager.OnLoadPlugin = [];
        }

        SetPlugin(Name: string, Plugin: Plugin): void {
            if (!this.PluginMap[Name]) {
                this.PluginMap[Name] = Plugin;
            } else {
                this.AssureNoteApp.DebugP("Plugin " + name + " already defined.");
            }
        }

		GetPanelPlugin(Name: string, Label?: string): Plugin {
			//TODO change plugin by Label
			return this.PluginMap[Name];
		}

		GetCommandPlugin(Name: string): Plugin {
			return this.PluginMap[Name];
		}

		GetMenuBarButtons(TargetView: NodeView): NodeMenuItem[]{
			var ret: NodeMenuItem[] = [];
			$.each(this.PluginMap, (key, value: Plugin) => {
				if (value.HasMenuBarButton) {
					this.AssureNoteApp.DebugP("Menu: key=" + key);
					var Button = value.CreateMenuBarButton(TargetView);
					if (Button != null) {
						ret.push(Button);
					}
				}
			});
			return ret;
		}

		GetDoubleClicked(): Plugin {
			var ret: Plugin = null;
			//FIXME Editing mode
			$.each(this.PluginMap, (key, value: Plugin) => {
				if (value.HasDoubleClicked) {
					ret = value;
					return false;
				}
			});
			return ret;
        }

        InvokeHTMLRenderPlugin(NodeDoc: string, Model: GSNNode): string {
            $.each(this.PluginMap, (key: string, value: Plugin) => {
                NodeDoc = value.RenderHTML(NodeDoc, Model);
            });
            return NodeDoc;
        }

        InvokeSVGRenderPlugin(ShapeGroup: SVGGElement, NodeView: NodeView): void {
            $.each(this.PluginMap, (key: string, value: Plugin) => {
                value.RenderSVG(ShapeGroup, NodeView);
            });
        }
	}
}

