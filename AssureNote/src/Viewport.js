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
document.createSVGElement = function (name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
};

/* VIEW (MVC) */
var AssureNote;
(function (AssureNote) {
    var ScrollManager = (function () {
        function ScrollManager(Viewport) {
            this.Viewport = Viewport;
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
        ScrollManager.prototype.StartDrag = function (InitialX, InitialY) {
            this.CurrentX = InitialX;
            this.CurrentY = InitialY;
            try  {
                if (this.OnStartDrag) {
                    this.OnStartDrag(this.Viewport);
                }
            } catch (e) {
            }
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
            if (this.OnDragged) {
                this.OnDragged(this.Viewport);
            }
        };

        ScrollManager.prototype.CalcOffsetDX = function () {
            return this.Dx;
        };

        ScrollManager.prototype.CalcOffsetDY = function () {
            return this.Dy;
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

        ScrollManager.prototype.EndDrag = function () {
            this.MainPointerID = null;
            this.Viewport.SetEventMapLayerPosition(false);
            try  {
                if (this.OnEndDrag) {
                    this.OnEndDrag(this.Viewport);
                }
            } catch (e) {
            }
        };

        ScrollManager.prototype.OnPointerEvent = function (e, Screen) {
            var _this = this;
            this.Pointers = e.getPointerList();
            var IsTherePointer = this.Pointers.length > 0;
            var HasDragJustStarted = IsTherePointer && !this.IsDragging();
            var HasDragJustEnded = !IsTherePointer && this.IsDragging();

            if (IsTherePointer) {
                if (HasDragJustStarted) {
                    this.StopAnimation();
                    this.timer = null;
                    var mainPointer = this.Pointers[0];
                    this.MainPointerID = mainPointer.identifier;
                    this.Viewport.SetEventMapLayerPosition(true);
                    this.StartDrag(mainPointer.pageX, mainPointer.pageY);
                } else {
                    var mainPointer = this.GetMainPointer();
                    if (mainPointer) {
                        this.UpdateDrag(mainPointer.pageX, mainPointer.pageY);
                        Screen.SetOffset(Screen.GetOffsetX() + this.CalcOffsetDX(), Screen.GetOffsetY() + this.CalcOffsetDY());
                    } else {
                        this.EndDrag();
                    }
                }
            } else {
                if (HasDragJustEnded) {
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
                        Screen.SetOffset(Screen.GetOffsetX() + _this.CalcOffsetDX(), Screen.GetOffsetY() + _this.CalcOffsetDY());
                    }, 16);
                }
                this.EndDrag();
            }
        };

        ScrollManager.prototype.OnDoubleTap = function (e, Screen) {
            var width = Screen.ContentLayer.clientWidth;
            var height = Screen.ContentLayer.clientHeight;
            var pointer = this.Pointers[0];
        };

        ScrollManager.prototype.OnMouseWheel = function (e, Screen) {
            Screen.SetScale(Screen.GetScale() * (1 + e.deltaY * 0.02));
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
            this.ScrollManager = new ScrollManager(this);
            this.OffsetX = 0;
            this.OffsetY = 0;
            this.LogicalOffsetX = 0;
            this.LogicalOffsetY = 0;
            this.Scale = 1.0;
            this.IsEventMapUpper = false;
            this.AnimationFrameTimerHandle = 0;
            this.SetTransformOriginToElement(this.ContentLayer, "left top");
            this.SetTransformOriginToElement(this.ControlLayer, "left top");
            this.UpdateAttr();
            var OnPointer = function (e) {
                _this.ScrollManager.OnPointerEvent(e, _this);
            };
            this.EventMapLayer.addEventListener("pointerdown", OnPointer, false);
            this.EventMapLayer.addEventListener("pointermove", OnPointer, false);
            this.EventMapLayer.addEventListener("pointerup", OnPointer, false);

            //this.EventMapLayer.addEventListener("gesturedoubletap", (e: PointerEvent) => { this.ScrollManager.OnDoubleTap(e, this); }, false);
            //BackGroundLayer.addEventListener("gesturescale", OnPointer, false);
            $(this.EventMapLayer.parentElement).on('mousewheel', function (e) {
                _this.ScrollManager.OnMouseWheel(e, _this);
            });
            document.body.addEventListener("resize", function (e) {
                _this.HTMLBodyBoundingRect = document.body.getBoundingClientRect();
            });
            this.HTMLBodyBoundingRect = document.body.getBoundingClientRect();
        }
        ViewportManager.prototype.SetTransformOriginToElement = function (Element, Value) {
            Element.style["transformOrigin"] = Value;
            Element.style["MozTransformOrigin"] = Value;
            Element.style["msTransformOrigin"] = Value;
            Element.style["webkitTransformOrigin"] = Value;
        };

        ViewportManager.prototype.SetTransformToElement = function (Element, Value) {
            Element.style["transform"] = Value;
            Element.style["MozTransform"] = Value;
            Element.style["msTransform"] = Value;
            Element.style["webkitTransform"] = Value;
        };

        ViewportManager.prototype.SetEventMapLayerPosition = function (IsUpper) {
            if (IsUpper && !this.IsEventMapUpper) {
                $(this.ControlLayer).after(this.EventMapLayer);
            } else if (!IsUpper && this.IsEventMapUpper) {
                $(this.ContentLayer).before(this.EventMapLayer);
            }
            this.IsEventMapUpper = IsUpper;
        };

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
            this.SetTransformToElement(this.ContentLayer, style);
            this.SetTransformToElement(this.ControlLayer, style);
        };

        ViewportManager.prototype.SetScale = function (scale) {
            scale = Math.max(0.02, Math.min(20.0, scale));
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

        ViewportManager.prototype.PageXFromGX = function (GX) {
            return this.GetOffsetX() + this.Scale * GX;
        };

        ViewportManager.prototype.PageYFromGY = function (GY) {
            return this.GetOffsetY() + this.Scale * GY;
        };

        ViewportManager.prototype.GXFromPageX = function (PageX) {
            return (PageX - this.GetOffsetX()) / this.Scale;
        };

        ViewportManager.prototype.GYFromPageY = function (PageY) {
            return (PageY - this.GetOffsetY()) / this.Scale;
        };

        ViewportManager.prototype.ConvertRectGlobalXYFromPageXY = function (PageRect) {
            var x1 = this.GXFromPageX(PageRect.X);
            var y1 = this.GYFromPageY(PageRect.Y);
            var x2 = this.GXFromPageX(PageRect.X + PageRect.Width);
            var y2 = this.GYFromPageY(PageRect.Y + PageRect.Height);
            return new AssureNote.Rect(x1, y1, x2 - x1, y2 - y1);
        };

        ViewportManager.prototype.GetOffsetX = function () {
            return this.OffsetX;
        };

        ViewportManager.prototype.GetOffsetY = function () {
            return this.OffsetY;
        };

        ViewportManager.prototype.GetWidth = function () {
            return this.HTMLBodyBoundingRect.width;
        };

        ViewportManager.prototype.GetHeight = function () {
            return this.HTMLBodyBoundingRect.height;
        };

        ViewportManager.prototype.GetPageRect = function () {
            return new AssureNote.Rect(0, 0, this.GetWidth(), this.GetHeight());
        };

        ViewportManager.prototype.GetPageCenterX = function () {
            return this.GetWidth() / 2;
        };

        ViewportManager.prototype.GetPageCenterY = function () {
            return this.GetHeight() / 2;
        };

        ViewportManager.prototype.GetScale = function () {
            return this.Scale;
        };

        ViewportManager.prototype.SetCaseCenter = function (X, Y) {
            var NewOffsetX = this.OffsetX + (this.GetPageCenterX() - (this.OffsetX + X * this.Scale));
            var NewOffsetY = this.OffsetY + (this.GetPageCenterY() - (this.OffsetY + Y * this.Scale));
            this.SetOffset(NewOffsetX, NewOffsetY);
        };

        ViewportManager.prototype.MoveTo = function (logicalOffsetX, logicalOffsetY, scale, duration) {
            var _this = this;
            if (duration <= 0) {
                this.SetLogicalOffset(logicalOffsetX, logicalOffsetY, scale);
                return;
            }

            var VX = (logicalOffsetX - this.GetLogicalOffsetX()) / duration;
            var VY = (logicalOffsetY - this.GetLogicalOffsetY()) / duration;
            var VS = (scale - this.GetScale()) / duration;

            if (VY == 0 && VX == 0 && VS == 0) {
                return;
            }

            if (this.AnimationFrameTimerHandle) {
                cancelAnimationFrame(this.AnimationFrameTimerHandle);
                this.AnimationFrameTimerHandle = 0;
            }

            var lastTime = performance.now();
            var startTime = lastTime;

            var update = function () {
                var currentTime = performance.now();
                var deltaT = currentTime - lastTime;
                var currentX = _this.GetLogicalOffsetX();
                var currentY = _this.GetLogicalOffsetY();
                var currentS = _this.GetScale();
                if (currentTime - startTime < duration) {
                    _this.AnimationFrameTimerHandle = requestAnimationFrame(update);
                } else {
                    deltaT = duration - (lastTime - startTime);
                }
                _this.SetLogicalOffset(currentX + VX * deltaT, currentY + VY * deltaT, currentS + VS * deltaT);
                lastTime = currentTime;
            };
            update();
        };
        return ViewportManager;
    })();
    AssureNote.ViewportManager = ViewportManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Viewport.js.map
