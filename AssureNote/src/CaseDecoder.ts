/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path="../d.ts/ASNParser.d.ts" />
/// <reference path="CaseModel.ts" />

module AssureNote {

	function OutputError(o : any) : void {
			console.log("error: " + o);
	}

	export class Parser {

		Case : Case;

		constructor(Case : Case) {
			this.Case = Case;
		}

		Parse(source : any, orig : NodeModel) : NodeModel {
			return null;
		}

	}

	export class JsonParser extends Parser {

		NodeModelMap : any = {};

		InitNodeModelMap(NodeList : any[] /* TODO: remove any type */) : void {
			for(var i : number = 0; i < NodeList.length; i++) {
				this.NodeModelMap[NodeList[i]["Label"]] = NodeList[i];
			}
		}

		ParseChild(childLabel : string, Parent : NodeModel) : NodeModel {
			var NodeModelData : any = this.NodeModelMap[childLabel]; // TODO: remove any type
			var Type : NodeType = NodeModelData["NodeType"]; // fix NodeType's type
			var Statement : string = NodeModelData["Statement"];
			var Children : string[] = NodeModelData["Children"];
			var NoteData : { [index: string]: string } = NodeModelData["Notes"];
			var AnnotationData : any[] = NodeModelData["Annotations"];

			if(NoteData == null) {
				NoteData = {};
			}

			var ChildNodeModel : NodeModel = new NodeModel(this.Case, Parent, Type, childLabel, Statement, NoteData);

			if(AnnotationData != null) {
				for(var i : number = 0; i < AnnotationData.length; i++) {
					var annotation : CaseAnnotation =
									 new CaseAnnotation(AnnotationData[i].Name, AnnotationData[i].Body);
					ChildNodeModel.Annotations.push(annotation);
				}
			}

			for(var i : number = 0; i < Children.length; i++) {
				this.ParseChild(Children[i], ChildNodeModel);
			}

			if(Parent == null) {
				return ChildNodeModel;
			}
			else {
				return Parent;
			}
		}

		Parse(JsonData : any /* TODO: remove any type */) : NodeModel {
			var DCaseName : string = JsonData["DCaseName"]; // Is it necessary?
			var NodeCount : number = JsonData["NodeCount"]; // Is it necessary?
			var TopGoalLabel : string = JsonData["TopGoalLabel"]; // Is it necessary?
			var NodeList : any[] = JsonData["NodeList"]; // TODO: remove any type

			this.InitNodeModelMap(NodeList);
			var root : NodeModel = this.ParseChild(TopGoalLabel, null);

			return root;
		}

	}

	export class DCaseLink {

		source : string;
		target : string;

		constructor(source : string, target : string) {
			this.source = source;
			this.target = target;
		}

	}

	export class DCaseXMLParser extends Parser {

		Case : Case;
		nodes : any = {};
		links : any = {};
		Text2NodeTypeMap : any = {"Goal" : NodeType.Goal, "Strategy" : NodeType.Strategy , "Context" : NodeType.Context, "Evidence" : NodeType.Evidence};
		RootNodeId : string;

		MakeTree(Id : string) : NodeModel {
			var ThisNode : NodeModel = this.nodes[Id];

			for(var LinkId in this.links) {
				var link : DCaseLink = this.links[LinkId];

				if(link.source == Id || link.target == Id) {
					var ChildNodeId : string;

					if(link.source == Id) {
						ChildNodeId = link.target;
					}
					else {
						ChildNodeId = link.source;
					}
					delete this.links[LinkId];

					var ChildNode : NodeModel = this.nodes[ChildNodeId];

					ThisNode.AppendChild(ChildNode);
					this.MakeTree(ChildNodeId);
				}
			}

			return ThisNode;
		}

		Parse(XMLData : string) : NodeModel {
			var self : DCaseXMLParser = this;
			var IsRootNode : boolean = true;

			$(XMLData).find("rootBasicNode").each(function(index : any, elem : Element) : JQuery {
				var XsiType : string = $(this).attr("xsi\:type");

				if(XsiType.split(":").length != 2) {
					OutputError("attr 'xsi:type' is incorrect format");
				}

				var NodeType : string = XsiType.split(":")[1];
				var Id : string = $(this).attr("id");
				var Statement : string = $(this).attr("desc");
				var Label : string = $(this).attr("name");

				if(IsRootNode) {
					self.RootNodeId = Id;
					IsRootNode = false;
				}

				var node : NodeModel = new NodeModel(self.Case, null, self.Text2NodeTypeMap[NodeType], Label, Statement, {});
				self.nodes[Id] = node;

				return null;
			});

			$(XMLData).find("rootBasicLink").each(function(index : any, elem : Element) : JQuery {
				var Id : any = $(this).attr("id");
				var source : string = $(this).attr("source").substring(1); // #abc -> abc
				var target : string = $(this).attr("target").substring(1); // #abc -> abc
				var link : DCaseLink = new DCaseLink(source, target);

				self.links[Id] = link;

				return null;
			});

			var root : NodeModel = this.MakeTree(this.RootNodeId);

			return root;
		}
	}

	export class ASNParser extends Parser {
		Text2NodeTypeMap : any = {"Goal" : NodeType.Goal, "Strategy" : NodeType.Strategy , "Context" : NodeType.Context, "Evidence" : NodeType.Evidence};
		private error;
		constructor(Case : Case) {
			super(Case);
			this.error = null;
		}
		Object2NodeModel(obj : any) : NodeModel {
			var Case : Case = this.Case;
			var Parent : NodeModel = obj["Parent"];
			var Type : NodeType = this.Text2NodeTypeMap[obj["Type"]];
			var Label : string = obj["Label"];
			var Statement : string = obj["Statement"];
	 		var Notes = (obj["Notes"]) ? obj["Notes"] : {};
			var Model : NodeModel = new NodeModel(Case, Parent,	Type, Label, Statement, Notes);

			var Children = obj["Children"];
	 		if (Children.length != 0) {
				for (var i : number = 0; i < Children.length; i++) {

					/* ASNParser returns [""] when the parsing Children failed at Strategy node. */
					if (Children[i] == "") break;
					var Child = this.Object2NodeModel(Children[i]);
					Child.Parent = Model;
					Model.Children.push(Child);
				}
			}
			else {
				Model.Children = []; // Is this really OK?
			}
			if (obj["Annotations"].length != 0) {
				for (var i : number = 0; i < obj["Annotations"].length; i++) {
					Model.SetAnnotation(obj["Annotations"][i].Name, obj["Annotations"][i].Body);
				}
			}
			else {
				//TODO
			}
			return Model;
		}
		Parse(ASNData : string, orig : NodeModel) : NodeModel {
			try {
				var obj : any = Peg.parse(ASNData)[1];
				var root : NodeModel = this.Object2NodeModel(obj);
				if (orig != null) {
					root.Parent = orig.Parent;
				}
				return root;
			} catch(e) {
				this.error = e;
				return null;
			}
		}

		GetError() {
			return this.error;
		}
	}

	export class CaseDecoder {
		ASNParser : ASNParser;
		constructor() {
			this.ASNParser = null;
		}

		ParseJson(Case : Case, JsonData : any) : NodeModel  {
			var parser : Parser = new JsonParser(Case);
			var root : NodeModel = parser.Parse(JsonData, null);
			return root;
		}

		ParseDCaseXML(Case : Case, XMLData : string) : NodeModel {
			var parser : Parser = new DCaseXMLParser(Case);
			var root : NodeModel = parser.Parse(XMLData, null);
			return root;
		}

		ParseASN(Case : Case,  ASNData: string, orig : NodeModel) : NodeModel {
			this.ASNParser = new ASNParser(Case);
//			console.log(ASNData);
			var root : NodeModel = this.ASNParser.Parse(ASNData, orig);
//			console.log(root);
			return root;
		}
		GetASNError() {
			if (this.ASNParser == null || this.ASNParser.GetError() == null) {
				return null;
			}
			return this.ASNParser.GetError();
		}
	}
}
