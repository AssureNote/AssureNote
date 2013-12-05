///<reference path="./MenuBar.ts" />
///<reference path='../d.ts/jquery.d.ts'/>

module AssureNote {

	export class Plugin {
        public HasMenuBarButton: boolean;
        public HasEditor: boolean;

		constructor() {
            this.HasMenuBarButton = false;
            this.HasEditor = false;
		}

		ExecCommand(AssureNote: AssureNoteApp, Args: string[]): void {
		}

		Display(PluginPanel: PluginPanel, GSNDoc: GSNDoc, Label: string): void {
		}

		CreateMenuBarButton(): MenuBarButton {
			//return new MenuBarButton("sample-id", "images/sample.png", "sample", (TargetView: NodeView) => {
			//});
			return null;
		}
	}

	export class SamplePlugin extends Plugin {
		constructor() {
			super();
			this.HasMenuBarButton = true;
		}

		CreateMenuBarButton(): MenuBarButton {
			return new MenuBarButton("sample-id", "images/copy.png", "sample", (event: Event, TargetView: NodeView) => {
				alert(TargetView.Label);
			});
		}
    }

    export class EditorPugin extends Plugin {
        public EnableCallback: () => void;
        public DisableCallback: () => void;
        constructor() {
            super();
            this.HasEditor = true;
            this.EnableCallback = null;
            this.DisableCallback = null;
        }
    }

	export class PluginManager {
		private PluginMap: {[index: string]: Plugin};
		constructor(public AssureNoteApp: AssureNoteApp) {
			this.PluginMap = {};
        }

		SetPlugin(Name: string, Plugin: Plugin): void {
			this.PluginMap[Name] = Plugin;
		}

		GetPanelPlugin(Name: string, Label?: string): Plugin {
			//TODO change plugin by Label
			return this.PluginMap[Name];
		}

		GetCommandPlugin(Name: string): Plugin {
			return this.PluginMap[Name];
		}

		GetMenuBarButtons(): MenuBarButton[]{
			var ret: MenuBarButton[] = [];
			$.each(this.PluginMap, (key, value: Plugin) => {
				if (value.HasMenuBarButton) {
					this.AssureNoteApp.DebugP("Menu: key=" + key);
					ret.push(value.CreateMenuBarButton());
				}
			});
			return ret;
		}

	}
}