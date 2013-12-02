///// <reference path="CaseModel.ts" />
///// <reference path="CaseViewer.ts" />
///// <reference path="Api.ts" />
///// <reference path="SideMenu.ts" />

//module AssureNote {

//	//---------Deprecated-----------------
//	export class PlugInSet {
//		HTMLRenderPlugIn: HTMLRenderPlugIn;
//		SVGRenderPlugIn: SVGRenderPlugIn;
//		LayoutEnginePlugIn: LayoutEnginePlugIn;

//		PatternPlugIn: PatternPlugIn;

//		ShortcutKeyPlugIn: ShortcutKeyPlugIn;
//		MenuBarContentsPlugIn: MenuBarContentsPlugIn;
//		SideMenuPlugIn: SideMenuPlugIn;

//		PlugInEnv: any;

//		constructor(public plugInManager: OldPlugInManager) {
//			//this.ActionPlugIn = null;
//			//this.CheckerPlugIn = null;

//			this.HTMLRenderPlugIn = null;
//			this.SVGRenderPlugIn = null;
//			this.LayoutEnginePlugIn = null;

//			this.PatternPlugIn = null;

//			this.MenuBarContentsPlugIn = null;
//			this.ShortcutKeyPlugIn = null;
//			this.SideMenuPlugIn = null;

//			this.PlugInEnv = null;
//		}
//	}

//	export class AbstractPlugIn {
//		constructor(public plugInManager: OldPlugInManager) {
//		}

//		DeleteFromDOM(): void { //TODO
//		}

//		DisableEvent(caseViewer: CaseViewer, case0: Case, serverApi: ServerAPI)  : void {
//		}

//	}

//	export class ActionPlugIn extends AbstractPlugIn {
//		EventName   : string;
//		EventTarget : string;

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(caseViewer: CaseViewer, case0: Case) : boolean {
//			return true;
//		}

//		Delegate(caseViewer: CaseViewer, case0: Case, serverApi: ServerAPI)  : boolean {
//			return true;
//		}

//	}

//	export class CheckerPlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(caseModel: NodeModel, EventType: string) : boolean {
//			return true;
//		}

//		Delegate(caseModel: NodeModel, y: string, z: string) : boolean {
//			return true;
//		}
//	}

//	export class HTMLRenderPlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(caseViewer: CaseViewer, caseModel: NodeModel) : boolean {
//			return true;
//		}

//		Delegate(caseViewer: CaseViewer, caseModel: NodeModel, element: JQuery) : boolean {
//			return true;
//		}
//	}

//	export class MenuBarContentsPlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(caseViewer: CaseViewer, caseModel: NodeModel) : boolean {
//			return true;
//		}

//		Delegate(caseViewer: CaseViewer, caseModel: NodeModel, element: JQuery, serverApi: ServerAPI) : boolean {
//			return true;
//		}
//	}

//	export class SVGRenderPlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(caseViewer: CaseViewer, elementShape: OldNodeView /* add args as necessary */) : boolean {
//			return true;
//		}

//		Delegate(caseViewer: CaseViewer, elementShape: OldNodeView /* add args as necessary */) : boolean {
//			return true;
//		}
//	}

//	export class LayoutEnginePlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		Init(ViewMap: {[index:string]: OldNodeView}, Element: NodeModel, x: number, y: number, ElementWidth: number): void {
//		}

//		LayoutAllView(ElementTop: NodeModel, x: number, y: number): void {
//		}

//		GetContextIndex(Node: NodeModel): number {
//			for (var i: number = 0; i < Node.Children.length; i++) {
//				if (Node.Children[i].Type == NodeType.Context) {
//					return i;
//				}
//			}
//			return -1; 
//		}
//	}

//	export class PatternPlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(caseViewer: CaseViewer, caseModel: NodeModel) : boolean {
//			return true;
//		}

//		Delegate(caseModel: NodeModel) : boolean {
//			return true;
//		}
//	}

//	export class ShortcutKeyPlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(Case0: Case, serverApi: ServerAPI) : boolean {
//			return true;
//		}

//		RegisterKeyEvents(caseViewer: CaseViewer, Case0: Case, serverApi: ServerAPI) : boolean {
//			return true;
//		}
//	}

//	export class SideMenuPlugIn extends AbstractPlugIn {

//		constructor(public plugInManager: OldPlugInManager) {
//			super(plugInManager);
//		}

//		IsEnabled(caseViewer: CaseViewer, Case0: Case, serverApi: ServerAPI) : boolean {
//			return true;
//		}

//		AddMenu(caseViewer: CaseViewer, Case0: Case, serverApi: ServerAPI) : SideMenuContent {
//			return null;
//		}
//		AddMenus(caseViewer: CaseViewer, Case0: Case, serverApi: ServerAPI) : SideMenuContent[] {
//			return null;
//		}
//	}

//	export class OldPlugInManager {

//		//ActionPlugInMap           : { [index: string]: ActionPlugIn };
//		//CheckerPlugInMap          : { [index: string]: CheckerPlugIn };

//		HTMLRenderPlugInMap       : { [index: string]: HTMLRenderPlugIn };
//		SVGRenderPlugInMap        : { [index: string]: SVGRenderPlugIn };
//		LayoutEnginePlugInMap     : { [index: string]: LayoutEnginePlugIn };
//		PatternPlugInMap          : { [index: string]: PatternPlugIn };

//		MenuBarContentsPlugInMap  : { [index: string]: MenuBarContentsPlugIn };
//		ShortcutKeyPlugInMap      : { [index: string]: ShortcutKeyPlugIn };
//		SideMenuPlugInMap         : { [index: string]: SideMenuPlugIn };

//		PlugInEnvMap              : { [index: string]: any };

//		UILayer: AbstractPlugIn[];
//		UsingLayoutEngine: string;


//		constructor(public basepath: string) {
//			//this.ActionPlugInMap = {};
//			//this.CheckerPlugInMap = {};

//			this.HTMLRenderPlugInMap = {};
//			this.SVGRenderPlugInMap = {};
//			this.LayoutEnginePlugInMap = {};

//			this.PatternPlugInMap = {};

//			this.MenuBarContentsPlugInMap = {};
//			this.ShortcutKeyPlugInMap = {};
//			this.SideMenuPlugInMap = {};

//			this.PlugInEnvMap = {};

//			this.UILayer = [];
//		}

//		//ExecCommand(cmdline: string): void {
//		//	//built-in command
//		//	//G,E,S,C, ... Jump to node
//		//}

//		//DrawNode(label: string, wx?: number, wy?: number): void {
//		//	//FIXME tetsurom
//		//	Node = GetNode(label);
//		//	if (!ViewPort.IsVisible(Node, wx, wy)) {
//		//		LayoutManager.Do(ViwePort, Node, this, wx, wy);
//		//	}
//		//	ViewPort.MoveTo(Node, wx, wy);
//		//}

//		Redraw(): void {

//		}

//		GetNodePosition(label: string): Point {
//			return null; //FIXME tetsurom
//		}

//		//Deprecated
//		SetPlugIn(key: string, plugIn: PlugInSet) {
//			//if(plugIn.ActionPlugIn) {
//			//	this.SetActionPlugIn(key, plugIn.ActionPlugIn);
//			//}
//			if(plugIn.HTMLRenderPlugIn) {
//				this.SetHTMLRenderPlugIn(key, plugIn.HTMLRenderPlugIn);
//			}
//			if(plugIn.SVGRenderPlugIn) {
//				this.SetSVGRenderPlugIn(key, plugIn.SVGRenderPlugIn);
//			}
//			if(plugIn.MenuBarContentsPlugIn) {
//				this.SetMenuBarContentsPlugIn(key, plugIn.MenuBarContentsPlugIn);
//			}
//			if(plugIn.LayoutEnginePlugIn) {
//				this.SetLayoutEnginePlugIn(key, plugIn.LayoutEnginePlugIn);
//			}
//			if(plugIn.PatternPlugIn) {
//				this.SetPatternPlugIn(key, plugIn.PatternPlugIn);
//			}
//			if(plugIn.ShortcutKeyPlugIn) {
//				this.SetShortcutKeyPlugIn(key, plugIn.ShortcutKeyPlugIn);
//			}
//			if(plugIn.SideMenuPlugIn) {
//				this.SetSideMenuPlugIn(key, plugIn.SideMenuPlugIn);
//			}
//			if(plugIn.PlugInEnv) {
//				this.SetPlugInEnv(key, plugIn.PlugInEnv);
//			}
//		}

//		//private SetActionPlugIn(key: string, actionPlugIn: ActionPlugIn) {
//		//	this.ActionPlugInMap[key] = actionPlugIn;
//		//}

//		//RegisterActionEventListeners(CaseViewer: CaseViewer, case0: Case, serverApi: ServerAPI): void {
//		//	for(var key in this.ActionPlugInMap) {
//		//		if(this.ActionPlugInMap[key].IsEnabled(CaseViewer, case0)) {
//		//			this.ActionPlugInMap[key].Delegate(CaseViewer, case0, serverApi);
//		//		}else {
//		//			this.ActionPlugInMap[key].DisableEvent(CaseViewer, case0, serverApi);
//		//		}
//		//	}
//		//}

//		private SetHTMLRenderPlugIn(key: string, HTMLRenderPlugIn: HTMLRenderPlugIn): void {
//			this.HTMLRenderPlugInMap[key] = HTMLRenderPlugIn;
//		}

//		private SetSVGRenderPlugIn(key: string, SVGRenderPlugIn: SVGRenderPlugIn): void {
//			this.SVGRenderPlugInMap[key] = SVGRenderPlugIn;
//		}

//		private SetMenuBarContentsPlugIn(key: string, MenuBarContentsPlugIn: MenuBarContentsPlugIn): void {
//			this.MenuBarContentsPlugInMap[key] = MenuBarContentsPlugIn;
//		}

//		SetUseLayoutEngine(key: string): void {
//			this.UsingLayoutEngine = key;
//		}

//		private SetLayoutEnginePlugIn(key: string, LayoutEnginePlugIn: LayoutEnginePlugIn): void {
//			this.LayoutEnginePlugInMap[key] = LayoutEnginePlugIn;
//		}

//		GetLayoutEngine(): LayoutEnginePlugIn {
//			return this.LayoutEnginePlugInMap[this.UsingLayoutEngine];
//		}

//		private SetPatternPlugIn(key: string, PatternPlugIn: PatternPlugIn): void {
//			this.PatternPlugInMap[key] = PatternPlugIn;
//		}

//		private SetShortcutKeyPlugIn(key: string, ShortcutKeyPlugIn: ShortcutKeyPlugIn): void {
//			this.ShortcutKeyPlugInMap[key] = ShortcutKeyPlugIn;
//		}

//		private SetSideMenuPlugIn(key: string, SideMenuPlugIn: SideMenuPlugIn): void {
//			this.SideMenuPlugInMap[key] = SideMenuPlugIn;
//		}

//		private SetPlugInEnv(key: string, PlugInEnv: any): void {
//			this.PlugInEnvMap[key] = PlugInEnv;
//		}

//		GetPlugInEnv(key: string): any {
//			return this.PlugInEnvMap[key];
//		}

//		UseUILayer(plugin :AbstractPlugIn): void {
//			var beforePlugin = this.UILayer.pop();
//			if(beforePlugin != plugin && beforePlugin) {
//				beforePlugin.DeleteFromDOM();
//			}
//			this.UILayer.push(plugin);
//		}

//		UnuseUILayer(plugin :AbstractPlugIn): void { //TODO
//			var beforePlugin = this.UILayer.pop();
//			if(beforePlugin) {
//				beforePlugin.DeleteFromDOM();
//			}
//		}

//		InvokePlugInMenuBarContents(caseViewer: CaseViewer, caseModel: NodeModel, DocBase: JQuery, serverApi: ServerAPI): void {
//			for (var key in this.MenuBarContentsPlugInMap) {
//				var contents: MenuBarContentsPlugIn = this.MenuBarContentsPlugInMap[key];
//				if(contents.IsEnabled(caseViewer, caseModel)) {
//					contents.Delegate(caseViewer, caseModel, DocBase, serverApi);
//				}
//			}
//		}

//		RegisterKeyEvents(caseViewer: CaseViewer, Case0: Case, serverApi: ServerAPI): void {
//			for(var key in this.ShortcutKeyPlugInMap) {
//				var plugin: ShortcutKeyPlugIn = this.ShortcutKeyPlugInMap[key];
//				if(plugin.IsEnabled(Case0, serverApi)) {
//					plugin.RegisterKeyEvents(caseViewer, Case0, serverApi);
//				}
//			}
//		}


//		CreateSideMenu(caseViewer: CaseViewer, Case0: Case, serverApi: ServerAPI): void {
//			var SideMenuContents: SideMenuContent[] = [];
//			for(var key in this.SideMenuPlugInMap) {
//				var plugin: SideMenuPlugIn = this.SideMenuPlugInMap[key];
//				if(plugin.IsEnabled(caseViewer, Case0, serverApi)) {
//					var content = plugin.AddMenu(caseViewer, Case0, serverApi);
//					if (content != null) SideMenuContents.push(content);
//					var contents = plugin.AddMenus(caseViewer, Case0, serverApi);
//					if (contents != null) SideMenuContents.push.apply(SideMenuContents, contents);
//				}
//			}
//			SideMenu.Create(SideMenuContents);
//		}
//	}
//}
