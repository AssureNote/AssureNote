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

	export class Point {
        constructor(public X: number, public Y: number) { }
        public Clone(): Point {
            return new Point(this.X, this.Y);
        }
	}

	export enum Direction {
		Left, Top, Right, Bottom
	}

	function ReverseDirection(Dir: Direction): Direction {
		return (Dir + 2) & 3;
	}

	export class ScrollManager {
		InitialOffsetX: number = 0;
		InitialOffsetY: number = 0;
		InitialX: number = 0;
		InitialY: number = 0;
		CurrentX: number = 0;
		CurrentY: number = 0;
		Dx: number = 0;
		Dy: number = 0;
		MainPointerID: number = null;
		Pointers: Pointer[] = [];

		private timer: number = 0;
		private ANIMATE_THRESHOLD: number = 5;
		private SPEED_MAX: number = 100;

		private SetInitialOffset(InitialOffsetX: number, InitialOffsetY: number) {
			this.InitialOffsetX = InitialOffsetX;
			this.InitialOffsetY = InitialOffsetY;
		}

		private StartDrag(InitialX: number, InitialY: number) {
			this.InitialX = InitialX;
			this.InitialY = InitialY;
			this.CurrentX = InitialX;
			this.CurrentY = InitialY;
		}

		private UpdateDrag(CurrentX: number, CurrentY: number) {
			this.Dx = CurrentX - this.CurrentX;
			this.Dy = CurrentY - this.CurrentY;
			var speed = this.Dx * this.Dx + this.Dy + this.Dy;
			if (speed > this.SPEED_MAX * this.SPEED_MAX) {
				this.Dx *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
				this.Dy *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
			}

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

		private StopAnimation(): void {
			clearInterval(this.timer);
			this.Dx = 0;
			this.Dy = 0;
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
					this.StopAnimation();
					this.timer = null;
					var mainPointer = this.Pointers[0];
					this.MainPointerID = mainPointer.identifier;
					this.SetInitialOffset(Screen.GetOffsetX(), Screen.GetOffsetY());
					this.StartDrag(mainPointer.pageX, mainPointer.pageY);
				}
			} else {
				if (this.IsDragging()) {
					if (this.timer) {
						this.StopAnimation();
						this.timer = null;
					}
					this.timer = setInterval(() => {
						if (Math.abs(this.Dx) < this.ANIMATE_THRESHOLD && Math.abs(this.Dy) < this.ANIMATE_THRESHOLD) {
							this.StopAnimation();
						}
						this.CurrentX += this.Dx;
						this.CurrentY += this.Dy;
						this.Dx *= 0.95;
						this.Dy *= 0.95;
						Screen.SetOffset(this.CalcOffsetX(), this.CalcOffsetY());
					}, 16);
				}
				this.MainPointerID = null;
			}
		}

		OnDoubleTap(e: PointerEvent, Screen: ViewportManager) {
			var width: number = Screen.ContentLayer.clientWidth;
			var height: number = Screen.ContentLayer.clientHeight;
			var pointer = this.Pointers[0];
        }

        OnMouseWheel(e: { deltaX: number; deltaY: number }, Screen: ViewportManager) {
            Screen.SetScale(Screen.GetScale() * (1 + e.deltaY * 0.02));
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

        private SetTransformOriginToElement(Element: HTMLElement, Value: string) {
            Element.style["transformOrigin"] = Value;
            Element.style["MozTransformOrigin"] = Value;
            Element.style["msTransformOrigin"] = Value;
            Element.style["OTransformOrigin"] = Value;
            Element.style["webkitTransformOrigin"] = Value;
        }

        private SetTransformToElement(Element: HTMLElement, Value: string) {
            Element.style["transform"] = Value;
            Element.style["MozTransform"] = Value;
            Element.style["msTransform"] = Value;
            Element.style["OTransform"] = Value;
            Element.style["webkitTransform"] = Value;
        }

		constructor(public SVGLayer: SVGGElement, public EventMapLayer: HTMLDivElement, public ContentLayer: HTMLDivElement, public ControlLayer: HTMLDivElement) {
            this.SetTransformOriginToElement(this.ContentLayer, "left top");
            this.SetTransformOriginToElement(this.ControlLayer, "left top");
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
            $(this.EventMapLayer).on('mousewheel', (e) => { this.ScrollManager.OnMouseWheel(e, this); });
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
            this.SetTransformToElement(this.ContentLayer, style);
            this.SetTransformToElement(this.ControlLayer, style);
		}

        SetScale(scale: number): void {
            scale = Math.max(0.2, Math.min(2.0, scale));
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

        PageXFromGX(GX: number) {
            return (this.GetLogicalOffsetX() - GX) * this.Scale + this.GetPageCenterX();
        }

        PageYFromGY(GY: number) {
            return (this.GetLogicalOffsetY() - GY) * this.Scale + this.GetPageCenterY();
        }

		GXFromPageX(PageX: number): number {
			return this.GetLogicalOffsetX() - (PageX - this.GetPageCenterX()) / this.Scale;
		}

		GYFromPageY(PageY: number): number {
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

		SetCaseCenter(X: number, Y: number): void {
            var NewOffsetX = this.OffsetX + (this.GetPageCenterX() - (this.OffsetX + X));
            var NewOffsetY = this.OffsetY + (this.GetPageCenterY() - (this.OffsetY + Y));
			this.SetOffset(NewOffsetX, NewOffsetY);
		}
	}
}
