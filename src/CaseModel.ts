
module AssureNote {

	export class CaseAnnotation {
		constructor(public Name: string, public Body: string) {
		}
	}

	/* obsolete */
	//export class CaseNote {
	//	constructor(public Name: string, public Body: any) {
	//	}
	//}

	export enum NodeType {
		Goal, Context, Strategy, Evidence
	}

	export class NodeModel {
		Case : Case;
		Type  : NodeType;
		Label : string;
		Statement: string;
		Annotations : CaseAnnotation[];
		Notes: { [index: string]: string };
		Parent : NodeModel;
		Children: NodeModel[];
		LineNumber : number;
		Environment;

		HasDiff: boolean = false;

		constructor(Case: Case, Parent: NodeModel, Type: NodeType, Label: string, Statement: string,Notes: {[index: string]: string}) {
			this.Case = Case;
			this.Type = Type;
			this.Label = Case.NewLabel(Type, Label);
			this.Statement = (Statement == null) ? "" : Statement.replace(/[\n\r]*$/g, "");
			this.Parent = Parent;
			if(Parent != null) {
				Parent.AppendChild(this);
			}
			this.Children = [];
			this.Annotations = [];
			this.Notes = (Notes == null)  ? {}: Notes;
			if (this.Notes['TranslatedTextEn']) {
				this.Case.SetTranslation(this.Statement, this.Notes['TranslatedTextEn']);
			} else if (this.Case.GetTranslation(this.Statement)) {
				this.Notes['TranslatedTextEn'] = this.Case.GetTranslation(this.Statement);
			}

			Case.ElementMap[this.Label] = this; // TODO: ensure consistensy of labels
			this.LineNumber = 1; /*FIXME*/
			this.Environment = null;
		}

		EnableEditFlag(): void {
			this.InvokePatternPlugIn();
			this.Case.SetModified(true);
		}

		AppendChild(Node : NodeModel) : void {
			this.Children.push(Node);
			Node.Parent = this;
			this.EnableEditFlag();
		}

		RemoveChild(Node : NodeModel) : void {
			for (var i = 0; i < this.Children.length; i++) {
				if (this.Children[i].Label == Node.Label) {
					this.Children.splice(i, 1);
				}
			}
			this.EnableEditFlag();
		}

		UpdateChild(oldNode : NodeModel, newNode : NodeModel) : void {
			for (var i = 0; i < this.Children.length; i++) {
				if (this.Children[i].Label == oldNode.Label) {
					this.Children[i] = newNode;
				}
			}
			this.EnableEditFlag();
		}

		GetAnnotation(Name: string) : CaseAnnotation {
			for(var i: number = 0; i < this.Annotations.length; i++ ) {
				if(this.Annotations[i].Name == Name) {
					return this.Annotations[i];
				}
			}
			return null;
		}

		SetAnnotation(Name: string, Body : string) : void {
			for(var i: number = 0; i < this.Annotations.length; i++ ) {
				if(this.Annotations[i].Name == Name) {
					this.Annotations[i].Body = Body;
					return;
				}
			}
			this.Annotations.push(new CaseAnnotation(Name, Body));
		}

		SetNote(Name: string, Body : string) : void {
			this.Notes[Name] = Body;
			this.EnableEditFlag();
		}

		GetNote(Name: string) : string {
			if(Name in this.Notes) {
				return this.Notes[Name];
			}
			return null;
		}

		eachChildren(f: (i: number, v: NodeModel) => void): void { //FIXME
			for(var i: number = 0; i < this.Children.length; i++) {
				f(i, this.Children[i]);
			}
		}

		traverse(f: (i: number, v: NodeModel) => void): void {
			function traverse_(n: NodeModel, f: (i: number, v: NodeModel) => void): void {
				n.eachChildren((i: number, v: NodeModel) => {
					f(i, v);
					traverse_(v, f)
				});
			}
			f(-1, this);
			traverse_(this, f);
		}

		SearchNode(keyword: string, HitNodes: NodeModel[]): NodeModel[] {
			if ((this.Statement).indexOf(keyword) != -1) {
				HitNodes.push(this);
			}

			for (var i: number = 0; i < this.Children.length; i++) {
				this.Children[i].SearchNode(keyword, HitNodes);
			}
			return HitNodes;
		}

		Equals(model: NodeModel) : boolean {
			/* Checks if the contents are the same (except parent and children). */
			if (model == null) return false;
			if (this.Type != model.Type) return false;
			if (this.Statement != model.Statement) return false;
			if (Object.keys(this.Notes).length != Object.keys(model.Notes).length) return false;
			for (var i in Object.keys(this.Notes)) {
				if (this.Notes[i] != model.Notes[i]) return false;
			}
			return true;
		}

		/* plug-In */
		private InvokePatternPlugInRecursive(model: NodeModel) : void {
			var pluginMap : { [index: string]: PatternPlugIn} = this.Case.pluginManager.PatternPlugInMap;
			for (var key in pluginMap) {
				var plugin: PatternPlugIn = pluginMap[key];
				plugin.Delegate(model);
			}
			for (var i in model.Children) {
				this.InvokePatternPlugInRecursive(model.Children[i]);
			}
		}
		private InvokePatternPlugIn() : void {
			this.InvokePatternPlugInRecursive(this);
		}

		HasContext() : boolean {
			for (var i in this.Children) {
				if (this.Children[i].Type == NodeType.Context) return true;
			}
			return false;
		}
		GetContext() : NodeModel {
			for (var i: number = 0; i < this.Children.length; i++) {
				if (this.Children[i].Type == NodeType.Context) return this.Children[i];
			}
			return null;
		}

		//InvokePlugInModifier(EventType : string, EventBody : any) : boolean {
		//	var recall = false;
		//	for(var a in this.Annotations) {
		//		var f = this.Case.GetPlugInModifier(a.Name);
		//		if(f != null) {
		//			recall = f(Case, this, EventType, EventBody) || recall;
		//		}
		//	}
		//	for(var a in this.Notes) {
		//		var f = this.Case.GetPlugInModifier(a.Name);
		//		if(f != null) {
		//			recall = f(Case, this, EventType, EventBody) || recall;
		//		}
		//	}
		//	return recall;
		//}

		UpdateEnvironment(proto = {}): void {
			var env = null;
			var context = this.GetContext();
			if (context == null) {
				env = proto;
			}
			else {
				var envConstructor = function() {
					for (var key in context.Notes) {
						this[key] = context.Notes[key];
					}
				}
				envConstructor.prototype = proto;
				env = new envConstructor();
			}
			this.Environment = env;
			for (var i: number = 0; i < this.Children.length; i++) {
				this.Children[i].UpdateEnvironment(env);
			}
		}

	}

	export class Case {
		IdCounters : any[];
		ElementTop : NodeModel;
		ElementMap : { [index: string]: NodeModel};
		TranslationMap : { [index: string]: string};
		oldsummary: any;

		private isModified : boolean = false;
		isEditable : boolean = false;
		isLatest   : boolean = true;
		constructor(public CaseName: string, summaryString: string, public oldasn: string, public CaseId: number, public CommitId: number, public pluginManager: PlugInManager) {
			this.IdCounters = [{}, {}, {}, {}, {}];
			this.ElementMap = {};
			this.TranslationMap = {};
			this.oldsummary = JSON.parse(summaryString);
		}

		DeleteNodesRecursive(root : NodeModel) : void {
			var Children = root.Children;
			delete this.ElementMap[root.Label];
			for (var i = 0; i < Children.length; i++) {
				this.DeleteNodesRecursive(Children[i]);
			}
			this.SetModified(true);
		}

		ClearNodes(): void {
			this.IdCounters = [{}, {}, {}, {}, {}];
			this.ElementMap = {};
		}

		/* Deprecated */
		SetElementTop(ElementTop : NodeModel) : void {
			this.ElementTop = ElementTop;
			this.SaveIdCounterMax(ElementTop);
		}

		SaveIdCounterMax(Element : NodeModel) : void {
			for (var i = 0; i < Element.Children.length; i++) {
				this.SaveIdCounterMax(Element.Children[i]);
			}
			var m = Element.Label.match(/^[GCSE][0-9]+$/);
			if(m == null) {
				return; //FIXME Label which not use this Id rule
			}
			if (m.length == 1) {
				var prefix = m[0][0];
				var count = Number(m[0].substring(1));
				switch (prefix) {
				case "G":
					this.IdCounters[NodeType["Goal"]][String(count)] = true;
					break;
				case "C":
					this.IdCounters[NodeType["Context"]][String(count)] = true;
					break;
				case "S":
					this.IdCounters[NodeType["Strategy"]][String(count)] = true;
					break;
				case "E":
					this.IdCounters[NodeType["Evidence"]][String(count)] = true;
					break;
				default:
					console.log("invalid label prefix :" + prefix);
				}
			}
		}

		private Label_getNumber(Label: string) : number {
			if (Label == null || Label.length <= 1) return -1;
			return Number(Label.substring(1));
		}

		ClearIdCounters() : void {
			this.IdCounters = [{}, {}, {}, {}, {}];
		}


		Object_Clone(obj: any) : any {
			var f = {};
			var keys = Object.keys(obj);
			for (var i in keys) {
				f[keys[i]] = obj[keys[i]];
			}
			return f;
		}

		private ElementMap_Clone(obj: any) : any {
			return this.Object_Clone(obj);
		}

		private IdCounters_Clone(obj: any[]) : any[] {
			var IdCounters = [];
			for (var i in obj) {
				IdCounters.push(this.Object_Clone(obj[i]));
			}
			return IdCounters;
		}

		private ElementMap_removeChild(ElementMap, model: NodeModel) {
			if (ElementMap[model.Label] == undefined) {
				console.log("wrong with nodemodel");
			}
			delete(ElementMap[model.Label]);
			for (var i in model.Children) {
				this.ElementMap_removeChild(ElementMap, model.Children[i]);
			}
			return ElementMap;
		}

		private IdCounters_removeChild(IdCounters: any[], model: NodeModel) {
			var count = Number(model.Label.substring(1));
			if (IdCounters[model.Type][count] == undefined) {
				console.log("wrong with idcounters");
			}
			delete(IdCounters[model.Type][count]);
			for (var i in model.Children) {
				this.IdCounters_removeChild(IdCounters, model.Children[i]);
			}
			return IdCounters;
		}

		ReserveElementMap (model: NodeModel) {
			var ElementMap = this.ElementMap;
			this.ElementMap =this. ElementMap_removeChild(this.ElementMap_Clone(this.ElementMap), model);
			return ElementMap;
		}

		ReserveIdCounters (model: NodeModel) {
			var IdCounters = this.IdCounters;
			this.IdCounters = this.IdCounters_removeChild(this.IdCounters_Clone(this.IdCounters), model);
			return IdCounters;
		}

		NewLabel(Type : NodeType, Label: string) : string {
			var label = this.Label_getNumber(Label);
			if (label != -1) {
				if (this.IdCounters[Type][String(label)] == undefined) {
					this.IdCounters[Type][String(label)] = true;
					return Label;
				}
			}
			var i: number = 1;
			while (this.IdCounters[Type][String(i)] != undefined) {
				i++;
			}
			this.IdCounters[Type][String(i)] = true;
			return NodeType[Type].charAt(0) + i;
		}

		SetEditable(flag: boolean): void {
			if (flag != null) {
				this.isEditable = flag;
			}
			return;
		}

		IsEditable(): boolean {
			return this.isEditable;
		}

		IsModified(): boolean {
			return this.isModified;
		}

		SetModified(s: boolean): void {
			this.isModified = s;
		}

		IsLatest(): boolean {
			return this.isLatest;
		}

		DiffCase(that: Case): void {
			var keys: string[] = Object.keys(this.ElementMap);
			for(var i: number =0; i< keys.length; i++) {
				if(!(keys[i] in that.ElementMap)) {
					this.ElementMap[keys[i]].HasDiff = true;
				} else if (!this.ElementMap[keys[i]].Equals(that.ElementMap[keys[i]])){
					this.ElementMap[keys[i]].HasDiff = true;
				}
			}
		}

		GetTranslation(key: string): string {
			if (this.TranslationMap[key]) {
				return this.TranslationMap[key];
			} else {
				return '';
			}
		}

		SetTranslation(key: string, value: string): void {
			this.TranslationMap[key] = value;
		}
	}

}
