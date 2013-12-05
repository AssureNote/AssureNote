/// <reference path="../d.ts/jquery.d.ts" />
/// <reference path="../d.ts/pointer.d.ts" />
document.createSVGElement = function (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
};

/* VIEW (MVC) */
var AssureNote;
(function (AssureNote) {
    var Point = (function () {
        function Point(X, Y) {
            this.X = X;
            this.Y = Y;
        }
        Point.prototype.Clone = function () {
            return new Point(this.X, this.Y);
        };
        return Point;
    })();
    AssureNote.Point = Point;

    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Top"] = 1] = "Top";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Bottom"] = 3] = "Bottom";
    })(AssureNote.Direction || (AssureNote.Direction = {}));
    var Direction = AssureNote.Direction;

    function ReverseDirection(Dir) {
        return (Dir + 2) & 3;
    }

    var ScrollManager = (function () {
        function ScrollManager() {
            this.InitialOffsetX = 0;
            this.InitialOffsetY = 0;
            this.InitialX = 0;
            this.InitialY = 0;
            this.CurrentX = 0;
            this.CurrentY = 0;
            this.Dx = 0;
            this.Dy = 0;
            this.MainPointerID = null;
            this.Pointers = [];
            this.timer = 0;
            this.ANIMATE_THRESHOLD = 5;
            this.SPEED_MAX = 100;
        }
        ScrollManager.prototype.SetInitialOffset = function (InitialOffsetX, InitialOffsetY) {
            this.InitialOffsetX = InitialOffsetX;
            this.InitialOffsetY = InitialOffsetY;
        };

        ScrollManager.prototype.StartDrag = function (InitialX, InitialY) {
            this.InitialX = InitialX;
            this.InitialY = InitialY;
            this.CurrentX = InitialX;
            this.CurrentY = InitialY;
        };

        ScrollManager.prototype.UpdateDrag = function (CurrentX, CurrentY) {
            this.Dx = CurrentX - this.CurrentX;
            this.Dy = CurrentY - this.CurrentY;
            var speed = this.Dx * this.Dx + this.Dy + this.Dy;
            if (speed > this.SPEED_MAX * this.SPEED_MAX) {
                this.Dx *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
                this.Dy *= ((this.SPEED_MAX * this.SPEED_MAX) / speed);
            }

            this.CurrentX = CurrentX;
            this.CurrentY = CurrentY;
        };

        ScrollManager.prototype.CalcOffsetX = function () {
            return this.CurrentX - this.InitialX + this.InitialOffsetX;
        };

        ScrollManager.prototype.CalcOffsetY = function () {
            return this.CurrentY - this.InitialY + this.InitialOffsetY;
        };

        ScrollManager.prototype.GetMainPointer = function () {
            for (var i = 0; i < this.Pointers.length; ++i) {
                if (this.Pointers[i].identifier === this.MainPointerID) {
                    return this.Pointers[i];
                }
            }
            ;
            return null;
        };

        ScrollManager.prototype.IsDragging = function () {
            return this.MainPointerID != null;
        };

        ScrollManager.prototype.StopAnimation = function () {
            clearInterval(this.timer);
            this.Dx = 0;
            this.Dy = 0;
        };

        ScrollManager.prototype.OnPointerEvent = function (e, Screen) {
            var _this = this;
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
                    this.timer = setInterval(function () {
                        if (Math.abs(_this.Dx) < _this.ANIMATE_THRESHOLD && Math.abs(_this.Dy) < _this.ANIMATE_THRESHOLD) {
                            _this.StopAnimation();
                        }
                        _this.CurrentX += _this.Dx;
                        _this.CurrentY += _this.Dy;
                        _this.Dx *= 0.95;
                        _this.Dy *= 0.95;
                        Screen.SetOffset(_this.CalcOffsetX(), _this.CalcOffsetY());
                    }, 16);
                }
                this.MainPointerID = null;
            }
        };

        ScrollManager.prototype.OnDoubleTap = function (e, Screen) {
            var width = Screen.ContentLayer.clientWidth;
            var height = Screen.ContentLayer.clientHeight;
            var pointer = this.Pointers[0];
            //Screen.SetOffset(width / 2 - pointer.pageX, height / 2 - pointer.pageY);
        };
        return ScrollManager;
    })();
    AssureNote.ScrollManager = ScrollManager;

    var ViewportManager = (function () {
        function ViewportManager(SVGLayer, EventMapLayer, ContentLayer, ControlLayer) {
            var _this = this;
            this.SVGLayer = SVGLayer;
            this.EventMapLayer = EventMapLayer;
            this.ContentLayer = ContentLayer;
            this.ControlLayer = ControlLayer;
            //windowX, windowY
            this.ScrollManager = new ScrollManager();
            this.OffsetX = 0;
            this.OffsetY = 0;
            this.LogicalOffsetX = 0;
            this.LogicalOffsetY = 0;
            this.Scale = 1.0;
            this.ContentLayer.style["transformOrigin"] = "left top";
            this.ContentLayer.style["MozTransformOrigin"] = "left top";
            this.ContentLayer.style["msTransformOrigin"] = "left top";
            this.ContentLayer.style["OTransformOrigin"] = "left top";
            this.ContentLayer.style["webkitTransformOrigin"] = "left top";
            this.UpdateAttr();
            var OnPointer = function (e) {
                _this.ScrollManager.OnPointerEvent(e, _this);
            };
            this.EventMapLayer.addEventListener("pointerdown", OnPointer, false);
            this.EventMapLayer.addEventListener("pointermove", OnPointer, false);
            this.EventMapLayer.addEventListener("pointerup", OnPointer, false);
            this.EventMapLayer.addEventListener("gesturedoubletap", function (e) {
                _this.ScrollManager.OnDoubleTap(e, _this);
            }, false);
            this.ContentLayer.addEventListener("pointerdown", OnPointer, false);
            this.ContentLayer.addEventListener("pointermove", OnPointer, false);
            this.ContentLayer.addEventListener("pointerup", OnPointer, false);
            this.ContentLayer.addEventListener("gesturedoubletap", function (e) {
                _this.ScrollManager.OnDoubleTap(e, _this);
            }, false);
            //BackGroundLayer.addEventListener("gesturescale", OnPointer, false);
        }
        ViewportManager.translateA = function (x, y) {
            return "translate(" + x + " " + y + ") ";
        };

        ViewportManager.scaleA = function (scale) {
            return "scale(" + scale + ") ";
        };

        ViewportManager.translateS = function (x, y) {
            return "translate(" + x + "px, " + y + "px) ";
        };

        ViewportManager.scaleS = function (scale) {
            return "scale(" + scale + ") ";
        };

        ViewportManager.prototype.UpdateAttr = function () {
            var attr = ViewportManager.translateA(this.OffsetX, this.OffsetY) + ViewportManager.scaleA(this.Scale);
            var style = ViewportManager.translateS(this.OffsetX, this.OffsetY) + ViewportManager.scaleS(this.Scale);
            this.SVGLayer.setAttribute("transform", attr);
            this.ContentLayer.style["transform"] = style;
            this.ContentLayer.style["MozTransform"] = style;
            this.ContentLayer.style["webkitTransform"] = style;
            this.ContentLayer.style["msTransform"] = style;
            this.ContentLayer.style["OTransform"] = style;
            this.ControlLayer.style["transform"] = style;
            this.ControlLayer.style["MozTransform"] = style;
            this.ControlLayer.style["webkitTransform"] = style;
            this.ControlLayer.style["msTransform"] = style;
            this.ControlLayer.style["OTransform"] = style;
        };

        ViewportManager.prototype.SetScale = function (scale) {
            this.Scale = scale;
            var cx = this.GetPageCenterX();
            var cy = this.GetPageCenterY();
            this.OffsetX = (this.LogicalOffsetX - cx) * scale + cx;
            this.OffsetY = (this.LogicalOffsetY - cy) * scale + cy;
            this.UpdateAttr();
        };

        ViewportManager.prototype.SetOffset = function (x, y) {
            this.OffsetX = x;
            this.OffsetY = y;
            this.LogicalOffsetX = this.CalcLogicalOffsetX(x);
            this.LogicalOffsetY = this.CalcLogicalOffsetY(y);
            this.UpdateAttr();
        };

        ViewportManager.prototype.SetLogicalOffset = function (x, y, scale) {
            this.LogicalOffsetX = x;
            this.LogicalOffsetY = y;
            this.SetScale(scale || this.Scale);
        };

        ViewportManager.prototype.GetLogicalOffsetX = function () {
            return this.LogicalOffsetX;
        };

        ViewportManager.prototype.GetLogicalOffsetY = function () {
            return this.LogicalOffsetY;
        };

        ViewportManager.prototype.CalcLogicalOffsetX = function (OffsetX) {
            var cx = this.GetPageCenterX();
            return (OffsetX - cx) / this.Scale + cx;
        };

        ViewportManager.prototype.CalcLogicalOffsetY = function (OffsetY) {
            var cy = this.GetPageCenterY();
            return (OffsetY - cy) / this.Scale + cy;
        };

        ViewportManager.prototype.CalcLogicalOffsetXFromPageX = function (PageX) {
            return this.GetLogicalOffsetX() - (PageX - this.GetPageCenterX()) / this.Scale;
        };

        ViewportManager.prototype.CalcLogicalOffsetYFromPageY = function (PageY) {
            return this.GetLogicalOffsetY() - (PageY - this.GetPageCenterY()) / this.Scale;
        };

        ViewportManager.prototype.GetOffsetX = function () {
            return this.OffsetX;
        };

        ViewportManager.prototype.GetOffsetY = function () {
            return this.OffsetY;
        };

        ViewportManager.prototype.GetWidth = function () {
            return document.body.clientWidth;
        };

        ViewportManager.prototype.GetHeight = function () {
            return document.body.clientHeight;
        };

        ViewportManager.prototype.GetPageCenterX = function () {
            return this.GetWidth() / 2;
        };

        ViewportManager.prototype.GetPageCenterY = function () {
            return this.GetHeight() / 2;
        };

        ViewportManager.prototype.GetCaseWidth = function () {
            return this.SVGLayer.getBoundingClientRect().width;
        };

        ViewportManager.prototype.GetCaseHeight = function () {
            return this.SVGLayer.getBoundingClientRect().height;
        };

        ViewportManager.prototype.GetScale = function () {
            return this.Scale;
        };

        ViewportManager.prototype.GetScaleRate = function () {
            var svgwidth = this.GetCaseWidth();
            var svgheight = this.GetCaseHeight();
            var bodywidth = this.GetWidth();
            var bodyheight = this.GetHeight();
            var scaleWidth = bodywidth / svgwidth;
            var scaleHeight = bodyheight / svgheight;
            return Math.min(scaleWidth, scaleHeight);
        };
        return ViewportManager;
    })();
    AssureNote.ViewportManager = ViewportManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Viewport.js.map
