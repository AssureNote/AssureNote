///// <reference path="../d.ts/jquery.d.ts" />
///// <reference path="../d.ts/ASNParser.d.ts" />
///// <reference path="CaseModel.ts" />

//module AssureNote {

//	export class JsonNodeModel {
//		Type: NodeType;
//		Label: string;
//		Statement: string;
//		Annotations: CaseAnnotation[];
//		Notes: { [index: string]: string };
//		Children: JsonNodeModel[];

//		constructor() {
//		}

//	}

//	export class CaseEncoderDeprecated {

//		constructor() {
//		}

//		ConvertToOldJson(case0: Case): any {
//			var keys = Object.keys(case0.ElementMap);
//			var root = {
//				"NodeList":     [],
//				"TopGoalLabel": case0.ElementTop.Label,
//				"NodeCount":    keys.length,
//				"DCaseName":    case0.CaseName
//			};

//			for (var i:number = 0; i < keys.length; i++) {
//				var node = case0.ElementMap[keys[i]];
//				var json = {
//					Label: node.Label,
//					Type: node.Type,
//					Statement: node.Statement,
//					Annotations: node.Annotations,
//					Notes: node.Notes,
//					Children: []
//				};
//				for(var j:number = 0; j < node.Children.length; j++) {
//					json.Children.push(node.Children[j].Label);
//				}
//				root.NodeList.push(json);
//			}

//			return root;
//		}
//	}

//	export class CaseEncoder {
//		JsonRoot: JsonNodeModel;

//		constructor() {
//		}

//		ConvertToJson(root: NodeModel): JsonNodeModel {
//			this.JsonRoot = new JsonNodeModel();
//			this.JsonRoot.Type = root.Type;
//			this.JsonRoot.Label = root.Label;
//			this.JsonRoot.Statement = root.Statement;
//			this.JsonRoot.Annotations = root.Annotations;
//			this.JsonRoot.Notes = root.Notes;

//			var JsonChildNodes: JsonNodeModel[] = [];
//			for (var i: number = 0; i < root.Children.length; i++) {
//				JsonChildNodes[i] = new JsonNodeModel();
//				this.GetChild(root.Children[i], JsonChildNodes[i]);
//			}

//			this.JsonRoot.Children = JsonChildNodes;

//			//console.log(this.JsonRoot);
//			return this.JsonRoot;
//		}

//		ConvertToDCaseXML(root: NodeModel): string {
//			var dcaseXML: string = '<dcase:Argument xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'
//									+ ' xmlns:dcase="http://www.dependalopble-os.net/2010/03/dcase/"'
//									+ ' id="_6A0EENScEeKCdP-goLYu9g">\n'; // FIXME: replacee id as case ID
//			var dcaseLinkXML: string = "";

//			function NodeTypeToString(type: NodeType): string {
//				switch(type) {
//					case NodeType.Goal:
//						return "Goal";
//					case NodeType.Strategy:
//						return "Strategy";
//					case NodeType.Evidence:
//						return "Evidence";
//					case NodeType.Context:
//						return "Context";
//					default:
//						return "";
//				}
//			}

//			var linkIdCounter: number = 0;

//			function createNewLinkId(): string {
//				linkIdCounter++;
//				return "LINK_"+linkIdCounter;
//			}

//			function convert(node: NodeModel): void {
//				dcaseXML += '\t<rootBasicNode xsi:type="dcase:'+NodeTypeToString(node.Type)+'"'
//							+ ' id="'+node.Label+'"'   // label is also regarded as id in AssureJS
//							+ ' name="'+node.Label+'"'
//							+ ' desc="'+node.Statement+'"'
//							+ '/>\n';

//				if(node.Parent != null) {
//					var linkId: string = createNewLinkId();
//					dcaseLinkXML += '\t<rootBasicLink xsi:type="dcase:link" id="'+linkId+'"'
//									+ ' source="'+node.Parent.Label+'"'
//									+ ' target="#'+node.Label+'"'
//									+ ' name="'+linkId+'"'
//									+ '/>\n';
//				}

//				for(var i: number = 0; i < node.Children.length; i++) {
//					convert(node.Children[i]);
//				}
//			}

//			convert(root);

//			dcaseXML += dcaseLinkXML;
//			dcaseXML += '</dcase:Argument>';

//			return dcaseXML;
//		}

//		ConvertToASN(root : NodeModel, isSingleNode: boolean): string {
//			var encoded : string = (function(model : NodeModel, prefix : string) : string {
//				var IndentToken: string = "    ";
//				var ret : string = "";
//				switch (model.Type) {
//				case NodeType["Goal"]:
//					prefix += "*";
//					ret += (prefix + " " + model.Label);
//					break;
//				//case NodeType["Context"]:
//				//	if (prefix == "") prefix += "*";
//				//	ret += (prefix + "Context");
//				//	break;
//				//case NodeType["Strategy"]:
//				//	if (prefix == "") prefix += "*";
//				//	ret += (prefix + "Strategy");
//				//	break;
//				//case NodeType["Evidence"]:
//				//	if (prefix == "") prefix += "*";
//				//	ret += (prefix + "Evidence");
//				//	break;
//				default:
//					if (prefix == "") prefix += "*";
//					ret += (prefix + " " + model.Label);
//					//console.log(model.Type);
//				}
//				//TODO:Label
//				var anno_num = model.Annotations.length;
//				if (anno_num != 0) {
//					for (var i = 0; i < model.Annotations.length; i++) {
//						ret += (" @" + model.Annotations[i].Name);
//						if (model.Annotations[i].Body) {
//							ret += (" "  + model.Annotations[i].Body);
//						}
//					}
//				}
//				ret += "\n";

//				if (model.Statement != "") ret += (model.Statement + "\n");

//				for(var key in model.Notes) {
//					switch(key) {
//					case 'TranslatedTextEn':
//						break;
//					default:
//						var Note = model.Notes[key];
//						ret += key + "::" + Note + "\n";
//						break;
//					}
//				}

//				if (isSingleNode) {
//					return ret;
//				}

//				/* Insert newline in case a node consists of multiple lines (for presentation).*/
//				if (ret.indexOf("\n") != ret.lastIndexOf("\n")) {
//					ret += "\n";
//				}

//				for (var i = 0; i < model.Children.length; i++) {
//					var child_model = model.Children[i];
//					//console.log(child_model.Type);
//					if (child_model.Type == NodeType["Context"]) {
//						ret += arguments.callee(child_model, prefix);
//						break;
//					}
//				}
//				for (var i = 0; i < model.Children.length; i++) {
//					var child_model = model.Children[i];
//					if (child_model.Type != NodeType["Context"]) {
//						ret += arguments.callee(child_model, prefix);
//					}
//				}
//				return ret;
//			})(root, "");
//			//console.log(encoded);
//			return encoded;
//		}

//		GetChild(root: NodeModel, JsonNode: JsonNodeModel): JsonNodeModel {
//			JsonNode.Type = root.Type;
//			JsonNode.Label = root.Label;
//			JsonNode.Statement = root.Statement;
//			JsonNode.Annotations = root.Annotations;
//			JsonNode.Notes = root.Notes;

//			var ChildNodes: JsonNodeModel[] = new Array<JsonNodeModel>();
//			for (var i: number = 0; i < root.Children.length; i++) {
//				ChildNodes[i] = new JsonNodeModel();
//				this.GetChild(root.Children[i], ChildNodes[i]);
//			}

//			JsonNode.Children = ChildNodes;

//			return JsonNode;
//		}
//	}
//}
