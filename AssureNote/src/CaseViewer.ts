/// <reference path="CaseModel.ts" />
/// <reference path="CaseDecoder.ts" />
/// <reference path="CaseEncoder.ts" />
/// <reference path="Api.ts" />
/// <reference path="PlugInManager.ts" />
/// <reference path="ColorMap.ts" />
/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path="../d.ts/pointer.d.ts" />

interface JQuery {
	svg(loadUrl: string): JQuery;
	svg(x: Function): JQuery;
}

interface Document {
	createSVGElement: (name: string) => Element;
}

document.createSVGElement = function (name: string): Element {
	return document.createElementNS('http://www.w3.org/2000/svg', name);
}


/* VIEW (MVC) */
module AssureNote {

	//Deprecated
	export class HTMLDoc {
        DocBase: JQuery;
        RawDocBase: HTMLDivElement;
		Width: number = 0;
		Height: number = 0;

		Render(Viewer: CaseViewer, NodeModel: NodeModel): void {
            if (this.DocBase != null) {
				this.DocBase.remove();
			}
            this.DocBase = $('<div>')
                .css("position", "absolute")
                .attr('id', NodeModel.Label);
            this.DocBase.append($('<h4>' + NodeModel.Label + '</h4>'));

			this.RawDocBase = <HTMLDivElement>this.DocBase[0];
			//this.InvokePlugInHTMLRender(Viewer, NodeModel, this.DocBase);
			var statements: string[] = NodeModel.Statement.split("\n");
			var content: string = "";
			for (var i: number = 0; i < statements.length; i++) {
				content += $('<div/>').text(statements[i]).html() + "<br>";
			}
			$('<p>' + content + '</p>').appendTo(this.DocBase);

            this.UpdateWidth(Viewer, NodeModel);
            this.Resize(Viewer, NodeModel);
        }

		UpdateWidth(Viewer: CaseViewer, Source: NodeModel) {
			switch (Source.Type) {
                case NodeType.Goal:
                    this.RawDocBase.className = "node node-goal";
					break;
				case NodeType.Context:
                    this.RawDocBase.className = "node node-context";
					break;
				case NodeType.Strategy:
                    this.RawDocBase.className = "node node-strategy";
					break;
				case NodeType.Evidence:
				default:
                    this.RawDocBase.className = "node node-evidence";
					break;
            }
		}

		InvokePlugInHTMLRender(caseViewer: CaseViewer, caseModel: NodeModel, DocBase: JQuery): void {
			var pluginMap : { [index: string]: HTMLRenderPlugIn} = caseViewer.pluginManager.HTMLRenderPlugInMap;
			for(var key in pluginMap) {
				var render = caseViewer.GetPlugInHTMLRender(key);
				render(caseViewer, caseModel, DocBase);
			}
		}

		Resize(Viewer: CaseViewer, Source: NodeModel): void {
            this.Width = CaseViewer.ElementWidth;
            this.Height = this.RawDocBase ? this.RawDocBase.clientHeight : 0;
		}

        SetPosition(x: number, y: number) {
            this.RawDocBase.style.left = x + "px";
            this.RawDocBase.style.top  = y + "px";
		}
	}

	export class Point {
		constructor(public x: number, public y: number) { }
	}

	export enum Direction {
		Left, Top, Right, Bottom
	}

	function ReverseDirection(Dir: Direction): Direction {
		return (Dir + 2) & 3;
	}

	export class SVGShape {
		Width: number;
		Height: number;
		ShapeGroup: SVGGElement;
		ArrowPath: SVGPathElement;
		ColorClassName: string = Color.Default;

		Render(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			this.ShapeGroup = <SVGGElement>document.createSVGElement("g");
			this.ShapeGroup.setAttribute("transform", "translate(0,0)");
			this.ArrowPath = <SVGPathElement>document.createSVGElement("path");
			this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
			this.ArrowPath.setAttribute("fill", "none");
			this.ArrowPath.setAttribute("stroke", "gray");
			this.ArrowPath.setAttribute("d", "M0,0 C0,0 0,0 0,0");
		}

		GetSVG(): SVGGElement {
			return this.ShapeGroup;
		}

		GetSVGPath(): SVGPathElement {
			return this.ArrowPath;
		}

		Resize(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			this.Width = HTMLDoc.Width;
			this.Height = HTMLDoc.Height;
		}

		SetPosition(x: number, y: number) {
			var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
			mat.e = x;
			mat.f = y;
		}

		SetArrowPosition(p1: Point, p2: Point, dir: Direction) {
			var start = <SVGPathSegMovetoAbs>this.ArrowPath.pathSegList.getItem(0);
			var curve = <SVGPathSegCurvetoCubicAbs>this.ArrowPath.pathSegList.getItem(1);
			start.x = p1.x;
			start.y = p1.y;
			curve.x = p2.x;
			curve.y = p2.y;
			if (dir == Direction.Bottom || dir == Direction.Top) {
				curve.x1 = (9 * p1.x + p2.x) / 10;
				curve.y1 = (p1.y + p2.y) / 2;
				curve.x2 = (9 * p2.x + p1.x) / 10;
				curve.y2 = (p1.y + p2.y) / 2;
			} else {
				curve.x1 = (p1.x + p2.x) / 2;
				curve.y1 = (9 * p1.y + p2.y) / 10;
				curve.x2 = (p1.x + p2.x) / 2;
				curve.y2 = (9 * p2.y + p1.y) / 10;
			}
		}

		SetArrowColorWhite(white: boolean) {
			if (white) {
				this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
			} else {
				this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
			}
		}

		SetColor(key: string) {
		}

		GetColor(): string {
			return null;
		}

		EnableHighlight() {
		}

		DisableHighlight() {
		}

		GetConnectorPosition(Dir: Direction): Point {
			switch (Dir) {
				case Direction.Right:
					return new Point(this.Width, this.Height / 2);
				case Direction.Left:
					return new Point(0, this.Height / 2);
				case Direction.Top:
					return new Point(this.Width / 2, 0);
				case Direction.Bottom:
					return new Point(this.Width / 2, this.Height);
				default:
					return new Point(0, 0);
			}
		}
	}

	export class GoalShape extends SVGShape {
		BodyRect: SVGRectElement;
		UndevelopedSymbol: SVGUseElement;

		Render(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Render(CaseViewer, NodeModel, HTMLDoc);
			this.BodyRect = <SVGRectElement>document.createSVGElement("rect");
			this.BodyRect.setAttribute("class",this.ColorClassName);
			this.UndevelopedSymbol = <SVGUseElement>document.createSVGElement("use");
			this.UndevelopedSymbol.setAttribute("xlink:href", "#UndevelopdSymbol");

			this.ShapeGroup.appendChild(this.BodyRect);
			this.Resize(CaseViewer, NodeModel, HTMLDoc);
		}

		Resize(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Resize(CaseViewer, NodeModel, HTMLDoc);
			this.BodyRect.setAttribute("width", this.Width.toString());
			this.BodyRect.setAttribute("height", this.Height.toString());
		}

		SetColor(key: string) {
			this.BodyRect.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyRect.getAttribute("class");
		}

		EnableHighlight() {
			var CurrentColor: string = this.GetColor();
			if(!CurrentColor.match(/-highlight/)) {
				this.BodyRect.removeAttribute("class");
				this.BodyRect.setAttribute("class", CurrentColor+"-highlight");
			}
		}

		DisableHighlight() {
			var CurrentColor: string = this.GetColor();
			this.BodyRect.removeAttribute("class");
			this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		}

		SetUndevelolpedSymbolPosition(point: Point){
			this.UndevelopedSymbol.setAttribute("x", point.x.toString());
			this.UndevelopedSymbol.setAttribute("y", point.y.toString());
		}
	}

	export class ContextShape extends SVGShape {
		BodyRect: SVGRectElement;

		Render(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Render(CaseViewer, NodeModel, HTMLDoc);
			this.BodyRect = <SVGRectElement>document.createSVGElement("rect");
			this.BodyRect.setAttribute("class",this.ColorClassName);
			this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
			this.BodyRect.setAttribute("rx", "10");
			this.BodyRect.setAttribute("ry", "10");
			this.ShapeGroup.appendChild(this.BodyRect);
			this.Resize(CaseViewer, NodeModel, HTMLDoc);
		}

		Resize(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Resize(CaseViewer, NodeModel, HTMLDoc);
			this.BodyRect.setAttribute("width", this.Width.toString());
			this.BodyRect.setAttribute("height", this.Height.toString());
		}

		SetColor(key: string) {
			this.BodyRect.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyRect.getAttribute("class");
		}

		EnableHighlight() {
			var CurrentColor: string = this.GetColor();
			if(!CurrentColor.match(/-highlight/)) {
				this.BodyRect.removeAttribute("class");
				this.BodyRect.setAttribute("class", CurrentColor+"-highlight");
			}
		}

		DisableHighlight() {
			var CurrentColor: string = this.GetColor();
			this.BodyRect.removeAttribute("class");
			this.BodyRect.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		}

	}

	export class StrategyShape extends SVGShape {
		BodyPolygon: SVGPolygonElement;
		delta: number =20;

		Render(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Render(CaseViewer, NodeModel, HTMLDoc);
			this.BodyPolygon = <SVGPolygonElement>document.createSVGElement("polygon");
			this.BodyPolygon.setAttribute("class",this.ColorClassName);
			this.ShapeGroup.appendChild(this.BodyPolygon);
			this.Resize(CaseViewer, NodeModel, HTMLDoc);
		}

		Resize(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Resize(CaseViewer, NodeModel, HTMLDoc);
			this.BodyPolygon.setAttribute("points", ""+this.delta+",0 " + this.Width + ",0 " + (this.Width - this.delta) + "," + this.Height + " 0," + this.Height);
		}

		SetColor(key: string) {
			this.BodyPolygon.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyPolygon.getAttribute("class");
		}

		EnableHighlight() {
			var CurrentColor: string = this.GetColor();
			if(!CurrentColor.match(/-highlight/)) {
				this.BodyPolygon.removeAttribute("class");
				this.BodyPolygon.setAttribute("class", CurrentColor+"-highlight");
			}
		}

		DisableHighlight() {
			var CurrentColor: string = this.GetColor();
			this.BodyPolygon.removeAttribute("class");
			this.BodyPolygon.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		}

		GetConnectorPosition(Dir: Direction): Point {
			switch (Dir) {
				case Direction.Right:
					return new Point(this.Width - this.delta / 2, this.Height / 2);
				case Direction.Left:
					return new Point(this.delta / 2, this.Height / 2);
				case Direction.Top:
					return new Point(this.Width / 2, 0);
				case Direction.Bottom:
					return new Point(this.Width / 2, this.Height);
			}
		}
	}

	export class EvidenceShape extends SVGShape {
		BodyEllipse: SVGEllipseElement;

		Render(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Render(CaseViewer, NodeModel, HTMLDoc);
			this.BodyEllipse = <SVGEllipseElement>document.createSVGElement("ellipse");
			this.BodyEllipse.setAttribute("class",this.ColorClassName);
			this.ShapeGroup.appendChild(this.BodyEllipse);
			this.Resize(CaseViewer, NodeModel, HTMLDoc);
		}

		Resize(CaseViewer: CaseViewer, NodeModel: NodeModel, HTMLDoc: HTMLDoc): void {
			super.Resize(CaseViewer, NodeModel, HTMLDoc);
			this.BodyEllipse.setAttribute("cx", (this.Width / 2).toString());
			this.BodyEllipse.setAttribute("cy", (this.Height / 2).toString());
			this.BodyEllipse.setAttribute("rx", (this.Width / 2).toString());
			this.BodyEllipse.setAttribute("ry", (this.Height / 2).toString());
		}

		SetColor(key: string) {
			this.BodyEllipse.setAttribute("class", key);
		}

		GetColor() {
			return this.BodyEllipse.getAttribute("class");
		}

		EnableHighlight() {
			var CurrentColor: string = this.GetColor();
			if(!CurrentColor.match(/-highlight/)) {
				this.BodyEllipse.removeAttribute("class");
				this.BodyEllipse.setAttribute("class", CurrentColor+"-highlight");
			}
		}

		DisableHighlight() {
			var CurrentColor: string = this.GetColor();
			this.BodyEllipse.removeAttribute("class");
			this.BodyEllipse.setAttribute("class", CurrentColor.replace(/-highlight/, ""));
		}

	}

	export class OldSVGShapeFactory {
		static Create(Type: NodeType): SVGShape {
			switch (Type) {
				case NodeType.Goal:
					return new GoalShape();
				case NodeType.Context:
					return new ContextShape();
				case NodeType.Strategy:
					return new StrategyShape();
				case NodeType.Evidence:
					return new EvidenceShape();
			}
		}
	}

	export class OldNodeView {
		CaseViewer: CaseViewer;
		Source: NodeModel;
		HTMLDoc: HTMLDoc;
		SVGShape: SVGShape;
		ParentShape: OldNodeView;
		TemporaryColor: { [index: string]: string };

		IsArrowWhite: boolean = false;

		AbsX: number = 0;
		AbsY: number = 0;
		x: number = 0;
		y: number = 0;

		constructor(CaseViewer: CaseViewer, NodeModel: NodeModel) {
			this.CaseViewer = CaseViewer;
			this.Source = NodeModel;
			this.HTMLDoc = new HTMLDoc();
			this.HTMLDoc.Render(CaseViewer, NodeModel);
			this.SVGShape = OldSVGShapeFactory.Create(NodeModel.Type);
			this.SVGShape.Render(CaseViewer, NodeModel, this.HTMLDoc);
			this.TemporaryColor = null;
		}

		Resize(): void {
			this.HTMLDoc.Resize(this.CaseViewer, this.Source);
			this.SVGShape.Resize(this.CaseViewer, this.Source, this.HTMLDoc);
		}

		Update(): void {
			this.Resize();
			this.HTMLDoc.SetPosition(this.AbsX, this.AbsY);
			this.SVGShape.SetPosition(this.AbsX, this.AbsY);
			if (this.ParentShape != null) {
				this.SVGShape.SetArrowColorWhite(this.IsArrowWhite);
			}
		}

        private AppendHTMLElement(svgroot: DocumentFragment, divroot: DocumentFragment, caseViewer : CaseViewer): void {
			divroot.appendChild(this.HTMLDoc.RawDocBase);
            svgroot.appendChild(this.SVGShape.ShapeGroup);
			this.InvokePlugInSVGRender(caseViewer);

			// if it has an parent, add an arrow element.
			if (this.ParentShape != null) {
                svgroot.appendChild(this.SVGShape.ArrowPath);
			}
			if (this.Source.Type == NodeType.Goal && this.Source.Children.length == 0){
                svgroot.appendChild((<GoalShape>this.SVGShape).UndevelopedSymbol);
			}
			this.Update();
		}

        AppendHTMLElementRecursive(svgroot: DocumentFragment, divroot: DocumentFragment, caseViewer : CaseViewer): void {
			var Children = this.Source.Children;
			var ViewMap = this.CaseViewer.ViewMap;
			for (var i = 0; i < Children.length; i++) {
				ViewMap[Children[i].Label].AppendHTMLElementRecursive(svgroot, divroot, caseViewer);
			}
			this.AppendHTMLElement(svgroot, divroot, caseViewer);
		}

	 	private DeleteHTMLElement(svgroot: JQuery, divroot: JQuery): void {
			this.HTMLDoc.DocBase.remove();
			$(this.SVGShape.ShapeGroup).remove();
			if (this.ParentShape != null) $(this.SVGShape.ArrowPath).remove();
			this.Update();
	 	}

	 	DeleteHTMLElementRecursive(svgroot: JQuery, divroot: JQuery): void {
			var Children = this.Source.Children;
			var ViewMap = this.CaseViewer.ViewMap;
			for (var i = 0; i < Children.length; i++) {
				ViewMap[Children[i].Label].DeleteHTMLElementRecursive(svgroot, divroot);
			}
			this.DeleteHTMLElement(svgroot, divroot);
	 	}

		GetAbsoluteConnectorPosition(Dir: Direction): Point {
			var p = this.SVGShape.GetConnectorPosition(Dir);
			p.x += this.AbsX;
			p.y += this.AbsY;
			return p;
		}

		InvokePlugInSVGRender(caseViewer: CaseViewer): void {
			var pluginMap : { [index: string]: SVGRenderPlugIn} = caseViewer.pluginManager.SVGRenderPlugInMap;
			for(var key in pluginMap) {
				var render = caseViewer.GetPlugInSVGRender(key);
				render(caseViewer, this);
			}
		}

		SetArrowPosition(p1: Point, p2: Point, dir: Direction) {
			this.SVGShape.SetArrowPosition(p1, p2, dir);
		}

		SetTemporaryColor(fill: string, stroke: string): void {
			if((!fill || fill == "none") && (!stroke || stroke == "none")) {
				this.TemporaryColor = null;
			}
			else {
				this.TemporaryColor = { "fill": fill, "stroke": stroke };
			}
		}

		GetTemporaryColor(): { [index: string]: string } {
			return this.TemporaryColor;
		}
	}

	export class CaseViewer {
		ViewMap: { [index: string]: OldNodeView; };
		ElementTop : NodeModel;
		static ElementWidth = 250; /*look index.css*/

		constructor(public Source: Case, public pluginManager : OldPlugInManager, public serverApi: ServerAPI, public Screen: ViewportManager) {
			this.InitViewMap(Source);
			this.Resize();
		}

		InitViewMap(Source: Case) {
			this.ViewMap = {};
			for (var elementkey in Source.ElementMap) {
				var element = Source.ElementMap[elementkey];
				this.ViewMap[element.Label] = new OldNodeView(this, element);
				if (element.Parent != null) {
					this.ViewMap[element.Label].ParentShape = this.ViewMap[element.Parent.Label];
				}
			}
			this.ElementTop = Source.ElementTop;
		}

		GetPlugInHTMLRender(PlugInName: string): (caseViewer: CaseViewer, caseModel: NodeModel, element: JQuery) => boolean {
			return (viewer: CaseViewer, model: NodeModel, e: JQuery) : boolean => {
				return this.pluginManager.HTMLRenderPlugInMap[PlugInName].Delegate(viewer, model, e);
			};
		}

		GetPlugInSVGRender(PlugInName: string): (caseViewer: CaseViewer, elementShape: OldNodeView) => boolean {
			return (viewer: CaseViewer, shape: OldNodeView) : boolean => {
				return this.pluginManager.SVGRenderPlugInMap[PlugInName].Delegate(viewer, shape);
			};
		}

		private Resize(): void {
			for (var shapekey in this.ViewMap) {
				this.ViewMap[shapekey].Resize();
			}
			this.LayoutElement();
		}

		Update(): void {
			this.Resize();
			for (var shapekey in this.ViewMap) {
				this.ViewMap[shapekey].Update();
			}
		}

		DeleteViewsRecursive(root : OldNodeView) : void {
			var Children = root.Source.Children;
			this.ViewMap[root.Source.Label].DeleteHTMLElementRecursive(null, null);
			delete this.ViewMap[root.Source.Label];
			for (var i = 0; i < Children.length; i++) {
				this.DeleteViewsRecursive(this.ViewMap[Children[i].Label]);
			}
		}

		private LayoutElement() : void {
			var layout = new LayoutPortrait(this.ViewMap, this.ElementTop, 0, 0, CaseViewer.ElementWidth);
			layout.LayoutAllView(this.ElementTop, 0, 0);
		}

		private UpdateViewMapRecursive(model: NodeModel, view: OldNodeView) {
			for (var i in model.Children) {
				var child_model: NodeModel = model.Children[i];
				var child_view = this.ViewMap[child_model.Label];
				if (child_view == null) {
					child_view = new OldNodeView(this, child_model);
					this.ViewMap[child_model.Label] = child_view;
					child_view.ParentShape = view;
				}
				this.UpdateViewMapRecursive(child_model, child_view);
			}
		}

		private UpdateViewMap() : void {
			this.UpdateViewMapRecursive(this.ElementTop, this.ViewMap[this.ElementTop.Label]);
		}

		Draw(): void {
			this.UpdateViewMap();
            var divfrag = document.createDocumentFragment();
            var svgfrag = document.createDocumentFragment();
            this.ViewMap[this.ElementTop.Label].AppendHTMLElementRecursive(svgfrag, divfrag, this);
            this.Screen.SVGLayer.appendChild(svgfrag);
            this.Screen.ContentLayer.appendChild(divfrag);
			//this.pluginManager.RegisterActionEventListeners(this, this.Source, this.serverApi);
			this.Update();
		}

		//FIXME Deprecated
		DeleteHTMLElementAll(): void {
			$('#layer0').children().remove();
			$('#layer1').children().remove();
		}
	}

	export class ScrollManager {
		InitialOffsetX: number = 0;
		InitialOffsetY: number = 0;
		InitialX: number = 0;
		InitialY: number = 0;
		CurrentX: number = 0;
		CurrentY: number = 0;
		MainPointerID: number = 0;
		Pointers: Pointer[] = [];

		private SetInitialOffset(InitialOffsetX: number, InitialOffsetY: number) {
			this.InitialOffsetX = InitialOffsetX;
			this.InitialOffsetY = InitialOffsetY;
		}

		private StartDrag(InitialX: number, InitialY: number) {
			this.InitialX = InitialX;
			this.InitialY = InitialY;
		}

		private UpdateDrag(CurrentX: number, CurrentY: number) {
			this.CurrentX = CurrentX;
			this.CurrentY = CurrentY;
		}

		private CalcOffsetX(): number {
			return this.CurrentX - this.InitialX + this.InitialOffsetX;
		}

		private CalcOffsetY(): number {
			return this.CurrentY - this.InitialY + this.InitialOffsetY;
		}

		private GetMainPointer(): Pointer {
			for (var i = 0; i < this.Pointers.length; ++i) {
				if (this.Pointers[i].identifier === this.MainPointerID) {
					return this.Pointers[i]
				}
			};
			return null;
		}

		private IsDragging(): boolean {
			return this.MainPointerID != null;
		}

		OnPointerEvent(e: PointerEvent, Screen: ViewportManager) {
			this.Pointers = e.getPointerList();
			if (this.Pointers.length > 0) {
				if (this.IsDragging()) {
					var mainPointer = this.GetMainPointer();
					if (mainPointer) {
						this.UpdateDrag(mainPointer.pageX, mainPointer.pageY);
						Screen.SetOffset(this.CalcOffsetX(), this.CalcOffsetY());
					} else {
						this.MainPointerID = null;
					}
				} else {
					var mainPointer = this.Pointers[0];
					this.MainPointerID = mainPointer.identifier;
					this.SetInitialOffset(Screen.GetOffsetX(), Screen.GetOffsetY());
					this.StartDrag(mainPointer.pageX, mainPointer.pageY);
				}
			} else {
				this.MainPointerID = null;
			}
		}

		OnDoubleTap(e: PointerEvent, Screen: ViewportManager) {
			var width: number = Screen.ContentLayer.clientWidth;
			var height: number = Screen.ContentLayer.clientHeight;
			var pointer = this.Pointers[0];
			//Screen.SetOffset(width / 2 - pointer.pageX, height / 2 - pointer.pageY);
		}
	}

	export class ViewportManager {
		//windowX, windowY
		ScrollManager: ScrollManager = new ScrollManager();
		private OffsetX: number = 0;
		private OffsetY: number = 0;
		private LogicalOffsetX: number = 0;
		private LogicalOffsetY: number = 0;
		private Scale: number = 1.0;

		constructor(public SVGLayer: SVGGElement, public EventMapLayer: HTMLDivElement, public ContentLayer: HTMLDivElement, public ControlLayer: HTMLDivElement) {
			this.ContentLayer.style["transformOrigin"]       = "left top";
			this.ContentLayer.style["MozTransformOrigin"]    = "left top";
			this.ContentLayer.style["msTransformOrigin"]     = "left top";
			this.ContentLayer.style["OTransformOrigin"]      = "left top";
			this.ContentLayer.style["webkitTransformOrigin"] = "left top";
			this.UpdateAttr();
			var OnPointer = (e: PointerEvent) => { this.ScrollManager.OnPointerEvent(e, this); };
			this.EventMapLayer.addEventListener("pointerdown", OnPointer, false);
			this.EventMapLayer.addEventListener("pointermove", OnPointer, false);
			this.EventMapLayer.addEventListener("pointerup", OnPointer, false);
			this.EventMapLayer.addEventListener("gesturedoubletap", (e: PointerEvent) => { this.ScrollManager.OnDoubleTap(e, this); }, false);
			this.ContentLayer.addEventListener("pointerdown", OnPointer, false);
			this.ContentLayer.addEventListener("pointermove", OnPointer, false);
			this.ContentLayer.addEventListener("pointerup", OnPointer, false);
			this.ContentLayer.addEventListener("gesturedoubletap", (e: PointerEvent) => { this.ScrollManager.OnDoubleTap(e, this); }, false);
			//BackGroundLayer.addEventListener("gesturescale", OnPointer, false);
		}

		private static translateA(x: number, y: number): string {
			return "translate(" + x + " " + y + ") ";
		}

		private static scaleA(scale: number): string {
			return "scale(" + scale + ") ";
		}

		private static translateS(x: number, y: number): string {
			return "translate(" + x + "px, " + y + "px) ";
		}

		private static scaleS(scale: number): string {
			return "scale(" + scale + ") ";
		}

		private UpdateAttr(): void {
			var attr: string = ViewportManager.translateA(this.OffsetX, this.OffsetY) + ViewportManager.scaleA(this.Scale);
			var style: string = ViewportManager.translateS(this.OffsetX, this.OffsetY) + ViewportManager.scaleS(this.Scale);
			this.SVGLayer.setAttribute("transform", attr);
			this.ContentLayer.style["transform"]       = style;
			this.ContentLayer.style["MozTransform"]    = style;
			this.ContentLayer.style["webkitTransform"] = style;
			this.ContentLayer.style["msTransform"]     = style;
			this.ContentLayer.style["OTransform"]      = style;
			this.ControlLayer.style["transform"]       = style;
			this.ControlLayer.style["MozTransform"]    = style;
			this.ControlLayer.style["webkitTransform"] = style;
			this.ControlLayer.style["msTransform"]     = style;
			this.ControlLayer.style["OTransform"]      = style;
		}

		SetScale(scale: number): void {
			this.Scale = scale;
			var cx = this.GetPageCenterX();
			var cy = this.GetPageCenterY();
			this.OffsetX = (this.LogicalOffsetX - cx) * scale + cx;
			this.OffsetY = (this.LogicalOffsetY - cy) * scale + cy;
			this.UpdateAttr();
		}

		SetOffset(x: number, y: number): void {
			this.OffsetX = x;
			this.OffsetY = y;
			this.LogicalOffsetX = this.CalcLogicalOffsetX(x);
			this.LogicalOffsetY = this.CalcLogicalOffsetY(y);
			this.UpdateAttr();
		}

		SetLogicalOffset(x: number, y: number, scale?: number): void {
			this.LogicalOffsetX = x;
			this.LogicalOffsetY = y;
			this.SetScale(scale || this.Scale);
		}

		GetLogicalOffsetX(): number {
			return this.LogicalOffsetX;
		}

		GetLogicalOffsetY(): number {
			return this.LogicalOffsetY;
		}

		private CalcLogicalOffsetX(OffsetX: number): number {
			var cx = this.GetPageCenterX();
			return (OffsetX - cx) / this.Scale + cx;
		}

		private CalcLogicalOffsetY(OffsetY: number): number {
			var cy = this.GetPageCenterY();
			return (OffsetY - cy) / this.Scale + cy;
		}

		CalcLogicalOffsetXFromPageX(PageX: number): number {
			return this.GetLogicalOffsetX() - (PageX - this.GetPageCenterX()) / this.Scale;
		}

		CalcLogicalOffsetYFromPageY(PageY: number): number {
			return this.GetLogicalOffsetY() - (PageY - this.GetPageCenterY()) / this.Scale;
		}

		GetOffsetX(): number {
			return this.OffsetX;
		}

		GetOffsetY(): number {
			return this.OffsetY;
		}

		GetWidth(): number {
			return document.body.clientWidth;
		}

		GetHeight(): number {
			return document.body.clientHeight;
		}

		GetPageCenterX(): number {
			return this.GetWidth() / 2;
		}

		GetPageCenterY(): number {
			return this.GetHeight() / 2;
		}

		GetCaseWidth(): number {
			return this.SVGLayer.getBoundingClientRect().width;
		}

		GetCaseHeight(): number {
			return this.SVGLayer.getBoundingClientRect().height;
		}

		GetScale() {
			return this.Scale;
		}

		GetScaleRate() {
			var svgwidth = this.GetCaseWidth();
			var svgheight = this.GetCaseHeight();
			var bodywidth = this.GetWidth();
			var bodyheight = this.GetHeight();
			var scaleWidth = bodywidth / svgwidth;
			var scaleHeight = bodyheight / svgheight;
			return Math.min(scaleWidth, scaleHeight);
		}

		SetCaseCenter(DCaseX: number, DCaseY: number, HTMLDoc: HTMLDoc): void {
			var NewOffsetX = this.ConvertX(DCaseX, HTMLDoc);
			var NewOffsetY = this.ConvertY(DCaseY, HTMLDoc);
			this.SetOffset(NewOffsetX, NewOffsetY);
		}

		ConvertX(DCaseX: number, HTMLDoc: HTMLDoc): number {
			var ConvertedX = this.OffsetX + (this.GetPageCenterX() - (this.OffsetX + DCaseX)) - HTMLDoc.Width/2;
			return ConvertedX;

		}

		ConvertY(DCaseY: number, HTMLDoc: HTMLDoc): number {

			var ConvertedY = this.OffsetY + (this.GetPageCenterY() - (this.OffsetY + DCaseY)) - HTMLDoc.Height/2;
			return ConvertedY;
		}
	}
}
