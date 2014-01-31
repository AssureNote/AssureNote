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
///<reference path='../javascripts/config.ts'/>
var AssureNote;
(function (AssureNote) {
    (function (AssureNoteUtils) {
        function postJsonRPC(methodName, params, Callback, ErrorCallback /*FIXME*/ ) {
            $.ajax({
                type: "POST",
                url: Config.BASEPATH + "/api/1.0",
                data: JSON.stringify({ jsonrpc: "2.0", id: "1", method: methodName, params: params }),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (response) {
                    Callback(response.result);
                },
                error: function (req, status, errorThrown) {
                    console.log("========== Ajax Error ==========");
                    console.log(status);
                    if (ErrorCallback != null) {
                        ErrorCallback();
                    }
                    console.log("================================");
                }
            });
        }
        AssureNoteUtils.postJsonRPC = postJsonRPC;

        function SaveAs(ContentString, FileName) {
            var blob = new Blob([ContentString], { type: 'text/plain; charset=UTF-8' });
            saveAs(blob, FileName);
        }
        AssureNoteUtils.SaveAs = SaveAs;

        function GetNodeLabelFromEvent(event) {
            var element = event.target || event.srcElement;
            while (element != null) {
                if (element.id != "") {
                    return element.id;
                }
                element = element.parentElement;
            }
            return "";
        }
        AssureNoteUtils.GetNodeLabelFromEvent = GetNodeLabelFromEvent;

        function GetNodePosition(Label) {
            var element = document.getElementById(Label);
            var view = element.getBoundingClientRect();
            return new AssureNote.Point(view.left, view.top);
        }
        AssureNoteUtils.GetNodePosition = GetNodePosition;

        function CreateGSNShape(NodeView) {
            switch (NodeView.GetNodeType()) {
                case 0 /* Goal */:
                    return new AssureNote.GSNGoalShape(NodeView);
                case 1 /* Context */:
                    return new AssureNote.GSNContextShape(NodeView);
                case 2 /* Strategy */:
                    return new AssureNote.GSNStrategyShape(NodeView);
                case 3 /* Evidence */:
                    return new AssureNote.GSNEvidenceShape(NodeView);
            }
        }
        AssureNoteUtils.CreateGSNShape = CreateGSNShape;

        function CreateSVGElement(name) {
            return document.createElementNS('http://www.w3.org/2000/svg', name);
        }
        AssureNoteUtils.CreateSVGElement = CreateSVGElement;

        var element = document.createElement('div');
        function HTMLEncode(text) {
            element.textContent = text;
            return element.innerHTML;
        }
        AssureNoteUtils.HTMLEncode = HTMLEncode;

        function ForeachLine(Text, LineWidth, Callback) {
            if (!Callback)
                return;
            var rest = Text;
            var maxLength = LineWidth || 20;
            maxLength = maxLength < 1 ? 1 : maxLength;
            var length = 0;
            var i = 0;
            for (var pos = 0; pos < rest.length; ++pos) {
                var code = rest.charCodeAt(pos);
                length += code < 128 ? 1 : 2;
                if (length > maxLength || rest.charAt(pos) == "\n") {
                    Callback(rest.substr(0, pos), i);
                    if (rest.charAt(pos) == "\n") {
                        pos++;
                    }
                    rest = rest.substr(pos, rest.length - pos);
                    pos = -1;
                    length = 0;
                    i++;
                }
            }
            Callback(rest, i);
        }
        AssureNoteUtils.ForeachLine = ForeachLine;

        var minute = 60 * 1000;
        var hour = minute * 60;
        var day = hour * 24;
        var month = day * 30;
        var year = month * 365;

        /**
        Format date to 'XX ago' style.
        @param {string} time Date and time that constructor of Date class accepts.
        */
        function FormatDate(time) {
            var deltaTime = new Date().getTime() - new Date(time).getTime();

            if (deltaTime < minute) {
                return "just now";
            } else if (deltaTime >= minute && deltaTime < 2 * minute) {
                return "a minute ago";
            } else if (deltaTime >= 2 * minute && deltaTime < hour) {
                return "" + Math.floor(deltaTime / minute) + " minutes ago";
            } else if (deltaTime >= hour && deltaTime < 2 * hour) {
                return "an hour ago";
            } else if (deltaTime >= 2 * hour && deltaTime < day) {
                return "" + Math.floor(deltaTime / hour) + " hours ago";
            } else if (deltaTime >= day && deltaTime < 2 * day) {
                return "a day ago";
            } else if (deltaTime >= 2 * day && deltaTime < month) {
                return "" + Math.floor(deltaTime / day) + " days ago";
            } else if (deltaTime >= month && deltaTime < 2 * month) {
                return "a month ago";
            } else if (deltaTime >= 2 * month && deltaTime < year) {
                return "" + Math.floor(deltaTime / month) + " months ago";
            } else if (deltaTime >= year && deltaTime < 2 * year) {
                return "an year ago";
            } else if (deltaTime >= 2 * year) {
                return "" + Math.floor(deltaTime / year) + " years ago";
            }
            return "error";
        }
        AssureNoteUtils.FormatDate = FormatDate;

        function GenerateUID() {
            return Math.floor(Math.random() * 2147483647);
        }
        AssureNoteUtils.GenerateUID = GenerateUID;

        function GenerateRandomString() {
            return GenerateUID().toString(36);
        }
        AssureNoteUtils.GenerateRandomString = GenerateRandomString;

        function UpdateHash(hash) {
            if (!hash)
                hash = '';
            window.location.hash = hash;
        }
        AssureNoteUtils.UpdateHash = UpdateHash;

        var UserAgant = (function () {
            function UserAgant() {
            }
            UserAgant.IsLessThanIE6 = function () {
                return !!UserAgant.ua.ltIE6;
            };
            UserAgant.IsLessThanIE7 = function () {
                return !!UserAgant.ua.ltIE7;
            };
            UserAgant.IsLessThanIE8 = function () {
                return !!UserAgant.ua.ltIE8;
            };
            UserAgant.IsLessThanIE9 = function () {
                return !!UserAgant.ua.ltIE9;
            };
            UserAgant.IsGreaterThanIE10 = function () {
                return !!UserAgant.ua.gtIE10;
            };
            UserAgant.IsTrident = function () {
                return !!UserAgant.ua.Trident;
            };
            UserAgant.IsGecko = function () {
                return !!UserAgant.ua.Gecko;
            };
            UserAgant.IsPresto = function () {
                return !!UserAgant.ua.Presto;
            };
            UserAgant.IsBlink = function () {
                return !!UserAgant.ua.Blink;
            };
            UserAgant.IsWebkit = function () {
                return !!UserAgant.ua.Webkit;
            };
            UserAgant.IsTouchEnabled = function () {
                return !!UserAgant.ua.Touch;
            };
            UserAgant.IsPointerEnabled = function () {
                return !!UserAgant.ua.Pointer;
            };
            UserAgant.IsMSPoniterEnabled = function () {
                return !!UserAgant.ua.MSPoniter;
            };
            UserAgant.IsPerformanceEnabled = function () {
                return !!UserAgant.ua.Performance;
            };
            UserAgant.IsAnimationFrameEnabled = function () {
                return !!UserAgant.ua.AnimationFrame;
            };
            UserAgant.IsTouchDevice = function () {
                return UserAgant.ua.Touch;
            };
            UserAgant.ua = (function () {
                return {
                    ltIE6: typeof window.addEventListener == "undefined" && typeof document.documentElement.style.maxHeight == "undefined",
                    ltIE7: typeof window.addEventListener == "undefined" && typeof document.querySelectorAll == "undefined",
                    ltIE8: typeof window.addEventListener == "undefined" && typeof document.getElementsByClassName == "undefined",
                    ltIE9: document.uniqueID && !window.matchMedia,
                    gtIE10: document.uniqueID && document.documentMode >= 10,
                    Trident: document.uniqueID,
                    Gecko: 'MozAppearance' in document.documentElement.style,
                    Presto: window.opera,
                    Blink: window.chrome,
                    Webkit: !window.chrome && 'WebkitAppearance' in document.documentElement.style,
                    Touch: typeof document.ontouchstart != "undefined",
                    Mobile: typeof document.orientation != "undefined",
                    Pointer: (typeof document.navigator != "undefined") && !!document.navigator.pointerEnabled,
                    MSPoniter: (typeof document.navigator != "undefined") && !!document.navigator.msPointerEnabled,
                    Performance: typeof window.performance != "undefined",
                    AnimationFrame: typeof window.requestAnimationFrame != "undefined"
                };
            })();
            return UserAgant;
        })();
        AssureNoteUtils.UserAgant = UserAgant;

        function RequestAnimationFrame(Callback) {
            if (UserAgant.IsAnimationFrameEnabled()) {
                return window.requestAnimationFrame(Callback);
            }
            return window.setTimeout(Callback, 16.7);
        }
        AssureNoteUtils.RequestAnimationFrame = RequestAnimationFrame;

        function CancelAnimationFrame(Handle) {
            if (UserAgant.IsAnimationFrameEnabled()) {
                return window.cancelAnimationFrame(Handle);
            }
            return window.clearTimeout(Handle);
        }
        AssureNoteUtils.CancelAnimationFrame = CancelAnimationFrame;

        function GetTime() {
            return UserAgant.IsPerformanceEnabled() ? window.performance.now() : Date.now();
        }
        AssureNoteUtils.GetTime = GetTime;
    })(AssureNote.AssureNoteUtils || (AssureNote.AssureNoteUtils = {}));
    var AssureNoteUtils = AssureNote.AssureNoteUtils;

    var ColorStyle = (function () {
        function ColorStyle() {
        }
        ColorStyle.Default = "assurenote-default";
        ColorStyle.Highlight = "assurenote-default-highlight";
        ColorStyle.ToDo = "assurenote-todo";
        ColorStyle.Searched = "assurenote-search";
        ColorStyle.Danger = "assurenote-danger";
        ColorStyle.SingleEdit = "assurenote-singleedit";
        ColorStyle.Locked = "assurenote-locked";
        return ColorStyle;
    })();
    AssureNote.ColorStyle = ColorStyle;

    var Rect = (function () {
        function Rect(X, Y, Width, Height) {
            this.X = X;
            this.Y = Y;
            this.Width = Width;
            this.Height = Height;
        }
        Rect.prototype.toString = function () {
            return "(" + [this.X, this.Y, this.Width, this.Height].join(", ") + ")";
        };
        Rect.prototype.Clone = function () {
            return new Rect(this.X, this.Y, this.Width, this.Height);
        };
        return Rect;
    })();
    AssureNote.Rect = Rect;

    var Point = (function () {
        function Point(X, Y) {
            this.X = X;
            this.Y = Y;
        }
        Point.prototype.Clone = function () {
            return new Point(this.X, this.Y);
        };
        Point.prototype.toString = function () {
            return "(" + this.X + ", " + this.Y + ")";
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
    AssureNote.ReverseDirection = ReverseDirection;

    (function (AssureNoteMode) {
        AssureNoteMode[AssureNoteMode["Edit"] = 0] = "Edit";
        AssureNoteMode[AssureNoteMode["View"] = 1] = "View";
    })(AssureNote.AssureNoteMode || (AssureNote.AssureNoteMode = {}));
    var AssureNoteMode = AssureNote.AssureNoteMode;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNoteUtils.js.map
