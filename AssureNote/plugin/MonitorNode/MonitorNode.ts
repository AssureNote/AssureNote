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

///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />

module AssureNote {

	export class MonitorNode {

		Location: string;
		Type: string;
		Condition: string;

		constructor(public Node: GSNNode) {
			var GoalNode = Node.GetCloseGoal();

			var ContextNode = null;
			for(var i: number = 0; i < GoalNode.SubNodeList.length; i++) {
				var BroutherNode = GoalNode.SubNodeList[i];
				if(BroutherNode.NodeType == GSNType.Context) {
					ContextNode = BroutherNode;
					break;
				}
			}
			if(ContextNode == null) {
				return;
			}
			var TagMap = ContextNode.GetTagMap();
			this.Location = TagMap.get("Location");
			this.Condition = TagMap.get("Condition");
			this.ExtractTypeFromCondition();
		}

		ExtractTypeFromCondition(): void {
			var text: string = this.Condition.replace(/\{|\}|\(|\)|==|<=|>=|<|>/g, " ");
			var words: string[] = text.split(" ");
			this.Type = null;
			for(var i: number = 0; i < words.length; i++) {
				if(words[i] != "" && !$.isNumeric(words[i])) {
					this.Type = words[i];
					break;
				}

			}
		}

		Validate(): boolean {
			return true;	
		}

	}

	export class MonitorNodeManager {

		MonitorNodeMap: { [key: string]: MonitorNode };

		constructor() {
			this.MonitorNodeMap = {};
		}

	}

	export class MonitorCommand extends Command {

		constructor(App: AssureNote.AssureNoteApp) {
			super(App);
		}

		public GetCommandLineNames(): string[] {
			return ["monitor"];
		}

		public GetDisplayName(): string {
			return "Monitor";
		}

		public Invoke(CommandName: string, FocuseView: NodeView, Params: any[]): void {
			if(Params.length == 1) {
				var Param = Params[0];
				if(Param == "all") {
					// TODO
					// Start all monitors
				}
				else {
					var Label = Param;
					var View = this.App.PictgramPanel.ViewMap[Label];
					if(View == null) {
						this.App.DebugP("Node not found");
						return;
					}

					var Model = this.App.PictgramPanel.ViewMap[Label].Model;
					var Monitor = new MonitorNode(Model);
					if(!Monitor.Validate()) {
						this.App.DebugP("This node is not monitor");
						return;
					}
				}
			}
			else if(Params.length > 1) {
				console.log("Too many parameter");
			}
			else {
				console.log("Need parameter");
			}
		}

	}

	export class MonitorNodePlugin extends Plugin {

		constructor(public AssureNoteApp: AssureNoteApp) {
			super();
			this.AssureNoteApp.RegistCommand(new MonitorCommand(this.AssureNoteApp));
		}

	}

}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});