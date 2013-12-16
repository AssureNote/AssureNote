///<reference path="./MenuBar.ts" />
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

		CreateMenuBarButton(NodeView: NodeView): MenuBarButton {
			return null;
        }

        EditorEnableCallback(): () => void {
            return null;
        }

        EditorDisableCallback(): () => void {
            return null;
        }

        RenderHTML(NodeDoc: string): string {
            /* Do nothing */
            return NodeDoc;
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

	export class PluginManager {
		private PluginMap: {[index: string]: Plugin};
		constructor(public AssureNoteApp: AssureNoteApp) {
			this.PluginMap = {};
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

		GetMenuBarButtons(TargetView: NodeView): MenuBarButton[]{
			var ret: MenuBarButton[] = [];
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

        InvokeHTMLRenderPlugin(NodeDoc: string): string {
            $.each(this.PluginMap, (key: string, value: Plugin) => {
                NodeDoc = value.RenderHTML(NodeDoc);
            });
            return NodeDoc;
        }

	}
}