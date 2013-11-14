module AssureNote {

	export class AssureNoteEvent {
		Label: string;
		constructor(public event: Event) {
		}
	}

	module AssureNoteUtils {
		export function LoadFile(): FixMeModel {
			return null;
		}

	}

	export class AssureNoteApp {
		PluginManager: PluginManager;
		PictgramPanel: PictgramPanel;
		PluginPanel: PluginPanel;
		IsDebugMode: boolean;
		FixMeModel: FixMeModel;

		constructor() {
			//var Api = new AssureNote.ServerAPI("http://", "", "");
			this.PluginManager = new PluginManager(this);
			this.PictgramPanel = new PictgramPanel(this);
			this.PluginPanel = new PluginPanel(this);
		}

		DebugP(Message: string): void {
			console.log(Message);
		}

		ExecCommand(CommandLine: string): void {
			this.DebugP(CommandLine);
			var Plugin = this.PluginManager.GetCommandPlugin(CommandLine);
			if (!Plugin) {
				Plugin.ExecCommand(this, CommandLine);
			}
			else {
				this.DebugP("undefined command: " + CommandLine);
			}
		}

		LoadFile() {
			this.FixMeModel = AssureNoteUtils.LoadFile();
		}

		ProcessDroppedFiles(Files: File[]): void {
			if (Files[0]) {
				var reader = new FileReader();
				reader.onerror = (e) => {
					console.log('error', (<any>e.target).error.code);
				};
				reader.onload = (e) => {
					var dcaseFile = [(<any>e.target).result, Files[0].name];
				};
				reader.readAsText(Files[0], 'utf-8');
			}
		}
	}

}

