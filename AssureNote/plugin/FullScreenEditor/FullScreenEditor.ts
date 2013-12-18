///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
    export class FullScreenEditorPlugin extends Plugin {
        public EditorUtil: EditorUtil;
		constructor(public AssureNoteApp: AssureNoteApp, public textarea: CodeMirror.Editor, public selector: string) {
			super();
            this.HasMenuBarButton = true;
            this.HasEditor = true;
            this.EditorUtil = new EditorUtil(AssureNoteApp, textarea, selector, {
                position: "fixed",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });
            CodeMirror.on(this.textarea, 'cursorActivity', (doc: CodeMirror.Doc) => this.MoveBackgroundNode(doc));
        }

		ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
			var Label: string;
			if (Args.length < 1) {
				Label = AssureNoteApp.MasterRecord.GetLatestDoc().TopGoal.GetLabel();
			} else {
				Label = Args[0].toUpperCase();
			}
			var event = document.createEvent("UIEvents");
			var TargetView = AssureNoteApp.PictgramPanel.ViewMap[Label];
			if (TargetView != null) {
				if (TargetView.GetNodeType() == GSNType.Strategy) {
					AssureNoteApp.DebugP("Strategy " + Label+ " cannot open FullScreenEditor.");
					return;
				}
				var Writer = new StringWriter();
				TargetView.Model.FormatSubNode(1, Writer);
                this.EditorUtil.EnableEditor(Writer.toString(), TargetView);
			} else {
				AssureNoteApp.DebugP(Label + " not found.");
			}
		}

		CreateMenuBarButton(NodeView: NodeView): MenuBarButton {
			if (NodeView.GetNodeType() == GSNType.Strategy) {
				return null;
			}
			return new MenuBarButton("fullscreeneditor-id", "images/editor.png", "fullscreeneditor",
				(event: Event, TargetView: NodeView) => {
					var Writer = new StringWriter();
					TargetView.Model.FormatSubNode(1, Writer);
                    this.EditorUtil.EnableEditor(Writer.toString(), TargetView);
			});
        }

        /* This focuses on the node where the cursor of CodeMirror indicate */
        MoveBackgroundNode(doc: CodeMirror.Doc) {
            var Label: string = null;
            var line = doc.getCursor().line;
            while (line >= 0) {
                var LineString: string = doc.getLine(line);
                if (LineString.startsWith('*')) {
                    var LabelChar: string = WikiSyntax.FormatNodeType(WikiSyntax.ParseNodeType(LineString));
                    var LabelNum: string = WikiSyntax.ParseLabelNumber(LineString);
                    Label = LabelChar + LabelNum;
                    break;
                }
                line -= 1;
            }
            if (Label) {
                var View: NodeView = this.AssureNoteApp.PictgramPanel.ViewMap[Label];
                if (View) {
                    console.log(View.GetCenterGX() + " " +  View.GetCenterGY())
                    this.AssureNoteApp.PictgramPanel.Viewport.SetCaseCenter(View.GetCenterGX(), View.GetCenterGY());
                }
            }
        }
	}
}
