module AssureNote {
	export class Plugin {
		constructor() {
		}

		ExecCommand(AssureNote: AssureNoteApp, Args: string[]) {
		}

		Display(PluginPanel: PluginPanel, GSNDoc: GSNDoc, Label: string) {
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