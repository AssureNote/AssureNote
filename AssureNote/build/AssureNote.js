var AssureNote;
(function (AssureNote) {
    (function (AssureNoteUtils) {
        function postJsonRPC(methodName, params, Callback, ErrorCallback) {
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

        AssureNoteUtils.RequestAnimationFrame = UserAgant.IsAnimationFrameEnabled() ? (function (c) {
            return requestAnimationFrame(c);
        }) : (function (c) {
            return setTimeout(c, 16.7);
        });

        AssureNoteUtils.CancelAnimationFrame = UserAgant.IsAnimationFrameEnabled() ? (function (h) {
            return cancelAnimationFrame(h);
        }) : (function (h) {
            return clearTimeout(h);
        });

        AssureNoteUtils.GetTime = UserAgant.IsPerformanceEnabled() ? (function () {
            return performance.now();
        }) : (function () {
            return Date.now();
        });

        function DefineColorStyle(StyleName, StyleDef) {
            $("<style>").html("." + StyleName + " { " + $("span").css(StyleDef).attr("style") + " }").appendTo("head");
        }
        AssureNoteUtils.DefineColorStyle = DefineColorStyle;

        function isValidURL(url) {
            var rg_pctEncoded = "%[0-9a-fA-F]{2}";
            var rg_protocol = "(http|https):\\/\\/";

            var rg_userinfo = "([a-zA-Z0-9$\\-_.+!*'(),;:&=]|" + rg_pctEncoded + ")+" + "@";

            var rg_decOctet = "(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])";
            var rg_ipv4address = "(" + rg_decOctet + "(\\." + rg_decOctet + "){3}" + ")";
            var rg_hostname = "([a-zA-Z0-9\\-\\u00C0-\\u017F]+\\.)+([a-zA-Z]{2,})";
            var rg_port = "[0-9]+";

            var rg_hostport = "(" + rg_ipv4address + "|localhost|" + rg_hostname + ")(:" + rg_port + ")?";

            var rg_pchar = "a-zA-Z0-9$\\-_.+!*'(),;:@&=";
            var rg_segment = "([" + rg_pchar + "]|" + rg_pctEncoded + ")*";

            var rg_path = rg_segment + "(\\/" + rg_segment + ")*";
            var rg_query = "\\?" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";
            var rg_fragment = "\\#" + "([" + rg_pchar + "/?]|" + rg_pctEncoded + ")*";

            var rgHttpUrl = new RegExp("^" + rg_protocol + "(" + rg_userinfo + ")?" + rg_hostport + "(\\/" + "(" + rg_path + ")?" + "(" + rg_query + ")?" + "(" + rg_fragment + ")?" + ")?" + "$");

            if (rgHttpUrl.test(url)) {
                return true;
            } else {
                return false;
            }
        }
        AssureNoteUtils.isValidURL = isValidURL;
        ;

        function GenerateStyleSetter(OriginalName) {
            var CameledName = OriginalName.substring(0, 1).toUpperCase() + OriginalName.substring(1);
            if (UserAgant.IsTrident()) {
                CameledName = "ms" + CameledName;
                return function (Element, Value) {
                    Element.style[CameledName] = Value;
                };
            }
            if (UserAgant.IsGecko()) {
                CameledName = "Moz" + CameledName;
                return function (Element, Value) {
                    Element.style[CameledName] = Value;
                };
            }
            if (UserAgant.IsWebkit() || UserAgant.IsBlink()) {
                CameledName = "webkit" + CameledName;
                return function (Element, Value) {
                    Element.style[CameledName] = Value;
                };
            }
            return function (Element, Value) {
                Element.style[OriginalName] = Value;
            };
        }

        AssureNoteUtils.SetTransformOriginToElement = GenerateStyleSetter("transformOrigin");

        AssureNoteUtils.SetTransformToElement = GenerateStyleSetter("transform");
    })(AssureNote.AssureNoteUtils || (AssureNote.AssureNoteUtils = {}));
    var AssureNoteUtils = AssureNote.AssureNoteUtils;

    var AnimationFrameTask = (function () {
        function AnimationFrameTask() {
        }
        AnimationFrameTask.prototype.Start = function (Duration, Callback) {
            var _this = this;
            this.Cancel();
            this.LastTime = this.StartTime = AssureNoteUtils.GetTime();
            this.EndTime = this.StartTime + Duration;
            this.Callback = Callback;

            var Update = function () {
                var CurrentTime = AssureNoteUtils.GetTime();
                var DeltaT = CurrentTime - _this.LastTime;
                if (CurrentTime < _this.EndTime) {
                    _this.TimerHandle = AssureNoteUtils.RequestAnimationFrame(Update);
                } else {
                    DeltaT = _this.EndTime - _this.LastTime;
                    _this.TimerHandle = 0;
                }
                _this.Callback(DeltaT, CurrentTime, _this.StartTime);
                _this.LastTime = CurrentTime;
            };
            Update();
        };

        AnimationFrameTask.prototype.StartMany = function (Duration, Callbacks) {
            if (Callbacks && Callbacks.length > 0) {
                this.Start(Duration, function (DeltaT, CurrentTime, StartTime) {
                    for (var i = 0; i < Callbacks.length; ++i) {
                        Callbacks[i](DeltaT, CurrentTime, StartTime);
                    }
                });
            }
        };

        AnimationFrameTask.prototype.IsRunning = function () {
            return this.TimerHandle != 0;
        };

        AnimationFrameTask.prototype.Cancel = function (RunToEnd) {
            if (this.TimerHandle) {
                AssureNoteUtils.CancelAnimationFrame(this.TimerHandle);
                this.TimerHandle = 0;
                if (RunToEnd) {
                    var DeltaT = this.EndTime - this.LastTime;
                    this.Callback(DeltaT, this.EndTime, this.StartTime);
                }
            }
        };
        return AnimationFrameTask;
    })();
    AssureNote.AnimationFrameTask = AnimationFrameTask;

    var AssureNoteEvent = (function () {
        function AssureNoteEvent() {
        }
        AssureNoteEvent.prototype.PreventDefault = function () {
            this.DefaultPrevented = true;
        };
        return AssureNoteEvent;
    })();
    AssureNote.AssureNoteEvent = AssureNoteEvent;

    var EventTarget = (function () {
        function EventTarget() {
            this.Listeners = {};
        }
        EventTarget.prototype.RemoveEventListener = function (type, listener) {
            var listeners = this.Listeners[type];
            if (listeners != null) {
                var i = listeners.indexOf(listener);
                if (i !== -1) {
                    listeners.splice(i, 1);
                }
            }
        };

        EventTarget.prototype.AddEventListener = function (type, listener) {
            var listeners = this.Listeners[type];
            if (listeners == null) {
                this.Listeners[type] = [listener];
            } else if (listeners.indexOf(listener) === -1) {
                listeners.unshift(listener);
            }
        };

        EventTarget.prototype.DispatchEvent = function (e) {
            e.Target = this;
            if (this["on" + e.Type] != null) {
                this["on" + e.Type](e);
            }
            if (this["On" + e.Type] != null) {
                this["On" + e.Type](e);
            }
            var listeners = this.Listeners[e.Type];
            if (listeners != null) {
                listeners = listeners.slice(0);
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].call(this, e);
                }
            }
            return !e.DefaultPrevented;
        };
        return EventTarget;
    })();
    AssureNote.EventTarget = EventTarget;

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
        ColorStyle.Useless = "assurenote-useless";
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
var AssureNote;
(function (AssureNote) {
    var Panel = (function () {
        function Panel(App) {
            this.IsVisible = false;
            this.App = App;
            if (!Panel.Initialized) {
                Panel.ActivePanel = this;
                document.addEventListener("keydown", function (Event) {
                    Panel.ActivePanel.OnKeyDown(Event);
                }, true);
                Panel.Initialized = true;
            }
        }
        Panel.prototype.Create = function (NodeView, ControlLayer, contents) {
        };

        Panel.prototype.OnKeyDown = function (Event) {
        };

        Panel.prototype.OnActivate = function () {
        };

        Panel.prototype.OnDeactivate = function () {
        };

        Panel.prototype.Remove = function () {
        };

        Panel.prototype.Show = function () {
            this.IsEnable = true;
        };

        Panel.prototype.Hide = function () {
            this.IsVisible = false;
        };

        Panel.prototype.Activate = function () {
            if (!this.IsActive()) {
                Panel.ActivePanel.OnDeactivate();
                Panel.ActivePanel = this;
                this.OnActivate();
            }
        };

        Panel.prototype.IsActive = function () {
            return Panel.ActivePanel == this;
        };
        Panel.Initialized = false;
        return Panel;
    })();
    AssureNote.Panel = Panel;
})(AssureNote || (AssureNote = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var StringReader = (function () {
        function StringReader(Text) {
            this.Text = Text;
            this.CurrentPos = 0;
            this.PreviousPos = 0;
            this.Linenum = 0;
        }
        StringReader.prototype.HasNext = function () {
            return this.CurrentPos < this.Text.length;
        };

        StringReader.prototype.ReadLine = function () {
            var StartPos = this.CurrentPos;
            var i;
            this.PreviousPos = this.CurrentPos;
            for (i = this.CurrentPos; i < this.Text.length; i++) {
                var ch = this.Text.charCodeAt(i);
                if (ch == 10) {
                    var EndPos = i;
                    this.CurrentPos = i + 1;
                    this.Linenum += 1;
                    return this.Text.substring(StartPos, EndPos).trim();
                }
                if (ch == 92) {
                    var EndPos = i;
                    if (i + 1 < this.Text.length && this.Text.charCodeAt(i + 1) == 10) {
                        i++;
                    }
                    this.Linenum += 1;
                    this.CurrentPos = i + 1;
                    return this.Text.substring(StartPos, EndPos).trim();
                }
            }
            this.CurrentPos = i;
            if (StartPos == this.CurrentPos) {
                return null;
            }
            this.Linenum += 1;
            return this.Text.substring(StartPos, this.CurrentPos).trim();
        };

        StringReader.prototype.RollbackLineFeed = function () {
            this.CurrentPos = this.PreviousPos;
            this.Linenum -= 1;
        };

        StringReader.prototype.ReadLineList = function (LineList, UntilSection) {
            while (this.HasNext()) {
                var Line = this.ReadLine();
                if (UntilSection && Lib.String_startsWith(Line, "*")) {
                    this.RollbackLineFeed();
                    break;
                }
                Lib.Array_add(LineList, Line);
            }
        };

        StringReader.prototype.GetLineList = function (UntilSection) {
            var LineList = new Array();
            this.ReadLineList(LineList, UntilSection);
            return LineList;
        };

        StringReader.prototype.LogError = function (Message, Line) {
            console.log("(error:" + this.Linenum + ") " + Message + ": " + Line);
        };

        StringReader.prototype.LogWarning = function (Message, Line) {
            console.log("(warning:" + this.Linenum + ") " + Message + ": " + Line);
        };
        return StringReader;
    })();
    AssureNote.StringReader = StringReader;

    var StringWriter = (function () {
        function StringWriter() {
            this.sb = new StringBuilder();
        }
        StringWriter.prototype.print = function (s) {
            this.sb.append(s);
        };
        StringWriter.prototype.println = function (s) {
            this.sb.append(s);
            this.sb.append(Lib.LineFeed);
        };
        StringWriter.prototype.newline = function () {
            this.sb.append(Lib.LineFeed);
        };

        StringWriter.prototype.toString = function () {
            return this.sb.toString();
        };
        return StringWriter;
    })();
    AssureNote.StringWriter = StringWriter;

    (function (GSNType) {
        GSNType[GSNType["Goal"] = 0] = "Goal";
        GSNType[GSNType["Context"] = 1] = "Context";
        GSNType[GSNType["Strategy"] = 2] = "Strategy";
        GSNType[GSNType["Evidence"] = 3] = "Evidence";
        GSNType[GSNType["Undefined"] = 4] = "Undefined";
    })(AssureNote.GSNType || (AssureNote.GSNType = {}));
    var GSNType = AssureNote.GSNType;

    var GSNHistory = (function () {
        function GSNHistory(Rev, Author, Role, DateString, Process, Doc) {
            this.UpdateHistory(Rev, Author, Role, DateString, Process, Doc);
            this.IsCommitRevision = true;
        }
        GSNHistory.prototype.toString = function () {
            return this.DateString + ";" + this.Author + ";" + this.Role + ";" + this.Process;
        };

        GSNHistory.prototype.EqualsHistory = function (aHistory) {
            return (Lib.Object_equals(this.DateString, aHistory.DateString) && Lib.Object_equals(this.Author, aHistory.Author));
        };

        GSNHistory.prototype.CompareDate = function (aHistory) {
            return (Lib.String_compareTo(this.DateString, aHistory.DateString));
        };

        GSNHistory.prototype.UpdateHistory = function (Rev, Author, Role, DateString, Process, Doc) {
            this.Rev = Rev;
            this.Author = Author;
            this.Role = Role;
            this.Process = Process;
            this.Doc = Doc;
            this.DateString = WikiSyntax.FormatDateString(DateString);
        };

        GSNHistory.prototype.GetCommitMessage = function () {
            return TagUtils.GetString(this.Doc.DocTagMap, "CommitMessage", "");
        };
        return GSNHistory;
    })();
    AssureNote.GSNHistory = GSNHistory;

    var WikiSyntax = (function () {
        function WikiSyntax() {
        }
        WikiSyntax.ParseInt = function (NumText, DefVal) {
            try  {
                return Lib.parseInt(NumText);
            } catch (e) {
            }
            return DefVal;
        };

        WikiSyntax.ParseGoalLevel = function (LabelLine) {
            var GoalLevel = 0;
            for (var i = 0; i < LabelLine.length; i++) {
                if (LabelLine.charCodeAt(i) != 42)
                    break;
                GoalLevel++;
            }
            return GoalLevel;
        };

        WikiSyntax.FormatGoalLevel = function (GoalLevel) {
            var sb = new StringBuilder();
            for (var i = 0; i < GoalLevel; i++) {
                sb.append("*");
            }
            return sb.toString();
        };

        WikiSyntax.GetLabelPos = function (LabelLine) {
            var i;
            for (i = 0; i < LabelLine.length; i++) {
                if (LabelLine.charCodeAt(i) != 42)
                    break;
            }
            for (; i < LabelLine.length; i++) {
                if (LabelLine.charCodeAt(i) != 32)
                    break;
            }
            return i;
        };

        WikiSyntax.ParseNodeType = function (LabelLine) {
            var i = WikiSyntax.GetLabelPos(LabelLine);
            if (i < LabelLine.length) {
                var ch = LabelLine.charCodeAt(i);
                if (ch == 71) {
                    return 0 /* Goal */;
                }
                if (ch == 83) {
                    return 2 /* Strategy */;
                }
                if (ch == 69 || ch == 77 || ch == 65) {
                    return 3 /* Evidence */;
                }
                if (ch == 67 || ch == 74 || ch == 82) {
                    return 1 /* Context */;
                }
            }
            return 4 /* Undefined */;
        };

        WikiSyntax.ParseLabelName = function (LabelLine) {
            var i = WikiSyntax.GetLabelPos(LabelLine);
            var sb = new StringBuilder();
            i = i + 1;

            if (i >= LabelLine.length || LabelLine.charCodeAt(i) != 58)
                return null;
            sb.append(LabelLine.substring(i - 1, i));

            while (i < LabelLine.length && LabelLine.charCodeAt(i) != 32) {
                sb.append(LabelLine.substring(i, i + 1));
                i = i + 1;
            }
            return sb.toString();
        };

        WikiSyntax.FormatNodeType = function (NodeType) {
            switch (NodeType) {
                case 0 /* Goal */:
                    return "G";
                case 1 /* Context */:
                    return "C";
                case 2 /* Strategy */:
                    return "S";
                case 3 /* Evidence */:
                    return "E";
                case 4 /* Undefined */:
            }
            return "U";
        };

        WikiSyntax.ParseLabelNumber = function (LabelLine) {
            var StartIdx = WikiSyntax.GetLabelPos(LabelLine) + 1;
            if (StartIdx >= LabelLine.length || LabelLine.charCodeAt(StartIdx) == 58)
                return null;
            for (var i = StartIdx; i < LabelLine.length; i++) {
                if (Character.isWhitespace(LabelLine.charCodeAt(i)))
                    continue;
                if (LabelLine.charCodeAt(i) == 38)
                    return null;
                if (Character.isDigit(LabelLine.charCodeAt(i))) {
                    StartIdx = i;
                    break;
                }
            }
            if (StartIdx != -1) {
                for (var i = StartIdx + 1; i < LabelLine.length; i++) {
                    if (Character.isWhitespace(LabelLine.charCodeAt(i))) {
                        return LabelLine.substring(StartIdx, i);
                    }
                }
                return LabelLine.substring(StartIdx);
            }
            return null;
        };

        WikiSyntax.ParseUID = function (LabelLine) {
            var StartIdx = LabelLine.indexOf("&") + 1;
            if (StartIdx == 0)
                return null;
            var EndIdx = StartIdx;
            while (EndIdx < LabelLine.length && LabelLine.charCodeAt(EndIdx) != 32)
                EndIdx++;
            var UID = LabelLine.substring(StartIdx, EndIdx);
            return UID;
        };

        WikiSyntax.ParseRevisionHistory = function (LabelLine) {
            var Loc = LabelLine.indexOf("#");
            if (Loc != -1) {
                return LabelLine.substring(Loc).trim();
            }
            return null;
        };

        WikiSyntax.ParseHistory = function (LabelLine, BaseDoc) {
            if (BaseDoc != null) {
                var Loc = LabelLine.indexOf("#");
                try  {
                    if (Loc != -1) {
                        var HistoryTaple = new Array(2);
                        var RevText = LabelLine.substring(Loc + 1).trim();
                        var RevSet = RevText.split(":");
                        HistoryTaple[0] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[0], -1));
                        HistoryTaple[1] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[1], -1));
                        if (HistoryTaple[0] == null || HistoryTaple[1] == null) {
                            return null;
                        }
                        return HistoryTaple;
                    }
                } catch (e) {
                }
            }
            return null;
        };

        WikiSyntax.FormatRefKey = function (NodeType, HistoryTaple) {
            return WikiSyntax.FormatNodeType(NodeType) + HistoryTaple;
        };

        WikiSyntax.CommentOutAll = function (DocText) {
            var Reader = new StringReader(DocText);
            var Writer = new StringWriter();
            while (Reader.HasNext()) {
                var line = Reader.ReadLine();
                line = "#" + line;
                Writer.print(line);
                Writer.newline();
            }
            return Writer.toString();
        };

        WikiSyntax.CommentOutSubNode = function (DocText) {
            var Reader = new StringReader(DocText);
            var Writer = new StringWriter();
            var NodeCount = 0;
            while (Reader.HasNext()) {
                var line = Reader.ReadLine();
                if (Lib.String_startsWith(line, "*"))
                    NodeCount++;
                if (NodeCount >= 2) {
                    line = "#" + line;
                }
                Writer.print(line);
                Writer.newline();
            }
            return Writer.toString();
        };

        WikiSyntax.FormatDateString = function (DateString) {
            var Format = new SimpleDateFormat("yyyy-MM-dd84HH:mm:ssZ");
            if (DateString != null) {
                try  {
                    return Format.format(Format.parse(DateString));
                } catch (e) {
                    e.printStackTrace();
                }
            }
            var d = new Date();
            return Format.format(d);
        };
        return WikiSyntax;
    })();
    AssureNote.WikiSyntax = WikiSyntax;

    var TagUtils = (function () {
        function TagUtils() {
        }
        TagUtils.ParseTag = function (TagMap, Line) {
            var loc = Line.indexOf("::");
            if (loc != -1) {
                var Key = Line.substring(0, loc).trim();
                var Value = Line.substring(loc + 2).trim();
                TagMap.put(Key, Value);
            }
        };

        TagUtils.FormatTag = function (TagMap, Writer) {
            if (TagMap != null) {
                var keyArray = TagMap.keySet();
                for (var i = 0; i < keyArray.length; i++) {
                    var Key = keyArray[i];
                    Writer.println(Key + ":: " + TagMap.get(Key));
                }
            }
        };

        TagUtils.FormatHistoryTag = function (HistoryList, i, Writer) {
            var History = Lib.Array_get(HistoryList, i);
            if (History != null) {
                Writer.println("#" + i + "::" + History);
            }
        };

        TagUtils.GetString = function (TagMap, Key, DefValue) {
            if (TagMap != null) {
                var Value = TagMap.get(Key);
                if (Value != null) {
                    return Value;
                }
            }
            return DefValue;
        };

        TagUtils.GetInteger = function (TagMap, Key, DefValue) {
            if (TagMap != null) {
                return WikiSyntax.ParseInt(TagMap.get(Key), DefValue);
            }
            return DefValue;
        };
        return TagUtils;
    })();
    AssureNote.TagUtils = TagUtils;

    var GSNNode = (function () {
        function GSNNode(BaseDoc, ParentNode, NodeType, LabelName, UID, HistoryTaple) {
            this.BaseDoc = BaseDoc;
            this.ParentNode = ParentNode;
            this.NodeType = NodeType;
            this.LabelName = LabelName;
            this.AssignedLabelNumber = "";
            this.UID = UID;
            this.SectionCount = 0;
            this.SubNodeList = null;
            if (HistoryTaple != null) {
                this.Created = HistoryTaple[0];
                this.LastModified = HistoryTaple[1];
            } else {
                if (BaseDoc != null) {
                    this.Created = BaseDoc.DocHistory;
                } else {
                    this.Created = null;
                }
                this.LastModified = this.Created;
            }
            this.Digest = null;
            this.NodeDoc = Lib.LineFeed.trim();
            this.HasTag = false;
            if (this.ParentNode != null) {
                ParentNode.AppendSubNode(this);
            }
        }
        GSNNode.prototype.DeepCopy = function (BaseDoc, ParentNode) {
            var NewNode = new GSNNode(BaseDoc, ParentNode, this.NodeType, this.LabelName, this.UID, null);
            NewNode.Created = this.Created;
            NewNode.LastModified = this.LastModified;
            NewNode.Digest = this.Digest;
            NewNode.NodeDoc = this.NodeDoc;
            NewNode.HasTag = this.HasTag;
            if (BaseDoc != null) {
                BaseDoc.UncheckAddNode(NewNode);
            }
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                Node.DeepCopy(BaseDoc, NewNode);
            }
            return NewNode;
        };

        GSNNode.prototype.IsGoal = function () {
            return (this.NodeType == 0 /* Goal */);
        };

        GSNNode.prototype.IsStrategy = function () {
            return (this.NodeType == 2 /* Strategy */);
        };

        GSNNode.prototype.IsContext = function () {
            return (this.NodeType == 1 /* Context */);
        };

        GSNNode.prototype.IsEvidence = function () {
            return (this.NodeType == 3 /* Evidence */);
        };

        GSNNode.prototype.NonNullSubNodeList = function () {
            return this.SubNodeList == null ? Lib.EmptyNodeList : this.SubNodeList;
        };

        GSNNode.prototype.Remap = function (NodeMap) {
            NodeMap.put(this.UID, this);
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                Node.Remap(NodeMap);
            }
        };

        GSNNode.prototype.GetGoalLevel = function () {
            var GoalCount = this.IsGoal() ? 1 : 0;
            var Node = this.ParentNode;
            while (Node != null) {
                if (Node.IsGoal()) {
                    GoalCount += 1;
                }
                Node = Node.ParentNode;
            }
            return GoalCount;
        };

        GSNNode.prototype.GetLabel = function () {
            return WikiSyntax.FormatNodeType(this.NodeType) + this.GetLabelNumber();
        };

        GSNNode.prototype.GetHistoryTaple = function () {
            return "#" + this.Created.Rev + ":" + this.LastModified.Rev;
        };

        GSNNode.prototype.GetLabelNumber = function () {
            return this.AssignedLabelNumber;
        };

        GSNNode.prototype.IsModified = function () {
            return this.LastModified == this.BaseDoc.DocHistory;
        };

        GSNNode.prototype.SetContent = function (LineList) {
            var OldDigest = this.Digest;
            var LineCount = 0;
            var Writer = new StringWriter();
            var md = Lib.GetMD5();
            for (var i = 0; i < Lib.Array_size(LineList); i++) {
                var Line = Lib.Array_get(LineList, i);
                var Loc = Line.indexOf("::");
                if (Loc > 0) {
                    this.HasTag = true;
                }
                Writer.newline();
                Writer.print(Line);
                if (Line.length > 0) {
                    Lib.UpdateMD5(md, Line);
                    LineCount += 1;
                }
            }
            if (LineCount > 0) {
                this.Digest = md.digest();
                this.NodeDoc = Writer.toString().trim();
            } else {
                this.Digest = null;
                this.NodeDoc = Lib.LineFeed.trim();
            }
        };

        GSNNode.prototype.UpdateContent = function (TextDoc) {
            this.SetContent(new StringReader(TextDoc).GetLineList(true));
        };

        GSNNode.prototype.GetHtmlContent = function () {
            if (this.Digest != null) {
                var Reader = new StringReader(this.NodeDoc);
                var Writer = new StringWriter();
                var Paragraph = "";
                while (Reader.HasNext()) {
                    var Line = Reader.ReadLine();
                    Paragraph += Line;
                    if (Line.length == 0 && Paragraph.length > 0) {
                        Writer.println("<p>" + Paragraph + "</p>");
                        continue;
                    }
                    var Loc = Line.indexOf("::");
                    if (Loc > 0) {
                        Writer.println("<p class='tag'>" + Line + "</p>");
                        continue;
                    }
                }
            }
        };

        GSNNode.prototype.GetNodeHistoryList = function () {
            var NodeList = new Array();
            var LastNode = null;
            for (var i = 0; i < Lib.Array_size(this.BaseDoc.Record.HistoryList); i++) {
                var NodeHistory = Lib.Array_get(this.BaseDoc.Record.HistoryList, i);
                if (NodeHistory.Doc != null) {
                    var Node = NodeHistory.Doc.GetNode(this.UID);
                    if (Node != null) {
                        if (Node.Created == this.Created) {
                            if (LastNode == null || LastNode.LastModified != this.LastModified) {
                                Lib.Array_add(NodeList, Node);
                                LastNode = Node;
                            }
                        }
                    }
                }
            }
            return NodeList;
        };

        GSNNode.prototype.AppendSubNode = function (Node) {
            (Node.BaseDoc == this.BaseDoc);
            if (this.SubNodeList == null) {
                this.SubNodeList = new Array();
            }
            Lib.Array_add(this.SubNodeList, Node);
        };

        GSNNode.prototype.HasSubNode = function (NodeType) {
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                if (Node.NodeType == NodeType) {
                    return true;
                }
            }
            return false;
        };

        GSNNode.prototype.GetCloseGoal = function () {
            var Node = this;
            while (Node.NodeType != 0 /* Goal */) {
                Node = Node.ParentNode;
            }
            return Node;
        };

        GSNNode.prototype.GetTagMap = function () {
            if (this.TagMap == null && this.HasTag) {
                this.TagMap = new HashMap();
                var Reader = new StringReader(this.NodeDoc);
                while (Reader.HasNext()) {
                    var Line = Reader.ReadLine();
                    var Loc = Line.indexOf("::");
                    if (Loc > 0) {
                        TagUtils.ParseTag(this.TagMap, Line);
                    }
                }
            }
            return this.TagMap;
        };

        GSNNode.prototype.MergeTagMap = function (BaseMap, NewMap) {
            if (BaseMap == null)
                return NewMap;
            if (NewMap == null)
                return BaseMap;

            var Result = new HashMap();
            var KeySet = BaseMap.keySet();
            for (var i = 0; i < KeySet.length; i++) {
                Result.put(KeySet[i], BaseMap.get(KeySet[i]));
            }
            KeySet = NewMap.keySet();
            for (var i = 0; i < KeySet.length; i++) {
                Result.put(KeySet[i], NewMap.get(KeySet[i]));
            }
            return Result;
        };

        GSNNode.prototype.GetTagMapWithLexicalScope = function () {
            var Result = null;
            if (this.ParentNode != null) {
                Result = this.MergeTagMap(this.ParentNode.GetTagMapWithLexicalScope(), this.GetTagMap());
            } else {
                Result = this.GetTagMap();
            }
            if (this.SubNodeList != null) {
                for (var i = 0; i < Lib.Array_size(this.SubNodeList); i++) {
                    var Node = Lib.Array_get(this.SubNodeList, i);
                    if (Node.IsContext()) {
                        Result = this.MergeTagMap(Result, Node.GetTagMap());
                    }
                }
            }
            return Result;
        };

        GSNNode.prototype.GetLastNode = function (NodeType, Creation) {
            if (this.SubNodeList != null) {
                for (var i = Lib.Array_size(this.SubNodeList) - 1; i >= 0; i--) {
                    var Node = Lib.Array_get(this.SubNodeList, i);
                    if (Node.NodeType == NodeType) {
                        return Node;
                    }
                }
            }
            if (NodeType == 2 /* Strategy */ && Creation) {
                return new GSNNode(this.BaseDoc, this, 2 /* Strategy */, this.LabelName, this.UID, null);
            }
            return null;
        };

        GSNNode.prototype.FormatNode = function (Writer) {
            Writer.print(WikiSyntax.FormatGoalLevel(this.GetGoalLevel()));
            Writer.print(" ");
            if (this.LabelName != null) {
                Writer.print(this.LabelName);
            } else {
                Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
            }
            Writer.print(" &");
            Writer.print(Lib.DecToHex(this.UID));

            if (this.Created != null) {
                var HistoryTaple = this.GetHistoryTaple();
                Writer.print(" " + HistoryTaple);
            }
            Writer.newline();
            if (this.NodeDoc != null && !Lib.Object_equals(this.NodeDoc, "")) {
                Writer.print(this.NodeDoc);
                Writer.newline();
            }
            Writer.newline();
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                if (Node.IsContext()) {
                    Node.FormatNode(Writer);
                }
            }
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                if (!Node.IsContext()) {
                    Node.FormatNode(Writer);
                }
            }
        };

        GSNNode.prototype.FormatSubNode = function (GoalLevel, Writer, IsRecursive) {
            Writer.print(WikiSyntax.FormatGoalLevel(GoalLevel));
            Writer.print(" ");
            if (this.LabelName != null) {
                Writer.print(this.LabelName);
            } else {
                Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
            }
            Writer.print(" &");
            Writer.print(Lib.DecToHex(this.UID));

            Writer.newline();
            if (this.NodeDoc != null && !Lib.Object_equals(this.NodeDoc, "")) {
                Writer.print(this.NodeDoc);
                Writer.newline();
            }
            if (!IsRecursive)
                return;
            Writer.newline();
            if (this.NonNullSubNodeList() != null) {
                for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                    var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                    if (Node.IsContext()) {
                        Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer, IsRecursive);
                    }
                }
                for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                    var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                    if (!Node.IsContext()) {
                        Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer, IsRecursive);
                    }
                }
            }
        };

        GSNNode.prototype.ReplaceSubNode = function (NewNode, IsRecursive) {
            this.MergeDocHistory(NewNode);
            if (this.ParentNode != null) {
                for (var i = 0; i < Lib.Array_size(this.ParentNode.SubNodeList); i++) {
                    if (Lib.Array_get(this.ParentNode.SubNodeList, i) == this) {
                        Lib.Array_set(this.ParentNode.SubNodeList, i, NewNode);
                        NewNode.ParentNode = this.ParentNode;
                    }
                }
            } else {
                (NewNode.IsGoal());
                this.BaseDoc.TopNode = NewNode;
            }
            if (!IsRecursive) {
                NewNode.SubNodeList = this.SubNodeList;
            }
            return NewNode;
        };

        GSNNode.prototype.ReplaceSubNodeAsText = function (DocText, IsRecursive) {
            if (!IsRecursive) {
                DocText = WikiSyntax.CommentOutSubNode(DocText);
            }
            var Reader = new StringReader(DocText);
            var Parser = new ParserContext(null);
            var NewNode = Parser.ParseNode(Reader);
            if (NewNode.NodeType != this.NodeType) {
                var Writer = new StringWriter();
                NewNode.FormatNode(Writer);
                this.NodeDoc = WikiSyntax.CommentOutAll(Writer.toString());
                NewNode = this;
            }
            if (NewNode != null) {
                NewNode = this.ReplaceSubNode(NewNode, IsRecursive);
            }
            return NewNode;
        };

        GSNNode.prototype.HasSubNodeUID = function (UID) {
            if (UID == this.UID) {
                return true;
            }
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var SubNode = Lib.Array_get(this.NonNullSubNodeList(), i);
                if (SubNode.HasSubNodeUID(UID))
                    return true;
            }
            return false;
        };

        GSNNode.prototype.Merge = function (NewNode, CommonRevision) {
            if (NewNode.LastModified.Rev > CommonRevision) {
                this.ReplaceSubNode(NewNode, true);
                return this;
            }

            for (var i = 0, j = 0; NewNode.SubNodeList != null && i < Lib.Array_size(NewNode.SubNodeList); i++) {
                var SubNewNode = Lib.Array_get(NewNode.SubNodeList, i);
                for (; this.SubNodeList != null && j < Lib.Array_size(this.SubNodeList); j++) {
                    var SubMasterNode = Lib.Array_get(this.SubNodeList, j);
                    if (SubMasterNode.UID == SubNewNode.UID) {
                        SubMasterNode.Merge(SubNewNode, CommonRevision);
                        break;
                    }
                }
                if (j == Lib.Array_size(this.SubNodeList)) {
                    Lib.Array_add(this.SubNodeList, SubNewNode);
                }
            }
            return this;
        };

        GSNNode.prototype.MergeDocHistory = function (NewNode) {
            (this.BaseDoc != null);
            NewNode.LastModified = null;
            var UID = NewNode.UID;
            var OldNode = this.BaseDoc.GetNode(UID);
            if (OldNode != null && this.HasSubNodeUID(UID)) {
                NewNode.Created = OldNode.Created;
                if (Lib.EqualsDigest(OldNode.Digest, NewNode.Digest)) {
                    NewNode.LastModified = OldNode.LastModified;
                } else {
                    NewNode.LastModified = this.BaseDoc.DocHistory;
                }
            }
            if (NewNode.LastModified == null) {
                NewNode.Created = this.BaseDoc.DocHistory;
                NewNode.LastModified = this.BaseDoc.DocHistory;
            }
            NewNode.BaseDoc = this.BaseDoc;
            for (var i = 0; i < Lib.Array_size(NewNode.NonNullSubNodeList()); i++) {
                var SubNode = Lib.Array_get(NewNode.NonNullSubNodeList(), i);
                this.MergeDocHistory(SubNode);
            }
        };

        GSNNode.prototype.IsNewerTree = function (ModifiedRev) {
            if (ModifiedRev <= this.LastModified.Rev) {
                for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                    var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                    if (!Node.IsNewerTree(ModifiedRev)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };

        GSNNode.prototype.ListSubGoalNode = function (BufferList) {
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                if (Node.IsGoal()) {
                    Lib.Array_add(BufferList, Node);
                }
                if (Node.IsStrategy()) {
                    Node.ListSubGoalNode(BufferList);
                }
            }
        };

        GSNNode.prototype.ListSectionNode = function (BufferList) {
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                if (!Node.IsGoal()) {
                    Lib.Array_add(BufferList, Node);
                }
                if (Node.IsStrategy() || Node.IsEvidence()) {
                    Node.ListSectionNode(BufferList);
                }
            }
        };

        GSNNode.prototype.RenumberGoalRecursive = function (GoalCount, NextGoalCount, LabelMap) {
            (this.IsGoal());

            var queue = new LinkedList();
            queue.add(this);
            var CurrentNode;
            while ((CurrentNode = queue.poll()) != null) {
                while (LabelMap.get("" + GoalCount) != null)
                    GoalCount++;
                CurrentNode.AssignedLabelNumber = "" + GoalCount;
                GoalCount++;
                var BufferList = new Array();
                CurrentNode.ListSectionNode(BufferList);
                var SectionCount = 1;
                for (var i = 0; i < Lib.Array_size(BufferList); i++, SectionCount += 1) {
                    var SectionNode = Lib.Array_get(BufferList, i);
                    var LabelNumber = CurrentNode.GetLabelNumber() + "." + SectionCount;
                    if (LabelMap.get(LabelNumber) != null)
                        continue;
                    SectionNode.AssignedLabelNumber = CurrentNode.GetLabelNumber() + "." + SectionCount;
                }
                Lib.Array_clear(BufferList);

                CurrentNode.ListSubGoalNode(BufferList);
                for (var i = 0; i < Lib.Array_size(BufferList); i++) {
                    var GoalNode = Lib.Array_get(BufferList, i);
                    queue.add(GoalNode);

                    NextGoalCount += 1;
                }
            }
        };

        GSNNode.prototype.RenumberGoal = function (GoalCount, NextGoalCount) {
            var LabelMap = new HashMap();
            this.RenumberGoalRecursive(GoalCount, NextGoalCount, LabelMap);
        };

        GSNNode.prototype.SearchNode = function (SearchWord) {
            var NodeList = new Array();
            if (Lib.String_matches(this.NodeDoc, SearchWord)) {
                Lib.Array_add(NodeList, this);
            }
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                Lib.Array_addAll(NodeList, Node.SearchNode(SearchWord));
            }
            return NodeList;
        };

        GSNNode.prototype.GetNodeCount = function () {
            var res = 1;
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                res += Lib.Array_get(this.NonNullSubNodeList(), i).GetNodeCount();
            }
            return res;
        };

        GSNNode.prototype.GetNodeCountTypeOf = function (type) {
            var res = this.NodeType == type ? 1 : 0;
            for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                res += Lib.Array_get(this.NonNullSubNodeList(), i).GetNodeCountTypeOf(type);
            }
            return res;
        };
        return GSNNode;
    })();
    AssureNote.GSNNode = GSNNode;

    var GSNDoc = (function () {
        function GSNDoc(Record) {
            this.Record = Record;
            this.TopNode = null;
            this.NodeMap = new HashMap();
            this.DocTagMap = new HashMap();
            this.DocHistory = null;
            this.GoalCount = 0;
        }
        GSNDoc.prototype.DeepCopy = function (Author, Role, Date, Process) {
            var NewDoc = new GSNDoc(this.Record);
            NewDoc.GoalCount = this.GoalCount;
            NewDoc.DocHistory = this.Record.NewHistory(Author, Role, Date, Process, NewDoc);
            NewDoc.DocTagMap = this.DuplicateTagMap(this.DocTagMap);
            if (this.TopNode != null) {
                NewDoc.TopNode = this.TopNode.DeepCopy(NewDoc, null);
            }
            return NewDoc;
        };

        GSNDoc.prototype.DuplicateTagMap = function (TagMap) {
            if (TagMap != null) {
                return new HashMap(TagMap);
            }
            return null;
        };

        GSNDoc.prototype.UpdateDocHeader = function (Reader) {
            var Revision = TagUtils.GetInteger(this.DocTagMap, "Revision", -1);
            if (Revision != -1) {
                this.DocHistory = this.Record.GetHistory(Revision);
                if (this.DocHistory != null) {
                    this.DocHistory.Doc = this;
                }
            }
            if (this.DocHistory == null) {
                var Author = TagUtils.GetString(this.DocTagMap, "Author", "unknown");
                var Role = TagUtils.GetString(this.DocTagMap, "Role", "converter");
                var Date = TagUtils.GetString(this.DocTagMap, "Date", null);
                var Process = TagUtils.GetString(this.DocTagMap, "Process", "-");
                this.DocHistory = this.Record.NewHistory(Author, Role, Date, Process, this);
            }
        };

        GSNDoc.prototype.GetNode = function (UID) {
            return this.NodeMap.get(UID);
        };

        GSNDoc.prototype.UncheckAddNode = function (Node) {
            this.NodeMap.put(Node.UID, Node);
        };

        GSNDoc.prototype.AddNode = function (Node) {
            var Key = Node.UID;
            var OldNode = this.NodeMap.get(Key);
            if (OldNode != null) {
                if (Lib.EqualsDigest(OldNode.Digest, Node.Digest)) {
                    Node.Created = OldNode.Created;
                }
            }
            this.NodeMap.put(Key, Node);
            if (Node.NodeType == 0 /* Goal */) {
                if (Node.GetGoalLevel() == 1) {
                    this.TopNode = Node;
                }
            }
        };

        GSNDoc.prototype.RemapNodeMap = function () {
            var NodeMap = new HashMap();
            if (this.TopNode != null) {
                this.TopNode.Remap(NodeMap);
            }
            this.NodeMap = NodeMap;
        };

        GSNDoc.prototype.RemoveNode = function (Node) {
            (this == Node.BaseDoc);
            if (Node.ParentNode != null) {
                Lib.Array_remove(Node.ParentNode.SubNodeList, Node);
            }
            this.RemapNodeMap();
        };

        GSNDoc.prototype.FormatDoc = function (Stream) {
            if (this.TopNode != null) {
                Stream.println("Revision:: " + this.DocHistory.Rev);
                if (TagUtils.GetString(this.DocTagMap, "CommitMessage", null) != null) {
                    Stream.println("CommitMessage:: " + TagUtils.GetString(this.DocTagMap, "CommitMessage", null));
                }
                this.TopNode.FormatNode(Stream);
            }
        };

        GSNDoc.prototype.GetLabelMap = function () {
            var LabelMap = new HashMap();
            var CurrentNode;
            var queue = new LinkedList();
            queue.add(this.TopNode);
            while ((CurrentNode = queue.poll()) != null) {
                if (CurrentNode.LabelName != null) {
                    LabelMap.put(CurrentNode.LabelName, CurrentNode.GetLabel());
                }
                for (var i = 0; CurrentNode.SubNodeList != null && i < Lib.Array_size(CurrentNode.SubNodeList); i++) {
                    queue.add(Lib.Array_get(CurrentNode.SubNodeList, i));
                }
            }
            return LabelMap;
        };

        GSNDoc.prototype.GetNodeCount = function () {
            return this.TopNode.GetNodeCount();
        };

        GSNDoc.prototype.GetNodeCountTypeOf = function (type) {
            return this.TopNode.GetNodeCountTypeOf(type);
        };

        GSNDoc.prototype.RenumberAll = function () {
            if (this.TopNode != null) {
                this.TopNode.RenumberGoal(1, 2);
            }
        };
        return GSNDoc;
    })();
    AssureNote.GSNDoc = GSNDoc;

    var GSNRecord = (function () {
        function GSNRecord() {
            this.HistoryList = new Array();
            this.EditingDoc = null;
        }
        GSNRecord.prototype.DeepCopy = function () {
            var NewRecord = new GSNRecord();
            for (var i = 0; i < Lib.Array_size(this.HistoryList); i++) {
                var Item = Lib.Array_get(this.HistoryList, i);
                Lib.Array_add(NewRecord.HistoryList, Item);
            }
            NewRecord.EditingDoc = this.EditingDoc;
            return NewRecord;
        };

        GSNRecord.prototype.GetHistory = function (Rev) {
            if (Rev < Lib.Array_size(this.HistoryList)) {
                return Lib.Array_get(this.HistoryList, Rev);
            }
            return null;
        };

        GSNRecord.prototype.GetHistoryDoc = function (Rev) {
            var history = this.GetHistory(Rev);
            if (history != null) {
                return history.Doc;
            }
            return null;
        };

        GSNRecord.prototype.NewHistory = function (Author, Role, Date, Process, Doc) {
            var History = new GSNHistory(Lib.Array_size(this.HistoryList), Author, Role, Date, Process, Doc);
            Lib.Array_add(this.HistoryList, History);
            return History;
        };

        GSNRecord.prototype.AddHistory = function (Rev, Author, Role, Date, Process, Doc) {
            if (Rev >= 0) {
                var History = new GSNHistory(Rev, Author, Role, Date, Process, Doc);
                while (!(Rev < Lib.Array_size(this.HistoryList))) {
                    Lib.Array_add(this.HistoryList, new GSNHistory(Rev, Author, Role, Date, Process, Doc));
                }
                if (0 <= Rev && Rev < Lib.Array_size(this.HistoryList)) {
                    var OldHistory = Lib.Array_get(this.HistoryList, Rev);
                    OldHistory.UpdateHistory(Rev, Author, Role, Date, Process, Doc);
                }
                Lib.Array_set(this.HistoryList, Rev, History);
                if (Doc != null) {
                    Doc.DocHistory = History;
                }
            }
        };

        GSNRecord.prototype.ParseHistoryTag = function (Line, Reader) {
            var loc = Line.indexOf("::");
            if (loc != -1) {
                var Key = Line.substring(0, loc).trim();
                try  {
                    var Value = Line.substring(loc + 2).trim();
                    var Records = Value.split(";");
                    this.AddHistory(WikiSyntax.ParseInt(Key.substring(1), -1), Records[1], Records[2], Records[0], Records[3], null);
                } catch (e) {
                    Reader.LogError("Invalid format of history tag", e.getMessage());
                }
            }
        };

        GSNRecord.prototype.Parse = function (TextDoc) {
            var Reader = new StringReader(TextDoc);
            while (Reader.HasNext()) {
                var Doc = new GSNDoc(this);
                var Parser = new ParserContext(Doc);
                Doc.TopNode = Parser.ParseNode(Reader);
                Doc.RenumberAll();
            }
            for (var i = 0; i < Lib.Array_size(this.HistoryList); i++) {
                var History = Lib.Array_get(this.HistoryList, i);
                if (i != 0 && TagUtils.GetString(History.Doc.DocTagMap, "CommitMessage", null) == null) {
                    History.IsCommitRevision = false;
                }
            }
        };

        GSNRecord.prototype.RenumberAll = function () {
            var LatestDoc = this.GetLatestDoc();
            if (LatestDoc != null && LatestDoc.TopNode != null) {
                LatestDoc.RenumberAll();
            }
        };

        GSNRecord.prototype.OpenEditor = function (Author, Role, Date, Process) {
            if (this.EditingDoc == null) {
                var Doc = this.GetLatestDoc();
                if (Doc != null) {
                    this.EditingDoc = Doc.DeepCopy(Author, Role, Date, Process);
                } else {
                    this.EditingDoc = new GSNDoc(this);
                    this.EditingDoc.DocHistory = this.NewHistory(Author, Role, Date, Process, this.EditingDoc);
                }
            }
            this.EditingDoc.DocHistory.IsCommitRevision = false;
        };

        GSNRecord.prototype.CloseEditor = function () {
            this.EditingDoc = null;
        };

        GSNRecord.prototype.DiscardEditor = function () {
            this.EditingDoc = null;
            Lib.Array_remove(this.HistoryList, Lib.Array_size(this.HistoryList) - 1);
        };

        GSNRecord.prototype.Merge = function (NewRecord) {
            var CommonRevision = -1;
            for (var Rev = 0; Rev < Lib.Array_size(this.HistoryList); Rev++) {
                var MasterHistory = this.GetHistory(Rev);
                var NewHistory = NewRecord.GetHistory(Rev);
                if (NewHistory != null && MasterHistory.EqualsHistory(NewHistory)) {
                    CommonRevision = Rev;
                    continue;
                }
                break;
            }
            if (CommonRevision == -1) {
                this.MergeAsReplaceTopGoal(NewRecord);
            } else if (CommonRevision == Lib.Array_size(this.HistoryList) - 1) {
                this.MergeAsFastFoward(NewRecord);
            } else if (CommonRevision != Lib.Array_size(NewRecord.HistoryList) - 1) {
                this.MergeConflict(NewRecord, CommonRevision);
            }
        };

        GSNRecord.prototype.MergeConflict = function (BranchRecord, CommonRevision) {
            var MasterHistory = Lib.Array_get(this.HistoryList, Lib.Array_size(this.HistoryList) - 1);
            var BranchHistory = null;
            for (var i = CommonRevision + 1; i < Lib.Array_size(BranchRecord.HistoryList); i++) {
                BranchHistory = Lib.Array_get(BranchRecord.HistoryList, i);
                Lib.Array_add(this.HistoryList, BranchHistory);
            }

            var MergeDoc = new GSNDoc(this);
            MergeDoc.TopNode = MasterHistory.Doc.TopNode.Merge(BranchHistory.Doc.TopNode, CommonRevision);
            MergeDoc.DocHistory = this.NewHistory(BranchHistory.Author, BranchHistory.Role, null, "merge", MergeDoc);
        };

        GSNRecord.prototype.MergeAsFastFoward = function (NewRecord) {
            for (var i = Lib.Array_size(this.HistoryList); i < Lib.Array_size(NewRecord.HistoryList); i++) {
                var BranchDoc = NewRecord.GetHistoryDoc(i);
                if (BranchDoc != null) {
                    BranchDoc.Record = this;
                    Lib.Array_add(this.HistoryList, BranchDoc.DocHistory);
                }
            }
        };

        GSNRecord.prototype.MergeAsReplaceTopGoal = function (NewRecord) {
            for (var i = 0; i < Lib.Array_size(NewRecord.HistoryList); i++) {
                var NewHistory = Lib.Array_get(NewRecord.HistoryList, i);
                var Doc = NewHistory != null ? NewHistory.Doc : null;
                if (Doc != null) {
                    this.OpenEditor(NewHistory.Author, NewHistory.Role, NewHistory.DateString, NewHistory.Process);
                    this.EditingDoc.TopNode.ReplaceSubNode(Doc.TopNode, true);
                    this.CloseEditor();
                }
            }
        };

        GSNRecord.prototype.MergeAsIncrementalAddition = function (Rev1, Record1, Rev2, Record2) {
            while (Rev1 < Lib.Array_size(Record1.HistoryList) && Rev2 < Lib.Array_size(Record2.HistoryList)) {
                var History1 = Record1.GetHistory(Rev1);
                var History2 = Record2.GetHistory(Rev2);
                if (History1 == null || History1.Doc == null) {
                    if (Rev1 < Lib.Array_size(Record1.HistoryList)) {
                        Rev1++;
                        continue;
                    }
                }
                if (History2 == null || History2.Doc == null) {
                    if (Rev2 < Lib.Array_size(Record2.HistoryList)) {
                        Rev2++;
                        continue;
                    }
                }
                if (History1.CompareDate(History2) < 0) {
                    this.OpenEditor(History1.Author, History1.Role, History1.DateString, History1.Process);
                    Rev1++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History1.Doc.TopNode, true);
                    this.CloseEditor();
                } else {
                    this.OpenEditor(History2.Author, History2.Role, History2.DateString, History2.Process);
                    Rev2++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History2.Doc.TopNode, true);
                    this.CloseEditor();
                }
            }
        };

        GSNRecord.prototype.GetLatestDoc = function () {
            for (var i = Lib.Array_size(this.HistoryList) - 1; i >= 0; i++) {
                var Doc = this.GetHistoryDoc(i);
                if (Doc != null) {
                    return Doc;
                }
            }
            return null;
        };

        GSNRecord.prototype.Commit = function (message) {
            this.GetLatestDoc().DocHistory.IsCommitRevision = true;
            this.GetLatestDoc().DocTagMap.put("CommitMessage", message);
        };

        GSNRecord.prototype.FormatRecord = function (Writer) {
            var DocCount = 0;
            for (var i = Lib.Array_size(this.HistoryList) - 1; i >= 0; i--) {
                var Doc = this.GetHistoryDoc(i);
                if (Doc != null) {
                    if (DocCount > 0) {
                        Writer.println(Lib.VersionDelim);
                    }
                    TagUtils.FormatHistoryTag(this.HistoryList, i, Writer);
                    Doc.FormatDoc(Writer);
                    DocCount += 1;
                }
            }
        };
        return GSNRecord;
    })();
    AssureNote.GSNRecord = GSNRecord;

    var ParserContext = (function () {
        function ParserContext(NullableDoc) {
            var ParentNode = new GSNNode(NullableDoc, null, 0 /* Goal */, null, -1, null);
            this.NullableDoc = NullableDoc;
            this.FirstNode = null;
            this.LastGoalNode = null;
            this.LastNonContextNode = null;
            this.GoalStack = new Array();
            this.random = new Random(System.currentTimeMillis());
            this.SetGoalStackAt(ParentNode);
        }
        ParserContext.prototype.SetLastNode = function (Node) {
            if (Node.IsGoal()) {
                this.LastGoalNode = Node;
                this.SetGoalStackAt(Node);
            }
            if (!Node.IsContext()) {
                this.LastNonContextNode = Node;
            }
        };

        ParserContext.prototype.GetStrategyOfGoal = function (Level) {
            if (Level - 1 < Lib.Array_size(this.GoalStack)) {
                var ParentGoal = this.GetGoalStackAt(Level - 1);
                if (ParentGoal != null) {
                    return ParentGoal.GetLastNode(2 /* Strategy */, true);
                }
            }
            return null;
        };

        ParserContext.prototype.GetGoalStackAt = function (Level) {
            if (Level >= 0 && Level < Lib.Array_size(this.GoalStack)) {
                return Lib.Array_get(this.GoalStack, Level);
            }
            return null;
        };

        ParserContext.prototype.SetGoalStackAt = function (Node) {
            var GoalLevel = Node.GetGoalLevel();

            while (!(GoalLevel - 1 < Lib.Array_size(this.GoalStack))) {
                Lib.Array_add(this.GoalStack, null);
            }
            Lib.Array_set(this.GoalStack, GoalLevel - 1, Node);
        };

        ParserContext.prototype.IsValidSection = function (Line, Reader) {
            var NodeType = WikiSyntax.ParseNodeType(Line);
            var Level = WikiSyntax.ParseGoalLevel(Line);
            if (NodeType == 0 /* Goal */) {
                var ParentNode = this.GetStrategyOfGoal(Level);
                if (ParentNode != null) {
                    return true;
                }
                Reader.LogError("Mismatched goal level < " + Lib.Array_size(this.GoalStack), Line);
                return false;
            }
            if (this.LastGoalNode != null && Lib.Array_size(this.GoalStack) <= Level) {
                Reader.LogError("Mismatched goal level < " + Lib.Array_size(this.GoalStack), Line);
                return false;
            }
            return true;
        };

        ParserContext.prototype.CreateNewNode = function (LabelLine, Reader) {
            var NodeType = WikiSyntax.ParseNodeType(LabelLine);
            var LabelName = WikiSyntax.ParseLabelName(LabelLine);
            var LabelNumber = WikiSyntax.ParseLabelNumber(LabelLine);
            var UID = (WikiSyntax.ParseUID(LabelLine) == null) ? this.random.nextInt() : Lib.HexToDec(WikiSyntax.ParseUID(LabelLine));
            var NewNode = null;
            var ParentNode = null;
            var HistoryTaple = WikiSyntax.ParseHistory(LabelLine, this.NullableDoc);
            var Level = WikiSyntax.ParseGoalLevel(LabelLine);
            if (NodeType == 0 /* Goal */) {
                ParentNode = this.GetStrategyOfGoal(Level);
            } else {
                ParentNode = (NodeType == 1 /* Context */) ? this.LastNonContextNode : this.GetGoalStackAt(Level);
            }
            NewNode = new GSNNode(this.NullableDoc, ParentNode, NodeType, LabelName, UID, HistoryTaple);
            if (this.FirstNode == null) {
                this.FirstNode = NewNode;
            }
            this.SetLastNode(NewNode);
            if (this.NullableDoc != null) {
                this.NullableDoc.AddNode(NewNode);
            }
            return NewNode;
        };

        ParserContext.prototype.RemoveSentinel = function () {
            if (this.FirstNode != null && this.FirstNode.ParentNode != null) {
                this.FirstNode.ParentNode = null;
            }
        };

        ParserContext.prototype.ParseNode = function (Reader) {
            while (Reader.HasNext()) {
                var Line = Reader.ReadLine();
                if (Lib.String_startsWith(Line, "*")) {
                    Reader.RollbackLineFeed();
                    break;
                }
                if (this.NullableDoc != null) {
                    if (Lib.String_startsWith(Line, "#")) {
                        this.NullableDoc.Record.ParseHistoryTag(Line, Reader);
                    } else {
                        TagUtils.ParseTag(this.NullableDoc.DocTagMap, Line);
                    }
                }
            }
            if (this.NullableDoc != null) {
                this.NullableDoc.UpdateDocHeader(Reader);
            }
            var LastNode = null;
            var LineList = new Array();
            while (Reader.HasNext()) {
                var Line = Reader.ReadLine();
                if (Lib.String_startsWith(Line, "*")) {
                    if (Lib.String_startsWith(Line, Lib.VersionDelim)) {
                        break;
                    }
                    if (this.IsValidSection(Line, Reader)) {
                        this.UpdateContent(LastNode, LineList);
                        LastNode = this.CreateNewNode(Line, Reader);
                        continue;
                    }
                }
                Lib.Array_add(LineList, Line);
            }
            this.UpdateContent(LastNode, LineList);
            this.RemoveSentinel();
            return this.FirstNode;
        };

        ParserContext.prototype.UpdateContent = function (LastNode, LineList) {
            if (LastNode != null) {
                LastNode.SetContent(LineList);
            }
            Lib.Array_clear(LineList);
        };
        return ParserContext;
    })();
    AssureNote.ParserContext = ParserContext;

    var AssureNoteParser = (function () {
        function AssureNoteParser() {
        }
        AssureNoteParser.merge = function (MasterFile, BranchFile) {
            var MasterRecord = new GSNRecord();
            MasterRecord.Parse(Lib.ReadFile(MasterFile));
            if (BranchFile != null) {
                var BranchRecord = new GSNRecord();
                BranchRecord.Parse(Lib.ReadFile(BranchFile));
                MasterRecord.Merge(BranchRecord);
            } else {
            }
            var Writer = new StringWriter();
            MasterRecord.FormatRecord(Writer);
            console.log(Writer.toString());
        };

        AssureNoteParser.ts_merge = function () {
            var MasterFile = (Lib.Input.length > 0) ? Lib.Input[0] : null;
            var BranchFile = (Lib.Input.length > 1) ? Lib.Input[1] : null;
            var MasterRecord = new GSNRecord();
            MasterRecord.Parse(MasterFile);
            if (BranchFile != null) {
                var BranchRecord = new GSNRecord();
                BranchRecord.Parse(Lib.ReadFile(BranchFile));
                MasterRecord.Merge(BranchRecord);
            } else {
                MasterRecord.RenumberAll();
            }
            var Writer = new StringWriter();
            MasterRecord.FormatRecord(Writer);
            console.log(Writer.toString());
        };

        AssureNoteParser.main = function (argv) {
            if (argv.length == 2) {
                var MasterRecord = new GSNRecord();
                MasterRecord.Parse(Lib.ReadFile(argv[0]));
                var NewNode = MasterRecord.GetLatestDoc().TopNode.ReplaceSubNodeAsText(Lib.ReadFile(argv[1]), true);
                var Writer = new StringWriter();
                NewNode.FormatNode(Writer);

                console.log(Writer.toString());
            }
            if (argv.length == 1) {
                AssureNoteParser.merge(argv[0], null);
            }
            console.log("Usage: AssureNoteParser file [margingfile]");
        };
        return AssureNoteParser;
    })();
    AssureNote.AssureNoteParser = AssureNoteParser;

    

    var PdfConverter = (function () {
        function PdfConverter() {
        }
        PdfConverter.main = function (args) {
        };
        return PdfConverter;
    })();
    AssureNote.PdfConverter = PdfConverter;

    var Random = (function () {
        function Random(seed) {
        }
        Random.prototype.nextInt = function () {
            return Math.floor(Math.random() * 2147483647);
        };
        return Random;
    })();
    AssureNote.Random = Random;

    var System = (function () {
        function System() {
        }
        System.currentTimeMillis = function () {
            return new Date().getTime();
        };
        return System;
    })();
    AssureNote.System = System;

    var StringBuilder = (function () {
        function StringBuilder() {
            this.str = "";
        }
        StringBuilder.prototype.append = function (str) {
            this.str += str;
        };

        StringBuilder.prototype.toString = function () {
            return this.str;
        };
        return StringBuilder;
    })();
    AssureNote.StringBuilder = StringBuilder;

    var Character = (function () {
        function Character() {
        }
        Character.isDigit = function (c) {
            return 48 <= c && c <= 57;
        };

        Character.isWhitespace = function (c) {
            return c == 9 || c == 10 || c == 12 || c == 13 || c == 32;
            ;
        };
        return Character;
    })();
    AssureNote.Character = Character;

    var SimpleDateFormat = (function () {
        function SimpleDateFormat(format) {
        }
        SimpleDateFormat.prototype.fillZero = function (digit) {
            if (digit < 10) {
                return '0' + digit;
            } else {
                return '' + digit;
            }
        };

        SimpleDateFormat.prototype.parse = function (date) {
            return new Date(date);
        };

        SimpleDateFormat.prototype.formatTimezone = function (timezoneOffset) {
            var res = '';
            var timezoneInHours = timezoneOffset / -60;
            if (Math.abs(timezoneInHours) < 10) {
                res = '0' + Math.abs(timezoneInHours) + '00';
            } else {
                res = Math.abs(timezoneInHours) + '00';
            }

            if (timezoneInHours > 0) {
                return '+' + res;
            } else {
                return '-' + res;
            }
        };

        SimpleDateFormat.prototype.format = function (date) {
            var y = this.fillZero(date.getFullYear());
            var m = this.fillZero(date.getMonth() + 1);
            var d = this.fillZero(date.getDate());
            var hr = this.fillZero(date.getHours());
            var min = this.fillZero(date.getMinutes());
            var sec = this.fillZero(date.getSeconds());
            var timezone = this.formatTimezone(date.getTimezoneOffset());
            return y + '-' + m + '-' + d + 'T' + hr + ':' + min + ':' + sec + timezone;
        };
        return SimpleDateFormat;
    })();
    AssureNote.SimpleDateFormat = SimpleDateFormat;

    var Queue = (function () {
        function Queue() {
            this.list = [];
        }
        Queue.prototype.add = function (elem) {
            this.list.push(elem);
        };

        Queue.prototype.poll = function () {
            if (this.list.length == 0)
                return null;
            var res = this.list[0];
            this.list = this.list.slice(1);
            return res;
        };
        return Queue;
    })();
    AssureNote.Queue = Queue;

    var LinkedList = (function (_super) {
        __extends(LinkedList, _super);
        function LinkedList() {
            _super.apply(this, arguments);
        }
        return LinkedList;
    })(Queue);
    AssureNote.LinkedList = LinkedList;

    var HashMap = (function () {
        function HashMap(map) {
            this.hash = {};
            if (map != null) {
                var keySet = map.keySet();
                for (var i = 0; i < keySet.length; i++) {
                    this.hash[keySet[i]] = map[keySet[i]];
                }
            }
        }
        HashMap.prototype.put = function (key, value) {
            this.hash[String(key)] = value;
        };

        HashMap.prototype.get = function (key) {
            return this.hash[String(key)];
        };

        HashMap.prototype.size = function () {
            return Object.keys(this.hash).length;
        };

        HashMap.prototype.clear = function () {
            this.hash = {};
        };

        HashMap.prototype.keySet = function () {
            return Object.keys(this.hash);
        };

        HashMap.prototype.toArray = function () {
            var res = [];
            for (var key in Object.keys(this.hash)) {
                res.push(this.hash[key]);
            }
            return res;
        };
        return HashMap;
    })();
    AssureNote.HashMap = HashMap;

    var MessageDigest = (function () {
        function MessageDigest() {
            this.digestString = null;
        }
        MessageDigest.prototype.digest = function () {
            return this.digestString;
        };
        return MessageDigest;
    })();
    AssureNote.MessageDigest = MessageDigest;

    var Lib = (function () {
        function Lib() {
        }
        Lib.GetMD5 = function () {
            return new MessageDigest();
        };

        Lib.UpdateMD5 = function (md, text) {
            md.digestString = Lib.md5(text);
        };

        Lib.EqualsDigest = function (digest1, digest2) {
            return digest1 == digest2;
        };

        Lib.ReadFile = function (file) {
            return "";
        };

        Lib.parseInt = function (numText) {
            return Number(numText);
        };

        Lib.HexToDec = function (v) {
            return parseInt(v, 16);
        };

        Lib.DecToHex = function (n) {
            return n.toString(16);
        };

        Lib.String_startsWith = function (self, key) {
            return self.indexOf(key, 0) == 0;
        };

        Lib.String_compareTo = function (self, anotherString) {
            if (self < anotherString) {
                return -1;
            } else if (self > anotherString) {
                return 1;
            } else {
                return 0;
            }
        };

        Lib.String_endsWith = function (self, key) {
            return self.lastIndexOf(key, 0) == 0;
        };

        Lib.String_matches = function (self, str) {
            return self.match(str) != null;
        };

        Lib.Array_get = function (self, index) {
            if (index >= self.length) {
                throw new RangeError("invalid array index");
            }
            return self[index];
        };
        Lib.Array_set = function (self, index, value) {
            self[index] = value;
        };
        Lib.Array_add = function (self, obj) {
            self.push(obj);
        };
        Lib.Array_add2 = function (self, index, obj) {
            self.splice(index, 0, obj);
        };
        Lib.Array_addAll = function (self, obj) {
            Array.prototype.push.apply(self, obj);
        };
        Lib.Array_size = function (self) {
            return self.length;
        };
        Lib.Array_clear = function (self) {
            self.length = 0;
        };
        Lib.Array_remove = function (self, index) {
            if (typeof index == 'number') {
                if (index >= self.length) {
                    throw new RangeError("invalid array index");
                }
            } else {
                var item = index;
                index = 0;
                for (var j in self) {
                    if (self[j] === index)
                        break;
                }
                if (j == self.length)
                    return null;
            }
            var v = self[index];
            self.splice(index, 1);
            return v;
        };

        Lib.Object_equals = function (self, obj) {
            return (self === obj);
        };

        Lib.Object_InstanceOf = function (self, klass) {
            return self.constructor == klass;
        };
        Lib.Input = [];
        Lib.EmptyNodeList = new Array();
        Lib.LineFeed = "\n";
        Lib.VersionDelim = "*=====";
        return Lib;
    })();
    AssureNote.Lib = Lib;

    var Iterator = (function () {
        function Iterator() {
        }
        return Iterator;
    })();
    AssureNote.Iterator = Iterator;

    Object.defineProperty(Array.prototype, "addAll", {
        enumerable: false,
        value: function (obj) {
            Array.prototype.push.apply(this, obj);
        }
    });

    Object.defineProperty(Array.prototype, "size", {
        enumerable: false,
        value: function () {
            return this.length;
        }
    });

    Object.defineProperty(Array.prototype, "add", {
        enumerable: false,
        value: function (arg1) {
            if (arguments.length == 1) {
                this.push(arg1);
            } else {
                var arg2 = arguments[1];
                this.splice(arg1, 0, arg2);
            }
        }
    });

    Object.defineProperty(Array.prototype, "get", {
        enumerable: false,
        value: function (i) {
            if (i >= this.length) {
                throw new RangeError("invalid array index");
            }
            return this[i];
        }
    });

    Object.defineProperty(Array.prototype, "set", {
        enumerable: false,
        value: function (i, v) {
            this[i] = v;
        }
    });

    Object.defineProperty(Array.prototype, "remove", {
        enumerable: false,
        value: function (i) {
            if (typeof i == 'number') {
                if (i >= this.length) {
                    throw new RangeError("invalid array index");
                }
            } else {
                var item = i;
                i = 0;
                for (var j in this) {
                    if (this[j] === i)
                        break;
                }
                if (j == this.length)
                    return null;
            }
            var v = this[i];
            this.splice(i, 1);
            return v;
        }
    });

    Object.defineProperty(Array.prototype, "clear", {
        enumerable: false,
        value: function () {
            this.length = 0;
        }
    });

    Object.defineProperty(Object.prototype, "equals", {
        enumerable: false,
        value: function (other) {
            return (this === other);
        }
    });

    Object.defineProperty(Object.prototype, "InstanceOf", {
        enumerable: false,
        value: function (klass) {
            return this.constructor == klass;
        }
    });

    Object.defineProperty(String.prototype, "compareTo", {
        enumerable: false,
        value: function (anotherString) {
            if (this < anotherString) {
                return -1;
            } else if (this > anotherString) {
                return 1;
            } else {
                return 0;
            }
        }
    });

    Object.defineProperty(String.prototype, "startsWith", {
        enumerable: false,
        value: function (key) {
            return this.indexOf(key, 0) == 0;
        }
    });

    Object.defineProperty(String.prototype, "endsWith", {
        enumerable: false,
        value: function (key) {
            return this.lastIndexOf(key, 0) == 0;
        }
    });

    Object.defineProperty(String.prototype, "equals", {
        enumerable: false,
        value: function (other) {
            return (this == other);
        }
    });

    Object.defineProperty(String.prototype, "matches", {
        enumerable: false,
        value: function (str) {
            return this.match(str) != null;
        }
    });

    (function ($) {
        'use strict';

        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        function md5_cmn(q, a, b, x, s, t) {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
        }
        function md5_ff(a, b, c, d, x, s, t) {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        function md5_gg(a, b, c, d, x, s, t) {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        function md5_hh(a, b, c, d, x, s, t) {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }
        function md5_ii(a, b, c, d, x, s, t) {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function binl_md5(x, len) {
            x[len >> 5] |= 0x80 << (len % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var i, olda, oldb, oldc, oldd, a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;

            for (i = 0; i < x.length; i += 16) {
                olda = a;
                oldb = b;
                oldc = c;
                oldd = d;

                a = md5_ff(a, b, c, d, x[i], 7, -680876936);
                d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                b = md5_gg(b, c, d, a, x[i], 20, -373897302);
                a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                d = md5_hh(d, a, b, c, x[i], 11, -358537222);
                c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i], 6, -198630844);
                d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }
            return [a, b, c, d];
        }

        function binl2rstr(input) {
            var i, output = '';
            for (i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
            }
            return output;
        }

        function rstr2binl(input) {
            var i, output = [];
            output[(input.length >> 2) - 1] = undefined;
            for (i = 0; i < output.length; i += 1) {
                output[i] = 0;
            }
            for (i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
            }
            return output;
        }

        function rstr_md5(s) {
            return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
        }

        function rstr_hmac_md5(key, data) {
            var i, bkey = rstr2binl(key), ipad = [], opad = [], hash;
            ipad[15] = opad[15] = undefined;
            if (bkey.length > 16) {
                bkey = binl_md5(bkey, key.length * 8);
            }
            for (i = 0; i < 16; i += 1) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }
            hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
            return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
        }

        function rstr2hex(input) {
            var hex_tab = '0123456789abcdef', output = '', x, i;
            for (i = 0; i < input.length; i += 1) {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
            }
            return output;
        }

        function str2rstr_utf8(input) {
            return unescape(encodeURIComponent(input));
        }

        function raw_md5(s) {
            return rstr_md5(str2rstr_utf8(s));
        }
        function hex_md5(s) {
            return rstr2hex(raw_md5(s));
        }
        function raw_hmac_md5(k, d) {
            return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
        }
        function hex_hmac_md5(k, d) {
            return rstr2hex(raw_hmac_md5(k, d));
        }

        function md5(string, key, raw) {
            if (!key) {
                if (!raw) {
                    return hex_md5(string);
                }
                return raw_md5(string);
            }
            if (!raw) {
                return hex_hmac_md5(key, string);
            }
            return raw_hmac_md5(key, string);
        }

        $.md5 = md5;
    }(Lib));
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var VisitableNodeList = (function () {
        function VisitableNodeList(Panel) {
            this.NodeIndex = 0;
            this.NodeList = [];
            this.Visiting = false;
            this.ColorStyle = AssureNote.ColorStyle.Searched;
            this.Panel = Panel;
        }
        VisitableNodeList.prototype.StartVisit = function (NodeList) {
            if (this.IsVisiting()) {
                this.FinishVisit();
            }
            this.NodeList = NodeList;
            if (this.NodeList.length > 0) {
                this.Visiting = true;
                this.UnfoldAllFoundNode();
                this.AddColorToAllHitNodes(this.ColorStyle);
                this.Panel.FocusAndMoveToNode(this.NodeList[0].GetLabel());
            }
        };

        VisitableNodeList.prototype.VisitNext = function (IsReversed) {
            if (this.IsVisiting() && this.NodeList.length > 1) {
                var Length = this.NodeList.length;
                this.NodeIndex = (Length + this.NodeIndex + (IsReversed ? -1 : 1)) % Length;
                this.Panel.FocusAndMoveToNode(this.NodeList[this.NodeIndex].GetLabel());
            }
        };

        VisitableNodeList.prototype.UnfoldAllFoundNode = function () {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                while (Node != null) {
                    Node.SetIsFolded(false);
                    Node = Node.Parent;
                }
            }
            this.Panel.Draw(this.Panel.TopNodeView.Label, 300);
        };

        VisitableNodeList.prototype.IsVisiting = function () {
            return this.Visiting;
        };

        VisitableNodeList.prototype.FinishVisit = function () {
            this.RemoveColorFromAllHitNodes(this.ColorStyle);
            this.NodeList = [];
            this.NodeIndex = 0;
            this.Visiting = false;
        };

        VisitableNodeList.prototype.AddColorToAllHitNodes = function (ColorStyle) {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().AddColorStyle(ColorStyle);
                }
            }
        };

        VisitableNodeList.prototype.RemoveColorFromAllHitNodes = function (ColorStyle) {
            var ViewMap = this.Panel.ViewMap;
            for (var i = 0; i < this.NodeList.length; i++) {
                var Node = ViewMap[this.NodeList[i].GetLabel()];
                if (Node != null) {
                    Node.GetShape().RemoveColorStyle(ColorStyle);
                }
            }
        };
        return VisitableNodeList;
    })();
    AssureNote.VisitableNodeList = VisitableNodeList;

    var SearchResultNodeList = (function (_super) {
        __extends(SearchResultNodeList, _super);
        function SearchResultNodeList(Panel) {
            _super.call(this, Panel);
        }
        SearchResultNodeList.prototype.Search = function (TargetView, SearchWord) {
            this.StartVisit(TargetView.Model.SearchNode(SearchWord));
        };
        return SearchResultNodeList;
    })(VisitableNodeList);
    AssureNote.SearchResultNodeList = SearchResultNodeList;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var LayoutEngine = (function () {
        function LayoutEngine(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
        }
        LayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView) {
        };
        return LayoutEngine;
    })();
    AssureNote.LayoutEngine = LayoutEngine;

    var SimpleLayoutEngine = (function (_super) {
        __extends(SimpleLayoutEngine, _super);
        function SimpleLayoutEngine(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
        }
        SimpleLayoutEngine.prototype.Render = function (ThisNode, DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            var _this = this;
            if (ThisNode.IsVisible) {
                ThisNode.GetShape().PrerenderContent(this.AssureNoteApp.PluginManager);
                ThisNode.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
                if (!ThisNode.IsFolded()) {
                    ThisNode.ForEachVisibleAllSubNodes(function (SubNode) {
                        _this.Render(SubNode, DivFrag, SvgNodeFrag, SvgConnectionFrag);
                    });
                }
            }
        };

        SimpleLayoutEngine.prototype.DoLayout = function (PictgramPanel, NodeView) {
            var DivFragment = document.createDocumentFragment();
            var SvgNodeFragment = document.createDocumentFragment();
            var SvgConnectionFragment = document.createDocumentFragment();
            var Dummy = document.createDocumentFragment();

            var t0 = AssureNote.AssureNoteUtils.GetTime();
            this.Render(NodeView, DivFragment, SvgNodeFragment, SvgConnectionFragment);
            var t1 = AssureNote.AssureNoteUtils.GetTime();
            console.log("Render: " + (t1 - t0));

            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayerConnectorGroup.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayerNodeGroup.appendChild(SvgNodeFragment);
            this.PrepareNodeSize(NodeView);
            Dummy.appendChild(DivFragment);
            Dummy.appendChild(SvgConnectionFragment);
            Dummy.appendChild(SvgNodeFragment);
            var t2 = AssureNote.AssureNoteUtils.GetTime();
            console.log("NodeSize: " + (t2 - t1));

            this.Layout(NodeView);
            PictgramPanel.ContentLayer.appendChild(DivFragment);
            PictgramPanel.SVGLayer.appendChild(SvgConnectionFragment);
            PictgramPanel.SVGLayer.appendChild(SvgNodeFragment);
            var t3 = AssureNote.AssureNoteUtils.GetTime();
            console.log("Layout: " + (t3 - t2));
        };

        SimpleLayoutEngine.prototype.PrepareNodeSize = function (ThisNode) {
            var _this = this;
            var Shape = ThisNode.GetShape();
            Shape.GetNodeWidth();
            Shape.GetNodeHeight();
            if (ThisNode.IsFolded()) {
                return;
            }
            ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
                _this.PrepareNodeSize(SubNode);
            });
            ThisNode.ForEachVisibleRightNodes(function (SubNode) {
                _this.PrepareNodeSize(SubNode);
            });
            ThisNode.ForEachVisibleChildren(function (SubNode) {
                _this.PrepareNodeSize(SubNode);
            });
        };

        SimpleLayoutEngine.prototype.Layout = function (ThisNode) {
            var _this = this;
            if (!ThisNode.IsVisible) {
                return;
            }
            var Shape = ThisNode.GetShape();
            if (!ThisNode.ShouldReLayout()) {
                ThisNode.TraverseVisibleNode(function (Node) {
                    Node.Shape.FitSizeToContent();
                });
                return;
            }
            ThisNode.SetShouldReLayout(false);
            Shape.FitSizeToContent();
            var TreeLeftX = 0;
            var ThisNodeWidth = Shape.GetNodeWidth();
            var TreeRightX = ThisNodeWidth;
            var TreeHeight = Shape.GetNodeHeight();
            if (ThisNode.IsFolded()) {
                Shape.SetHeadRect(0, 0, ThisNodeWidth, TreeHeight);
                Shape.SetTreeRect(0, 0, ThisNodeWidth, TreeHeight);
                return;
            }
            if (ThisNode.Left != null) {
                var LeftNodesWidth = 0;
                var LeftNodesHeight = -SimpleLayoutEngine.ContextVerticalMargin;
                ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    LeftNodesHeight += SimpleLayoutEngine.ContextVerticalMargin;
                    SubNode.RelativeX = -(SubNode.Shape.GetNodeWidth() + SimpleLayoutEngine.ContextHorizontalMargin);
                    SubNode.RelativeY = LeftNodesHeight;
                    LeftNodesWidth = Math.max(LeftNodesWidth, SubNode.Shape.GetNodeWidth());
                    LeftNodesHeight += SubNode.Shape.GetNodeHeight();
                });
                var LeftShift = (ThisNode.Shape.GetNodeHeight() - LeftNodesHeight) / 2;
                if (LeftShift > 0) {
                    ThisNode.ForEachVisibleLeftNodes(function (SubNode) {
                        SubNode.RelativeY += LeftShift;
                    });
                }
                if (LeftNodesHeight > 0) {
                    TreeLeftX = -(LeftNodesWidth + SimpleLayoutEngine.ContextHorizontalMargin);
                    TreeHeight = Math.max(TreeHeight, LeftNodesHeight);
                }
            }
            if (ThisNode.Right != null) {
                var RightNodesWidth = 0;
                var RightNodesHeight = -SimpleLayoutEngine.ContextVerticalMargin;
                ThisNode.ForEachVisibleRightNodes(function (SubNode) {
                    SubNode.GetShape().FitSizeToContent();
                    RightNodesHeight += SimpleLayoutEngine.ContextVerticalMargin;
                    SubNode.RelativeX = (ThisNodeWidth + SimpleLayoutEngine.ContextHorizontalMargin);
                    SubNode.RelativeY = RightNodesHeight;
                    RightNodesWidth = Math.max(RightNodesWidth, SubNode.Shape.GetNodeWidth());
                    RightNodesHeight += SubNode.Shape.GetNodeHeight();
                });
                var RightShift = (ThisNode.Shape.GetNodeHeight() - RightNodesHeight) / 2;
                if (RightShift > 0) {
                    ThisNode.ForEachVisibleRightNodes(function (SubNode) {
                        SubNode.RelativeY += RightShift;
                    });
                }
                if (RightNodesHeight > 0) {
                    TreeRightX += RightNodesWidth + SimpleLayoutEngine.ContextHorizontalMargin;
                    TreeHeight = Math.max(TreeHeight, RightNodesHeight);
                }
            }

            var HeadRightX = TreeRightX;
            var HeadWidth = TreeRightX - TreeLeftX;
            Shape.SetHeadRect(TreeLeftX, 0, HeadWidth, TreeHeight);
            TreeHeight += SimpleLayoutEngine.ChildrenVerticalMargin;

            var ChildrenTopWidth = 0;
            var ChildrenBottomWidth = 0;
            var ChildrenHeight = 0;
            var FormarUnfoldedChildHeight = Infinity;
            var FoldedNodeRun = [];
            var VisibleChildrenCount = 0;
            if (ThisNode.Children != null && ThisNode.Children.length > 0) {
                var IsPreviousChildFolded = false;

                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    VisibleChildrenCount++;
                    _this.Layout(SubNode);
                    var ChildTreeWidth = SubNode.Shape.GetTreeWidth();
                    var ChildHeadWidth = SubNode.IsFolded() ? SubNode.Shape.GetNodeWidth() : SubNode.Shape.GetHeadWidth();
                    var ChildHeadHeight = SubNode.IsFolded() ? SubNode.Shape.GetNodeHeight() : SubNode.Shape.GetHeadHeight();
                    var ChildHeadLeftSideMargin = SubNode.Shape.GetHeadLeftLocalX() - SubNode.Shape.GetTreeLeftLocalX();
                    var ChildHeadRightX = ChildHeadLeftSideMargin + ChildHeadWidth;
                    var ChildTreeHeight = SubNode.Shape.GetTreeHeight();
                    var HMargin = SimpleLayoutEngine.ChildrenHorizontalMargin;

                    var IsUndeveloped = SubNode.Children == null || SubNode.Children.length == 0;
                    var IsFoldedLike = (SubNode.IsFolded() || IsUndeveloped) && ChildHeadHeight <= FormarUnfoldedChildHeight;

                    if (IsFoldedLike) {
                        SubNode.RelativeX = ChildrenTopWidth;
                        ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + HMargin;
                        FoldedNodeRun.push(SubNode);
                    } else {
                        if (IsPreviousChildFolded) {
                            var WidthDiff = ChildrenTopWidth - ChildrenBottomWidth;
                            if (WidthDiff < ChildHeadLeftSideMargin) {
                                SubNode.RelativeX = ChildrenBottomWidth;
                                ChildrenTopWidth = ChildrenBottomWidth + ChildHeadRightX + HMargin;
                                ChildrenBottomWidth = ChildrenBottomWidth + ChildTreeWidth + HMargin;
                                if (SubNode.RelativeX == 0) {
                                    for (var i = 0; i < FoldedNodeRun.length; i++) {
                                        FoldedNodeRun[i].RelativeX += ChildHeadLeftSideMargin - WidthDiff;
                                    }
                                } else {
                                    var FoldedRunMargin = (ChildHeadLeftSideMargin - WidthDiff) / (FoldedNodeRun.length + 1);
                                    for (var i = 0; i < FoldedNodeRun.length; i++) {
                                        FoldedNodeRun[i].RelativeX += FoldedRunMargin * (i + 1);
                                    }
                                }
                            } else {
                                SubNode.RelativeX = ChildrenTopWidth - ChildHeadLeftSideMargin;
                                ChildrenBottomWidth = ChildrenTopWidth + ChildTreeWidth - ChildHeadLeftSideMargin + HMargin;
                                ChildrenTopWidth = ChildrenTopWidth + ChildHeadWidth + HMargin;
                            }
                        } else {
                            var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth);
                            SubNode.RelativeX = ChildrenWidth;
                            ChildrenTopWidth = ChildrenWidth + ChildHeadRightX + HMargin;
                            ChildrenBottomWidth = ChildrenWidth + ChildTreeWidth + HMargin;
                        }
                        FoldedNodeRun = [];
                        FormarUnfoldedChildHeight = ChildHeadHeight;
                        SubNode.RelativeX += -SubNode.Shape.GetTreeLeftLocalX();
                    }
                    SubNode.RelativeY = TreeHeight;

                    IsPreviousChildFolded = IsFoldedLike;
                    ChildrenHeight = Math.max(ChildrenHeight, ChildTreeHeight);
                });

                var ChildrenWidth = Math.max(ChildrenTopWidth, ChildrenBottomWidth) - SimpleLayoutEngine.ChildrenHorizontalMargin;
                var ShiftX = (ChildrenWidth - ThisNodeWidth) / 2;

                if (VisibleChildrenCount == 1) {
                    ThisNode.ForEachVisibleChildren(function (SubNode) {
                        ShiftX = -SubNode.Shape.GetTreeLeftLocalX();
                        if (!SubNode.HasSideNode() || SubNode.IsFolded()) {
                            var ShiftY = 0;
                            var SubNodeHeight = SubNode.Shape.GetNodeHeight();
                            var ThisHeight = ThisNode.Shape.GetNodeHeight();
                            var VMargin = SimpleLayoutEngine.ChildrenVerticalMargin;
                            if (!SubNode.HasChildren() || ThisHeight + VMargin * 2 + SubNodeHeight > TreeHeight) {
                                ShiftY = TreeHeight - (ThisHeight + VMargin);
                            } else {
                                ShiftY = SubNodeHeight + VMargin;
                            }
                            SubNode.RelativeY -= ShiftY;
                            ChildrenHeight -= ShiftY;
                        }
                    });
                }
                TreeLeftX = Math.min(TreeLeftX, -ShiftX);
                ThisNode.ForEachVisibleChildren(function (SubNode) {
                    SubNode.RelativeX -= ShiftX;
                });

                TreeHeight += ChildrenHeight;
                TreeRightX = Math.max(TreeLeftX + ChildrenWidth, HeadRightX);
            }
            Shape.SetTreeRect(TreeLeftX, 0, TreeRightX - TreeLeftX, TreeHeight);
        };
        SimpleLayoutEngine.ContextHorizontalMargin = 32;
        SimpleLayoutEngine.ContextVerticalMargin = 10;
        SimpleLayoutEngine.ChildrenVerticalMargin = 64;
        SimpleLayoutEngine.ChildrenHorizontalMargin = 12;
        return SimpleLayoutEngine;
    })(LayoutEngine);
    AssureNote.SimpleLayoutEngine = SimpleLayoutEngine;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var NodeMenuItem = (function () {
        function NodeMenuItem(ElementId, ImagePath, Title, EventHandler) {
            this.ElementId = ElementId;
            this.ImagePath = ImagePath;
            this.Title = Title;
            this.EventHandler = EventHandler;
            this.boolean = false;
        }
        NodeMenuItem.prototype.EnableEventHandler = function (MenuBar) {
            var _this = this;
            MenuBar.Menu.append('<a href="#" ><img id="' + this.ElementId + '" src="' + Config.BASEPATH + this.ImagePath + '" title="' + this.Title + '" alt="' + this.Title + '" /></a>');
            $("#" + this.ElementId).click(function (event) {
                _this.EventHandler(event, MenuBar.CurrentView);
                MenuBar.Remove();
            });
        };
        return NodeMenuItem;
    })();
    AssureNote.NodeMenuItem = NodeMenuItem;

    var NodeMenu = (function (_super) {
        __extends(NodeMenu, _super);
        function NodeMenu(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
            this.IsEnable = false;
        }
        NodeMenu.prototype.CreateButtons = function (Contents) {
            var Count = 0;
            for (var i = 0; i < Contents.length; i++) {
                var Button = Contents[i];
                if (this.App.ModeManager.GetMode() == 1 /* View */ && !Button.IsEnableOnViewOnlyMode) {
                    continue;
                }
                Button.EnableEventHandler(this);
                Count++;
            }
            return Count;
        };

        NodeMenu.prototype.Create = function (CurrentView, ControlLayer, Contents) {
            var _this = this;
            this.IsEnable = true;
            this.CurrentView = CurrentView;
            $('#menu').remove();
            this.Menu = $('<div id="menu" style="display: none;"></div>');
            this.Menu.appendTo(ControlLayer);
            var EnableButtonCount = this.CreateButtons(Contents);
            if (EnableButtonCount > 0) {
                var refresh = function () {
                    AssureNote.AssureNoteApp.Assert(_this.CurrentView != null);
                    var Node = _this.CurrentView;
                    var Top = Node.GetGY() + Node.Shape.GetNodeHeight() + 5;
                    var Left = Node.GetGX() + (Node.Shape.GetNodeWidth() - _this.Menu.width()) / 2;
                    _this.Menu.css({ position: 'absolute', top: Top, left: Left, display: 'block', opacity: 0 });
                };

                this.Menu.jqDock({
                    align: 'bottom',
                    idle: 1500,
                    size: 45,
                    distance: 60,
                    labels: 'tc',
                    duration: 200,
                    fadeIn: 200,
                    source: function () {
                        return this.src.replace(/(jpg|gif)$/, 'png');
                    },
                    onReady: refresh
                });
            }
        };

        NodeMenu.prototype.Remove = function () {
            this.Menu.remove();
            this.Menu = null;
            this.CurrentView = null;
            this.IsEnable = false;
        };
        return NodeMenu;
    })(AssureNote.Panel);
    AssureNote.NodeMenu = NodeMenu;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var Plugin = (function () {
        function Plugin() {
            this.hasMenuBarButton = false;
            this.hasEditor = false;
            this.hasDoubleClicked = false;
        }
        Plugin.prototype.Display = function (PluginPanel, GSNDoc, Label) {
        };

        Plugin.prototype.OnNodeDoubleClicked = function (NodeView) {
        };

        Plugin.prototype.CreateMenuBarButton = function (NodeView) {
            return null;
        };

        Plugin.prototype.CreateMenuBarButtons = function (NodeView) {
            return null;
        };

        Plugin.prototype.CreateTooltipContents = function (NodeView) {
            return null;
        };

        Plugin.prototype.RenderHTML = function (NodeDoc, Model) {
            return NodeDoc;
        };

        Plugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
        };

        Plugin.prototype.SetHasMenuBarButton = function (b) {
            this.hasMenuBarButton = b;
        };

        Plugin.prototype.HasMenuBarButton = function () {
            return this.hasMenuBarButton;
        };

        Plugin.prototype.SetHasEditor = function (b) {
            this.hasEditor = b;
        };

        Plugin.prototype.HasEditor = function () {
            return this.hasEditor;
        };

        Plugin.prototype.SetHasDoubleClicked = function (b) {
            this.hasDoubleClicked = b;
        };

        Plugin.prototype.HasDoubleClicked = function () {
            return this.hasDoubleClicked;
        };
        return Plugin;
    })();
    AssureNote.Plugin = Plugin;

    function OnLoadPlugin(Callback) {
        PluginManager.OnLoadPlugin.push(Callback);
        if (PluginManager.Current != null) {
            PluginManager.Current.LoadPlugin();
        }
    }
    AssureNote.OnLoadPlugin = OnLoadPlugin;

    var PluginManager = (function () {
        function PluginManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.PluginMap = {};
            PluginManager.Current = this;
        }
        PluginManager.prototype.LoadPlugin = function () {
            for (var i = 0; i < PluginManager.OnLoadPlugin.length; i++) {
                PluginManager.OnLoadPlugin[i](this.AssureNoteApp);
            }
            PluginManager.OnLoadPlugin = [];
        };

        PluginManager.prototype.SetPlugin = function (Name, Plugin) {
            if (!this.PluginMap[Name]) {
                this.PluginMap[Name] = Plugin;
            } else {
                this.AssureNoteApp.DebugP("Plugin " + name + " already defined.");
            }
        };

        PluginManager.prototype.GetPanelPlugin = function (Name, Label) {
            return this.PluginMap[Name];
        };

        PluginManager.prototype.GetCommandPlugin = function (Name) {
            return this.PluginMap[Name];
        };

        PluginManager.prototype.GetMenuBarButtons = function (TargetView) {
            var _this = this;
            var ret = [];
            $.each(this.PluginMap, function (key, value) {
                if (value.HasMenuBarButton()) {
                    _this.AssureNoteApp.DebugP("Menu: key=" + key);
                    var Button = value.CreateMenuBarButton(TargetView);
                    if (Button != null) {
                        ret.push(Button);
                    }
                    var Buttons = value.CreateMenuBarButtons(TargetView);
                    if (Buttons != null) {
                        ret = ret.concat(Buttons);
                    }
                }
            });
            return ret;
        };

        PluginManager.prototype.GetTooltipContents = function (TargetView) {
            var ret = [];
            $.each(this.PluginMap, function (key, value) {
                var Tooltip = value.CreateTooltipContents(TargetView);
                if (Tooltip)
                    ret = ret.concat(Tooltip);
            });
            return ret;
        };

        PluginManager.prototype.GetDoubleClicked = function () {
            var ret = null;

            $.each(this.PluginMap, function (key, value) {
                if (value.HasDoubleClicked()) {
                    ret = value;
                    return false;
                }
            });
            return ret;
        };

        PluginManager.prototype.InvokeHTMLRenderPlugin = function (NodeDoc, Model) {
            $.each(this.PluginMap, function (key, value) {
                NodeDoc = value.RenderHTML(NodeDoc, Model);
            });
            return NodeDoc;
        };

        PluginManager.prototype.InvokeSVGRenderPlugin = function (ShapeGroup, NodeView) {
            $.each(this.PluginMap, function (key, value) {
                value.RenderSVG(ShapeGroup, NodeView);
            });
        };
        PluginManager.OnLoadPlugin = [];
        return PluginManager;
    })();
    AssureNote.PluginManager = PluginManager;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var CodeMirrorEditorPanel = (function (_super) {
        __extends(CodeMirrorEditorPanel, _super);
        function CodeMirrorEditorPanel(App, IsEditRecursive, TextArea, CodeMirrorConfig, Wrapper, WrapperCSS) {
            _super.call(this, App);
            this.App = App;
            this.IsEditRecursive = IsEditRecursive;
            this.Wrapper = Wrapper;
            this.WrapperCSS = WrapperCSS;
            this.Editor = CodeMirror.fromTextArea(TextArea, CodeMirrorConfig);
            $(this.Editor.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            this.Element = $(Wrapper);
            this.Element.css(WrapperCSS);
            this.Element.css({ display: "none" });
        }
        CodeMirrorEditorPanel.prototype.UpdateCSS = function (CSS) {
            this.Element.css(CSS);
        };

        CodeMirrorEditorPanel.prototype.EnableEditor = function (WGSN, NodeView, IsRecursive) {
            var _this = this;
            if (this.Timeout) {
                this.Element.removeClass();
                clearInterval(this.Timeout);
            }

            if (IsRecursive && (NodeView.Status == 1 /* SingleEditable */)) {
                return;
            }

            this.Timeout = null;
            var Model = NodeView.Model;
            this.App.FullScreenEditorPanel.IsVisible = false;
            this.App.SocketManager.StartEdit({ "UID": Model.UID, "IsRecursive": IsRecursive, "UserName": this.App.GetUserName() });

            var Callback = function (event) {
                _this.Element.blur();
            };
            var App = this.App;

            this.Editor.getDoc().setValue(WGSN);

            this.OnOutSideClicked = function () {
                _this.DisableEditor(NodeView, WGSN);
            };
            this.App.PictgramPanel.ContentLayer.addEventListener("pointerdown", this.OnOutSideClicked);
            this.App.PictgramPanel.ContentLayer.addEventListener("contextmenu", this.OnOutSideClicked);
            this.App.PictgramPanel.EventMapLayer.addEventListener("pointerdown", this.OnOutSideClicked);
            this.App.PictgramPanel.EventMapLayer.addEventListener("contextmenu", this.OnOutSideClicked);
            this.Element.css("opacity", 1).show();
            this.Editor.refresh();
            this.Editor.focus();
            this.Activate();
        };

        CodeMirrorEditorPanel.prototype.DisableEditor = function (OldNodeView, OldWGSN) {
            var WGSN = this.Editor.getDoc().getValue();
            this.App.MasterRecord.OpenEditor(this.App.GetUserName(), "todo", null, "test");
            var Node = this.App.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
            var NewNode;
            NewNode = Node.ReplaceSubNodeAsText(WGSN, this.IsEditRecursive);
            var Writer = new AssureNote.StringWriter();
            if (NewNode && NewNode.FormatSubNode(1, Writer, true), Writer.toString().trim() != OldWGSN.trim()) {
                this.App.MasterRecord.EditingDoc.RenumberAll();
                var TopGoal = this.App.MasterRecord.EditingDoc.TopNode;

                var NewNodeView = new AssureNote.NodeView(TopGoal, true);
                NewNodeView.SaveFlags(this.App.PictgramPanel.ViewMap);
                this.App.PictgramPanel.InitializeView(NewNodeView);
                this.App.PictgramPanel.Draw(null);

                this.App.FullScreenEditorPanel.IsVisible = true;
                this.App.SocketManager.UpdateWGSN();
                this.App.MasterRecord.CloseEditor();
            } else {
                this.App.MasterRecord.DiscardEditor();
            }
            this.App.SocketManager.Emit('finishedit', OldNodeView.Model.UID);
            $(this.Wrapper).animate({ opacity: 0 }, 300).hide(0);

            var Panel = this.App.PictgramPanel;

            Panel.ContentLayer.removeEventListener("pointerdown", this.OnOutSideClicked);
            Panel.ContentLayer.removeEventListener("contextmenu", this.OnOutSideClicked);
            Panel.EventMapLayer.removeEventListener("pointerdown", this.OnOutSideClicked);
            Panel.EventMapLayer.removeEventListener("contextmenu", this.OnOutSideClicked);

            Panel.Activate();
        };

        CodeMirrorEditorPanel.prototype.OnKeyDown = function (Event) {
            this.Editor.focus();
            if (Event.keyCode == 27) {
                Event.stopPropagation();
                this.OnOutSideClicked();
            }
        };
        return CodeMirrorEditorPanel;
    })(AssureNote.Panel);
    AssureNote.CodeMirrorEditorPanel = CodeMirrorEditorPanel;

    var SingleNodeEditorPanel = (function (_super) {
        __extends(SingleNodeEditorPanel, _super);
        function SingleNodeEditorPanel(App) {
            var TextArea = document.getElementById('singlenode-editor');
            var Wrapper = document.getElementById('singlenode-editor-wrapper');
            _super.call(this, App, false, TextArea, { lineNumbers: false, mode: 'wgsn', lineWrapping: true }, Wrapper, { position: "absolute" });
        }
        return SingleNodeEditorPanel;
    })(CodeMirrorEditorPanel);
    AssureNote.SingleNodeEditorPanel = SingleNodeEditorPanel;

    var WGSNEditorPanel = (function (_super) {
        __extends(WGSNEditorPanel, _super);
        function WGSNEditorPanel(App) {
            var TextArea = document.getElementById('editor');
            var Wrapper = document.getElementById('editor-wrapper');
            _super.call(this, App, true, TextArea, { lineNumbers: true, mode: 'wgsn', lineWrapping: true, extraKeys: { "Shift-Space": "autocomplete" } }, Wrapper, { position: "fixed", top: "5%", left: "5%", width: "90%", height: "90%" });
        }
        return WGSNEditorPanel;
    })(CodeMirrorEditorPanel);
    AssureNote.WGSNEditorPanel = WGSNEditorPanel;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var Command = (function () {
        function Command(App) {
            this.App = App;
        }
        Command.prototype.GetCommandLineNames = function () {
            return [];
        };

        Command.prototype.Invoke = function (CommandName, Params) {
        };

        Command.prototype.GetHelpHTML = function () {
            return "<code>" + this.GetCommandLineNames().pop() + "</code>";
        };

        Command.prototype.CanUseOnViewOnlyMode = function () {
            return false;
        };
        return Command;
    })();
    AssureNote.Command = Command;

    var CommandMissingCommand = (function (_super) {
        __extends(CommandMissingCommand, _super);
        function CommandMissingCommand(App) {
            _super.call(this, App);
        }
        CommandMissingCommand.prototype.Invoke = function (CommandName, Params) {
            if (CommandName == null) {
                return;
            }
            var Label = CommandName.toUpperCase();
            if (this.App.PictgramPanel.ViewMap == null) {
                this.App.DebugP("Jump is diabled.");
                return;
            }
            var Node = this.App.PictgramPanel.ViewMap[Label];
            if (CommandName == "" && Node == null) {
                Label = this.App.PictgramPanel.GetFocusedLabel();
                Node = this.App.PictgramPanel.ViewMap[Label];
            }
            if (Node != null) {
                if ($("#" + Label.replace(/\./g, "\\.")).length > 0) {
                    this.App.PictgramPanel.Viewport.SetCameraPosition(Node.GetCenterGX(), Node.GetCenterGY());
                    this.App.PictgramPanel.ChangeFocusedLabel(Label);
                } else {
                    this.App.DebugP("Invisible node " + Label + " Selected.");
                }
                return;
            }
            this.App.DebugP("undefined command: " + CommandName);
        };
        return CommandMissingCommand;
    })(Command);
    AssureNote.CommandMissingCommand = CommandMissingCommand;

    var SaveCommand = (function (_super) {
        __extends(SaveCommand, _super);
        function SaveCommand(App) {
            _super.call(this, App);
        }
        SaveCommand.prototype.GetCommandLineNames = function () {
            return ["w", "save"];
        };

        SaveCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            var Extention = Filename.split(".").pop();
            var SaveCommand = this.App.FindCommandByCommandLineName("save-as-" + Extention);
            if (SaveCommand) {
                SaveCommand.Invoke(CommandName, Params);
                return;
            }
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Filename);
        };

        SaveCommand.prototype.GetHelpHTML = function () {
            return "<code>save [name]</code><br>Save editing GSN.";
        };

        SaveCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveCommand;
    })(Command);
    AssureNote.SaveCommand = SaveCommand;

    var SaveWGSNCommand = (function (_super) {
        __extends(SaveWGSNCommand, _super);
        function SaveWGSNCommand(App) {
            _super.call(this, App);
            this.App = App;
        }
        SaveWGSNCommand.prototype.GetCommandLineNames = function () {
            return ["save-as-wgsn", "SaveAsWgsn"];
        };

        SaveWGSNCommand.prototype.GetHelpHTML = function () {
            return "<code>" + this.GetCommandLineNames()[0] + " [name]</code><br>Save editing GSN as WGSN file.";
        };

        SaveWGSNCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Filename);
        };

        SaveWGSNCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveWGSNCommand;
    })(Command);
    AssureNote.SaveWGSNCommand = SaveWGSNCommand;

    var SaveDCaseCommand = (function (_super) {
        __extends(SaveDCaseCommand, _super);
        function SaveDCaseCommand(App) {
            _super.call(this, App);
            this.App = App;
        }
        SaveDCaseCommand.prototype.GetCommandLineNames = function () {
            return ["save-as-dcase_model", "SaveAsDCaseModel"];
        };

        SaveDCaseCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".dcase_model");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToDCaseXML(this.App.MasterRecord.GetLatestDoc().TopNode), Filename);
        };

        SaveDCaseCommand.prototype.GetHelpHTML = function () {
            return "<code>" + this.GetCommandLineNames()[0] + " [name]</code><br>Save editing GSN as dcase_model file.";
        };

        SaveDCaseCommand.prototype.ConvertToDCaseXML = function (root) {
            var dcaseNS = "http://www.dependable-os.net/2013/11/dcase_model/";
            var xsiNS = "http://www.w3.org/2001/XMLSchema-instance";

            var DCaseArgumentXML = document.createElementNS(dcaseNS, "dcase:Argument");
            DCaseArgumentXML.setAttribute("xmlns:dcase", dcaseNS);
            DCaseArgumentXML.setAttribute("xmlns:xsi", xsiNS);
            DCaseArgumentXML.setAttribute("id", "_6A0EENScEeKCdP-goLYu9g");

            var NodeFragment = document.createDocumentFragment();
            var LinkFragment = document.createDocumentFragment();

            function NodeTypeToString(type) {
                switch (type) {
                    case 0 /* Goal */:
                        return "Goal";
                    case 2 /* Strategy */:
                        return "Strategy";
                    case 3 /* Evidence */:
                        return "Evidence";
                    case 1 /* Context */:
                        return "Context";
                    default:
                        return "";
                }
            }

            function Convert(node) {
                var Label = node.GetLabel();
                var UID = node.UID.toString();

                var NodeXML = document.createElementNS(dcaseNS, "rootBasicNode");
                NodeXML.setAttribute("xsi:type", "dcase:" + NodeTypeToString(node.NodeType));
                NodeXML.setAttribute("id", UID);
                NodeXML.setAttribute("name", Label);
                NodeXML.setAttribute("desc", node.NodeDoc.replace(/^\s*(.*?)\s*$/, "$1").replace(/\r/g, "&#xD;").replace(/\n/g, "&#xA;"));

                NodeFragment.appendChild(NodeXML);

                if (node.ParentNode != null && node != root) {
                    var ParentUID = node.ParentNode.UID.toString();
                    var linkId = "LINK_" + ParentUID + "_" + UID;
                    var LinkXML = document.createElementNS(dcaseNS, "rootBasicLink");
                    if (node.NodeType == 1 /* Context */) {
                        LinkXML.setAttribute("xsi:type", "dcase:InContextOf");
                    } else {
                        LinkXML.setAttribute("xsi:type", "dcase:SupportedBy");
                    }
                    LinkXML.setAttribute("id", linkId);
                    LinkXML.setAttribute("name", linkId);
                    LinkXML.setAttribute("source", "#" + ParentUID);
                    LinkXML.setAttribute("target", "#" + UID);

                    LinkFragment.appendChild(LinkXML);
                }
                if (node.SubNodeList) {
                    for (var i = 0; i < node.SubNodeList.length; i++) {
                        Convert(node.SubNodeList[i]);
                    }
                }
            }

            Convert(root);

            DCaseArgumentXML.appendChild(NodeFragment);
            DCaseArgumentXML.appendChild(LinkFragment);

            var DummyNode = document.createElement("div");
            DummyNode.appendChild(DCaseArgumentXML);
            return '<?xml version="1.0" encoding="UTF-8"?>\n' + DummyNode.innerHTML.replace(/>/g, ">\n").replace(/&amp;#x/g, "&#x");
        };

        SaveDCaseCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveDCaseCommand;
    })(Command);
    AssureNote.SaveDCaseCommand = SaveDCaseCommand;

    var SaveSVGCommand = (function (_super) {
        __extends(SaveSVGCommand, _super);
        function SaveSVGCommand(App) {
            _super.call(this, App);
        }
        SaveSVGCommand.prototype.GetCommandLineNames = function () {
            return ["saveassvg", "save-as-svg"];
        };

        SaveSVGCommand.prototype.Invoke = function (CommandName, Params) {
            var Filename = Params.length > 0 ? Params[0] : this.App.WGSNName.replace(/(\.\w+)?$/, ".svg");
            AssureNote.AssureNoteUtils.SaveAs(this.ConvertToSVG(this.App.PictgramPanel.TopNodeView), Filename);
        };

        SaveSVGCommand.prototype.GetHelpHTML = function () {
            return "<code>save-as-svg [name]</code><br>Save editing GSN as SVG file.";
        };

        SaveSVGCommand.prototype.ConvertToSVG = function (TopView) {
            var SVG_NS = "http://www.w3.org/2000/svg";
            var $svg = $('<svg width="' + (TopView.Shape.GetTreeWidth() + 20) + 'px" height="' + (TopView.Shape.GetTreeHeight() + 20) + 'px" version="1.1" xmlns="' + SVG_NS + '">');
            $svg.append($("svg defs").clone(false));

            this.App.PictgramPanel.ForceAppendAllOutOfScreenNode();

            var $target = $(AssureNote.AssureNoteUtils.CreateSVGElement("g")).attr("transform", "translate(" + (10 - TopView.Shape.GetTreeLeftLocalX()) + " 10) scale(1)").appendTo($svg);
            TopView.TraverseVisibleNode(function (nodeView) {
                var svg = nodeView.Shape.ShapeGroup;
                var connector = nodeView.Shape.ArrowPath;
                var SVGStyle = window.getComputedStyle(svg, null);
                var Style = window.getComputedStyle(nodeView.Shape.Content, null);
                var LableStyle = window.getComputedStyle($(nodeView.Shape.Content).find("h4")[0], null);

                $target.append($(svg).clone(false).attr({ "fill": "none", "stroke": "#000000" }));
                if (nodeView != TopView) {
                    $target.append($(connector).clone(false));
                }

                var TextX = nodeView.GetGX() + parseInt(Style.paddingLeft);
                var TextY = nodeView.GetGY() + parseInt(Style.paddingTop);
                var LableDy = parseInt(LableStyle.marginTop) + parseInt(LableStyle.fontSize);
                var FirstLineDy = parseInt(LableStyle.marginBottom) + parseInt(LableStyle.lineHeight);
                var LineDy = parseInt(Style.lineHeight);
                var LineFontSize = parseInt(Style.fontSize);

                var $svgtext = $(AssureNote.AssureNoteUtils.CreateSVGElement("text")).attr({ x: TextX, y: TextY });

                function CreateTSpan(Text) {
                    return $(AssureNote.AssureNoteUtils.CreateSVGElement("tspan")).text(Text);
                }

                CreateTSpan(nodeView.Label).attr({ "x": TextX, dy: LableDy, "font-size": LableStyle.fontSize, "font-weight": "bold", "font-family": 'Arial, Meiryo' }).appendTo($svgtext);

                var MaxNumberOfCharInLine = 1 + ~~((nodeView.Shape.GetNodeWidth() - 2 * parseInt(Style.paddingLeft)) * 2 / LineFontSize);
                var firstLine = true;
                AssureNote.AssureNoteUtils.ForeachLine(nodeView.NodeDoc, MaxNumberOfCharInLine, function (linetext) {
                    CreateTSpan(linetext).attr({ x: TextX, dy: firstLine ? FirstLineDy : LineDy, "font-size": Style.fontSize, "font-family": 'Arial, Meiryo' }).appendTo($svgtext);
                    firstLine = false;
                });

                $target.append($svgtext);
            });
            var $dummydiv = $("<div>").append($svg);
            var header = '<?xml version="1.0" standalone="no"?>\n' + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n';
            var doc = header + $dummydiv.html();
            $svg.empty().remove();
            return doc;
        };

        SaveSVGCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SaveSVGCommand;
    })(Command);
    AssureNote.SaveSVGCommand = SaveSVGCommand;

    var NewCommand = (function (_super) {
        __extends(NewCommand, _super);
        function NewCommand(App) {
            _super.call(this, App);
        }
        NewCommand.prototype.GetCommandLineNames = function () {
            return ["new"];
        };

        NewCommand.prototype.GetDisplayName = function () {
            return "New";
        };

        NewCommand.prototype.GetHelpHTML = function () {
            return "<code>new [name]</code><br>Create new file.";
        };

        NewCommand.prototype.Invoke = function (CommandName, Params) {
            var History = new AssureNote.GSNHistory(0, this.App.GetUserName(), 'todo', null, 'test', null);
            var Writer = new AssureNote.StringWriter();
            AssureNote.TagUtils.FormatHistoryTag([History], 0, Writer);
            console.log(Writer.toString());
            var WGSN = Writer.toString() + 'Revision:: 0\n*G';
            if (Params.length > 0) {
                this.App.LoadNewWGSN(Params[0], WGSN);
            } else {
                var Name = prompt("Enter the file name");
                if (Name != null) {
                    if (Name == "") {
                        Name = "default.wgsn";
                    }
                    this.App.LoadNewWGSN(Name, WGSN);
                }
            }
        };
        return NewCommand;
    })(Command);
    AssureNote.NewCommand = NewCommand;

    var UnfoldAllCommand = (function (_super) {
        __extends(UnfoldAllCommand, _super);
        function UnfoldAllCommand(App) {
            _super.call(this, App);
        }
        UnfoldAllCommand.prototype.GetCommandLineNames = function () {
            return ["unfoldAll", "unfold-all"];
        };

        UnfoldAllCommand.prototype.GetHelpHTML = function () {
            return "<code>unfold-all</code><br>Unfold all folded Goals";
        };

        UnfoldAllCommand.prototype.Invoke = function (CommandName, Params) {
            var TopView = this.App.PictgramPanel.TopNodeView;
            var unfoldAll = function (TargetView) {
                TargetView.SetIsFolded(false);
                TargetView.ForEachVisibleChildren(function (SubNode) {
                    unfoldAll(SubNode);
                });
            };
            unfoldAll(TopView);
            this.App.PictgramPanel.Draw();
        };

        UnfoldAllCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return UnfoldAllCommand;
    })(Command);
    AssureNote.UnfoldAllCommand = UnfoldAllCommand;

    var SetColorCommand = (function (_super) {
        __extends(SetColorCommand, _super);
        function SetColorCommand(App) {
            _super.call(this, App);
        }
        SetColorCommand.prototype.GetCommandLineNames = function () {
            return ["setcolor", "set-color"];
        };

        SetColorCommand.prototype.GetHelpHTML = function () {
            return "<code>set-color label color</code><br>Change node color.";
        };

        SetColorCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length > 1) {
                var TargetLabel = Params[0];
                var Color = Params[1];
                if (this.App.PictgramPanel.ViewMap == null) {
                    console.log("'set color' is disabled.");
                } else {
                    var Node = this.App.PictgramPanel.ViewMap[TargetLabel];
                    if (Node != null) {
                        $("#" + TargetLabel + " h4").css("background-color", Color);
                    }
                }
            }
        };
        return SetColorCommand;
    })(Command);
    AssureNote.SetColorCommand = SetColorCommand;

    var SetScaleCommand = (function (_super) {
        __extends(SetScaleCommand, _super);
        function SetScaleCommand(App) {
            _super.call(this, App);
        }
        SetScaleCommand.prototype.GetCommandLineNames = function () {
            return ["setscale", "set-scale"];
        };

        SetScaleCommand.prototype.GetHelpHTML = function () {
            return "<code>set-scale scale</code><br>Change scale.";
        };

        SetScaleCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length > 0) {
                this.App.PictgramPanel.Viewport.SetCameraScale(Params[0] - 0);
            }
        };

        SetScaleCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SetScaleCommand;
    })(Command);
    AssureNote.SetScaleCommand = SetScaleCommand;

    var CommitCommand = (function (_super) {
        __extends(CommitCommand, _super);
        function CommitCommand(App) {
            _super.call(this, App);
        }
        CommitCommand.prototype.GetCommandLineNames = function () {
            return ["commit"];
        };

        CommitCommand.prototype.GetHelpHTML = function () {
            return "<code>commit</code><br>Commit.";
        };

        CommitCommand.prototype.Invoke = function (CommandName, Params) {
            var message = "Default message";
            if (Params.length >= 1)
                message = Params.join(" ");
            this.App.MasterRecord.Commit(message);
        };
        return CommitCommand;
    })(Command);
    AssureNote.CommitCommand = CommitCommand;

    var OpenCommand = (function (_super) {
        __extends(OpenCommand, _super);
        function OpenCommand(App) {
            _super.call(this, App);
        }
        OpenCommand.prototype.GetCommandLineNames = function () {
            return ["e", "open"];
        };

        OpenCommand.prototype.GetHelpHTML = function () {
            return "<code>open</code><br>Open a file.";
        };

        OpenCommand.prototype.Invoke = function (CommandName, Params) {
            var _this = this;
            $("#file-open-dialog").change(function (e) {
                var target = e.target || e.srcElement;
                _this.App.LoadFiles(target.files);
            });
            $("#file-open-dialog").click();
        };
        return OpenCommand;
    })(Command);
    AssureNote.OpenCommand = OpenCommand;

    var HelpCommand = (function (_super) {
        __extends(HelpCommand, _super);
        function HelpCommand(App) {
            _super.call(this, App);
        }
        HelpCommand.prototype.GetCommandLineNames = function () {
            return ["help", "?"];
        };

        HelpCommand.prototype.GetHelpHTML = function () {
            return "<code>help [name]</code><br>Show this message.";
        };

        HelpCommand.prototype.Invoke = function (CommandName, Params) {
            var Helps = jQuery.map(this.App.Commands, function (Command, i) {
                return Command.GetHelpHTML();
            }).sort();
            $("#help-modal ul").empty().append("<li>" + Helps.join("</li><li>") + "</li>");
            $("#help-modal .modal-body").css({ "overflow-y": "scroll", "height": this.App.PictgramPanel.Viewport.GetPageHeight() * 0.6 });
            $("#help-modal").modal();
        };

        HelpCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return HelpCommand;
    })(Command);
    AssureNote.HelpCommand = HelpCommand;

    var ShareCommand = (function (_super) {
        __extends(ShareCommand, _super);
        function ShareCommand(App) {
            _super.call(this, App);
        }
        ShareCommand.prototype.GetCommandLineNames = function () {
            return ["share"];
        };

        ShareCommand.prototype.GetHelpHTML = function () {
            return "<code>share</code><br>Share editing GSN to the server(online version only).";
        };

        ShareCommand.prototype.Invoke = function (CommandName, Params) {
            var _this = this;
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            this.App.SetLoading(true);
            AssureNote.AssureNoteUtils.postJsonRPC("upload", { content: Writer.toString() }, function (result) {
                window.location.href = Config.BASEPATH + "/file/" + result.fileId;
            }, function () {
                _this.App.SetLoading(false);
            });
        };

        ShareCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return ShareCommand;
    })(Command);
    AssureNote.ShareCommand = ShareCommand;

    var SetGuestUserNameCommand = (function (_super) {
        __extends(SetGuestUserNameCommand, _super);
        function SetGuestUserNameCommand(App) {
            _super.call(this, App);
        }
        SetGuestUserNameCommand.prototype.GetCommandLineNames = function () {
            return ["set-user", "setuser"];
        };

        SetGuestUserNameCommand.prototype.Invoke = function (CommandName, Params) {
            var Name = Params[0];
            if (!Name || Name == '') {
                Name = prompt('Enter the new name for guest', '');
            }
            if (!Name || Name == '') {
                Name = 'Guest';
            }
            this.App.SetUserName(Name);
        };

        SetGuestUserNameCommand.prototype.GetHelpHTML = function () {
            return "<code>set-user [name]</code><br>Rename guest user.";
        };

        SetGuestUserNameCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SetGuestUserNameCommand;
    })(Command);
    AssureNote.SetGuestUserNameCommand = SetGuestUserNameCommand;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var FullScreenEditorCommand = (function (_super) {
        __extends(FullScreenEditorCommand, _super);
        function FullScreenEditorCommand() {
            _super.apply(this, arguments);
        }
        FullScreenEditorCommand.prototype.GetCommandLineNames = function () {
            return ["edit"];
        };

        FullScreenEditorCommand.prototype.GetHelpHTML = function () {
            return "<code>edit [label]</code><br>Open editor.";
        };

        FullScreenEditorCommand.prototype.Invoke = function (CommandName, Params) {
            var Label;
            if (Params.length < 1) {
                Label = this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel();
            } else {
                Label = Params[0].toUpperCase();
            }
            var event = document.createEvent("UIEvents");
            var TargetView = this.App.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                if (TargetView.GetNodeType() == 2 /* Strategy */) {
                    this.App.DebugP("Strategy " + Label + " cannot open FullScreenEditor.");
                    return;
                }
                var Writer = new AssureNote.StringWriter();
                TargetView.Model.FormatSubNode(1, Writer, true);
                this.App.FullScreenEditorPanel.EnableEditor(Writer.toString().trim(), TargetView, true);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        };
        return FullScreenEditorCommand;
    })(AssureNote.Command);
    AssureNote.FullScreenEditorCommand = FullScreenEditorCommand;

    var FullScreenEditorPlugin = (function (_super) {
        __extends(FullScreenEditorPlugin, _super);
        function FullScreenEditorPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.SetHasMenuBarButton(true);
            this.SetHasEditor(true);
            this.AssureNoteApp.RegistCommand(new FullScreenEditorCommand(this.AssureNoteApp));
        }
        FullScreenEditorPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            var _this = this;
            if (NodeView.GetNodeType() == 2 /* Strategy */) {
                return null;
            }
            return new AssureNote.NodeMenuItem("fullscreeneditor-id", "/images/editor.png", "fullscreeneditor", function (event, TargetView) {
                var Command = _this.AssureNoteApp.FindCommandByCommandLineName("edit");
                if (Command) {
                    Command.Invoke(null, [TargetView.Label]);
                }
            });
        };

        FullScreenEditorPlugin.prototype.MoveBackgroundNode = function (doc) {
            var UID = null;
            var line = doc.getCursor().line;
            while (line >= 0) {
                var LineString = doc.getLine(line);
                if (LineString.indexOf('*') == 0) {
                    UID = AssureNote.WikiSyntax.ParseUID(LineString);
                    break;
                }
                line -= 1;
            }
            if (UID != null) {
                var Keys = Object.keys(this.AssureNoteApp.PictgramPanel.ViewMap);
                for (var i in Keys) {
                    var View = this.AssureNoteApp.PictgramPanel.ViewMap[Keys[i]];

                    if (View && View.Model && AssureNote.Lib.DecToHex(View.Model.UID) == UID) {
                        console.log(View.GetCenterGX() + ' ' + View.GetCenterGY());
                        this.AssureNoteApp.PictgramPanel.Viewport.SetCameraPosition(View.GetCenterGX(), View.GetCenterGY());
                    }
                }
            }
        };
        return FullScreenEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.FullScreenEditorPlugin = FullScreenEditorPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    App.PluginManager.SetPlugin("open", new AssureNote.FullScreenEditorPlugin(App));
});
var AssureNote;
(function (AssureNote) {
    var SingleNodeEditorCommand = (function (_super) {
        __extends(SingleNodeEditorCommand, _super);
        function SingleNodeEditorCommand(App) {
            _super.call(this, App);
        }
        SingleNodeEditorCommand.prototype.GetCommandLineNames = function () {
            return ["singleedit"];
        };

        SingleNodeEditorCommand.prototype.GetHelpHTML = function () {
            return "<code>singleedit [label]</code><br>Open single node editor.";
        };

        SingleNodeEditorCommand.prototype.Invoke = function (CommandName, Params) {
            var Label;
            if (Params.length < 1) {
                Label = this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel();
            } else {
                Label = Params[0].toUpperCase();
            }
            var event = document.createEvent("UIEvents");
            var NodeView = this.App.PictgramPanel.ViewMap[Label];
            if (NodeView != null) {
                var Writer = new AssureNote.StringWriter();
                NodeView.Model.FormatSubNode(1, Writer, false);
                var Top = NodeView.GetGY();
                var Left = NodeView.GetGX();
                var Width = NodeView.GetShape().GetNodeWidth();
                var Height = Math.max(50, NodeView.GetShape().GetNodeHeight());
                var StrokeWidth = Number($(NodeView.Shape.ShapeGroup).css('stroke-width').charAt(0));
                var CSS = {
                    position: "fixed",
                    top: Top - (StrokeWidth / 2) + "px",
                    left: Left - (StrokeWidth / 2) + "px",
                    width: Width + StrokeWidth + "px",
                    height: Height + StrokeWidth + "px",
                    background: "rgba(255, 255, 255, 1.00)"
                };
                var Scale = this.App.PictgramPanel.Viewport.GetCameraScale();
                if (Scale < 1.0) {
                    CSS["mozTransform"] = CSS["msTransform"] = CSS["webkitTransform"] = CSS["transform"] = "scale(" + (1 / Scale) + ")";
                } else {
                    CSS["mozTransform"] = CSS["msTransform"] = CSS["webkitTransform"] = CSS["transform"] = "";
                }
                this.App.SingleNodeEditorPanel.UpdateCSS(CSS);
                this.App.SingleNodeEditorPanel.EnableEditor(Writer.toString().trim(), NodeView, false);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        };
        return SingleNodeEditorCommand;
    })(AssureNote.Command);
    AssureNote.SingleNodeEditorCommand = SingleNodeEditorCommand;
    var SingleNodeEditorPlugin = (function (_super) {
        __extends(SingleNodeEditorPlugin, _super);
        function SingleNodeEditorPlugin(App) {
            _super.call(this);
            this.App = App;
            this.SetHasMenuBarButton(true);
            this.SetHasEditor(true);
            this.SetHasDoubleClicked(true);

            this.App.RegistCommand(new SingleNodeEditorCommand(this.App));
        }
        SingleNodeEditorPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            var _this = this;
            return new AssureNote.NodeMenuItem("singlenodeeditor-id", "/images/pencil.png", "editor", function (event, TargetView) {
                var Command = _this.App.FindCommandByCommandLineName("SingleEdit");
                if (Command) {
                    Command.Invoke(null, [TargetView.Label]);
                }
            });
        };

        SingleNodeEditorPlugin.prototype.OnNodeDoubleClicked = function (NodeView) {
            if (AssureNote.AssureNoteApp.Current.ModeManager.GetMode() == 0 /* Edit */) {
                var Command = this.App.FindCommandByCommandLineName("SingleEdit");
                if (Command) {
                    Command.Invoke(null, [NodeView.Label]);
                }
            }
        };
        return SingleNodeEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.SingleNodeEditorPlugin = SingleNodeEditorPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    App.PluginManager.SetPlugin("open-single", new AssureNote.SingleNodeEditorPlugin(App));
});
var AssureNote;
(function (AssureNote) {
    var CommandParser = (function () {
        function CommandParser() {
        }
        CommandParser.prototype.Parse = function (line) {
            var s = line.split(/\s+/);
            if (s.length > 0) {
                if (s[0][0] == null) {
                    this.Method = "";
                    return;
                }
                this.RawString = line;
                if (s[0][0].match(/\//) != null) {
                    this.Method = "search";
                    this.Args = [];
                    this.Args.push(line.slice(1));
                    return;
                } else if (s[0][0].match(/:/) != null) {
                    this.Method = s[0].slice(1);
                    if (s.length > 1) {
                        this.Args = s.slice(1);
                    }
                } else if (s[0][0].match(/@/) != null) {
                    this.Method = "message";
                    this.Args = [];
                    this.Args.push(line.slice(1));
                }
            }
        };

        CommandParser.prototype.GetRawString = function () {
            return this.RawString;
        };

        CommandParser.prototype.GetMethod = function () {
            AssureNote.AssureNoteApp.Assert(this.Method != null);
            return this.Method;
        };

        CommandParser.prototype.GetArgs = function () {
            if (this.Args == null) {
                this.Args = [];
            }
            return this.Args;
        };

        CommandParser.prototype.GetArg = function (n) {
            return this.Args[n];
        };
        return CommandParser;
    })();
    AssureNote.CommandParser = CommandParser;

    var CommandLine = (function (_super) {
        __extends(CommandLine, _super);
        function CommandLine(App) {
            _super.call(this, App);
            this.App = App;
            this.Element = $("#command-line");
            this.IsEnable = true;
            this.IsVisible = false;
            this.HistoryList = [];
            this.HistoryIndex = 0;
        }
        CommandLine.prototype.Enable = function () {
            this.IsEnable = true;
        };

        CommandLine.prototype.Disable = function () {
            this.IsEnable = false;
            this.Hide();
        };

        CommandLine.prototype.Clear = function () {
            this.Element.val("");
        };

        CommandLine.prototype.Show = function () {
            this.Element.css("display", "block");
            this.Element.focus();
            this.HistoryIndex = 0;
            this.IsVisible = true;
        };

        CommandLine.prototype.Hide = function () {
            this.Element.css("display", "none");
            this.IsVisible = false;
        };

        CommandLine.prototype.GetValue = function () {
            return this.Element.val();
        };

        CommandLine.prototype.AddHistory = function (line) {
            this.HistoryList.splice(0, 0, line);
        };

        CommandLine.prototype.SaveHistory = function () {
            localStorage.setItem("commandline:history", JSON.stringify(this.HistoryList));
        };

        CommandLine.prototype.LoadHistory = function () {
            var list = localStorage.getItem("commandline:history");
            if (list != null) {
                this.HistoryList = JSON.parse(list);
            }
        };

        CommandLine.prototype.OnActivate = function () {
            this.Show();
        };

        CommandLine.prototype.OnDeactivate = function () {
            this.Hide();
            this.Clear();
        };

        CommandLine.prototype.ShowNextHistory = function () {
            if (this.HistoryIndex > 0) {
                this.HistoryIndex -= 1;
                this.Element.val(this.HistoryList[this.HistoryIndex]);
            } else if (this.HistoryIndex == 0) {
                this.Element.val(":");
            }
        };

        CommandLine.prototype.ShowPrevHistory = function () {
            if (this.HistoryIndex < this.HistoryList.length) {
                this.Element.val(this.HistoryList[this.HistoryIndex]);
                this.HistoryIndex += 1;
            }
        };

        CommandLine.prototype.IsEmpty = function () {
            return this.Element.val() == "";
        };

        CommandLine.prototype.OnKeyDown = function (Event) {
            var handled = true;
            switch (Event.keyCode) {
                case 27:
                    this.App.PictgramPanel.Activate();
                    Event.preventDefault();
                    break;
                case 38:
                    this.ShowPrevHistory();
                    break;
                case 40:
                    this.ShowNextHistory();
                    break;
                case 8:
                    if (this.IsEmpty()) {
                        this.App.PictgramPanel.Activate();
                        Event.preventDefault();
                        break;
                    }
                    break;
                case 13:
                    Event.preventDefault();
                    var ParsedCommand = new CommandParser();
                    ParsedCommand.Parse(this.GetValue());
                    if (ParsedCommand.GetMethod() == "search") {
                        this.App.PictgramPanel.Search.Search(this.App.PictgramPanel.TopNodeView, ParsedCommand.GetArgs()[0]);
                    }
                    this.App.ExecCommand(ParsedCommand);
                    this.AddHistory(ParsedCommand.GetRawString());
                    if (this.IsActive()) {
                        this.App.PictgramPanel.Activate();
                    }
                    break;
                default:
                    handled = false;
                    break;
            }
            if (handled) {
                Event.stopPropagation();
            }
        };
        return CommandLine;
    })(AssureNote.Panel);
    AssureNote.CommandLine = CommandLine;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var PictgramPanel = (function (_super) {
        __extends(PictgramPanel, _super);
        function PictgramPanel(App) {
            var _this = this;
            _super.call(this, App);
            this.App = App;
            this.OnScreenNodeMap = {};
            this.HiddenNodeMap = {};
            this.FoldingAnimationTask = new AssureNote.AnimationFrameTask();
            this.SVGLayerBox = document.getElementById("svglayer-box");
            this.SVGLayer = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayerConnectorGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayerNodeGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayer.appendChild(this.SVGLayerConnectorGroup);
            this.SVGLayer.appendChild(this.SVGLayerNodeGroup);
            this.SVGLayer.id = "svg-layer";
            this.SVGLayer.setAttribute("transform", "translate(0,0)");
            this.SVGLayerBox.appendChild(this.SVGLayer);
            this.HiddenNodeBuffer = document.createDocumentFragment();
            this.EventMapLayer = (document.getElementById("eventmap-layer"));
            this.ContentLayer = (document.getElementById("content-layer"));
            this.ControlLayer = (document.getElementById("control-layer"));
            this.Viewport = new AssureNote.ViewportManager(this.SVGLayer, this.EventMapLayer, this.ContentLayer, this.ControlLayer);
            this.LayoutEngine = new AssureNote.SimpleLayoutEngine(this.App);

            this.Viewport.AddEventListener("cameramove", function () {
                _this.UpdateHiddenNodeList();
            });

            this.ContextMenu = new AssureNote.NodeMenu(App);
            this.NodeTooltip = new AssureNote.Tooltip(App);

            this.ContentLayer.addEventListener("click", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                _this.App.DebugP("click:" + Label);
                if (_this.IsActive()) {
                    _this.ChangeFocusedLabel(Label);
                } else {
                    _this.App.SocketManager.Emit("focusednode", Label);
                }
                if (_this.ContextMenu.IsEnable) {
                    _this.ContextMenu.Remove();
                }
                if (_this.NodeTooltip.IsEnable) {
                    _this.NodeTooltip.Remove();
                }
                event.stopPropagation();
                event.preventDefault();
            });

            this.EventMapLayer.addEventListener("pointerdown", function (event) {
                if (_this.IsActive()) {
                    _this.ChangeFocusedLabel(null);
                }
            });

            this.ContentLayer.addEventListener("contextmenu", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null) {
                    _this.ChangeFocusedLabel(Label);
                    switch (NodeView.Status) {
                        case 0 /* TreeEditable */:
                            var Buttons = _this.App.PluginManager.GetMenuBarButtons(NodeView);
                            _this.ContextMenu.Create(_this.ViewMap[Label], _this.ControlLayer, Buttons);
                            break;
                        case 1 /* SingleEditable */:
                            var Buttons = _this.App.PluginManager.GetMenuBarButtons(NodeView);
                            _this.ContextMenu.Create(_this.ViewMap[Label], _this.ControlLayer, Buttons);
                            break;
                        case 2 /* Locked */:
                            $.notify("Warning: currently edited", 'warn');
                            break;
                    }
                } else {
                    _this.FocusedLabel = null;
                }
                event.preventDefault();
            });

            this.ContentLayer.addEventListener("dblclick", function (event) {
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                _this.App.DebugP("double click:" + Label);
                if (_this.ContextMenu.IsEnable) {
                    _this.ContextMenu.Remove();
                }
                if (_this.NodeTooltip.IsEnable) {
                    _this.NodeTooltip.Remove();
                }
                _this.App.ExecDoubleClicked(NodeView);
                event.stopPropagation();
                event.preventDefault();
            });

            this.CmdLine = new AssureNote.CommandLine(App);
            this.Search = new AssureNote.SearchResultNodeList(this);

            var ToolTipFocusedLabel = null;
            this.ContentLayer.addEventListener("mouseover", function (event) {
                if (_this.App.FullScreenEditorPanel.IsActive()) {
                    return;
                }
                var Label = AssureNote.AssureNoteUtils.GetNodeLabelFromEvent(event);
                var NodeView = _this.ViewMap[Label];
                if (NodeView != null && ToolTipFocusedLabel != Label) {
                    ToolTipFocusedLabel = Label;
                    var Tooltips = _this.App.PluginManager.GetTooltipContents(NodeView);
                    _this.NodeTooltip.Create(NodeView, _this.ControlLayer, Tooltips);
                }
            });

            this.ContentLayer.addEventListener("mouseleave", function (event) {
                if (_this.NodeTooltip.IsEnable) {
                    _this.NodeTooltip.Remove();
                    ToolTipFocusedLabel = null;
                }
            });

            var DragHandler = function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (_this.IsActive()) {
                    event.dataTransfer.dropEffect = "move";
                } else {
                    event.dataTransfer.dropEffect = "none";
                }
            };
            document.addEventListener("dragenter", DragHandler, true);
            document.addEventListener("dragover", DragHandler, true);
            document.addEventListener("dragleave", DragHandler, true);
            document.addEventListener("drop", function (event) {
                event.stopPropagation();
                event.preventDefault();
                if (_this.IsActive()) {
                    _this.App.LoadFiles(event.dataTransfer.files);
                }
            }, true);

            this.Viewport.ScrollManager.OnDragged = function (Viewport) {
                if (!_this.TopNodeView) {
                    return;
                }
                var HitBoxCenter = new AssureNote.Point(Viewport.GXFromPageX(Viewport.GetPageCenterX()), Viewport.GYFromPageY(Viewport.GetPageHeight() / 3));
                _this.TopNodeView.TraverseVisibleNode(function (Node) {
                    if (Node.IsFolded()) {
                        var DX = HitBoxCenter.X - Node.GetCenterGX();
                        var DY = HitBoxCenter.Y - Node.GetCenterGY();
                        var R = 150 / _this.Viewport.GetCameraScale();
                        if (DX * DX + DY * DY < R * R) {
                            var FoldCommand = _this.App.FindCommandByCommandLineName("fold");
                            if (FoldCommand) {
                                FoldCommand.Invoke(null, [Node.Label]);
                            }
                            return false;
                        }
                    }
                });
            };
            this.Viewport.ScrollManager.OnStartDrag = function (Viewport) {
                $("#auto-expand-area").show(100);
                $(".dropdown.open > .dropdown-toggle").dropdown("toggle");
            };
            this.Viewport.ScrollManager.OnEndDrag = function (Viewport) {
                $("#auto-expand-area").hide(100);
            };
        }
        PictgramPanel.prototype.OnKeyDown = function (Event) {
            var Label;
            var handled = true;
            switch (Event.keyCode) {
                case 58:
                case 186:
                case 191:
                case 219:
                    if (this.Search.IsVisiting()) {
                        this.Search.FinishVisit();
                    }
                    this.CmdLine.Activate();
                    break;
                case 27:
                    if (this.Search.IsVisiting()) {
                        this.Search.FinishVisit();
                        Event.preventDefault();
                    }
                    if (this.App.HistoryPanel) {
                        this.App.HistoryPanel.Hide();
                    }
                    break;
                case 13:
                    if (this.Search.IsVisiting()) {
                        this.Search.VisitNext(event.shiftKey);
                        Event.preventDefault();
                    } else {
                        var EditCommand = this.App.FindCommandByCommandLineName(Event.shiftKey ? "edit" : "singleedit");
                        if (EditCommand && this.FocusedLabel) {
                            EditCommand.Invoke(null, [this.FocusedLabel]);
                        }
                        Event.preventDefault();
                    }
                    break;
                case 72:
                case 37:
                    this.NavigateLeft();
                    Event.preventDefault();
                    break;
                case 74:
                case 40:
                    this.NavigateDown();
                    Event.preventDefault();
                    break;
                case 75:
                case 38:
                    this.NavigateUp();
                    Event.preventDefault();
                    break;
                case 76:
                case 39:
                    this.NavigateRight();
                    Event.preventDefault();
                    break;
                case 36:
                    this.NavigateHome();
                    Event.preventDefault();
                    break;
                case 32:
                case 70:
                    var FoldCommand = this.App.FindCommandByCommandLineName("fold");
                    if (FoldCommand && this.FocusedLabel) {
                        FoldCommand.Invoke(null, [this.FocusedLabel]);
                    }
                    Event.preventDefault();
                    break;
                case 65:
                case 73:
                    var EditCommand = this.App.FindCommandByCommandLineName(Event.shiftKey ? "edit" : "singleedit");
                    if (EditCommand && this.FocusedLabel) {
                        EditCommand.Invoke(null, [this.FocusedLabel]);
                    }
                    Event.preventDefault();
                    break;
                case 187:
                    var Command = this.App.FindCommandByCommandLineName("set-scale");
                    if (Command && Event.shiftKey) {
                        Command.Invoke(null, [this.Viewport.GetCameraScale() + 0.1]);
                    }
                    Event.preventDefault();
                    break;
                case 189:
                    var Command = this.App.FindCommandByCommandLineName("set-scale");
                    if (Command && Event.shiftKey) {
                        Command.Invoke(null, [this.Viewport.GetCameraScale() - 0.1]);
                    }
                    Event.preventDefault();
                    break;
                default:
                    handled = false;
                    break;
            }
            if (handled) {
                Event.stopPropagation();
            }
        };

        PictgramPanel.prototype.OnActivate = function () {
            this.Viewport.IsPointerEnabled = true;
        };

        PictgramPanel.prototype.OnDeactivate = function () {
            this.Viewport.IsPointerEnabled = false;
        };

        PictgramPanel.prototype.MoveToNearestNode = function (Dir) {
            var NextNode = this.FocusedLabel ? this.FindNearestNode(this.ViewMap[this.FocusedLabel], Dir) : this.TopNodeView;
            this.FocusAndMoveToNode(NextNode);
        };

        PictgramPanel.prototype.FocusAndMoveToNode = function (Node) {
            if (Node != null) {
                var NextNode = Node.constructor == String ? this.ViewMap[Node] : Node;
                if (NextNode != null) {
                    this.ChangeFocusedLabel(NextNode.Label);
                    this.Viewport.MoveTo(NextNode.GetCenterGX(), NextNode.GetCenterGY(), this.Viewport.GetCameraScale(), 50);
                }
            }
        };

        PictgramPanel.prototype.FindNearestNode = function (CenterNode, Dir) {
            if (!CenterNode) {
                return null;
            }
            var RightLimitVectorX = 1;
            var RightLimitVectorY = 1;
            var LeftLimitVectorX = 1;
            var LeftLimitVectorY = 1;

            switch (Dir) {
                case 2 /* Right */:
                    LeftLimitVectorY = -1;
                    break;
                case 0 /* Left */:
                    RightLimitVectorX = -1;
                    RightLimitVectorY = -1;
                    LeftLimitVectorX = -1;
                    break;
                case 1 /* Top */:
                    RightLimitVectorY = -1;
                    LeftLimitVectorX = -1;
                    LeftLimitVectorY = -1;
                    break;
                case 3 /* Bottom */:
                    RightLimitVectorX = -1;
                    break;
            }
            var NearestNode = null;
            var CurrentMinimumDistanceSquere = Infinity;
            this.TopNodeView.TraverseVisibleNode(function (Node) {
                var DX = Node.GetCenterGX() - CenterNode.GetCenterGX();
                var DY = Node.GetCenterGY() - CenterNode.GetCenterGY();
                var DDotR = DX * RightLimitVectorX + DY * RightLimitVectorY;
                var DDotL = DX * LeftLimitVectorX + DY * LeftLimitVectorY;
                if (DDotR > 0 && DDotL > 0) {
                    var DistanceSquere = DX * DX + DY * DY;
                    if (DistanceSquere < CurrentMinimumDistanceSquere) {
                        CurrentMinimumDistanceSquere = DistanceSquere;
                        NearestNode = Node;
                    }
                }
            });
            return NearestNode;
        };

        PictgramPanel.prototype.FoldDeepSubGoals = function (NodeView) {
            var _this = this;
            NodeView.ForEachVisibleChildren(function (SubNode) {
                _this.FoldDeepSubGoals(SubNode);
                if (SubNode.GetNodeType() == 0 /* Goal */ && SubNode.Children != null) {
                    if (SubNode.Children.length != 1 || SubNode.Children[0].GetNodeType() != 3 /* Evidence */) {
                        SubNode.SetIsFolded(true);
                    }
                }
            });
        };

        PictgramPanel.prototype.ChangeFocusedLabel = function (Label) {
            this.App.SocketManager.Emit("focusednode", Label);
            AssureNote.AssureNoteUtils.UpdateHash(Label);
            if (this.ContextMenu.IsEnable) {
                this.ContextMenu.Remove();
            }
            if (this.NodeTooltip.IsEnable) {
                this.NodeTooltip.Remove();
            }
            if (Label == null) {
                var oldNodeView = this.ViewMap[this.FocusedLabel];
                if (oldNodeView != null) {
                    oldNodeView.RemoveColorStyle(AssureNote.ColorStyle.Highlight);
                }
                this.FocusedLabel = null;
                return;
            }
            var NodeView = this.ViewMap[Label];
            if (NodeView != null) {
                var oldNodeView = this.ViewMap[this.FocusedLabel];
                if (oldNodeView != null) {
                    oldNodeView.RemoveColorStyle(AssureNote.ColorStyle.Highlight);
                }
                this.FocusedLabel = Label;
                NodeView.AddColorStyle(AssureNote.ColorStyle.Highlight);
            }
        };

        PictgramPanel.prototype.GetFocusedLabel = function () {
            return this.FocusedLabel;
        };

        PictgramPanel.prototype.InitializeView = function (NodeView) {
            this.TopNodeView = NodeView;
            this.ViewMap = {};
            this.TopNodeView.UpdateViewMap(this.ViewMap);
        };

        PictgramPanel.prototype.Draw = function (Label, Duration, FixedNode) {
            var _this = this;
            var t0 = AssureNote.AssureNoteUtils.GetTime();
            this.Clear();
            var t1 = AssureNote.AssureNoteUtils.GetTime();
            console.log("Clear: " + (t1 - t0));
            var TargetView = this.ViewMap[Label];

            if (TargetView == null) {
                TargetView = this.TopNodeView;
            }

            var FixedNodeGX0;
            var FixedNodeGY0;
            var FixedNodeDX;
            var FixedNodeDY;
            if (FixedNode) {
                FixedNodeGX0 = FixedNode.GetGX();
                FixedNodeGY0 = FixedNode.GetGY();
            }

            this.LayoutEngine.DoLayout(this, TargetView);
            this.ContentLayer.style.display = "none";
            this.SVGLayer.style.display = "none";

            AssureNote.GSNShape.__Debug_Animation_SkippedNodeCount = 0;
            AssureNote.GSNShape.__Debug_Animation_TotalNodeCount = 0;

            this.FoldingAnimationTask.Cancel(true);

            AssureNote.NodeView.SetGlobalPositionCacheEnabled(true);
            var FoldingAnimationCallbacks = [];

            var ScreenRect = this.Viewport.GetPageRectInGxGy();
            if (FixedNode) {
                FixedNodeDX = FixedNode.GetGX() - FixedNodeGX0;
                FixedNodeDY = FixedNode.GetGY() - FixedNodeGY0;
                if (FixedNodeDX > 0) {
                    ScreenRect.Width += FixedNodeDX;
                } else {
                    ScreenRect.Width -= FixedNodeDX;
                    ScreenRect.X += FixedNodeDX;
                }
                var Scale = this.Viewport.GetCameraScale();
                var Task = this.Viewport.CreateMoveTaskFunction(FixedNodeDX, FixedNodeDY, Scale, Duration);
                if (Task) {
                    FoldingAnimationCallbacks.push(Task);
                } else {
                    FoldingAnimationCallbacks.push(function () {
                        _this.UpdateHiddenNodeList();
                    });
                }
            } else {
                FoldingAnimationCallbacks.push(function () {
                    _this.UpdateHiddenNodeList();
                });
            }

            var t2 = AssureNote.AssureNoteUtils.GetTime();
            TargetView.UpdateNodePosition(FoldingAnimationCallbacks, Duration, ScreenRect);
            TargetView.ClearAnimationCache();
            var t3 = AssureNote.AssureNoteUtils.GetTime();
            console.log("Update: " + (t3 - t2));
            this.FoldingAnimationTask.StartMany(Duration, FoldingAnimationCallbacks);

            var Shape = TargetView.GetShape();
            this.Viewport.CameraLimitRect = new AssureNote.Rect(Shape.GetTreeLeftLocalX() - 100, -100, Shape.GetTreeWidth() + 200, Shape.GetTreeHeight() + 200);

            var PageRect = this.Viewport.GetPageRectInGxGy();
            this.TopNodeView.TraverseVisibleNode(function (Node) {
                if (Node.IsInRect(PageRect)) {
                    _this.OnScreenNodeMap[Node.Label] = Node;
                } else {
                    _this.HiddenNodeMap[Node.Label] = Node;
                    _this.HiddenNodeBuffer.appendChild(Node.Shape.Content);
                    _this.HiddenNodeBuffer.appendChild(Node.Shape.ShapeGroup);
                }
            });

            AssureNote.NodeView.SetGlobalPositionCacheEnabled(false);
            this.ContentLayer.style.display = "";
            this.SVGLayer.style.display = "";
            console.log("Animation: " + AssureNote.GSNShape.__Debug_Animation_TotalNodeCount + " nodes moved, " + AssureNote.GSNShape.__Debug_Animation_SkippedNodeCount + " nodes skipped. reduce rate = " + AssureNote.GSNShape.__Debug_Animation_SkippedNodeCount / AssureNote.GSNShape.__Debug_Animation_TotalNodeCount);
        };

        PictgramPanel.prototype.ForceAppendAllOutOfScreenNode = function () {
            var _this = this;
            var UpdateArrow = function (Node) {
                if (Node.Parent) {
                    var Arrow = Node.Shape.ArrowPath;
                    if (Arrow.parentNode != _this.HiddenNodeBuffer) {
                        _this.HiddenNodeBuffer.appendChild(Arrow);
                    }
                }
            };
            for (var Label in this.HiddenNodeMap) {
                var Node = this.HiddenNodeMap[Label];
                delete this.HiddenNodeMap[Label];
                this.OnScreenNodeMap[Label] = Node;
                this.ContentLayer.appendChild(Node.Shape.Content);
                this.SVGLayerNodeGroup.appendChild(Node.Shape.ShapeGroup);
                UpdateArrow(Node);
            }
        };

        PictgramPanel.prototype.UpdateHiddenNodeList = function () {
            var _this = this;
            AssureNote.NodeView.SetGlobalPositionCacheEnabled(true);
            var PageRect = this.Viewport.GetPageRectInGxGy();
            var UpdateArrow = function (Node) {
                if (Node.Parent) {
                    var Arrow = Node.Shape.ArrowPath;
                    if (Node.IsConnectorInRect(PageRect)) {
                        if (Arrow.parentNode != _this.SVGLayerConnectorGroup) {
                            _this.SVGLayerConnectorGroup.appendChild(Arrow);
                        }
                    } else {
                        if (Arrow.parentNode != _this.HiddenNodeBuffer) {
                            _this.HiddenNodeBuffer.appendChild(Arrow);
                        }
                    }
                }
            };
            for (var Label in this.OnScreenNodeMap) {
                var Node = this.OnScreenNodeMap[Label];
                if (!Node.IsInRect(PageRect)) {
                    delete this.OnScreenNodeMap[Label];
                    this.HiddenNodeMap[Label] = Node;
                    this.HiddenNodeBuffer.appendChild(Node.Shape.Content);
                    this.HiddenNodeBuffer.appendChild(Node.Shape.ShapeGroup);
                }
                UpdateArrow(Node);
            }
            for (var Label in this.HiddenNodeMap) {
                var Node = this.HiddenNodeMap[Label];
                if (Node.IsInRect(PageRect)) {
                    delete this.HiddenNodeMap[Label];
                    this.OnScreenNodeMap[Label] = Node;
                    this.ContentLayer.appendChild(Node.Shape.Content);
                    this.SVGLayerNodeGroup.appendChild(Node.Shape.ShapeGroup);
                }
                UpdateArrow(Node);
            }
            AssureNote.NodeView.SetGlobalPositionCacheEnabled(false);
        };

        PictgramPanel.prototype.Clear = function () {
            document.getElementById("assure-note").style.display = "none";
            this.ContentLayer.innerHTML = "";
            this.SVGLayer.removeChild(this.SVGLayerConnectorGroup);
            this.SVGLayer.removeChild(this.SVGLayerNodeGroup);
            this.SVGLayerConnectorGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayerNodeGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.SVGLayer.appendChild(this.SVGLayerConnectorGroup);
            this.SVGLayer.appendChild(this.SVGLayerNodeGroup);
            this.Viewport.SVGLayer = this.SVGLayer;
            this.HiddenNodeMap = {};
            this.OnScreenNodeMap = {};
            this.HiddenNodeBuffer = document.createDocumentFragment();
            document.getElementById("assure-note").style.display = "";
        };

        PictgramPanel.prototype.DisplayPluginPanel = function (PluginName, Label) {
            var Plugin = this.App.PluginManager.GetPanelPlugin(PluginName, Label);
            Plugin.Display(this.App.FullScreenEditorPanel, this.App.MasterRecord.GetLatestDoc(), Label);
        };

        PictgramPanel.prototype.GetFocusedView = function () {
            if (this.ViewMap) {
                return this.ViewMap[this.FocusedLabel];
            }
            return null;
        };

        PictgramPanel.prototype.GetNodeViewFromUID = function (UID) {
            for (var i in this.ViewMap) {
                if (this.ViewMap[i].Model.UID == UID)
                    return this.ViewMap[i];
            }
            return null;
        };

        PictgramPanel.prototype.NavigateUp = function () {
            this.MoveToNearestNode(1 /* Top */);
        };
        PictgramPanel.prototype.NavigateDown = function () {
            this.MoveToNearestNode(3 /* Bottom */);
        };
        PictgramPanel.prototype.NavigateLeft = function () {
            this.MoveToNearestNode(0 /* Left */);
        };
        PictgramPanel.prototype.NavigateRight = function () {
            this.MoveToNearestNode(2 /* Right */);
        };
        PictgramPanel.prototype.NavigateHome = function () {
            this.FocusAndMoveToNode(this.TopNodeView);
        };
        return PictgramPanel;
    })(AssureNote.Panel);
    AssureNote.PictgramPanel = PictgramPanel;
})(AssureNote || (AssureNote = {}));

var AssureNote;
(function (AssureNote) {
    var WGSNSocket = (function () {
        function WGSNSocket(name, WGSN) {
            this.name = name;
            this.WGSN = WGSN;
        }
        return WGSNSocket;
    })();
    AssureNote.WGSNSocket = WGSNSocket;

    var EditNodeStatus = (function () {
        function EditNodeStatus(UserName, UID, IsRecursive, SID) {
            this.UserName = UserName;
            this.UID = UID;
            this.IsRecursive = IsRecursive;
            this.SID = SID;
        }
        return EditNodeStatus;
    })();
    AssureNote.EditNodeStatus = EditNodeStatus;

    var FocusedLabels = (function () {
        function FocusedLabels(SID, Label) {
            this.SID = SID;
            this.Label = Label;
        }
        return FocusedLabels;
    })();
    AssureNote.FocusedLabels = FocusedLabels;
    var SocketManager = (function () {
        function SocketManager(App) {
            var _this = this;
            this.App = App;
            this.DefaultChatServer = (!Config || !Config.DefaultChatServer) ? 'http://localhost:3002' : Config.DefaultChatServer;
            this.UseOnScrollEvent = true;
            this.ReceivedFoldEvent = false;
            this.EditNodeInfo = [];
            this.FocusedLabels = [];
            if (!this.IsOperational()) {
                App.DebugP('socket.io not found');
            }

            App.PictgramPanel.Viewport.AddEventListener("cameramove", function (e) {
                var Viewport = e.Target;
                if (_this.IsConnected() && _this.UseOnScrollEvent && (_this.App.ModeManager.GetMode() != 1 /* View */)) {
                    console.log('StartEmit');
                    var X = Viewport.GetCameraGX();
                    var Y = Viewport.GetCameraGY();
                    var Scale = Viewport.GetCameraScale();

                    _this.Emit("sync", { "X": X, "Y": Y, "Scale": Scale });
                }
            });
            this.socket = null;
            this.handler = {};
        }
        SocketManager.prototype.RegisterSocketHandler = function (key, handler) {
            this.handler[key] = handler;
        };

        SocketManager.prototype.Emit = function (method, params) {
            if (!this.IsConnected()) {
                this.App.DebugP('Socket not enable.');
                return;
            }

            this.socket.emit(method, params);
        };

        SocketManager.prototype.EnableListeners = function () {
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.App.ModeManager.Disable();
                self.socket = null;
            });
            this.socket.on('close', function (SID) {
                self.UpdateView("");
                self.UpdateWGSN();
                console.log('close: ' + SID);
                self.App.UserList.RemoveUser(SID);
            });

            this.socket.on('error', function (data) {
                $.notify('Cannot establish connection or connection closed', 'error');
                self.App.ModeManager.Disable();
            });

            this.socket.on('init', function (data) {
                if (data.WGSN != null && self.App.MasterRecord.HistoryList.length > 1) {
                    alert('Your changes will disappear. TODO: Make a choice.');
                }
                if (data.WGSN != null) {
                    self.App.LoadNewWGSN(data.name, data.WGSN);
                }
            });

            this.socket.on('adduser', function (data) {
                self.App.UserList.AddUser(data);
            });

            this.socket.on('focusednode', function (data) {
                var OldView;
                var OldLabel;
                if (data.Label == null || self.FocusedLabels.length != 0) {
                    for (var i in self.FocusedLabels) {
                        if (self.FocusedLabels[i].SID == data.SID) {
                            OldLabel = self.FocusedLabels[i].Label;
                            OldView = self.App.PictgramPanel.ViewMap[OldLabel];
                            self.FocusedLabels.splice(i, 1);
                            self.App.UserList.RemoveFocusedUserColor(data.SID, OldView);
                            break;
                        }
                    }
                }

                if (data.Label != null) {
                    var FocusedView = self.App.PictgramPanel.ViewMap[data.Label];
                    self.App.UserList.AddFocusedUserColor(data.SID, FocusedView);
                    self.FocusedLabels.push(data);
                }
            });

            this.socket.on('updateeditmode', function (data) {
                self.App.UserList.UpdateEditMode(data);
            });

            this.socket.on('fold', function (data) {
                if (!self.ReceivedFoldEvent) {
                    self.ReceivedFoldEvent = true;
                    var NodeView = self.App.PictgramPanel.GetNodeViewFromUID(data.UID);
                    self.App.ExecDoubleClicked(NodeView);
                    self.ReceivedFoldEvent = false;
                }
            });
            this.socket.on('update', function (data) {
                self.App.LoadNewWGSN(data.name, data.WGSN);
            });
            this.socket.on('sync', function (data) {
                self.UseOnScrollEvent = false;
                self.App.PictgramPanel.Viewport.SetCamera(data.X, data.Y, data.Scale);
                self.UseOnScrollEvent = true;
            });
            this.socket.on('startedit', function (data) {
                console.log('edit');
                var CurrentNodeView = self.App.PictgramPanel.GetNodeViewFromUID(data.UID);
                self.EditNodeInfo.push(data);
                self.UpdateFlags(CurrentNodeView);
                self.UpdateView("startedit");
                self.AddUserNameOn(CurrentNodeView, { User: data.UserName, IsRecursive: data.IsRecursive });
            });
            this.socket.on('finishedit', function (UID) {
                console.log('finishedit');
                var Length;
                self.DeleteEditInfo(UID);
                if ((Length = self.EditNodeInfo.length) != 0) {
                    var LatestView = self.App.PictgramPanel.GetNodeViewFromUID(self.EditNodeInfo[Length - 1].UID);
                    self.UpdateFlags(LatestView);
                    self.UpdateView("anotheredit");
                    self.AddUserNameOn(LatestView, { User: self.EditNodeInfo[Length - 1].UserName, IsRecursive: self.EditNodeInfo[Length - 1].IsRecursive });
                } else {
                    self.UpdateView("finishedit");
                }
                console.log('here is ID array after delete = ' + self.EditNodeInfo);
            });

            for (var key in this.handler) {
                this.socket.on(key, this.handler[key]);
            }
        };

        SocketManager.prototype.Connect = function (room, host) {
            if (!this.IsConnected()) {
                if (host == null || host == '') {
                    this.socket = io.connect(this.DefaultChatServer);
                } else {
                    this.socket = io.connect(host);
                }
                this.App.ModeManager.Enable();
                this.EnableListeners();
                this.App.UserList.Show();
                this.Emit("adduser", { User: this.App.GetUserName(), Mode: this.App.ModeManager.GetMode(), Room: room });
            }
        };

        SocketManager.prototype.DisConnect = function () {
            this.socket.disconnect();
            this.socket = null;
        };

        SocketManager.prototype.IsConnected = function () {
            return this.socket != null;
        };

        SocketManager.prototype.IsOperational = function () {
            return io != null && io.connect != null;
        };

        SocketManager.prototype.DeleteEditInfo = function (UID) {
            for (var i = 0; i < this.EditNodeInfo.length; i++) {
                if (this.EditNodeInfo[i].UID == UID) {
                    this.EditNodeInfo.splice(i, 1);
                    return;
                }
            }
        };

        SocketManager.prototype.UpdateParentStatus = function (NodeView) {
            if (NodeView.Parent == null)
                return;
            NodeView.Parent.Status = 1 /* SingleEditable */;
            this.UpdateParentStatus(NodeView.Parent);
        };

        SocketManager.prototype.UpdateChildStatus = function (NodeView) {
            if (NodeView.Children != null) {
                for (var i = 0; i < NodeView.Children.length; i++) {
                    NodeView.Children[i].Status = 2 /* Locked */;
                    this.UpdateChildStatus(NodeView.Children[i]);
                }
            }
            if (NodeView.Left != null) {
                for (var i = 0; i < NodeView.Left.length; i++) {
                    NodeView.Left[i].Status = 2 /* Locked */;
                    this.UpdateChildStatus(NodeView.Left[i]);
                }
            }
            if (NodeView.Right != null) {
                for (var i = 0; i < NodeView.Right.length; i++) {
                    NodeView.Right[i].Status = 2 /* Locked */;
                    this.UpdateChildStatus(NodeView.Right[i]);
                }
            }
        };

        SocketManager.prototype.UpdateFlags = function (NodeView) {
            NodeView.Status = 2 /* Locked */;
            this.UpdateParentStatus(NodeView);
            if (NodeView.Children == null && NodeView.Left == null && NodeView.Right == null)
                return;
            if (this.EditNodeInfo[this.EditNodeInfo.length - 1].IsRecursive) {
                this.UpdateChildStatus(NodeView);
            }
        };

        SocketManager.prototype.UpdateView = function (Method) {
            var NewNodeView = new AssureNote.NodeView(this.App.MasterRecord.GetLatestDoc().TopNode, true);
            NewNodeView.SaveFlags(this.App.PictgramPanel.ViewMap);
            if (Method == "finishedit") {
                this.SetDefaultFlags(NewNodeView);
            }
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw(this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel());
        };

        SocketManager.prototype.SetDefaultFlags = function (NodeView) {
            NodeView.Status = 0 /* TreeEditable */;
            if (NodeView.Children != null) {
                for (var i = 0; i < NodeView.Children.length; i++) {
                    this.SetDefaultFlags(NodeView.Children[i]);
                }
            }
            if (NodeView.Left != null) {
                for (var i = 0; i < NodeView.Left.length; i++) {
                    this.SetDefaultFlags(NodeView.Left[i]);
                }
            }
            if (NodeView.Right != null) {
                for (var i = 0; i < NodeView.Right.length; i++) {
                    this.SetDefaultFlags(NodeView.Right[i]);
                }
            }
        };

        SocketManager.prototype.IsEditable = function (UID) {
            var index = 0;
            var CurrentView = this.App.PictgramPanel.GetNodeViewFromUID(UID).Parent;

            if (this.EditNodeInfo.length == 0)
                return true;
            for (var i = 0; i < this.EditNodeInfo.length; i++) {
                if (this.EditNodeInfo[i].UID == UID) {
                    return false;
                }
            }

            while (CurrentView != null) {
                for (var i = 0; i < this.EditNodeInfo.length; i++) {
                    if (this.EditNodeInfo[i].IsRecursive && this.EditNodeInfo[i].UID == CurrentView.Model.UID) {
                        return false;
                    }
                }
                CurrentView = CurrentView.Parent;
            }
            return true;
        };

        SocketManager.prototype.AddUserNameOn = function (NodeView, Data) {
            var Label = NodeView.Label.replace(/\./g, "\\.");
            var topdist;
            var rightdist;
            switch (NodeView.Model.NodeType) {
                case 0 /* Goal */:
                case 1 /* Context */:
                    topdist = "5px";
                    rightdist = "5px";
                    break;
                case 2 /* Strategy */:
                    topdist = "5px";
                    rightdist = "10px";
                    break;
                case 3 /* Evidence */:
                    topdist = "19px";
                    rightdist = "40px";
                    break;
            }
            $("<div class=\"user_" + Data.User + "\">" + Data.User + "</div>").appendTo($('#' + Label)).css({ position: "absolute", top: topdist, right: rightdist, "font-size": "12px", "text-decoration": "underline" });

            if (NodeView.Right != null && Data.IsRecursive) {
                this.AddUserNameOn(NodeView.Right[0], Data);
            }
            if (NodeView.Children == null || !Data.IsRecursive)
                return;

            for (var i = 0; i < NodeView.Children.length; i++) {
                this.AddUserNameOn(NodeView.Children[i], Data);
            }
        };

        SocketManager.prototype.StartEdit = function (data) {
            if (this.IsConnected()) {
                this.Emit('startedit', data);
            }
        };

        SocketManager.prototype.FoldNode = function (data) {
            if (this.IsConnected() && !this.ReceivedFoldEvent) {
                this.Emit('fold', data);
            }
        };

        SocketManager.prototype.SyncScreenPos = function (Data) {
            this.Emit("syncfocus", Data);
        };

        SocketManager.prototype.UpdateWGSN = function () {
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            var WGSN = Writer.toString();
            this.Emit('update', new WGSNSocket(this.App.WGSNName, WGSN));
        };

        SocketManager.prototype.UpdateEditMode = function (Mode) {
            this.Emit('updateeditmode', { User: this.App.GetUserName(), Mode: Mode });
        };
        return SocketManager;
    })();
    AssureNote.SocketManager = SocketManager;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var TopMenuItem = (function () {
        function TopMenuItem() {
        }
        TopMenuItem.prototype.GetIconName = function () {
            return "";
        };
        TopMenuItem.prototype.GetDisplayName = function () {
            return "";
        };
        TopMenuItem.CreateIconElement = function (Name) {
            var span = document.createElement("span");
            span.className = "glyphicon glyphicon-" + Name;
            return span;
        };
        TopMenuItem.CreateID = function () {
            return "topmenu-" + AssureNote.AssureNoteUtils.GenerateRandomString();
        };
        TopMenuItem.prototype.Render = function (App, Target, IsTopLevel) {
            var _this = this;
            var item;
            var icon = TopMenuItem.CreateIconElement(this.GetIconName());
            var spaceChar = "\u00a0";
            var text = document.createTextNode(spaceChar + this.GetDisplayName());
            if (IsTopLevel) {
                item = document.createElement("button");
                item.type = "button";
                item.setAttribute("oncontextmenu", "return false");
                item.className = "btn navbar-btn btn-default clickable navbar-left";
                item.appendChild(icon);
                item.appendChild(text);
            } else {
                item = document.createElement("li");
                var a = document.createElement("a");
                a.href = "#";
                a.appendChild(icon);
                a.appendChild(text);
                item.appendChild(a);
            }
            item.addEventListener("click", function (event) {
                _this.Invoke(App);
            });
            Target.appendChild(item);
        };

        TopMenuItem.prototype.Invoke = function (App) {
        };
        return TopMenuItem;
    })();
    AssureNote.TopMenuItem = TopMenuItem;

    var SubMenuItem = (function (_super) {
        __extends(SubMenuItem, _super);
        function SubMenuItem(DisplayName, IconName, SubMenuList) {
            _super.call(this);
            this.DisplayName = DisplayName;
            this.IconName = IconName;
            this.SubMenuList = SubMenuList;
        }
        SubMenuItem.prototype.GetIconName = function () {
            return this.IconName;
        };

        SubMenuItem.prototype.GetDisplayName = function () {
            return this.DisplayName;
        };

        SubMenuItem.prototype.Render = function (App, Target, IsTopLevel) {
            var icon = TopMenuItem.CreateIconElement(this.GetIconName());
            var text = document.createTextNode("\u00a0" + this.GetDisplayName() + "\u00a0");
            if (IsTopLevel) {
                var dropdown = document.createElement("div");
                dropdown.className = "dropdown clickable navbar-left";
                var button = document.createElement("button");
                button.type = "button";
                button.setAttribute("oncontextmenu", "return false");
                button.setAttribute("data-toggle", "dropdown");
                button.className = "btn navbar-btn btn-default dropdown-toggle";
                var caret = document.createElement("span");
                caret.className = "caret";
                button.appendChild(icon);
                button.appendChild(text);
                button.appendChild(caret);

                var ul = document.createElement("ul");
                ul.setAttribute("oncontextmenu", "return false");
                ul.className = "dropdown-menu";
                ul.style.right = "auto";
                ul.style.width = "250px";

                for (var i = 0; i < this.SubMenuList.length; i++) {
                    this.SubMenuList[i].Render(App, ul, false);
                }

                dropdown.appendChild(button);
                dropdown.appendChild(ul);
                Target.appendChild(dropdown);
            } else {
                var li = document.createElement("li");
                li.className = "dropdown-submenu";
                var a = document.createElement("a");
                a.href = "#";
                li.appendChild(a);
                a.appendChild(icon);
                a.appendChild(text);

                var ul = document.createElement("ul");
                ul.setAttribute("oncontextmenu", "return false");
                ul.className = "dropdown-menu";

                for (var i = 0; i < this.SubMenuList.length; i++) {
                    this.SubMenuList[i].Render(App, ul, false);
                }

                li.appendChild(ul);
                Target.appendChild(li);
            }
        };
        return SubMenuItem;
    })(TopMenuItem);
    AssureNote.SubMenuItem = SubMenuItem;

    var TopMenuTopItem = (function (_super) {
        __extends(TopMenuTopItem, _super);
        function TopMenuTopItem(SubMenuList) {
            _super.call(this);
            this.SubMenuList = SubMenuList;
        }
        TopMenuTopItem.prototype.AppendSubMenu = function (SubMenu) {
            this.SubMenuList.unshift(SubMenu);
        };

        TopMenuTopItem.prototype.Render = function (App, Target, IsTopLevel) {
            for (var i = 0; i < this.SubMenuList.length; i++) {
                this.SubMenuList[i].Render(App, Target, true);
            }
            $(".dropdown-toggle").dropdown();
        };
        return TopMenuTopItem;
    })(TopMenuItem);
    AssureNote.TopMenuTopItem = TopMenuTopItem;

    var DividerMenuItem = (function (_super) {
        __extends(DividerMenuItem, _super);
        function DividerMenuItem() {
            _super.apply(this, arguments);
        }
        DividerMenuItem.prototype.Render = function (App, Target, IsTopLevel) {
            var li = document.createElement("li");
            li.className = "divider";
            Target.appendChild(li);
        };
        return DividerMenuItem;
    })(TopMenuItem);
    AssureNote.DividerMenuItem = DividerMenuItem;

    var NewMenuItem = (function (_super) {
        __extends(NewMenuItem, _super);
        function NewMenuItem() {
            _super.apply(this, arguments);
        }
        NewMenuItem.prototype.GetIconName = function () {
            return "plus";
        };
        NewMenuItem.prototype.GetDisplayName = function () {
            return "New...";
        };
        NewMenuItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("new");
            Command.Invoke(null, []);
        };
        return NewMenuItem;
    })(TopMenuItem);
    AssureNote.NewMenuItem = NewMenuItem;

    var OpenMenuItem = (function (_super) {
        __extends(OpenMenuItem, _super);
        function OpenMenuItem() {
            _super.apply(this, arguments);
        }
        OpenMenuItem.prototype.GetIconName = function () {
            return "folder-open";
        };
        OpenMenuItem.prototype.GetDisplayName = function () {
            return "Open...";
        };
        OpenMenuItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("open");
            Command.Invoke(null, []);
        };
        return OpenMenuItem;
    })(TopMenuItem);
    AssureNote.OpenMenuItem = OpenMenuItem;

    var UploadMenuItem = (function (_super) {
        __extends(UploadMenuItem, _super);
        function UploadMenuItem() {
            _super.apply(this, arguments);
        }
        UploadMenuItem.prototype.GetIconName = function () {
            return "cloud-upload";
        };
        UploadMenuItem.prototype.GetDisplayName = function () {
            return "Share";
        };
        UploadMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Share"]);
            }
            var Command = App.FindCommandByCommandLineName("share");
            Command.Invoke(null, []);
        };
        return UploadMenuItem;
    })(TopMenuItem);
    AssureNote.UploadMenuItem = UploadMenuItem;

    var SaveMenuItem = (function (_super) {
        __extends(SaveMenuItem, _super);
        function SaveMenuItem() {
            _super.apply(this, arguments);
        }
        SaveMenuItem.prototype.GetIconName = function () {
            return "floppy-save";
        };
        SaveMenuItem.prototype.GetDisplayName = function () {
            return "Save";
        };
        SaveMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Save"]);
            }
            var Command = App.FindCommandByCommandLineName("save");
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, ".wgsn");
            Command.Invoke(null, [DefaultName]);
        };
        return SaveMenuItem;
    })(TopMenuItem);
    AssureNote.SaveMenuItem = SaveMenuItem;

    var SaveAsMenuItem = (function (_super) {
        __extends(SaveAsMenuItem, _super);
        function SaveAsMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsMenuItem.prototype.GetDisplayName = function () {
            return "*." + this.GetExtention() + "...";
        };
        SaveAsMenuItem.prototype.GetExtention = function () {
            return "";
        };
        SaveAsMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Save"]);
            }
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, "." + this.GetExtention());
            var Command = App.FindCommandByCommandLineName("save");
            var Name = prompt("Enter the file name", DefaultName);
            if (Name == null) {
                return;
            }
            var Args;
            if (Name == "") {
                Args = [DefaultName];
            } else {
                Args = [Name.replace(/(\.\w+)?$/, "." + this.GetExtention())];
            }
            Command.Invoke(null, Args);
        };
        return SaveAsMenuItem;
    })(TopMenuItem);
    AssureNote.SaveAsMenuItem = SaveAsMenuItem;

    var SaveAsWGSNMenuItem = (function (_super) {
        __extends(SaveAsWGSNMenuItem, _super);
        function SaveAsWGSNMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsWGSNMenuItem.prototype.GetExtention = function () {
            return "wgsn";
        };
        return SaveAsWGSNMenuItem;
    })(SaveAsMenuItem);
    AssureNote.SaveAsWGSNMenuItem = SaveAsWGSNMenuItem;

    var SaveAsDCaseMenuItem = (function (_super) {
        __extends(SaveAsDCaseMenuItem, _super);
        function SaveAsDCaseMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsDCaseMenuItem.prototype.GetExtention = function () {
            return "dcase_model";
        };
        return SaveAsDCaseMenuItem;
    })(SaveAsMenuItem);
    AssureNote.SaveAsDCaseMenuItem = SaveAsDCaseMenuItem;

    var SaveAsSVGMenuItem = (function (_super) {
        __extends(SaveAsSVGMenuItem, _super);
        function SaveAsSVGMenuItem() {
            _super.apply(this, arguments);
        }
        SaveAsSVGMenuItem.prototype.GetDisplayName = function () {
            return "*.svg...";
        };
        SaveAsSVGMenuItem.prototype.GetExtention = function () {
            return "";
        };
        SaveAsSVGMenuItem.prototype.Invoke = function (App) {
            if (!App.MasterRecord.GetLatestDoc().DocHistory.IsCommitRevision) {
                var CommitCommand = App.FindCommandByCommandLineName("commit");
                CommitCommand.Invoke(null, ["Save"]);
            }
            var DefaultName = App.WGSNName.replace(/(\.\w+)?$/, ".svg");
            var Command = App.FindCommandByCommandLineName("save-as-svg");
            var Name = prompt("Enter the file name", DefaultName);
            if (Name == null) {
                return;
            }
            var Args;
            if (Name == "") {
                Args = [DefaultName];
            } else {
                Args = [Name.replace(/(\.\w+)?$/, ".svg")];
            }
            Command.Invoke(null, Args);
        };
        return SaveAsSVGMenuItem;
    })(TopMenuItem);
    AssureNote.SaveAsSVGMenuItem = SaveAsSVGMenuItem;

    var CommandListMenuItem = (function (_super) {
        __extends(CommandListMenuItem, _super);
        function CommandListMenuItem() {
            _super.apply(this, arguments);
        }
        CommandListMenuItem.prototype.GetIconName = function () {
            return "question-sign";
        };
        CommandListMenuItem.prototype.GetDisplayName = function () {
            return "Command list";
        };
        CommandListMenuItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("help");
            Command.Invoke(null, []);
        };
        return CommandListMenuItem;
    })(TopMenuItem);
    AssureNote.CommandListMenuItem = CommandListMenuItem;

    var HelpMenuItem = (function (_super) {
        __extends(HelpMenuItem, _super);
        function HelpMenuItem() {
            _super.apply(this, arguments);
        }
        HelpMenuItem.prototype.GetIconName = function () {
            return "question-sign";
        };
        HelpMenuItem.prototype.GetDisplayName = function () {
            return "Help";
        };
        HelpMenuItem.prototype.Invoke = function (App) {
            window.open("https://github.com/AssureNote/AssureNote/blob/master/README.md");
        };
        return HelpMenuItem;
    })(TopMenuItem);
    AssureNote.HelpMenuItem = HelpMenuItem;

    var AboutMenuItem = (function (_super) {
        __extends(AboutMenuItem, _super);
        function AboutMenuItem() {
            _super.apply(this, arguments);
        }
        AboutMenuItem.prototype.GetIconName = function () {
            return "question-sign";
        };
        AboutMenuItem.prototype.GetDisplayName = function () {
            return "About";
        };
        AboutMenuItem.prototype.Invoke = function (App) {
            $('#about-modal').modal();
        };
        return AboutMenuItem;
    })(TopMenuItem);
    AssureNote.AboutMenuItem = AboutMenuItem;

    var ShowHistoryPanelItem = (function (_super) {
        __extends(ShowHistoryPanelItem, _super);
        function ShowHistoryPanelItem() {
            _super.apply(this, arguments);
        }
        ShowHistoryPanelItem.prototype.GetIconName = function () {
            return "time";
        };
        ShowHistoryPanelItem.prototype.GetDisplayName = function () {
            return "Show history panel";
        };
        ShowHistoryPanelItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("history");
            Command.Invoke(null, []);
        };
        return ShowHistoryPanelItem;
    })(TopMenuItem);
    AssureNote.ShowHistoryPanelItem = ShowHistoryPanelItem;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var UserItem = (function () {
        function UserItem(UserName, Color, IsEditMode, SID) {
            this.UserName = UserName;
            this.Color = Color;
            this.IsEditMode = IsEditMode;
            this.SID = SID;
        }
        return UserItem;
    })();
    AssureNote.UserItem = UserItem;

    var UserList = (function (_super) {
        __extends(UserList, _super);
        function UserList(App) {
            _super.call(this, App);
            this.App = App;
            this.UserName = 'Guest';
            this.UserList = [];
        }
        UserList.prototype.Show = function () {
            var found = false;
            for (var i in this.UserList) {
                if (this.UserList[i].IsEditMode) {
                    found = true;
                }
            }
            this.App.ModeManager.ReadOnly(found);
            $('.user-name').text(this.App.GetUserName());
            $('#user-list-tmpl').tmpl(this.UserList).appendTo($('#user-list').empty());
        };

        UserList.prototype.AddUser = function (Info) {
            var Color = this.GetRandomColor();
            var IsEditMode = (Info.Mode == 0 /* Edit */) ? true : false;
            this.UserList.push(new UserItem(Info.User, Color, IsEditMode, Info.SID));
            this.Show();
            var StyleName = "highlight-" + Info.SID;
            var ColorInfo = { stroke: Color };
            AssureNote.AssureNoteUtils.DefineColorStyle(StyleName, ColorInfo);
        };

        UserList.prototype.UpdateEditMode = function (Info) {
            for (var i in this.UserList) {
                if (this.UserList[i].SID == Info.SID) {
                    var UserItem = this.UserList[i];
                    UserItem.IsEditMode = (Info.Mode == 0 /* Edit */);
                }
            }
            this.Show();
        };

        UserList.prototype.RemoveUser = function (SID) {
            for (var i = 0; i < this.UserList.length; i++) {
                if (this.UserList[i].SID == SID) {
                    this.UserList.splice(i, 1);
                    break;
                }
            }
            this.Show();
        };

        UserList.prototype.GetRandomColor = function () {
            var color;
            do {
                color = Math.floor(Math.random() * 0xFFFFFF).toString(16);
                for (var i = color.length; i < 6; i++) {
                    color = "0" + color;
                }
            } while(color == "000000" || color == "FFFFFF");
            return "#" + color;
        };

        UserList.prototype.AddFocusedUserColor = function (SID, View) {
            var StyleName = "highlight-" + SID;
            View.Shape.AddColorStyle(StyleName);
        };

        UserList.prototype.RemoveFocusedUserColor = function (SID, View) {
            var StyleName = "highlight-" + SID;
            View.Shape.RemoveColorStyle(StyleName);
        };
        return UserList;
    })(AssureNote.Panel);
    AssureNote.UserList = UserList;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var DCaseLink = (function () {
        function DCaseLink(source, target) {
            this.source = source;
            this.target = target;
        }
        return DCaseLink;
    })();

    var DCaseModelXMLParser = (function () {
        function DCaseModelXMLParser(Record) {
            this.Record = Record;
            this.nodes = {};
            this.links = {};
            this.Text2NodeTypeMap = { "Goal": 0 /* Goal */, "Strategy": 2 /* Strategy */, "Context": 1 /* Context */, "Pattern": 1 /* Context */, "Evidence": 3 /* Evidence */ };
            this.Doc = new AssureNote.GSNDoc(this.Record);

            this.Record.AddHistory(0, "unknown", "converter", "2013-12-09T13:16:18+0900", "-", this.Doc);
        }
        DCaseModelXMLParser.prototype.MakeTree = function (Id) {
            var ThisNode = this.nodes[Id];

            for (var LinkId in this.links) {
                var link = this.links[LinkId];

                if (link.source == Id || link.target == Id) {
                    var ChildNodeId;
                    if (link.source == Id) {
                        ChildNodeId = link.target;
                    } else {
                        ChildNodeId = link.source;
                    }
                    delete this.links[LinkId];
                    var ChildNode = this.nodes[ChildNodeId];
                    if (ThisNode.SubNodeList == null) {
                        ThisNode.SubNodeList = [ChildNode];
                    } else {
                        ThisNode.SubNodeList.push(ChildNode);
                    }
                    ChildNode.ParentNode = ThisNode;
                    this.MakeTree(ChildNodeId);
                }
            }

            return ThisNode;
        };

        DCaseModelXMLParser.prototype.Parse = function (XMLData) {
            var _this = this;
            var IsRootNode = true;

            var $XML = $(XMLData);

            $XML.find("rootBasicNode").each(function (index, elem) {
                var XSIType = elem.getAttribute("xsi\:type");

                var NodeType = XSIType.split(":").pop();
                var Id = elem.getAttribute("id");
                var Statement = elem.getAttribute("desc");

                if (IsRootNode) {
                    _this.RootNodeId = Id;
                    IsRootNode = false;
                }
                var Type = _this.Text2NodeTypeMap[NodeType];
                var node = new AssureNote.GSNNode(_this.Doc, null, Type, NodeType.charAt(0), AssureNote.AssureNoteUtils.GenerateUID(), null);
                node.NodeDoc = Statement;
                _this.nodes[Id] = node;
            });

            $XML.find("rootBasicLink").each(function (index, elem) {
                var LinkId = elem.getAttribute("id");
                var SourceNodeId = elem.getAttribute("source").substring(1);
                var TargetNodeId = elem.getAttribute("target").substring(1);
                _this.links[LinkId] = new DCaseLink(SourceNodeId, TargetNodeId);
            });
            this.Doc.TopNode = this.MakeTree(this.RootNodeId);
            this.Doc.RenumberAll();
        };
        return DCaseModelXMLParser;
    })();
    AssureNote.DCaseModelXMLParser = DCaseModelXMLParser;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var HistoryCommand = (function (_super) {
        __extends(HistoryCommand, _super);
        function HistoryCommand(App) {
            _super.call(this, App);
            this.History = new HistoryPanel(App);
        }
        HistoryCommand.prototype.GetCommandLineNames = function () {
            return ["history"];
        };

        HistoryCommand.prototype.GetHelpHTML = function () {
            return "<code>history</code><br>.";
        };

        HistoryCommand.prototype.Invoke = function (CommandName, Params) {
            this.History.Show();
        };

        HistoryCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return HistoryCommand;
    })(AssureNote.Command);
    AssureNote.HistoryCommand = HistoryCommand;

    var HistoryPanel = (function (_super) {
        __extends(HistoryPanel, _super);
        function HistoryPanel(App) {
            _super.call(this, App);
            this.App = App;
            this.Element = $("#history");
            this.Element.hide();
            this.App.HistoryPanel = this;
        }
        HistoryPanel.prototype.Show = function () {
            this.Index = this.App.MasterRecord.HistoryList.length - 1;
            this.Update();
            this.Element.show();
        };

        HistoryPanel.prototype.Hide = function () {
            this.Element.empty();
            this.Element.hide();
            this.DrawGSN(this.App.MasterRecord.GetLatestDoc().TopNode);
        };

        HistoryPanel.prototype.DrawGSN = function (TopGoal) {
            var NewNodeView = new AssureNote.NodeView(TopGoal, true);
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw();
        };

        HistoryPanel.prototype.Update = function () {
            var _this = this;
            this.Element.empty();
            var h = this.App.MasterRecord.HistoryList[this.Index];
            var message = h.GetCommitMessage() || "(No Commit Message)";
            var t = {
                Message: message,
                User: h.Author,
                DateTime: AssureNote.AssureNoteUtils.FormatDate(h.DateString),
                DateTimeString: new Date(h.DateString).toLocaleString(),
                Count: {
                    All: h.Doc.GetNodeCount(),
                    Goal: h.Doc.GetNodeCountTypeOf(0 /* Goal */),
                    Evidence: h.Doc.GetNodeCountTypeOf(3 /* Evidence */),
                    Context: h.Doc.GetNodeCountTypeOf(1 /* Context */),
                    Strategy: h.Doc.GetNodeCountTypeOf(2 /* Strategy */)
                }
            };
            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            $("#history-panel-date").tooltip({});
            $("#history-panel-count").tooltip({
                html: true,
                title: "Goal: " + t.Count.Goal + "" + "<br>Evidence: " + t.Count.Evidence + "" + "<br>Context: " + t.Count.Context + "" + "<br>Strategy: " + t.Count.Strategy + ""
            });

            if (this.Index == 0) {
                $("#prev-revision").addClass("disabled");
            }

            if (this.Index == this.App.MasterRecord.HistoryList.length - 1) {
                $("#next-revision").addClass("disabled");
            }

            $("#history-panel-close").click(function () {
                _this.Hide();
            });

            $("#prev-revision").click(function () {
                var length = _this.App.MasterRecord.HistoryList.length;
                var OldIndex = _this.Index;
                _this.Index--;
                if (_this.Index < 0) {
                    _this.Index = 0;
                }
                while (!_this.App.MasterRecord.HistoryList[_this.Index].IsCommitRevision) {
                    if (_this.Index < 0) {
                        _this.Index = 0;
                        break;
                    }
                    _this.Index--;
                }
                console.log(_this.Index);
                if (OldIndex != _this.Index) {
                    var TopGoal = _this.App.MasterRecord.HistoryList[_this.Index].Doc.TopNode;
                    _this.DrawGSN(TopGoal);
                    _this.Update();
                }
            });

            $("#next-revision").click(function () {
                var length = _this.App.MasterRecord.HistoryList.length;
                var OldIndex = _this.Index;
                _this.Index++;
                if (_this.Index >= length) {
                    _this.Index = length - 1;
                }
                while (!_this.App.MasterRecord.HistoryList[_this.Index].IsCommitRevision) {
                    _this.Index++;
                    if (_this.Index >= length) {
                        _this.Index = length - 1;
                        break;
                    }
                }
                console.log(_this.Index);
                if (OldIndex != _this.Index) {
                    var TopGoal = _this.App.MasterRecord.HistoryList[_this.Index].Doc.TopNode;
                    _this.DrawGSN(TopGoal);
                    _this.Update();
                }
            });
        };
        return HistoryPanel;
    })(AssureNote.Panel);
    AssureNote.HistoryPanel = HistoryPanel;
})(AssureNote || (AssureNote = {}));

var AssureNote;
(function (AssureNote) {
    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            this.LoadingIndicatorVisible = true;
            this.LoadingIndicator = document.getElementById("loading-indicator");
            AssureNoteApp.Current = this;
            this.Commands = [];
            this.CommandLineTable = {};

            this.PluginManager = new AssureNote.PluginManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.FullScreenEditorPanel = new AssureNote.WGSNEditorPanel(this);
            this.SingleNodeEditorPanel = new AssureNote.SingleNodeEditorPanel(this);
            this.ModeManager = new AssureNote.ModeManager(this, 1 /* View */);

            this.DefaultCommand = new AssureNote.CommandMissingCommand(this);
            this.RegistCommand(new AssureNote.SaveCommand(this));
            this.RegistCommand(new AssureNote.SaveSVGCommand(this));
            this.RegistCommand(new AssureNote.SaveWGSNCommand(this));
            this.RegistCommand(new AssureNote.SaveDCaseCommand(this));
            this.RegistCommand(new AssureNote.CommitCommand(this));
            this.RegistCommand(new AssureNote.OpenCommand(this));
            this.RegistCommand(new AssureNote.NewCommand(this));
            this.RegistCommand(new AssureNote.UnfoldAllCommand(this));
            this.RegistCommand(new AssureNote.SetColorCommand(this));
            this.RegistCommand(new AssureNote.SetScaleCommand(this));
            this.RegistCommand(new AssureNote.HelpCommand(this));
            this.RegistCommand(new AssureNote.ShareCommand(this));
            this.RegistCommand(new AssureNote.HistoryCommand(this));
            this.RegistCommand(new AssureNote.SetGuestUserNameCommand(this));

            this.TopMenu = new AssureNote.TopMenuTopItem([]);
            this.TopMenuRight = new AssureNote.TopMenuTopItem([]);

            this.PluginManager.LoadPlugin();
            this.UserName = ($.cookie('UserName') != null) ? $.cookie('UserName') : 'Guest';
            this.UserList = new AssureNote.UserList(this);

            this.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem("History", "time", [
                new AssureNote.ShowHistoryPanelItem()
            ]));
            this.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem("File", "file", [
                new AssureNote.NewMenuItem(),
                new AssureNote.OpenMenuItem(),
                new AssureNote.SaveMenuItem(),
                new AssureNote.SubMenuItem("Save As", "floppy-save", [
                    new AssureNote.SaveAsWGSNMenuItem(),
                    new AssureNote.SaveAsDCaseMenuItem(),
                    new AssureNote.SaveAsSVGMenuItem()
                ]),
                new AssureNote.DividerMenuItem(),
                new AssureNote.HelpMenuItem(),
                new AssureNote.AboutMenuItem()
            ]));
            this.TopMenuRight.AppendSubMenu(new AssureNote.UploadMenuItem());

            this.TopMenu.Render(this, $("#top-menu").empty()[0], true);
            this.TopMenuRight.Render(this, $("#top-menu-right").empty()[0], true);
        }
        AssureNoteApp.prototype.IsLoading = function () {
            return this.LoadingIndicatorVisible;
        };

        AssureNoteApp.prototype.SetLoading = function (IsLoading) {
            this.LoadingIndicatorVisible = IsLoading;
            this.LoadingIndicator.style.display = IsLoading ? "" : "none";
        };

        AssureNoteApp.prototype.RegistCommand = function (Command) {
            this.Commands.push(Command);
            var Names = Command.GetCommandLineNames();
            for (var i = 0; i < Names.length; ++i) {
                this.CommandLineTable[Names[i].toLowerCase()] = Command;
            }
        };

        AssureNoteApp.prototype.DebugP = function (Message) {
            console.log(Message);
        };

        AssureNoteApp.Assert = function (b, message) {
            if (b == false) {
                console.log("Assert: " + message);
                throw "Assert: " + message;
            }
        };

        AssureNoteApp.prototype.ExecDoubleClicked = function (NodeView) {
            var Plugin = this.PluginManager.GetDoubleClicked();
            Plugin.OnNodeDoubleClicked(NodeView);
        };

        AssureNoteApp.prototype.FindCommandByCommandLineName = function (Name) {
            var Command = this.CommandLineTable[Name.toLowerCase()] || this.DefaultCommand;
            if (this.ModeManager.GetMode() == 1 /* View */ && !Command.CanUseOnViewOnlyMode()) {
                return this.DefaultCommand;
            }
            return Command;
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var CommandName = ParsedCommand.GetMethod();
            if (CommandName == "search") {
                return;
            }

            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(CommandName, ParsedCommand.GetArgs());
        };

        AssureNoteApp.prototype.LoadDefaultWGSN = function () {
            var _this = this;
            this.SetLoading(true);
            if (window.location.pathname.match("/file/") != null) {
                AssureNote.AssureNoteUtils.postJsonRPC("download", { fileId: window.location.pathname.replace(/\/.*\//, "") }, function (result) {
                    _this.LoadNewWGSN("hello.wgsn", result.content);
                }, function () {
                    console.log("Assurance Case not found.");
                    alert("Assurance Case not found.");
                });
            } else {
                var lang = navigator.browserLanguage || navigator.language || navigator.userLanguage;
                if (!lang || lang == "ja") {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-ja").text());
                } else {
                    this.LoadNewWGSN("hello.wgsn", $("#default-case-en").text());
                }
            }
            this.SetLoading(false);
        };

        AssureNoteApp.prototype.GetUserName = function () {
            return this.UserName;
        };

        AssureNoteApp.prototype.SetUserName = function (Name) {
            this.UserName = Name;
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            this.SetLoading(true);
            var Extention = Name.split(".").pop();
            this.WGSNName = Name;
            this.MasterRecord = new AssureNote.GSNRecord();
            switch (Extention) {
                case "dcase_model":
                    new AssureNote.DCaseModelXMLParser(this.MasterRecord).Parse(WGSN);
                    break;
                case "xmi":
                    new AssureNote.XMIParser(this.MasterRecord).Parse(WGSN);
                    break;
                default:
                case "wgsn":
                    this.MasterRecord.Parse(WGSN);
                    this.MasterRecord.RenumberAll();
                    break;
            }
            var LatestDoc = this.MasterRecord.GetLatestDoc();
            var TopGoalNode = LatestDoc.TopNode;

            this.PictgramPanel.InitializeView(new AssureNote.NodeView(TopGoalNode, true));
            this.PictgramPanel.FoldDeepSubGoals(this.PictgramPanel.TopNodeView);
            this.PictgramPanel.Draw();

            if (location.hash != "") {
                var label = location.hash.substring(1);
                var NodeView = this.PictgramPanel.ViewMap[label];
                if (NodeView) {
                    var ParentView = NodeView.Parent;
                    while (ParentView) {
                        ParentView.SetIsFolded(false);
                        ParentView = ParentView.Parent;
                    }
                    this.PictgramPanel.Draw();
                    this.PictgramPanel.ChangeFocusedLabel(label);
                    console.log(NodeView.GetCenterGX());
                    this.PictgramPanel.Viewport.SetCamera(NodeView.GetCenterGX(), NodeView.GetCenterGY(), 1);
                }
            } else {
                var TopGoal = this.PictgramPanel.TopNodeView;
                this.PictgramPanel.Viewport.SetCamera(TopGoal.GetCenterGX(), TopGoal.GetCenterGY() + this.PictgramPanel.Viewport.GetPageHeight() / 3, 1);
            }
            $("title").text("AssureNote");
            this.SetLoading(false);
        };

        AssureNoteApp.prototype.LoadFiles = function (Files) {
            var _this = this;
            if (Files[0]) {
                var reader = new FileReader();
                reader.onerror = function (event) {
                    console.log('error', event.target.error.code);
                };

                reader.onload = function (event) {
                    var Contents = event.target.result;
                    var Name = Files[0].name;
                    AssureNote.AssureNoteUtils.UpdateHash(null);
                    _this.LoadNewWGSN(Name, Contents);

                    _this.SocketManager.UpdateWGSN();
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var Pointer = (function () {
        function Pointer(X, Y, ID) {
            this.X = X;
            this.Y = Y;
            this.ID = ID;
        }
        Pointer.prototype.SetPosition = function (X, Y) {
            this.X = X;
            this.Y = Y;
        };
        return Pointer;
    })();
    AssureNote.Pointer = Pointer;

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

        ScrollManager.prototype.GetMainPointer = function () {
            return this.Pointers[this.MainPointerID];
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
            switch (e.type) {
                case "pointerdown":
                    if (e.pointerType == "mouse" && e.button != 0) {
                        return;
                    }
                    if (!this.Pointers[e.pointerId]) {
                        this.Pointers[e.pointerId] = new Pointer(e.clientX, e.clientY, e.pointerId);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    break;
                case "pointerout":
                case "pointerleave":
                case "pointercancel":
                case "pointerup":
                    if (!this.Pointers[e.pointerId]) {
                        return;
                    }
                    delete this.Pointers[e.pointerId];
                    e.preventDefault();
                    e.stopPropagation();

                    break;
                case "pointermove":
                    if (!this.Pointers[e.pointerId]) {
                        return;
                    }
                    this.Pointers[e.pointerId].SetPosition(e.clientX, e.clientY);
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                default:
                    return;
            }

            var IsTherePointer = Object.keys(this.Pointers).length > 0;
            var HasDragJustStarted = IsTherePointer && !this.IsDragging();
            var HasDragJustEnded = !this.GetMainPointer() && this.IsDragging();

            if (IsTherePointer) {
                if (HasDragJustStarted) {
                    this.StopAnimation();
                    this.timer = null;
                    var mainPointer = this.Pointers[Object.keys(this.Pointers)[0]];
                    this.MainPointerID = mainPointer.ID;
                    this.Viewport.SetEventMapLayerPosition(true);
                    this.StartDrag(mainPointer.X, mainPointer.Y);
                } else {
                    var mainPointer = this.GetMainPointer();
                    if (mainPointer) {
                        this.UpdateDrag(mainPointer.X, mainPointer.Y);
                        Screen.AddOffset(this.Dx, this.Dy);
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
                        Screen.AddOffset(_this.Dx, _this.Dy);
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
            Screen.SetCameraScale(Screen.GetCameraScale() * (1 + e.deltaY * 0.02));
        };
        return ScrollManager;
    })();
    AssureNote.ScrollManager = ScrollManager;

    var ViewportManager = (function (_super) {
        __extends(ViewportManager, _super);
        function ViewportManager(SVGLayer, EventMapLayer, ContentLayer, ControlLayer) {
            var _this = this;
            _super.call(this);
            this.SVGLayer = SVGLayer;
            this.EventMapLayer = EventMapLayer;
            this.ContentLayer = ContentLayer;
            this.ControlLayer = ControlLayer;
            this.ScrollManager = new ScrollManager(this);
            this.CameraGX = 0;
            this.CameraGY = 0;
            this.Scale = 1.0;
            this.PageWidth = window.innerWidth;
            this.PageHeight = window.innerHeight;
            this.IsPointerEnabled = true;
            this.CameraMoveTask = new AssureNote.AnimationFrameTask();
            this.IsEventMapUpper = false;
            window.addEventListener("resize", function (e) {
                _this.UpdatePageRect();
            });
            this.UpdatePageRect();
            this.SetCameraPageCenter(this.GetPageCenterX(), this.GetPageCenterY());
            AssureNote.AssureNoteUtils.SetTransformOriginToElement(this.ContentLayer, "left top");
            AssureNote.AssureNoteUtils.SetTransformOriginToElement(this.ControlLayer, "left top");
            this.UpdateAttr();
            var OnPointer = function (e) {
                if (_this.IsPointerEnabled) {
                    _this.ScrollManager.OnPointerEvent(e, _this);
                }
            };
            ["down", "move", "up", "out", "leave", "cancel"].forEach(function (Name) {
                _this.EventMapLayer.addEventListener("pointer" + Name, OnPointer, false);
            });

            $(this.EventMapLayer.parentElement).on('mousewheel', function (e) {
                if (_this.IsPointerEnabled) {
                    _this.ScrollManager.OnMouseWheel(e, _this);
                }
            });
        }
        ViewportManager.prototype.GetCameraScale = function () {
            return this.Scale;
        };

        ViewportManager.LimitScale = function (Scale) {
            return Math.max(0.2, Math.min(20.0, Scale));
        };

        ViewportManager.prototype.SetCameraScale = function (Scale) {
            this.Scale = ViewportManager.LimitScale(Scale);
            this.UpdateAttr();
        };

        ViewportManager.prototype.GetOffsetPageX = function () {
            return this.CameraCenterPageX - this.CameraGX * this.Scale;
        };

        ViewportManager.prototype.GetOffsetPageY = function () {
            return this.CameraCenterPageY - this.CameraGY * this.Scale;
        };

        ViewportManager.prototype.LimitCameraPosition = function () {
            var R = this.CameraLimitRect;
            if (R) {
                if (this.CameraGX < R.X)
                    this.CameraGX = R.X;
                if (this.CameraGY < R.Y)
                    this.CameraGY = R.Y;
                if (this.CameraGX > R.X + R.Width)
                    this.CameraGX = R.X + R.Width;
                if (this.CameraGY > R.Y + R.Height)
                    this.CameraGY = R.Y + R.Height;
            }
        };

        ViewportManager.prototype.SetOffset = function (PageX, PageY) {
            this.CameraGX = (this.CameraCenterPageX - PageX) / this.Scale;
            this.CameraGY = (this.CameraCenterPageY - PageY) / this.Scale;
            this.LimitCameraPosition();
            this.UpdateAttr();
        };

        ViewportManager.prototype.AddOffset = function (PageX, PageY) {
            this.CameraGX -= PageX / this.Scale;
            this.CameraGY -= PageY / this.Scale;
            this.LimitCameraPosition();
            this.UpdateAttr();
        };

        ViewportManager.prototype.GetCameraGX = function () {
            return this.CameraGX;
        };

        ViewportManager.prototype.GetCameraGY = function () {
            return this.CameraGY;
        };

        ViewportManager.prototype.SetCameraPosition = function (GX, GY) {
            this.SetOffset(this.CameraCenterPageX - GX * this.Scale, this.CameraCenterPageY - GY * this.Scale);
        };

        ViewportManager.prototype.SetCamera = function (GX, GY, Scale) {
            this.Scale = Scale;
            this.SetOffset(this.CameraCenterPageX - GX * this.Scale, this.CameraCenterPageY - GY * this.Scale);
        };

        ViewportManager.prototype.MoveCamera = function (GX, GY, Scale) {
            this.Scale += Scale;
            this.CameraGX += GX;
            this.CameraGY += GY;
            this.UpdateAttr();
        };

        ViewportManager.prototype.GetCameraPageCenterX = function () {
            return this.CameraCenterPageX;
        };

        ViewportManager.prototype.GetCameraPageCenterY = function () {
            return this.CameraCenterPageY;
        };

        ViewportManager.prototype.SetCameraPageCenter = function (PageX, PageY) {
            this.CameraCenterPageX = PageX;
            this.CameraCenterPageY = PageY;
        };

        ViewportManager.prototype.PageXFromGX = function (GX) {
            return this.CameraCenterPageX + (GX - this.CameraGX) * this.Scale;
        };

        ViewportManager.prototype.PageYFromGY = function (GY) {
            return this.CameraCenterPageY + (GY - this.CameraGY) * this.Scale;
        };

        ViewportManager.prototype.GXFromPageX = function (PageX) {
            return (PageX - this.CameraCenterPageX) / this.Scale + this.CameraGX;
        };

        ViewportManager.prototype.GYFromPageY = function (PageY) {
            return (PageY - this.CameraCenterPageY) / this.Scale + this.CameraGY;
        };

        ViewportManager.prototype.ConvertRectGlobalXYFromPageXY = function (PageRect) {
            var x1 = this.GXFromPageX(PageRect.X);
            var y1 = this.GYFromPageY(PageRect.Y);
            var x2 = this.GXFromPageX(PageRect.X + PageRect.Width);
            var y2 = this.GYFromPageY(PageRect.Y + PageRect.Height);
            return new AssureNote.Rect(x1, y1, x2 - x1, y2 - y1);
        };

        ViewportManager.prototype.GetPageRectInGxGy = function () {
            var x1 = this.GXFromPageX(0);
            var y1 = this.GYFromPageY(0);
            var x2 = this.GXFromPageX(this.PageWidth);
            var y2 = this.GYFromPageY(this.PageHeight);
            return new AssureNote.Rect(x1, y1, x2 - x1, y2 - y1);
        };

        ViewportManager.prototype.GetPageWidth = function () {
            return this.PageWidth;
        };

        ViewportManager.prototype.GetPageHeight = function () {
            return this.PageHeight;
        };

        ViewportManager.prototype.GetPageCenterX = function () {
            return this.GetPageWidth() * 0.5;
        };

        ViewportManager.prototype.GetPageCenterY = function () {
            return this.GetPageHeight() * 0.5;
        };

        ViewportManager.prototype.Move = function (GX, GY, Scale, Duration) {
            this.MoveTo(this.GetCameraGX() + GX, this.GetCameraGY() + GY, Scale, Duration);
        };

        ViewportManager.prototype.MoveTo = function (GX, GY, Scale, Duration) {
            var Task = this.CreateMoveToTaskFunction(GX, GY, Scale, Duration);
            if (!Task) {
                this.SetCamera(GX, GY, Scale);
                return;
            }
            this.CameraMoveTask.Start(Duration, Task);
        };

        ViewportManager.prototype.CreateMoveTaskFunction = function (GX, GY, Scale, Duration) {
            return this.CreateMoveToTaskFunction(this.GetCameraGX() + GX, this.GetCameraGY() + GY, Scale, Duration);
        };

        ViewportManager.prototype.CreateMoveToTaskFunction = function (GX, GY, Scale, Duration) {
            var _this = this;
            Scale = ViewportManager.LimitScale(Scale);
            if (Duration <= 0) {
                return null;
            }

            var VX = (GX - this.GetCameraGX()) / Duration;
            var VY = (GY - this.GetCameraGY()) / Duration;

            var S0 = this.GetCameraScale();
            var ScaleRate = Scale / S0;
            var DInv = 1 / Duration;
            var ScaleFunction = function (t) {
                return S0 * Math.pow(ScaleRate, t * DInv);
            };

            if (VY == 0 && VX == 0 && (Scale == S0)) {
                return null;
            }

            return (function (deltaT, currentTime, startTime) {
                var DeltaS = ScaleFunction(currentTime - startTime) - ScaleFunction(currentTime - deltaT - startTime);
                _this.MoveCamera(VX * deltaT, VY * deltaT, DeltaS);
            });
        };

        ViewportManager.prototype.UpdatePageRect = function () {
            var CameraCenterXRate = this.CameraCenterPageX / this.PageWidth;
            var CameraCenterYRate = this.CameraCenterPageY / this.PageHeight;
            this.PageWidth = window.innerWidth;
            this.PageHeight = window.innerHeight;
            this.SetCameraPageCenter(this.PageWidth * CameraCenterXRate, this.PageHeight * CameraCenterYRate);
        };

        ViewportManager.prototype.SetEventMapLayerPosition = function (IsUpper) {
            if (IsUpper && !this.IsEventMapUpper) {
                $(this.ControlLayer).after(this.EventMapLayer);
            } else if (!IsUpper && this.IsEventMapUpper) {
                $(this.ContentLayer).before(this.EventMapLayer);
            }
            this.IsEventMapUpper = IsUpper;
        };

        ViewportManager.CreateTranformAttr = function (x, y, scale) {
            return "translate(" + x + " " + y + ") scale(" + scale + ")";
        };

        ViewportManager.CreateTransformStyle = function (x, y, scale) {
            return "translate(" + x + "px, " + y + "px) scale(" + scale + ") ";
        };

        ViewportManager.prototype.UpdateAttr = function () {
            var OffsetPageX = this.GetOffsetPageX();
            var OffsetPageY = this.GetOffsetPageY();
            var attr = ViewportManager.CreateTranformAttr(OffsetPageX, OffsetPageY, this.Scale);
            var style = ViewportManager.CreateTransformStyle(OffsetPageX, OffsetPageY, this.Scale);
            this.SVGLayer.setAttribute("transform", attr);
            AssureNote.AssureNoteUtils.SetTransformToElement(this.ContentLayer, style);
            AssureNote.AssureNoteUtils.SetTransformToElement(this.ControlLayer, style);
            if (this.OnScroll) {
                this.OnScroll(this);
            }
            var Event = new AssureNote.AssureNoteEvent();
            Event.Type = "cameramove";
            Event.Target = this;
            this.DispatchEvent(Event);
        };
        return ViewportManager;
    })(AssureNote.EventTarget);
    AssureNote.ViewportManager = ViewportManager;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var FoldingCommand = (function (_super) {
        __extends(FoldingCommand, _super);
        function FoldingCommand(App) {
            _super.call(this, App);
        }
        FoldingCommand.prototype.GetCommandLineNames = function () {
            return ["fold"];
        };

        FoldingCommand.prototype.GetHelpHTML = function () {
            return "<code>fold label</code><br>Toggle folding state of Goal.";
        };

        FoldingCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length < 1) {
                this.App.DebugP("no args");
                return;
            }
            var Label = Params[0].toUpperCase();
            var event = document.createEvent("UIEvents");
            var TargetView = this.App.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                this.Fold(TargetView);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        };

        FoldingCommand.prototype.Fold = function (TargetView) {
            var Panel = this.App.PictgramPanel;
            var ViewPort = Panel.Viewport;

            this.App.SocketManager.FoldNode({ "IsFolded": TargetView.IsFolded(), "UID": TargetView.Model.UID });

            if (TargetView.GetNodeType() == 2 /* Strategy */) {
                if (TargetView.Children != null) {
                    for (var i = 0; i < TargetView.Children.length; i++) {
                        var SubView = TargetView.Children[i];
                        if (SubView.GetNodeType() == 0 /* Goal */) {
                            SubView.SetIsFolded(true);
                        }
                    }
                }
            } else if (TargetView.GetNodeType() != 0 /* Goal */) {
                this.App.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
                return;
            } else {
                TargetView.SetIsFolded(!TargetView.IsFolded());
            }
            Panel.Draw(Panel.TopNodeView.Label, 300, TargetView);
        };

        FoldingCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return FoldingCommand;
    })(AssureNote.Command);
    AssureNote.FoldingCommand = FoldingCommand;

    var FoldingViewSwitchPlugin = (function (_super) {
        __extends(FoldingViewSwitchPlugin, _super);
        function FoldingViewSwitchPlugin(AssureNoteApp) {
            _super.call(this);
            this.SetHasDoubleClicked(true);
            this.FoldingCommand = new FoldingCommand(AssureNoteApp);
            AssureNoteApp.RegistCommand(this.FoldingCommand);
        }
        FoldingViewSwitchPlugin.prototype.OnNodeDoubleClicked = function (NodeView) {
            if (AssureNote.AssureNoteApp.Current.ModeManager.GetMode() == 1 /* View */) {
                this.FoldingCommand.Fold(NodeView);
            }
        };
        return FoldingViewSwitchPlugin;
    })(AssureNote.Plugin);
    AssureNote.FoldingViewSwitchPlugin = FoldingViewSwitchPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var FoldPlugin = new AssureNote.FoldingViewSwitchPlugin(App);
    App.PluginManager.SetPlugin("fold", FoldPlugin);
});
var AssureNote;
(function (AssureNote) {
    var MessageCommand = (function (_super) {
        __extends(MessageCommand, _super);
        function MessageCommand() {
            _super.apply(this, arguments);
        }
        MessageCommand.prototype.GetCommandLineNames = function () {
            return ["message"];
        };

        MessageCommand.prototype.GetHelpHTML = function () {
            return "<code>message msg</code><br>Send message to the chat server.";
        };

        MessageCommand.prototype.Invoke = function (CommandName, Params) {
            if (this.App.SocketManager.IsConnected()) {
                this.App.SocketManager.Emit('message', Params.join(' '));
                $.notify(Params.join(' '), 'info');
            }
        };

        MessageCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return MessageCommand;
    })(AssureNote.Command);
    AssureNote.MessageCommand = MessageCommand;

    var ConnectCommand = (function (_super) {
        __extends(ConnectCommand, _super);
        function ConnectCommand() {
            _super.apply(this, arguments);
        }
        ConnectCommand.prototype.GetCommandLineNames = function () {
            return ["connect"];
        };

        ConnectCommand.prototype.GetHelpHTML = function () {
            return "<code>connect [room?] [uri?]</code><br>Connect to the chat server.";
        };

        ConnectCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length > 2) {
                this.App.DebugP('Invalid parameter: ' + Params);
                return;
            }
            var room = null;
            var url = null;
            if (Params.length == 2) {
                room = Params[0];
                url = Params[1];
            } else if (Params.length == 1) {
                if (AssureNote.AssureNoteUtils.isValidURL(Params[0])) {
                    url = Params[0];
                } else {
                    room = Params[0];
                }
            }
            this.App.ModeManager.SetMode(1 /* View */);
            if (this.App.SocketManager.IsOperational()) {
                this.App.SocketManager.Connect(room, url);
            }
        };

        ConnectCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return ConnectCommand;
    })(AssureNote.Command);
    AssureNote.ConnectCommand = ConnectCommand;

    var MessageChatPlugin = (function (_super) {
        __extends(MessageChatPlugin, _super);
        function MessageChatPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.AssureNoteApp.SocketManager.RegisterSocketHandler('message', function (data) {
                console.log(data);
                $.notify(data);
            });
            this.AssureNoteApp.RegistCommand(new MessageCommand(this.AssureNoteApp));
        }
        MessageChatPlugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
            NodeView.RemoveColorStyle(AssureNote.ColorStyle.SingleEdit);
            NodeView.RemoveColorStyle(AssureNote.ColorStyle.Locked);
            switch (NodeView.Status) {
                case 1 /* SingleEditable */:
                    NodeView.AddColorStyle(AssureNote.ColorStyle.SingleEdit);
                    break;

                case 2 /* Locked */:
                    NodeView.AddColorStyle(AssureNote.ColorStyle.Locked);
                    break;
            }
        };
        return MessageChatPlugin;
    })(AssureNote.Plugin);
    AssureNote.MessageChatPlugin = MessageChatPlugin;

    var ConnectServerPlugin = (function (_super) {
        __extends(ConnectServerPlugin, _super);
        function ConnectServerPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.AssureNoteApp.RegistCommand(new ConnectCommand(this.AssureNoteApp));
        }
        return ConnectServerPlugin;
    })(AssureNote.Plugin);
    AssureNote.ConnectServerPlugin = ConnectServerPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var MessageChatPlugin = new AssureNote.MessageChatPlugin(App);
    App.PluginManager.SetPlugin("message", MessageChatPlugin);
    var ConnectserverPlugin = new AssureNote.ConnectServerPlugin(App);
    App.PluginManager.SetPlugin("connect", ConnectserverPlugin);
});
var AssureNote;
(function (AssureNote) {
    var VariableInterpolationPlugin = (function (_super) {
        __extends(VariableInterpolationPlugin, _super);
        function VariableInterpolationPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        VariableInterpolationPlugin.prototype.Style = function (str, cls) {
            console.log('Match: ' + str);
            var div = document.createElement('span');
            div.className = cls;
            div.textContent = str;
            return div.outerHTML;
        };

        VariableInterpolationPlugin.prototype.Supplant = function (str, LabelMap, TagMap) {
            var _this = this;
            return str.replace(/\[([^\[\]]*)\]/g, (function (v) {
                var params = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    params[_i] = arguments[_i + 1];
                }
                var b = params[0];
                var value = TagMap[b];
                while (TagMap[value]) {
                    value = TagMap[value];
                }
                if ((typeof value === 'string' && value != '') || typeof value === 'number') {
                    return _this.Style(value, 'node-variable');
                }
                value = LabelMap[b];
                while (LabelMap[value]) {
                    value = LabelMap[value];
                }
                if (typeof value === 'string' && value != '') {
                    return _this.Style(value, 'node-variable');
                }
                return _this.Style(v, 'node-variable-undefined');
            }));
        };

        VariableInterpolationPlugin.prototype.RenderHTML = function (NodeDoc, Model) {
            var Map = Model.GetTagMapWithLexicalScope();
            var LabelMap = Model.BaseDoc.GetLabelMap();
            return this.Supplant(NodeDoc, LabelMap.hash, Map ? Map.hash : {});
        };
        return VariableInterpolationPlugin;
    })(AssureNote.Plugin);
    AssureNote.VariableInterpolationPlugin = VariableInterpolationPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var VariableInterpolationPlugin = new AssureNote.VariableInterpolationPlugin(App);
    App.PluginManager.SetPlugin("variableinterpolation", VariableInterpolationPlugin);
});
var AssureNote;
(function (AssureNote) {
    var ToDoPlugin = (function (_super) {
        __extends(ToDoPlugin, _super);
        function ToDoPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        ToDoPlugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
            NodeView.RemoveColorStyle(AssureNote.ColorStyle.ToDo);
            var TagMap = NodeView.Model.GetTagMap();
            if (!TagMap)
                return;
            if (TagMap.get('TODO') || TagMap.get('TODO') == '') {
                NodeView.AddColorStyle(AssureNote.ColorStyle.ToDo);
            }
            var KeySet = TagMap.keySet();
            for (var key in KeySet) {
                if (TagMap.get(KeySet[key]) == '') {
                    NodeView.AddColorStyle(AssureNote.ColorStyle.ToDo);
                }
            }
        };
        return ToDoPlugin;
    })(AssureNote.Plugin);
    AssureNote.ToDoPlugin = ToDoPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var ToDoPlugin = new AssureNote.ToDoPlugin(App);
    App.PluginManager.SetPlugin("todo", ToDoPlugin);
});
var Debug = {};

(function () {
    var NavBar = document.getElementsByClassName("navbar")[0];
    NavBar.innerHTML = NavBar.innerHTML.replace(/\s\s+/g, "");
})();

$(function () {
    var UA = AssureNote.AssureNoteUtils.UserAgant;
    if (!UA.IsBlink() && !UA.IsWebkit() && !UA.IsGecko()) {
        alert('Not supported browser. Use Chrome/Safari/FireFox.');
        return;
    }

    if (!UA.IsPerformanceEnabled()) {
        window.performance = { now: function () {
                return Date.now();
            } };
    }
    var App = new AssureNote.AssureNoteApp();
    Debug.AssureNote = App;
    Debug.ShowCameraInfo = function () {
        setInterval(function () {
            var p = Debug.AssureNote.PictgramPanel.Viewport;
            var x = p.GetCameraGX();
            var y = p.GetCameraGY();
            var s = p.GetCameraScale();
            document.title = ["(", ~~x, ", ", ~~y, ") ", ~~(s * 100), "%"].join("");
        }, 100);
    };

    Debug.ShowFocusedLabel = function () {
        setInterval(function () {
            var p = Debug.AssureNote.PictgramPanel;
            document.title = p.FocusedLabel || "(not selected)";
        }, 100);
    };

    App.LoadDefaultWGSN();
});
var AssureNote;
(function (AssureNote) {
    var NodeView = (function () {
        function NodeView(Model, IsRecursive) {
            this.Model = Model;
            this.RelativeX = 0;
            this.RelativeY = 0;
            this.Left = null;
            this.Right = null;
            this.Children = null;
            this.Shape = null;
            this.ShouldReLayoutFlag = true;
            this.Label = Model.GetLabel();
            this.NodeDoc = Model.NodeDoc;
            this.IsVisible = true;
            this.IsFoldedFlag = false;
            this.Status = 0 /* TreeEditable */;
            if (IsRecursive && Model.SubNodeList != null) {
                for (var i = 0; i < Model.SubNodeList.length; i++) {
                    var SubNode = Model.SubNodeList[i];
                    var SubView = new NodeView(SubNode, IsRecursive);
                    if (SubNode.NodeType == 1 /* Context */) {
                        this.AppendRightNode(SubView);
                    } else {
                        this.AppendChild(SubView);
                    }
                }
            }
        }
        NodeView.prototype.IsFolded = function () {
            return this.IsFoldedFlag;
        };

        NodeView.prototype.SetIsFolded = function (Flag) {
            if (this.IsFoldedFlag != Flag) {
                this.SetShouldReLayout(true);
            }
            this.IsFoldedFlag = Flag;
        };

        NodeView.prototype.SetShouldReLayout = function (Flag) {
            if (!this.ShouldReLayoutFlag && Flag && this.Parent) {
                this.Parent.SetShouldReLayout(true);
            }
            this.ShouldReLayoutFlag = Flag;
        };

        NodeView.prototype.ShouldReLayout = function () {
            return this.ShouldReLayoutFlag;
        };

        NodeView.prototype.UpdateViewMap = function (ViewMap) {
            ViewMap[this.Label] = this;
            if (this.Left != null) {
                for (var i = 0; i < this.Left.length; i++) {
                    this.Left[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Right != null) {
                for (var i = 0; i < this.Right.length; i++) {
                    this.Right[i].UpdateViewMap(ViewMap);
                }
            }
            if (this.Children != null) {
                for (var i = 0; i < this.Children.length; i++) {
                    this.Children[i].UpdateViewMap(ViewMap);
                }
            }
        };

        NodeView.prototype.AppendChild = function (SubNode) {
            if (this.Children == null) {
                this.Children = [];
            }
            this.Children.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.AppendLeftNode = function (SubNode) {
            if (this.Left == null) {
                this.Left = [];
            }
            this.Left.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.AppendRightNode = function (SubNode) {
            if (this.Right == null) {
                this.Right = [];
            }
            this.Right.push(SubNode);
            SubNode.Parent = this;
        };

        NodeView.prototype.GetShape = function () {
            if (this.Shape == null) {
                this.Shape = AssureNote.AssureNoteUtils.CreateGSNShape(this);
            }
            return this.Shape;
        };

        NodeView.prototype.SetShape = function (Shape) {
            if (this.Shape) {
                this.Shape.NodeView = null;
            }
            if (Shape) {
                Shape.NodeView = this;
            }
            this.Shape = Shape;
        };

        NodeView.prototype.GetGX = function () {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].X;
            }
            if (this.Parent == null) {
                return this.RelativeX;
            }
            return this.Parent.GetGX() + this.RelativeX;
        };

        NodeView.prototype.GetGY = function () {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Y;
            }
            if (this.Parent == null) {
                return this.RelativeY;
            }
            return this.Parent.GetGY() + this.RelativeY;
        };

        NodeView.prototype.GetCenterGX = function () {
            return this.GetGX() + this.Shape.GetNodeWidth() * 0.5;
        };

        NodeView.prototype.GetCenterGY = function () {
            return this.GetGY() + this.Shape.GetNodeHeight() * 0.5;
        };

        NodeView.SetGlobalPositionCacheEnabled = function (State) {
            if (State && NodeView.GlobalPositionCache == null) {
                NodeView.GlobalPositionCache = {};
            } else if (!State) {
                NodeView.GlobalPositionCache = null;
            }
        };

        NodeView.prototype.GetGlobalPosition = function () {
            if (NodeView.GlobalPositionCache != null && NodeView.GlobalPositionCache[this.Label]) {
                return NodeView.GlobalPositionCache[this.Label].Clone();
            }
            if (this.Parent == null) {
                return new AssureNote.Point(this.RelativeX, this.RelativeY);
            }
            var ParentPosition = this.Parent.GetGlobalPosition();
            ParentPosition.X += this.RelativeX;
            ParentPosition.Y += this.RelativeY;
            if (NodeView.GlobalPositionCache != null) {
                NodeView.GlobalPositionCache[this.Label] = ParentPosition.Clone();
            }
            return ParentPosition;
        };

        NodeView.prototype.GetNodeType = function () {
            return this.Model.NodeType;
        };

        NodeView.prototype.Render = function (DivFrag, SvgNodeFrag, SvgConnectionFrag) {
            this.Shape.Render(DivFrag, SvgNodeFrag, SvgConnectionFrag);
        };

        NodeView.prototype.SaveFlags = function (OldViewMap) {
            var OldView = OldViewMap[this.Model.GetLabel()];
            if (OldView) {
                this.IsFoldedFlag = OldView.IsFoldedFlag;
                this.Status = OldView.Status;
                if (this.NodeDoc == OldView.NodeDoc && this.GetNodeType() == OldView.GetNodeType() && !OldView.HasParameter()) {
                    this.SetShape(OldView.GetShape());
                } else {
                    this.GetShape().SetColorStyle(OldView.GetShape().GetColorStyle());
                }
            }

            for (var i = 0; this.Children && i < this.Children.length; i++) {
                this.Children[i].SaveFlags(OldViewMap);
            }
            for (var i = 0; this.Left && i < this.Left.length; i++) {
                this.Left[i].SaveFlags(OldViewMap);
            }
            for (var i = 0; this.Right && i < this.Right.length; i++) {
                this.Right[i].SaveFlags(OldViewMap);
            }
        };

        NodeView.prototype.GetConnectorPosition = function (Dir, GlobalPosition) {
            var P = this.Shape.GetConnectorPosition(Dir);
            P.X += GlobalPosition.X;
            P.Y += GlobalPosition.Y;
            return P;
        };

        NodeView.prototype.UpdateNodePosition = function (AnimationCallbacks, Duration, ScreenRect, UnfoldBaseNode) {
            var _this = this;
            Duration = Duration || 0;
            if (!this.IsVisible) {
                return;
            }
            var UpdateSubNode = function (SubNode) {
                var Base = UnfoldBaseNode;
                if (!Base && SubNode.Shape.WillFadein()) {
                    Base = _this;
                }
                if (Base && Duration > 0) {
                    SubNode.Shape.SetFadeinBasePosition(Base.Shape.GetGXCache(), Base.Shape.GetGYCache());
                    SubNode.UpdateNodePosition(AnimationCallbacks, Duration, ScreenRect, Base);
                } else {
                    SubNode.UpdateNodePosition(AnimationCallbacks, Duration, ScreenRect);
                }
            };

            var GlobalPosition = this.GetGlobalPosition();
            this.Shape.MoveTo(AnimationCallbacks, GlobalPosition.X, GlobalPosition.Y, Duration, ScreenRect);

            var ArrowDirections = [3 /* Bottom */, 2 /* Right */, 0 /* Left */];
            var SubNodeTypes = [this.Children, this.Right, this.Left];
            for (var i = 0; i < 3; ++i) {
                var P1 = this.GetConnectorPosition(ArrowDirections[i], GlobalPosition);
                var ArrowToDirection = AssureNote.ReverseDirection(ArrowDirections[i]);
                this.ForEachVisibleSubNode(SubNodeTypes[i], function (SubNode) {
                    var P2 = SubNode.GetConnectorPosition(ArrowToDirection, SubNode.GetGlobalPosition());
                    UpdateSubNode(SubNode);
                    SubNode.Shape.MoveArrowTo(AnimationCallbacks, P1, P2, ArrowDirections[i], Duration, ScreenRect);
                    SubNode.ParentDirection = AssureNote.ReverseDirection(ArrowDirections[i]);
                });
            }
        };

        NodeView.prototype.ForEachVisibleSubNode = function (SubNodes, Action) {
            if (SubNodes != null && !this.IsFoldedFlag) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (SubNodes[i].IsVisible) {
                        if (Action(SubNodes[i]) === false) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        NodeView.prototype.ForEachVisibleChildren = function (Action) {
            this.ForEachVisibleSubNode(this.Children, Action);
        };

        NodeView.prototype.ForEachVisibleRightNodes = function (Action) {
            this.ForEachVisibleSubNode(this.Right, Action);
        };

        NodeView.prototype.ForEachVisibleLeftNodes = function (Action) {
            this.ForEachVisibleSubNode(this.Left, Action);
        };

        NodeView.prototype.ForEachVisibleAllSubNodes = function (Action) {
            if (this.ForEachVisibleSubNode(this.Left, Action) && this.ForEachVisibleSubNode(this.Right, Action) && this.ForEachVisibleSubNode(this.Children, Action))
                return true;
            return false;
        };

        NodeView.prototype.TraverseVisibleNode = function (Action) {
            Action(this);
            this.ForEachVisibleAllSubNodes(function (SubNode) {
                SubNode.TraverseVisibleNode(Action);
            });
        };

        NodeView.prototype.ForEachSubNode = function (SubNodes, Action) {
            if (SubNodes != null) {
                for (var i = 0; i < SubNodes.length; i++) {
                    if (Action(SubNodes[i]) === false) {
                        return false;
                    }
                }
            }
            return true;
        };

        NodeView.prototype.ForEachAllSubNodes = function (Action) {
            if (this.ForEachSubNode(this.Left, Action) && this.ForEachSubNode(this.Right, Action) && this.ForEachSubNode(this.Children, Action))
                return true;
            return false;
        };

        NodeView.prototype.TraverseNode = function (Action) {
            if (Action(this) === false)
                return false;
            if (this.ForEachAllSubNodes(function (SubNode) {
                return SubNode.TraverseNode(Action);
            }))
                return true;
            return false;
        };

        NodeView.prototype.ClearAnimationCache = function (Force) {
            if (Force || !this.IsVisible) {
                this.GetShape().ClearAnimationCache();
            }
            if (Force || this.IsFoldedFlag) {
                this.ForEachAllSubNodes(function (SubNode) {
                    SubNode.ClearAnimationCache(true);
                });
            } else {
                this.ForEachAllSubNodes(function (SubNode) {
                    SubNode.ClearAnimationCache(false);
                });
            }
        };

        NodeView.prototype.HasSideNode = function () {
            return (this.Left != null && this.Left.length > 0) || (this.Right != null && this.Right.length > 0);
        };

        NodeView.prototype.HasChildren = function () {
            return (this.Children != null && this.Children.length > 0);
        };

        NodeView.prototype.AddColorStyle = function (ColorStyle) {
            this.Shape.AddColorStyle(ColorStyle);
        };

        NodeView.prototype.RemoveColorStyle = function (ColorStyle) {
            this.Shape.RemoveColorStyle(ColorStyle);
        };

        NodeView.prototype.IsInRect = function (Target) {
            var GXC = this.Shape.GetGXCache();
            var GYC = this.Shape.GetGYCache();
            var Pos;
            if (GXC != null && GYC != null) {
                Pos = new AssureNote.Point(GXC, GYC);
            } else {
                Pos = this.GetGlobalPosition();
            }
            if (Pos.X > Target.X + Target.Width || Pos.Y > Target.Y + Target.Height) {
                return false;
            }
            Pos.X += this.Shape.GetNodeWidth();
            Pos.Y += this.Shape.GetNodeHeight();
            if (Pos.X < Target.X || Pos.Y < Target.Y) {
                return false;
            }
            return true;
        };

        NodeView.prototype.IsConnectorInRect = function (Target) {
            if (!this.Parent) {
                return false;
            }
            var PA;
            var PB;
            if (this.Shape.GetGXCache() != null && this.Shape.GetGYCache() != null) {
                PA = this.Shape.GetArrowP1Cache();
                PB = this.Shape.GetArrowP2Cache();
            } else {
                PA = this.GetConnectorPosition(this.ParentDirection, this.GetGlobalPosition());
                PB = this.Parent.GetConnectorPosition(AssureNote.ReverseDirection(this.ParentDirection), this.Parent.GetGlobalPosition());
            }
            var Pos = new AssureNote.Point(Math.min(PA.X, PB.X), Math.min(PA.Y, PB.Y));
            if (Pos.X > Target.X + Target.Width || Pos.Y > Target.Y + Target.Height) {
                return false;
            }
            Pos.X = Math.max(PA.X, PB.X);
            Pos.Y = Math.max(PA.Y, PB.Y);
            if (Pos.X < Target.X || Pos.Y < Target.Y) {
                return false;
            }
            return true;
        };

        NodeView.prototype.HasParameter = function () {
            return this.NodeDoc.match(/\[([^\[\]]*)\]/) != null;
        };
        NodeView.GlobalPositionCache = null;
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;

    (function (EditStatus) {
        EditStatus[EditStatus["TreeEditable"] = 0] = "TreeEditable";
        EditStatus[EditStatus["SingleEditable"] = 1] = "SingleEditable";
        EditStatus[EditStatus["Locked"] = 2] = "Locked";
    })(AssureNote.EditStatus || (AssureNote.EditStatus = {}));
    var EditStatus = AssureNote.EditStatus;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var GSNShapeSizePreFetcher = (function () {
        function GSNShapeSizePreFetcher() {
            var _this = this;
            this.Queue = [];
            this.TimerHandle = 0;
            this.DummyDiv = document.createElement("div");
            this.DummyDiv.style.position = "absolute";
            this.DummyDiv.style.top = "1000%";
            document.body.appendChild(this.DummyDiv);

            setInterval(function () {
                if (_this.Queue.length) {
                    console.log("size prefetch: " + _this.Queue.length + " nodes left");
                }
            }, 1000);
        }
        GSNShapeSizePreFetcher.prototype.Start = function () {
            var _this = this;
            this.TimerHandle = setInterval(function () {
                var StartTime = AssureNote.AssureNoteUtils.GetTime();
                while (_this.Queue.length > 0 && AssureNote.AssureNoteUtils.GetTime() - StartTime < 16) {
                    var Shape = _this.Queue.shift();
                    if (Shape.NodeView && !Shape.IsSizeCached()) {
                        Shape.PrerenderContent(AssureNote.AssureNoteApp.Current.PluginManager);
                        if (!Shape.Content.parentElement) {
                            _this.DummyDiv.appendChild(Shape.Content);
                        }
                        Shape.GetNodeWidth();
                        Shape.GetHeadHeight();
                        _this.DummyDiv.removeChild(Shape.Content);
                    }
                }
                if (_this.Queue.length == 0) {
                    clearInterval(_this.TimerHandle);
                    _this.TimerHandle = 0;
                }
            }, 20);
        };

        GSNShapeSizePreFetcher.prototype.AddShape = function (Shape) {
            this.Queue.push(Shape);
            if (!this.TimerHandle) {
                this.Start();
            }
        };
        return GSNShapeSizePreFetcher;
    })();
    AssureNote.GSNShapeSizePreFetcher = GSNShapeSizePreFetcher;

    var GSNShape = (function () {
        function GSNShape(NodeView) {
            this.NodeView = NodeView;
            this.ColorStyles = [AssureNote.ColorStyle.Default];
            this.willFadein = false;
            this.GXCache = null;
            this.GYCache = null;
            this.Content = null;
            this.NodeWidthCache = GSNShape.DefaultWidth;
            this.NodeHeightCache = 0;
            this.HeadBoundingBox = new AssureNote.Rect(0, 0, 0, 0);
            this.TreeBoundingBox = new AssureNote.Rect(0, 0, 0, 0);
            if (GSNShape.AsyncSizePrefetcher == null) {
                GSNShape.AsyncSizePrefetcher = new GSNShapeSizePreFetcher();
            }
            GSNShape.AsyncSizePrefetcher.AddShape(this);
        }
        GSNShape.prototype.IsSizeCached = function () {
            return this.NodeHeightCache != 0 && this.NodeWidthCache != 0;
        };

        GSNShape.CreateArrowPath = function () {
            return GSNShape.ArrowPathMaster.cloneNode();
        };

        GSNShape.prototype.SetTreeRect = function (LocalX, LocalY, Width, Height) {
            this.SetTreeUpperLeft(LocalX, LocalY);
            this.SetTreeSize(Width, Height);
        };

        GSNShape.prototype.SetHeadRect = function (LocalX, LocalY, Width, Height) {
            this.SetHeadUpperLeft(LocalX, LocalY);
            this.SetHeadSize(Width, Height);
        };

        GSNShape.prototype.SetTreeSize = function (Width, Height) {
            this.TreeBoundingBox.Width = Width;
            this.TreeBoundingBox.Height = Height;
        };

        GSNShape.prototype.SetHeadSize = function (Width, Height) {
            this.HeadBoundingBox.Width = Width;
            this.HeadBoundingBox.Height = Height;
        };

        GSNShape.prototype.GetNodeWidth = function () {
            return this.NodeWidthCache;
        };

        GSNShape.prototype.GetNodeHeight = function () {
            if (this.NodeHeightCache == 0) {
                var Cached = GSNShape.NodeHeightCache[this.Content.innerHTML];
                if (Cached) {
                    this.NodeHeightCache = Cached;
                } else {
                    GSNShape.NodeHeightCache[this.Content.innerHTML] = this.NodeHeightCache = this.Content.clientHeight;
                }
            }
            return this.NodeHeightCache;
        };

        GSNShape.prototype.GetTreeWidth = function () {
            if (this.TreeBoundingBox.Width == 0) {
                this.TreeBoundingBox.Width = 250;
            }
            return this.TreeBoundingBox.Width;
        };

        GSNShape.prototype.GetTreeHeight = function () {
            if (this.TreeBoundingBox.Height == 0) {
                this.TreeBoundingBox.Height = 100;
            }
            return this.TreeBoundingBox.Height;
        };

        GSNShape.prototype.GetHeadWidth = function () {
            if (this.HeadBoundingBox.Width == 0) {
                this.HeadBoundingBox.Width = 250;
            }
            return this.HeadBoundingBox.Width;
        };

        GSNShape.prototype.GetHeadHeight = function () {
            if (this.HeadBoundingBox.Height == 0) {
                this.HeadBoundingBox.Height = 100;
            }
            return this.HeadBoundingBox.Height;
        };

        GSNShape.prototype.GetTreeLeftLocalX = function () {
            return this.TreeBoundingBox.X;
        };

        GSNShape.prototype.GetHeadLeftLocalX = function () {
            return this.HeadBoundingBox.X;
        };

        GSNShape.prototype.SetTreeUpperLeft = function (LocalX, LocalY) {
            this.TreeBoundingBox.X = LocalX;
            this.TreeBoundingBox.Y = LocalY;
        };

        GSNShape.prototype.SetHeadUpperLeft = function (LocalX, LocalY) {
            this.HeadBoundingBox.X = LocalX;
            this.HeadBoundingBox.Y = LocalY;
        };

        GSNShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node";
        };

        GSNShape.prototype.FormatNewLine = function (doc) {
            return doc.replace(/\n/g, '<br>');
        };

        GSNShape.prototype.PrerenderHTMLContent = function (manager) {
            if (this.Content == null) {
                var div = document.createElement("div");
                this.Content = div;

                div.style.position = "absolute";
                div.id = this.NodeView.Label;

                var h4 = document.createElement("h4");
                h4.textContent = this.NodeView.Label;

                var p = document.createElement("p");
                var encoded = AssureNote.AssureNoteUtils.HTMLEncode(this.NodeView.NodeDoc.trim());
                p.innerHTML = this.FormatNewLine(manager.InvokeHTMLRenderPlugin(encoded, this.NodeView.Model));

                this.UpdateHtmlClass();
                div.appendChild(h4);
                div.appendChild(p);
            }
        };

        GSNShape.prototype.PrerenderContent = function (manager) {
            this.PrerenderHTMLContent(manager);
            this.PrerenderSVGContent(manager);
        };

        GSNShape.prototype.Render = function (HtmlContentFragment, SvgNodeFragment, SvgConnectionFragment) {
            SvgNodeFragment.appendChild(this.ShapeGroup);
            if (this.ArrowPath != null && this.NodeView.Parent != null) {
                SvgConnectionFragment.appendChild(this.ArrowPath);
            }
            HtmlContentFragment.appendChild(this.Content);
        };

        GSNShape.prototype.FitSizeToContent = function () {
        };

        GSNShape.prototype.RemoveAnimateElement = function (Animate) {
            if (Animate) {
                var Parent = Animate.parentNode;
                if (Parent) {
                    Parent.removeChild(Animate);
                }
            }
        };

        GSNShape.prototype.SetPosition = function (x, y) {
            if (this.NodeView.IsVisible) {
                var div = this.Content;
                if (div != null) {
                    div.style.left = x + "px";
                    div.style.top = y + "px";
                }
                var mat = this.ShapeGroup.transform.baseVal.getItem(0).matrix;
                mat.e = x;
                mat.f = y;
            }
            this.GXCache = x;
            this.GYCache = y;
        };

        GSNShape.prototype.SetOpacity = function (Opacity) {
            this.Content.style.opacity = Opacity.toString();
            this.ShapeGroup.style.opacity = Opacity.toString();
        };

        GSNShape.prototype.Fadein = function (AnimationCallbacks, Duration) {
            var _this = this;
            var V = 1 / Duration;
            var Opacity = 0;
            AnimationCallbacks.push(function (deltaT) {
                Opacity += V * deltaT;
                _this.SetOpacity(Opacity);
                _this.SetArrowOpacity(Opacity);
            });
        };

        GSNShape.prototype.MoveTo = function (AnimationCallbacks, x, y, Duration, ScreenRect) {
            var _this = this;
            if (Duration <= 0) {
                this.SetPosition(x, y);
                return;
            }

            if (this.WillFadein()) {
                GSNShape.__Debug_Animation_TotalNodeCount++;
                if (ScreenRect && (y + this.GetNodeHeight() < ScreenRect.Y || y > ScreenRect.Y + ScreenRect.Height)) {
                    this.SetPosition(x, y);
                    this.willFadein = false;
                    GSNShape.__Debug_Animation_SkippedNodeCount++;
                    return;
                }
                this.Fadein(AnimationCallbacks, Duration);
                this.willFadein = false;
                if (this.GXCache == null || this.GYCache == null) {
                    this.SetPosition(x, y);
                    GSNShape.__Debug_Animation_SkippedNodeCount++;
                    return;
                }
            }

            if (ScreenRect) {
                GSNShape.__Debug_Animation_TotalNodeCount++;
                if (this.GXCache + this.GetNodeWidth() < ScreenRect.X || this.GXCache > ScreenRect.X + ScreenRect.Width) {
                    if (x + this.GetNodeWidth() < ScreenRect.X || x > ScreenRect.X + ScreenRect.Width) {
                        GSNShape.__Debug_Animation_SkippedNodeCount++;
                        this.SetPosition(x, y);
                        return;
                    }
                }
                if (this.GYCache + this.GetNodeHeight() < ScreenRect.Y || this.GYCache > ScreenRect.Y + ScreenRect.Height) {
                    GSNShape.__Debug_Animation_SkippedNodeCount++;
                    this.SetPosition(x, y);
                    return;
                }
            }

            var VX = (x - this.GXCache) / Duration;
            var VY = (y - this.GYCache) / Duration;

            AnimationCallbacks.push(function (deltaT) {
                return _this.SetPosition(_this.GXCache + VX * deltaT, _this.GYCache + VY * deltaT);
            });
        };

        GSNShape.prototype.SetFadeinBasePosition = function (StartGX, StartGY) {
            this.willFadein = true;
            this.GXCache = StartGX;
            this.GYCache = StartGY;
            this.ArrowP1Cache = this.ArrowP2Cache = new AssureNote.Point(StartGX + this.GetNodeWidth() * 0.5, StartGY + this.GetNodeHeight() * 0.5);
        };

        GSNShape.prototype.GetGXCache = function () {
            return this.GXCache;
        };

        GSNShape.prototype.GetGYCache = function () {
            return this.GYCache;
        };

        GSNShape.prototype.WillFadein = function () {
            return this.willFadein || this.GXCache == null || this.GYCache == null;
        };

        GSNShape.prototype.ClearAnimationCache = function () {
            this.GXCache = null;
            this.GYCache = null;
        };

        GSNShape.prototype.PrerenderSVGContent = function (manager) {
            this.ShapeGroup = AssureNote.AssureNoteUtils.CreateSVGElement("g");
            this.ShapeGroup.setAttribute("transform", "translate(0,0)");
            this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
            this.ArrowPath = GSNShape.CreateArrowPath();
            this.ArrowStart = this.ArrowPath.pathSegList.getItem(0);
            this.ArrowCurve = this.ArrowPath.pathSegList.getItem(1);
            manager.InvokeSVGRenderPlugin(this.ShapeGroup, this.NodeView);
        };

        GSNShape.prototype.GetArrowP1Cache = function () {
            return this.ArrowP1Cache;
        };

        GSNShape.prototype.GetArrowP2Cache = function () {
            return this.ArrowP2Cache;
        };

        GSNShape.prototype.SetArrowPosition = function (P1, P2, Dir) {
            var start = this.ArrowStart;
            var curve = this.ArrowCurve;
            start.x = P1.X;
            start.y = P1.Y;
            curve.x = P2.X;
            curve.y = P2.Y;
            if (Dir == 3 /* Bottom */ || Dir == 1 /* Top */) {
                var DiffX = Math.abs(P1.X - P2.X);
                curve.x1 = (9 * P1.X + P2.X) / 10;
                curve.y1 = P2.Y;
                curve.x2 = (9 * P2.X + P1.X) / 10;
                curve.y2 = P1.Y;
                if (DiffX > 300) {
                    curve.x1 = P1.X - 10 * (P1.X - P2.X < 0 ? -1 : 1);
                    curve.x2 = P2.X + 10 * (P1.X - P2.X < 0 ? -1 : 1);
                }
                if (DiffX < 50) {
                    curve.y1 = curve.y2 = (P1.Y + P2.Y) * 0.5;
                }
            } else {
                curve.x1 = (P1.X + P2.X) / 2;
                curve.y1 = (9 * P1.Y + P2.Y) / 10;
                curve.x2 = (P1.X + P2.X) / 2;
                curve.y2 = (9 * P2.Y + P1.Y) / 10;
            }
            this.ArrowP1Cache = P1;
            this.ArrowP2Cache = P2;
        };

        GSNShape.prototype.SetArrowOpacity = function (Opacity) {
            this.ArrowPath.style.opacity = Opacity.toString();
        };

        GSNShape.prototype.MoveArrowTo = function (AnimationCallbacks, P1, P2, Dir, Duration, ScreenRect) {
            var _this = this;
            if (Duration <= 0) {
                this.SetArrowPosition(P1, P2, Dir);
                return;
            }
            if (ScreenRect) {
                var R0 = this.ArrowP1Cache.X < this.ArrowP2Cache.X ? this.ArrowP2Cache.X : this.ArrowP1Cache.X;
                var L0 = this.ArrowP1Cache.X < this.ArrowP2Cache.X ? this.ArrowP1Cache.X : this.ArrowP2Cache.X;
                if (R0 < ScreenRect.X || L0 > ScreenRect.X + ScreenRect.Width) {
                    var R1 = P1.X < P2.X ? P2.X : P1.X;
                    var L1 = P1.X < P2.X ? P1.X : P2.X;
                    if (R1 < ScreenRect.X || L1 > ScreenRect.X + ScreenRect.Width) {
                        this.SetArrowPosition(P1, P2, Dir);
                        return;
                    }
                }
                if (this.ArrowP2Cache.Y < ScreenRect.Y || this.ArrowP1Cache.Y > ScreenRect.Y + ScreenRect.Height) {
                    this.SetArrowPosition(P1, P2, Dir);
                    return;
                }
            }

            if (this.ArrowP1Cache == this.ArrowP2Cache && ScreenRect && (P2.Y + this.GetNodeHeight() < ScreenRect.Y || P1.Y > ScreenRect.Y + ScreenRect.Height)) {
                this.SetArrowPosition(P1, P2, Dir);
                return;
            }

            var P1VX = (P1.X - this.ArrowP1Cache.X) / Duration;
            var P1VY = (P1.Y - this.ArrowP1Cache.Y) / Duration;
            var P2VX = (P2.X - this.ArrowP2Cache.X) / Duration;
            var P2VY = (P2.Y - this.ArrowP2Cache.Y) / Duration;

            var CurrentP1 = this.ArrowP1Cache.Clone();
            var CurrentP2 = this.ArrowP2Cache.Clone();

            AnimationCallbacks.push(function (deltaT) {
                CurrentP1.X += P1VX * deltaT;
                CurrentP1.Y += P1VY * deltaT;
                CurrentP2.X += P2VX * deltaT;
                CurrentP2.Y += P2VY * deltaT;
                _this.SetArrowPosition(CurrentP1, CurrentP2, Dir);
            });
        };

        GSNShape.prototype.SetArrowColorWhite = function (IsWhite) {
            if (IsWhite) {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            } else {
                this.ArrowPath.setAttribute("marker-end", "url(#Triangle-black)");
            }
        };

        GSNShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case 2 /* Right */:
                    return new AssureNote.Point(this.GetNodeWidth(), this.GetNodeHeight() / 2);
                case 0 /* Left */:
                    return new AssureNote.Point(0, this.GetNodeHeight() / 2);
                case 1 /* Top */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, 0);
                case 3 /* Bottom */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
                default:
                    return new AssureNote.Point(0, 0);
            }
        };

        GSNShape.prototype.AddColorStyle = function (ColorStyleCode) {
            if (ColorStyleCode) {
                if (this.ColorStyles.indexOf(ColorStyleCode) < 0) {
                    this.ColorStyles.push(ColorStyleCode);
                }
                if (this.ShapeGroup) {
                    this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
                }
            }
        };

        GSNShape.prototype.RemoveColorStyle = function (ColorStyleCode) {
            if (ColorStyleCode && ColorStyleCode != AssureNote.ColorStyle.Default) {
                var Index = this.ColorStyles.indexOf(ColorStyleCode);
                if (Index > 0) {
                    this.ColorStyles.splice(Index, 1);
                }
                if (this.ShapeGroup) {
                    this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
                }
            }
        };

        GSNShape.prototype.GetColorStyle = function () {
            return this.ColorStyles;
        };

        GSNShape.prototype.SetColorStyle = function (Styles) {
            this.ColorStyles = Styles;
            if (this.ColorStyles.indexOf(AssureNote.ColorStyle.Default) < 0) {
                this.ColorStyles.push(AssureNote.ColorStyle.Default);
            }
        };

        GSNShape.prototype.ClearColorStyle = function () {
            this.ColorStyles = [AssureNote.ColorStyle.Default];
            if (this.ShapeGroup) {
                this.ShapeGroup.setAttribute("class", this.ColorStyles.join(" "));
            }
        };
        GSNShape.NodeHeightCache = {};

        GSNShape.DefaultWidth = 250;

        GSNShape.ArrowPathMaster = (function () {
            var Master = AssureNote.AssureNoteUtils.CreateSVGElement("path");
            Master.setAttribute("marker-end", "url(#Triangle-black)");
            Master.setAttribute("fill", "none");
            Master.setAttribute("stroke", "gray");
            Master.setAttribute("d", "M0,0 C0,0 0,0 0,0");
            return Master;
        })();
        return GSNShape;
    })();
    AssureNote.GSNShape = GSNShape;

    var GSNGoalShape = (function (_super) {
        __extends(GSNGoalShape, _super);
        function GSNGoalShape() {
            _super.apply(this, arguments);
        }
        GSNGoalShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            this.ShapeGroup.appendChild(this.BodyRect);
            if (this.NodeView.IsFolded()) {
                this.ShapeGroup.appendChild(GSNGoalShape.ModuleSymbolMaster.cloneNode());
            }
            if (this.NodeView.Children == null && !this.NodeView.IsFolded()) {
                this.UndevelopedSymbol = GSNGoalShape.UndevelopedSymbolMaster.cloneNode();
                this.ShapeGroup.appendChild(this.UndevelopedSymbol);
            }
        };

        GSNGoalShape.prototype.FitSizeToContent = function () {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
            if (this.NodeView.Children == null && !this.NodeView.IsFolded()) {
                var x = (this.GetNodeWidth() / 2).toString();
                var y = (this.GetNodeHeight() + 20).toString();
                this.UndevelopedSymbol.setAttribute("transform", "translate(" + x + "," + y + ")");
                this.UndevelopedSymbol.setAttribute("y", y + "px");
            }
        };

        GSNGoalShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-goal";
        };
        GSNGoalShape.ModuleSymbolMaster = (function () {
            var Master = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            Master.setAttribute("width", "80px");
            Master.setAttribute("height", "13px");
            Master.setAttribute("y", "-13px");
            return Master;
        })();

        GSNGoalShape.UndevelopedSymbolMaster = (function () {
            var Master = AssureNote.AssureNoteUtils.CreateSVGElement("polygon");
            Master.setAttribute("points", "0 -20 -20 0 0 20 20 0");
            return Master;
        })();
        return GSNGoalShape;
    })(GSNShape);
    AssureNote.GSNGoalShape = GSNGoalShape;

    var GSNContextShape = (function (_super) {
        __extends(GSNContextShape, _super);
        function GSNContextShape() {
            _super.apply(this, arguments);
        }
        GSNContextShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyRect = AssureNote.AssureNoteUtils.CreateSVGElement("rect");
            this.ArrowPath.setAttribute("marker-end", "url(#Triangle-white)");
            this.BodyRect.setAttribute("rx", "10");
            this.BodyRect.setAttribute("ry", "10");
            this.ShapeGroup.appendChild(this.BodyRect);
        };

        GSNContextShape.prototype.FitSizeToContent = function () {
            this.BodyRect.setAttribute("width", this.GetNodeWidth().toString());
            this.BodyRect.setAttribute("height", this.GetNodeHeight().toString());
        };

        GSNContextShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-context";
        };
        return GSNContextShape;
    })(GSNShape);
    AssureNote.GSNContextShape = GSNContextShape;

    var GSNStrategyShape = (function (_super) {
        __extends(GSNStrategyShape, _super);
        function GSNStrategyShape() {
            _super.apply(this, arguments);
            this.delta = 20;
        }
        GSNStrategyShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyPolygon = AssureNote.AssureNoteUtils.CreateSVGElement("polygon");
            this.ShapeGroup.appendChild(this.BodyPolygon);
        };

        GSNStrategyShape.prototype.FitSizeToContent = function () {
            var w = this.GetNodeWidth();
            var h = this.GetNodeHeight();
            this.BodyPolygon.setAttribute("points", "" + this.delta + ",0 " + w + ",0 " + (w - this.delta) + "," + h + " 0," + h);
        };

        GSNStrategyShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-strategy";
        };

        GSNStrategyShape.prototype.GetConnectorPosition = function (Dir) {
            switch (Dir) {
                case 2 /* Right */:
                    return new AssureNote.Point(this.GetNodeWidth() - this.delta / 2, this.GetNodeHeight() / 2);
                case 0 /* Left */:
                    return new AssureNote.Point(this.delta / 2, this.GetNodeHeight() / 2);
                case 1 /* Top */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, 0);
                case 3 /* Bottom */:
                    return new AssureNote.Point(this.GetNodeWidth() / 2, this.GetNodeHeight());
            }
        };
        return GSNStrategyShape;
    })(GSNShape);
    AssureNote.GSNStrategyShape = GSNStrategyShape;

    var GSNEvidenceShape = (function (_super) {
        __extends(GSNEvidenceShape, _super);
        function GSNEvidenceShape() {
            _super.apply(this, arguments);
        }
        GSNEvidenceShape.prototype.IsMonitorNodeShape = function () {
            var ThisModel = this.NodeView.Model;
            var GoalModel = ThisModel.GetCloseGoal();
            var ContextModel = null;

            for (var i = 0; i < GoalModel.SubNodeList.length; i++) {
                var BroutherModel = GoalModel.SubNodeList[i];
                if (BroutherModel.IsContext()) {
                    ContextModel = BroutherModel;
                    break;
                }
            }
            if (ContextModel == null) {
                return false;
            }

            var TagMap = ContextModel.GetTagMapWithLexicalScope();
            var Location = TagMap.get("Location");
            var Condition = TagMap.get("Condition");
            if (Location && Condition) {
                return true;
            }

            return false;
        };

        GSNEvidenceShape.prototype.PrerenderSVGContent = function (manager) {
            _super.prototype.PrerenderSVGContent.call(this, manager);
            this.BodyEllipse = AssureNote.AssureNoteUtils.CreateSVGElement("ellipse");
            this.ShapeGroup.appendChild(this.BodyEllipse);

            if (this.IsMonitorNodeShape()) {
                var MonitorMaster = GSNEvidenceShape.MonitorLabelMaster.cloneNode();
                MonitorMaster.textContent = "M";
                this.ShapeGroup.appendChild(MonitorMaster);
            }
        };

        GSNEvidenceShape.prototype.FitSizeToContent = function () {
            this.BodyEllipse.setAttribute("cx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("cy", (this.GetNodeHeight() / 2).toString());
            this.BodyEllipse.setAttribute("rx", (this.GetNodeWidth() / 2).toString());
            this.BodyEllipse.setAttribute("ry", (this.GetNodeHeight() / 2).toString());
        };

        GSNEvidenceShape.prototype.UpdateHtmlClass = function () {
            this.Content.className = "node node-evidence";
        };

        GSNEvidenceShape.MonitorLabelMaster = (function () {
            var MonitorMaster = AssureNote.AssureNoteUtils.CreateSVGElement("text");
            MonitorMaster.setAttribute("x", "220");
            MonitorMaster.setAttribute("y", "20");
            MonitorMaster.setAttribute("font-size", "36px");
            MonitorMaster.setAttribute("font-family", "Times New Roman");
            MonitorMaster.setAttribute("fill", "gray");
            MonitorMaster.setAttribute("stroke", "none");
            return MonitorMaster;
        })();
        return GSNEvidenceShape;
    })(GSNShape);
    AssureNote.GSNEvidenceShape = GSNEvidenceShape;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var ModeManager = (function () {
        function ModeManager(App, Mode) {
            this.App = App;
            this.Mode = Mode;
            this.WrapperElement = $('.edit-mode');
            this.Input = document.createElement('input');
            this.Input.id = 'mode-switch';
            this.Input.setAttribute('type', 'checkbox');
            if (Mode == 0 /* Edit */) {
                this.Input.setAttribute('checked', '');
            }
            this.Input.setAttribute('data-on-label', 'Edit');
            this.Input.setAttribute('data-off-label', 'View');

            this.Enable();
        }
        ModeManager.prototype.GetMode = function () {
            return this.Mode;
        };

        ModeManager.prototype.SetMode = function (Mode) {
            this.Mode = Mode;
            if (Mode == 0 /* Edit */) {
                this.Input.setAttribute('checked', '');
            } else {
                this.Input.removeAttribute('checked');
            }
        };

        ModeManager.prototype.ReadOnly = function (b) {
            $('#mode-switch').bootstrapSwitch('setDisabled', b);
        };

        ModeManager.prototype.Disable = function () {
            $(this.WrapperElement.empty());
        };

        ModeManager.prototype.Enable = function () {
            var _this = this;
            $(this.Input).appendTo(this.WrapperElement.empty());
            $('#mode-switch').bootstrapSwitch();
            $('#mode-switch').bootstrapSwitch('setSizeClass', '').on('switch-change', function (e) {
                var data = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    data[_i] = arguments[_i + 1];
                }
                var value = data[0].value;
                _this.SetMode((value) ? 0 /* Edit */ : 1 /* View */);
                _this.App.SocketManager.UpdateEditMode(_this.Mode);
            });
        };
        return ModeManager;
    })();
    AssureNote.ModeManager = ModeManager;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var Tooltip = (function (_super) {
        __extends(Tooltip, _super);
        function Tooltip(AssureNoteApp) {
            _super.call(this, AssureNoteApp);
            this.AssureNoteApp = AssureNoteApp;
            this.Tooltip = null;
            this.CurrentView = null;
        }
        Tooltip.prototype.Enable = function () {
        };

        Tooltip.prototype.Remove = function () {
            this.Tooltip.remove();
            this.Tooltip = null;
            this.CurrentView = null;
            this.IsEnable = false;
        };

        Tooltip.prototype.Create = function (CurrentView, ControlLayer, Contents) {
            if (this.Tooltip != null)
                this.Remove();
            if (Contents == null || Contents.length == 0)
                return;

            this.IsEnable = true;
            this.CurrentView = CurrentView;
            this.Tooltip = $('<div"></div>');
            var pre = $('<pre id="tooltip"></pre>');

            var ul = $(document.createElement('ul'));
            ul.addClass('list-unstyled');
            for (var i = 0; i < Contents.length; i++) {
                ul.append(Contents[i]);
            }
            pre.append(ul);
            this.Tooltip.append(pre);
            this.Tooltip.appendTo(ControlLayer);

            var Top = this.CurrentView.GetGY() + this.CurrentView.Shape.GetNodeHeight() + 5;
            var Left = this.CurrentView.GetGX() + this.CurrentView.Shape.GetNodeWidth() / 2;
            this.Tooltip.css({
                position: 'absolute',
                top: Top,
                left: Left,
                display: 'block',
                opacity: 100
            });
        };
        return Tooltip;
    })(AssureNote.Panel);
    AssureNote.Tooltip = Tooltip;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    function RemoteProcedureCall(URL, Method, Params, ErrorCallback) {
        var ReturnValue = null;
        var Command = {
            jsonrpc: "2.0",
            method: Method,
            id: 1,
            params: Params
        };

        $.ajax({
            type: "POST",
            url: URL,
            async: false,
            data: Command,
            success: function (Response) {
                ReturnValue = Response;
            },
            error: function (Request, Status, Error) {
                console.log("ajax error");
                if (ErrorCallback != null) {
                    ErrorCallback(Request, Status, Error);
                }
            }
        });

        return ReturnValue;
    }

    var RecApi = (function () {
        function RecApi(URL) {
            this.URL = URL;
        }
        RecApi.prototype.GetLatestData = function (Location, Type, ErrorCallback) {
            var Params = {
                location: Location,
                type: Type
            };

            var Response = RemoteProcedureCall(this.URL, "getLatestData", Params, ErrorCallback);

            if (Response == null) {
                return null;
            }

            if ('result' in Response) {
                return Response.result;
            } else {
                console.log(Response.error);
                return null;
            }
        };
        return RecApi;
    })();
    AssureNote.RecApi = RecApi;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var DCaseLink = (function () {
        function DCaseLink(source, target) {
            this.source = source;
            this.target = target;
        }
        return DCaseLink;
    })();
    var XMIParser = (function () {
        function XMIParser(Record) {
            this.Record = Record;
            this.contents = {};
            this.nodes = {};
            this.links = {};
            this.Text2NodeTypeMap = { "GSN.Goal": 0 /* Goal */, "GSN.Strategy": 2 /* Strategy */, "GSN.Context": 1 /* Context */, "GSN.Solution": 3 /* Evidence */ };
            this.Doc = new AssureNote.GSNDoc(this.Record);

            this.Record.AddHistory(0, "unknown", "converter", "2013-12-09T13:16:18+0900", "-", this.Doc);
        }
        XMIParser.prototype.MakeTree = function (Id) {
            var ThisNode = this.nodes[Id];

            for (var LinkId in this.links) {
                var link = this.links[LinkId];

                if (link.source == Id || link.target == Id) {
                    var ChildNodeId;
                    if (link.source == Id) {
                        ChildNodeId = link.target;
                    } else {
                        ChildNodeId = link.source;
                    }
                    delete this.links[LinkId];
                    var ChildNode = this.nodes[ChildNodeId];
                    if (ThisNode.SubNodeList == null) {
                        ThisNode.SubNodeList = [ChildNode];
                    } else {
                        ThisNode.SubNodeList.push(ChildNode);
                    }
                    ChildNode.ParentNode = ThisNode;
                    this.MakeTree(ChildNodeId);
                }
            }

            return ThisNode;
        };

        XMIParser.prototype.Parse = function (XMLData) {
            var _this = this;
            var IsRootNode = true;

            var $XML = $(XMLData);

            $XML.find("argumentElement").each(function (index, elem) {
                var ID = elem.getAttribute("xmi:id");
                _this.contents[ID] = elem.getAttribute("content");
            });

            $XML.find("children").each(function (index, elem) {
                var NodeType = elem.getAttribute("type");
                var ID = elem.getAttribute("xmi:id");
                var ContentID = elem.getAttribute("element");

                if (IsRootNode) {
                    _this.RootNodeId = ID;
                    IsRootNode = false;
                }
                var Type = _this.Text2NodeTypeMap[NodeType];
                var node = new AssureNote.GSNNode(_this.Doc, null, Type, NodeType.charAt(4), AssureNote.AssureNoteUtils.GenerateUID(), null);
                node.NodeDoc = _this.contents[ContentID] || "";
                _this.nodes[ID] = node;
            });

            $XML.find("edges").each(function (index, elem) {
                var LinkId = elem.getAttribute("xmi:id");
                var SourceNodeId = elem.getAttribute("source");
                var TargetNodeId = elem.getAttribute("target");
                _this.links[LinkId] = new DCaseLink(SourceNodeId, TargetNodeId);
            });

            this.Doc.TopNode = this.MakeTree(this.RootNodeId);
            this.Doc.RenumberAll();
        };
        return XMIParser;
    })();
    AssureNote.XMIParser = XMIParser;
})(AssureNote || (AssureNote = {}));
var AssureNote;
(function (AssureNote) {
    var RemoveCommand = (function (_super) {
        __extends(RemoveCommand, _super);
        function RemoveCommand(App) {
            _super.call(this, App);
        }
        RemoveCommand.prototype.GetCommandLineNames = function () {
            return ["rm", "remove"];
        };

        RemoveCommand.prototype.GetHelpHTML = function () {
            return "<code>remove label</code><br>Remove a node and it's descendant.";
        };

        RemoveCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length > 0) {
                var Label = Params[0];
                var View = this.App.PictgramPanel.ViewMap[Label];
                if (View == null) {
                    this.App.DebugP("Node not Found");
                    return;
                }
                var Node = this.App.PictgramPanel.ViewMap[Label].Model;
                var Parent = Node.ParentNode;
                for (var i = 0; i < Parent.SubNodeList.length; i++) {
                    var it = Parent.SubNodeList[i];
                    if (Node == it) {
                        Parent.SubNodeList.splice(i, 1);
                    }
                }

                RemoveCommand.RemoveDescendantsRecursive(Node);

                var TopGoal = this.App.MasterRecord.GetLatestDoc().TopNode;
                var NewNodeView = new AssureNote.NodeView(TopGoal, true);
                NewNodeView.SaveFlags(this.App.PictgramPanel.ViewMap);
                this.App.PictgramPanel.InitializeView(NewNodeView);
                this.App.PictgramPanel.Draw(TopGoal.GetLabel());
                this.App.SocketManager.UpdateWGSN();
            } else {
                console.log("Need paramter");
            }
        };

        RemoveCommand.RemoveDescendantsRecursive = function (Node) {
            if (Node.SubNodeList == null) {
                Node.ParentNode = null;
                return;
            }

            for (var i = 0; i < Node.SubNodeList.length; i++) {
                RemoveCommand.RemoveDescendantsRecursive(Node.SubNodeList[i]);
            }
            Node.SubNodeList = null;
        };
        return RemoveCommand;
    })(AssureNote.Command);
    AssureNote.RemoveCommand = RemoveCommand;

    var RemoveNodePlugin = (function (_super) {
        __extends(RemoveNodePlugin, _super);
        function RemoveNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.SetHasMenuBarButton(true);
            this.AssureNoteApp.RegistCommand(new RemoveCommand(this.AssureNoteApp));
        }
        RemoveNodePlugin.prototype.CreateMenuBarButton = function (View) {
            var _this = this;
            var App = this.AssureNoteApp;
            return new AssureNote.NodeMenuItem("remove-id", "/images/remove.png", "remove", function (event, TargetView) {
                var Command = _this.AssureNoteApp.FindCommandByCommandLineName("remove");
                if (Command) {
                    Command.Invoke(null, [TargetView.Label]);
                }
            });
        };
        return RemoveNodePlugin;
    })(AssureNote.Plugin);
    AssureNote.RemoveNodePlugin = RemoveNodePlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var RemoveNodePlugin = new AssureNote.RemoveNodePlugin(App);
    App.PluginManager.SetPlugin("Remove", RemoveNodePlugin);
});
var AssureNote;
(function (AssureNote) {
    var AddNodeCommand = (function (_super) {
        __extends(AddNodeCommand, _super);
        function AddNodeCommand(App) {
            _super.call(this, App);
            this.Text2NodeTypeMap = { "goal": 0 /* Goal */, "strategy": 2 /* Strategy */, "context": 1 /* Context */, "evidence": 3 /* Evidence */ };
        }
        AddNodeCommand.prototype.GetCommandLineNames = function () {
            return ["addnode", "add-node"];
        };

        AddNodeCommand.prototype.GetHelpHTML = function () {
            return "<code>add-node node type</code><br>Add new node.";
        };

        AddNodeCommand.prototype.Invoke = function (CommandName, Params) {
            var Type = this.Text2NodeTypeMap[Params[1].toLowerCase()];
            var TargetView = this.App.PictgramPanel.ViewMap[Params[0]];
            if (TargetView == null) {
                this.App.DebugP("Node not Found");
                return;
            }
            this.App.MasterRecord.OpenEditor(this.App.GetUserName(), "todo", null, "test");
            var Node = this.App.MasterRecord.EditingDoc.GetNode(TargetView.Model.UID);
            new AssureNote.GSNNode(Node.BaseDoc, Node, Type, null, AssureNote.AssureNoteUtils.GenerateUID(), null);
            var Doc = this.App.MasterRecord.EditingDoc;
            Doc.RenumberAll();
            var TopGoal = Doc.TopNode;
            var NewNodeView = new AssureNote.NodeView(TopGoal, true);
            NewNodeView.SaveFlags(this.App.PictgramPanel.ViewMap);
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw(TopGoal.GetLabel());
            this.App.SocketManager.UpdateWGSN();
            this.App.MasterRecord.CloseEditor();
        };
        return AddNodeCommand;
    })(AssureNote.Command);
    AssureNote.AddNodeCommand = AddNodeCommand;

    var AddNodePlugin = (function (_super) {
        __extends(AddNodePlugin, _super);
        function AddNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.SetHasMenuBarButton(true);
            this.AssureNoteApp.RegistCommand(new AddNodeCommand(this.AssureNoteApp));
        }
        AddNodePlugin.prototype.CreateCallback = function (Type) {
            var _this = this;
            return function (event, TargetView) {
                var Command = _this.AssureNoteApp.FindCommandByCommandLineName("add-node");
                if (Command) {
                    Command.Invoke(null, [TargetView.Label, Type]);
                }
            };
        };

        AddNodePlugin.prototype.CreateGoalMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-goal", "/images/goal.png", "goal", this.CreateCallback("goal"));
        };

        AddNodePlugin.prototype.CreateContextMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-context", "/images/context.png", "context", this.CreateCallback("context"));
        };

        AddNodePlugin.prototype.CreateStrategyMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-strategy", "/images/strategy.png", "strategy", this.CreateCallback("strategy"));
        };

        AddNodePlugin.prototype.CreateEvidenceMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-evidence", "/images/evidence.png", "evidence", this.CreateCallback("evidence"));
        };

        AddNodePlugin.prototype.CreateMenuBarButtons = function (View) {
            var res = [];
            var NodeType = View.GetNodeType();
            switch (NodeType) {
                case 0 /* Goal */:
                    res = res.concat([
                        this.CreateContextMenu(View),
                        this.CreateStrategyMenu(View),
                        this.CreateEvidenceMenu(View)]);
                    break;
                case 2 /* Strategy */:
                    res = res.concat([this.CreateContextMenu(View), this.CreateGoalMenu(View)]);
                    break;
                case 1 /* Context */:
                    break;
                case 3 /* Evidence */:
                    res.push(this.CreateContextMenu(View));
                    break;
                default:
                    break;
            }
            return res;
        };
        return AddNodePlugin;
    })(AssureNote.Plugin);
    AssureNote.AddNodePlugin = AddNodePlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var AddNodePlugin = new AssureNote.AddNodePlugin(App);
    App.PluginManager.SetPlugin("AddNode", AddNodePlugin);
});
var AssureNote;
(function (AssureNote) {
    var LastModifiedPlugin = (function (_super) {
        __extends(LastModifiedPlugin, _super);
        function LastModifiedPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        LastModifiedPlugin.prototype.RenderHTML = function (NodeDoc, Model) {
            var Author = Model.LastModified.Author;
            if (Author && Author != 'unknown') {
                var icon_user = document.createElement('span');
                icon_user.className = 'glyphicon glyphicon-user';
                var icon_time = document.createElement('span');
                icon_time.className = 'glyphicon glyphicon-time';
                var span = document.createElement('span');

                span.className = 'node-author';
                if (Model.IsEvidence()) {
                    span.className = span.className + ' node-author-evidence';
                } else if (Model.IsStrategy()) {
                    span.className = span.className + ' node-author-strategy';
                }
                span.textContent = Author + '&nbsp';
                var small = document.createElement('small');
                small.innerHTML = icon_time.outerHTML + '&nbsp' + AssureNote.AssureNoteUtils.FormatDate(Model.LastModified.DateString);
                span.innerHTML = icon_user.outerHTML + span.textContent + small.outerHTML;
                return NodeDoc + span.outerHTML;
            } else {
                return NodeDoc;
            }
        };

        LastModifiedPlugin.prototype.CreateTooltipContents = function (NodeView) {
            var res = [];
            var li = null;
            if (NodeView.Model.Created.Author != 'unknown') {
                li = document.createElement('li');
                li.innerHTML = 'Created by <b>' + NodeView.Model.Created.Author + '</b> ' + AssureNote.AssureNoteUtils.FormatDate(NodeView.Model.Created.DateString);
                res.push(li);
            }
            if (NodeView.Model.LastModified.Author != 'unknown') {
                li = document.createElement('li');
                li.innerHTML = 'Last modified by <b>' + NodeView.Model.LastModified.Author + '</b> ' + AssureNote.AssureNoteUtils.FormatDate(NodeView.Model.LastModified.DateString);
                res.push(li);
            }

            return res;
        };
        return LastModifiedPlugin;
    })(AssureNote.Plugin);
    AssureNote.LastModifiedPlugin = LastModifiedPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var LastModifiedPlugin = new AssureNote.LastModifiedPlugin(App);
    App.PluginManager.SetPlugin("LastModified", LastModifiedPlugin);
});
var AssureNote;
(function (AssureNote) {
    var MonitorNode = (function () {
        function MonitorNode(App, Label) {
            this.App = App;
            this.Label = Label;
            this.Data = null;
            this.PastStatus = [];
            this.PastLogs = [];

            var ThisModel = this.GetModel();
            var GoalModel = ThisModel.GetCloseGoal();
            var ContextModel = null;
            for (var i = 0; i < GoalModel.SubNodeList.length; i++) {
                var BroutherModel = GoalModel.SubNodeList[i];
                if (BroutherModel.IsContext()) {
                    ContextModel = BroutherModel;
                    break;
                }
            }
            if (ContextModel == null) {
                return;
            }
            var TagMap = ContextModel.GetTagMapWithLexicalScope();
            this.Location = TagMap.get("Location");
            this.Condition = TagMap.get("Condition");
            this.ExtractTypeFromCondition();
        }
        MonitorNode.prototype.GetView = function () {
            return this.App.PictgramPanel.ViewMap[this.Label];
        };

        MonitorNode.prototype.GetModel = function () {
            return this.GetView().Model;
        };

        MonitorNode.prototype.ExtractTypeFromCondition = function () {
            var text = this.Condition.replace(/\{|\}|\(|\)|==|<=|>=|<|>/g, " ");
            var words = text.split(" ");
            this.Type = null;
            for (var i = 0; i < words.length; i++) {
                if (words[i] != "" && !$.isNumeric(words[i])) {
                    this.Type = words[i];
                    break;
                }
            }
        };

        MonitorNode.prototype.IsValid = function () {
            if (this.Location && this.Type && this.Condition) {
                return true;
            }
            return false;
        };

        MonitorNode.prototype.IsDead = function () {
            if (this.GetView() == null) {
                return true;
            }
            return false;
        };

        MonitorNode.prototype.GetLatestLog = function () {
            return this.PastLogs[0];
        };

        MonitorNode.prototype.SetLatestLog = function (LatestLog) {
            if (this.PastLogs.length > 10) {
                this.PastLogs.pop();
            }
            this.PastLogs.unshift(LatestLog);
        };

        MonitorNode.prototype.GetLatestStatus = function () {
            return this.PastStatus[0];
        };

        MonitorNode.prototype.SetLatestStatus = function (LatestStatus) {
            if (this.PastStatus.length > 10) {
                this.PastStatus.pop();
            }
            this.PastStatus.unshift(LatestStatus);
        };

        MonitorNode.prototype.UpdateModel = function () {
            var Model = this.GetModel();
            if (Model.TagMap == null) {
                Model.TagMap = new AssureNote.HashMap();
            }
            var Value = (this.Data != null) ? this.Data + "" : "";
            Model.TagMap.put(this.Type, Value);
            Model.HasTag = true;

            var NodeDoc = Model.NodeDoc + AssureNote.Lib.LineFeed;
            ;
            var Regex = new RegExp(this.Type + "\\s*::.*\\n", "g");
            if (NodeDoc.match(Regex)) {
                NodeDoc = NodeDoc.replace(Regex, this.Type + "::" + Value + AssureNote.Lib.LineFeed);
                NodeDoc = NodeDoc.slice(0, -1);
            } else {
                if (NodeDoc == AssureNote.Lib.LineFeed) {
                    NodeDoc = "";
                }
                NodeDoc += this.Type + "::" + Value;
            }
            Model.NodeDoc = NodeDoc;
            Model.LastModified = Model.BaseDoc.DocHistory;
        };

        MonitorNode.prototype.Update = function (Rec, ErrorCallback) {
            var LatestLog = Rec.GetLatestData(this.Location, this.Type, ErrorCallback);
            if (LatestLog == null) {
                return;
            }

            if (JSON.stringify(LatestLog) == JSON.stringify(this.GetLatestLog())) {
                return;
            }

            this.Data = LatestLog.data;
            var RecType = this.Type.replace(/[\.\/\-]/g, "_");
            var RecCondition = this.Condition.replace(/[\.\/\-]/g, "_");
            var Script = "var " + RecType + "=" + this.Data + ";";
            Script += RecCondition + ";";
            var LatestStatus = eval(Script);

            this.SetLatestLog(LatestLog);
            this.SetLatestStatus(LatestStatus);

            this.UpdateModel();
        };
        return MonitorNode;
    })();
    AssureNote.MonitorNode = MonitorNode;

    var MonitorNodeManager = (function () {
        function MonitorNodeManager(App) {
            this.App = App;
            this.MonitorNodeMap = {};
            this.NodeCount = 0;
            this.IsRunning = false;

            var RecURL = Config.RecURL;
            if (RecURL == null || RecURL == "") {
                RecURL = "http://localhost:3001/api/3.0/";
            }
            this.Rec = new AssureNote.RecApi(RecURL);

            this.NodeColorMap = {};
        }
        MonitorNodeManager.prototype.SetRecURL = function (URL) {
            this.Rec = new AssureNote.RecApi(URL);
        };

        MonitorNodeManager.prototype.SetMonitorNode = function (MNode) {
            if (!(MNode.Label in this.MonitorNodeMap)) {
                this.NodeCount += 1;
            }
            this.MonitorNodeMap[MNode.Label] = MNode;

            MNode.UpdateModel();
        };

        MonitorNodeManager.prototype.DeleteMonitorNode = function (Label) {
            if (Label in this.MonitorNodeMap) {
                this.NodeCount -= 1;
                delete this.MonitorNodeMap[Label];
            }
        };

        MonitorNodeManager.prototype.DeleteDeadMonitorNodes = function () {
            for (var Label in this.MonitorNodeMap) {
                var MNode = this.MonitorNodeMap[Label];
                if (MNode.IsDead()) {
                    this.DeleteMonitorNode(Label);
                    if (this.NodeCount < 1 && this.IsRunning) {
                        this.StopMonitoring();
                        break;
                    }
                }
            }
        };

        MonitorNodeManager.prototype.DeleteAllMonitorNodes = function () {
            for (var Label in this.MonitorNodeMap) {
                var MNode = this.MonitorNodeMap[Label];
                this.DeleteMonitorNode(Label);
                if (this.NodeCount < 1 && this.IsRunning) {
                    this.StopMonitoring();
                    break;
                }
            }
        };

        MonitorNodeManager.prototype.InitializeView = function (Doc) {
            var Panel = this.App.PictgramPanel;
            Doc.RenumberAll();
            var NewView = new AssureNote.NodeView(Doc.TopNode, true);
            NewView.SaveFlags(Panel.ViewMap);
            Panel.InitializeView(NewView);
        };

        MonitorNodeManager.prototype.UpdateView = function (Doc) {
            this.App.PictgramPanel.Draw(Doc.TopNode.GetLabel());
        };

        MonitorNodeManager.prototype.CheckPresumedNodeColor = function () {
            var self = this;
            var LabelMap = this.App.MasterRecord.GetLatestDoc().GetLabelMap();
            for (var Label in self.App.PictgramPanel.ViewMap) {
                var View = self.App.PictgramPanel.ViewMap[Label];
                var Model = View.Model;
                if (Model.HasTag) {
                    var PresumedNodeLabelName = null;
                    var TagValue = Model.GetTagMap().get("Presume");
                    if (TagValue != null) {
                        PresumedNodeLabelName = TagValue.replace(/\[|\]/g, "");
                    }

                    var PresumedNodeLabel = null;
                    if (PresumedNodeLabelName != null) {
                        PresumedNodeLabel = LabelMap.get(PresumedNodeLabelName);
                    }
                    if (PresumedNodeLabel == null) {
                        PresumedNodeLabel = PresumedNodeLabelName;
                    }

                    var PresumedNodeIsColored = self.NodeColorMap[PresumedNodeLabel];
                    if ((PresumedNodeIsColored != null) && PresumedNodeIsColored) {
                        var TargetView = View;

                        while (View != null) {
                            self.NodeColorMap[View.Label] = AssureNote.ColorStyle.Danger;
                            View = View.Parent;
                        }

                        if (TargetView.Model.IsContext()) {
                            TargetView = TargetView.Parent;
                        }

                        TargetView.ForEachVisibleChildren(function (ChildNodeView) {
                            ChildNodeView.TraverseNode(function (SubNodeView) {
                                self.NodeColorMap[SubNodeView.Label] = AssureNote.ColorStyle.Useless;
                            });
                        });
                    }
                }
            }
        };

        MonitorNodeManager.prototype.UpdateNodeColorMap = function () {
            this.NodeColorMap = {};
            for (var Label in this.MonitorNodeMap) {
                var MNode = this.MonitorNodeMap[Label];
                if (MNode.GetLatestStatus() == false) {
                    var View = MNode.GetView();
                    while (View != null) {
                        this.NodeColorMap[View.Label] = AssureNote.ColorStyle.Danger;
                        View = View.Parent;
                    }
                }
            }
            this.CheckPresumedNodeColor();
        };

        MonitorNodeManager.prototype.StartMonitoring = function (Interval) {
            this.IsRunning = true;
            console.log("Start monitoring...");

            var self = this;
            this.Timer = setInterval(function () {
                console.log("Monitoring...");

                self.NodeColorMap = {};

                var Doc = self.App.MasterRecord.GetLatestDoc();
                var IsFirst = true;
                for (var Label in self.MonitorNodeMap) {
                    var MNode = self.MonitorNodeMap[Label];
                    if (MNode.IsDead()) {
                        self.DeleteMonitorNode(Label);
                        if (self.NodeCount < 1 && self.IsRunning) {
                            self.StopMonitoring();
                            break;
                        }
                        continue;
                    }

                    MNode.Update(self.Rec, function (Request, Status, Error) {
                        self.StopMonitoring();
                    });
                    if (!self.IsRunning)
                        break;

                    if (IsFirst) {
                        if (Doc.DocHistory.Author != "Monitor") {
                            self.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                            Doc = self.App.MasterRecord.EditingDoc;
                        }
                        IsFirst = false;
                    }

                    if (MNode.GetLatestStatus() == false) {
                        var View = MNode.GetView();
                        while (View != null) {
                            self.NodeColorMap[View.Label] = AssureNote.ColorStyle.Danger;
                            View = View.Parent;
                        }
                    }
                }

                self.CheckPresumedNodeColor();

                self.InitializeView(Doc);
                self.UpdateView(Doc);
                if (self.App.MasterRecord.EditingDoc != null) {
                    self.App.MasterRecord.CloseEditor();
                }
            }, Interval);

            SetMonitorMenuItem.ChangeMenuToggle(this.App);
        };

        MonitorNodeManager.prototype.StopMonitoring = function () {
            this.IsRunning = false;
            console.log("Stop monitoring...");
            clearTimeout(this.Timer);
            SetMonitorMenuItem.ChangeMenuToggle(this.App);
        };
        return MonitorNodeManager;
    })();
    AssureNote.MonitorNodeManager = MonitorNodeManager;

    var MNodeManager = null;

    var SetMonitorCommand = (function (_super) {
        __extends(SetMonitorCommand, _super);
        function SetMonitorCommand(App) {
            _super.call(this, App);
        }
        SetMonitorCommand.prototype.GetCommandLineNames = function () {
            return ["set-monitor"];
        };

        SetMonitorCommand.prototype.GetHelpHTML = function () {
            return "<code>set-monitor</code><br>Set node as monitor.";
        };

        SetMonitorCommand.prototype.Invoke = function (CommandName, Params) {
            MNodeManager.DeleteDeadMonitorNodes();

            if (Params.length == 1) {
                var Param = Params[0];

                if (Param == "all") {
                    var IsFirst = true;
                    for (var Label in this.App.PictgramPanel.ViewMap) {
                        var View = this.App.PictgramPanel.ViewMap[Label];
                        if (!View.Model.IsEvidence()) {
                            continue;
                        }

                        var MNode = new MonitorNode(this.App, Label);
                        if (!MNode.IsValid()) {
                            this.App.DebugP("Node(" + Label + ") is not a monitor");
                            continue;
                        }

                        if (IsFirst) {
                            this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                            MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                            IsFirst = false;
                        }
                        MNodeManager.SetMonitorNode(MNode);
                    }
                } else {
                    var Label = Param;
                    var View = this.App.PictgramPanel.ViewMap[Label];
                    if (View == null) {
                        this.App.DebugP("Node not found");
                        return;
                    }
                    if (!View.Model.IsEvidence()) {
                        this.App.DebugP("This node is not a monitor");
                        return;
                    }

                    var MNode = new MonitorNode(this.App, Label);
                    if (!MNode.IsValid()) {
                        this.App.DebugP("This node is not a monitor");
                        return;
                    }

                    this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                    MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                    MNodeManager.SetMonitorNode(MNode);
                }

                if (this.App.MasterRecord.EditingDoc != null) {
                    MNodeManager.UpdateView(this.App.MasterRecord.EditingDoc);
                    this.App.MasterRecord.CloseEditor();
                }

                if (MNodeManager.NodeCount > 0 && !MNodeManager.IsRunning) {
                    MNodeManager.StartMonitoring(5000);
                }
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };

        SetMonitorCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return SetMonitorCommand;
    })(AssureNote.Command);
    AssureNote.SetMonitorCommand = SetMonitorCommand;

    var UnsetMonitorCommand = (function (_super) {
        __extends(UnsetMonitorCommand, _super);
        function UnsetMonitorCommand(App) {
            _super.call(this, App);
        }
        UnsetMonitorCommand.prototype.GetCommandLineNames = function () {
            return ["unset-monitor"];
        };

        UnsetMonitorCommand.prototype.GetHelpHTML = function () {
            return "<code>unset-monitor</code><br>Unset node as monitor.";
        };

        UnsetMonitorCommand.prototype.Invoke = function (CommandName, Params) {
            MNodeManager.DeleteDeadMonitorNodes();

            if (Params.length == 1) {
                var Param = Params[0];
                if (Param == "all") {
                    MNodeManager.DeleteAllMonitorNodes();
                } else {
                    var Label = Param;
                    var View = this.App.PictgramPanel.ViewMap[Label];
                    if (View == null) {
                        this.App.DebugP("Node not found");
                        return;
                    }

                    MNodeManager.DeleteMonitorNode(Label);
                    if (MNodeManager.NodeCount < 1 && MNodeManager.IsRunning) {
                        MNodeManager.StopMonitoring();
                    }
                }
                MNodeManager.UpdateNodeColorMap();
                var Doc = this.App.MasterRecord.GetLatestDoc();
                MNodeManager.InitializeView(Doc);
                MNodeManager.UpdateView(Doc);
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };

        UnsetMonitorCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return UnsetMonitorCommand;
    })(AssureNote.Command);
    AssureNote.UnsetMonitorCommand = UnsetMonitorCommand;

    var UseRecAtCommand = (function (_super) {
        __extends(UseRecAtCommand, _super);
        function UseRecAtCommand(App) {
            _super.call(this, App);
        }
        UseRecAtCommand.prototype.GetCommandLineNames = function () {
            return ["use-rec-at"];
        };

        UseRecAtCommand.prototype.GetHelpHTML = function () {
            return "<code>use-rec-at</code><br>Use specified REC.";
        };

        UseRecAtCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length == 1) {
                MNodeManager.SetRecURL(Params[0]);
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };

        UseRecAtCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return UseRecAtCommand;
    })(AssureNote.Command);
    AssureNote.UseRecAtCommand = UseRecAtCommand;

    var MonitorListPanel = (function (_super) {
        __extends(MonitorListPanel, _super);
        function MonitorListPanel(App) {
            _super.call(this, App);
            var Modal = $('\
<div id="monitorlist-modal" tabindex="-1" role="dialog" aria-labelledby="monitorlist-modal-label" aria-hidden="true" class="modal fade">\n\
  <div class="modal-dialog">\n\
    <div class="modal-content">\n\
      <div class="modal-header">\n\
        <button type="button" data-dismiss="modal" aria-hidden="true" class="close">&times;</button>\n\
        <h4 id="monitorlist-modal-label" class="modal-title">Active Monitor List</h4>\n\
      </div>\n\
      <div id="monitorlist-modal-body" class="modal-body">\n\
      </div>\n\
      <div class="modal-footer">\n\
        <button type="button" data-dismiss="modal" class="btn btn-default">Close</button>\n\
      </div>\n\
    </div>\n\
  </div>\n\
</div>\n\
            ');
            $('#plugin-layer').append(Modal);

            $('#monitorlist-modal').on('hidden.bs.modal', function () {
                App.PictgramPanel.Activate();
            });
        }
        MonitorListPanel.prototype.UpdateMonitorList = function () {
            var ModalBody = $("#monitorlist-modal-body")[0];

            var Table = document.createElement('table');
            Table.className = 'table table-bordered';
            Table.setAttribute('width', '90%');
            Table.setAttribute('align', 'center');

            var TableInnerHTML = '';
            TableInnerHTML += '<tr align="center" bgcolor="#cccccc">';
            TableInnerHTML += '<th>Label</th>';
            TableInnerHTML += '<th>Type</th>';
            TableInnerHTML += '<th>Location</th>';
            TableInnerHTML += '<th>AuthID</th>';
            TableInnerHTML += '<th>Last Update</th>';
            TableInnerHTML += '</tr>';

            for (var Label in MNodeManager.MonitorNodeMap) {
                var MNode = MNodeManager.MonitorNodeMap[Label];
                var LatestStatus = MNode.GetLatestStatus();
                if (LatestStatus == null || LatestStatus == true) {
                    TableInnerHTML += '<tr align="center">';
                } else {
                    TableInnerHTML += '<tr align="center" bgcolor="#ffaa7d">';
                }
                TableInnerHTML += '<td>' + MNode.Label + '</td>';
                TableInnerHTML += '<td>' + MNode.Type + '</td>';
                TableInnerHTML += '<td>' + MNode.Location + '</td>';
                var LatestLog = MNode.GetLatestLog();
                if (LatestLog != null) {
                    TableInnerHTML += '<td>' + LatestLog.authid + '</td>';
                    TableInnerHTML += '<td>' + LatestLog.timestamp + '</td>';
                } else {
                    TableInnerHTML += '<td>N/A</td>';
                    TableInnerHTML += '<td>N/A</td>';
                }
                TableInnerHTML += '</tr>';
            }

            Table.innerHTML = TableInnerHTML;
            ModalBody.innerHTML = Table.outerHTML;
        };

        MonitorListPanel.prototype.OnActivate = function () {
            this.UpdateMonitorList();
            $('#monitorlist-modal').modal();
        };
        return MonitorListPanel;
    })(AssureNote.Panel);
    AssureNote.MonitorListPanel = MonitorListPanel;

    var ShowMonitorListCommand = (function (_super) {
        __extends(ShowMonitorListCommand, _super);
        function ShowMonitorListCommand(App) {
            _super.call(this, App);
            this.MonitorListPanel = new MonitorListPanel(App);
        }
        ShowMonitorListCommand.prototype.GetCommandLineNames = function () {
            return ["show-monitorlist"];
        };

        ShowMonitorListCommand.prototype.GetHelpHTML = function () {
            return "<code>show-monitorlist</code><br>Show list of monitors.";
        };

        ShowMonitorListCommand.prototype.Invoke = function (CommandName, Params) {
            this.MonitorListPanel.Activate();
        };

        ShowMonitorListCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return ShowMonitorListCommand;
    })(AssureNote.Command);
    AssureNote.ShowMonitorListCommand = ShowMonitorListCommand;

    var SetMonitorMenuItem = (function (_super) {
        __extends(SetMonitorMenuItem, _super);
        function SetMonitorMenuItem() {
            _super.apply(this, arguments);
        }
        SetMonitorMenuItem.prototype.GetIconName = function () {
            if (MNodeManager.IsRunning) {
                return "minus";
            } else {
                return "plus";
            }
        };

        SetMonitorMenuItem.prototype.GetDisplayName = function () {
            if (MNodeManager.IsRunning) {
                return "Unset";
            } else {
                return "Set";
            }
        };

        SetMonitorMenuItem.ChangeMenuToggle = function (App) {
            App.TopMenu.Render(App, $("#top-menu").empty()[0], true);
        };

        SetMonitorMenuItem.prototype.Invoke = function (App) {
            if (MNodeManager.IsRunning) {
                var Command = App.FindCommandByCommandLineName("unset-monitor");
                if (Command != null) {
                    Command.Invoke(null, ["all"]);
                }
            } else {
                var Command = App.FindCommandByCommandLineName("set-monitor");
                if (Command != null) {
                    Command.Invoke(null, ["all"]);
                }
            }
        };
        return SetMonitorMenuItem;
    })(AssureNote.TopMenuItem);
    AssureNote.SetMonitorMenuItem = SetMonitorMenuItem;

    var ShowMonitorListMenuItem = (function (_super) {
        __extends(ShowMonitorListMenuItem, _super);
        function ShowMonitorListMenuItem() {
            _super.apply(this, arguments);
        }
        ShowMonitorListMenuItem.prototype.GetIconName = function () {
            return "th-list";
        };

        ShowMonitorListMenuItem.prototype.GetDisplayName = function () {
            return "Show monitors";
        };

        ShowMonitorListMenuItem.prototype.Invoke = function (App) {
            var Command = App.FindCommandByCommandLineName("show-monitorlist");
            Command.Invoke(null, []);
        };
        return ShowMonitorListMenuItem;
    })(AssureNote.TopMenuItem);
    AssureNote.ShowMonitorListMenuItem = ShowMonitorListMenuItem;

    var MonitorNodePlugin = (function (_super) {
        __extends(MonitorNodePlugin, _super);
        function MonitorNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            MNodeManager = new MonitorNodeManager(this.AssureNoteApp);
            this.SetHasMenuBarButton(true);
            this.AssureNoteApp.RegistCommand(new SetMonitorCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new UnsetMonitorCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new UseRecAtCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new ShowMonitorListCommand(this.AssureNoteApp));
            this.AssureNoteApp.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem("Monitor", "eye-open", [
                new SetMonitorMenuItem(),
                new ShowMonitorListMenuItem()
            ]));
        }
        MonitorNodePlugin.prototype.CreateMenuBarButton = function (View) {
            if (!View.Model.IsEvidence()) {
                return null;
            }

            var App = this.AssureNoteApp;
            var MNode = new MonitorNode(App, View.Label);

            if (MNode.IsValid) {
                if (MNode.Label in MNodeManager.MonitorNodeMap) {
                    return new AssureNote.NodeMenuItem("unset-monitor", "/images/monitor.png", "unset\ monitor", function (event, TargetView) {
                        var Command = App.FindCommandByCommandLineName("unset-monitor");
                        if (Command != null) {
                            Command.Invoke(null, [TargetView.Label]);
                        }
                    });
                } else {
                    return new AssureNote.NodeMenuItem("set-monitor", "/images/monitor.png", "set\ monitor", function (event, TargetView) {
                        var Command = App.FindCommandByCommandLineName("set-monitor");
                        if (Command != null) {
                            Command.Invoke(null, [TargetView.Label]);
                        }
                    });
                }
            }

            return null;
        };

        MonitorNodePlugin.prototype.CreateTooltipContents = function (NodeView) {
            if (!(NodeView.Label in MNodeManager.MonitorNodeMap)) {
                return null;
            }

            var MNode = MNodeManager.MonitorNodeMap[NodeView.Label];

            var ReturnValue = [];
            var Li = document.createElement('li');
            Li.innerHTML = '<b>Monitor</b> is running on <b>' + MNode.Location + '<br></b>';
            ReturnValue.push(Li);

            var LatestLog = MNode.GetLatestLog();
            if (LatestLog != null) {
                Li = document.createElement('li');
                Li.innerHTML = '<b>Monitor</b> is certificated by <b>' + MNode.GetLatestLog().authid + '<br></b>';
                ReturnValue.push(Li);
            }

            Li = document.createElement('li');
            Li.innerHTML = '<hr>';
            ReturnValue.push(Li);

            Li = document.createElement('li');
            var Table = document.createElement('table');
            Table.setAttribute('border', '4');
            Table.setAttribute('width', '250');
            Table.setAttribute('align', 'center');

            var TableInnerHTML = '';
            TableInnerHTML += '<caption>REC Logs</caption>';
            TableInnerHTML += '<tr align="center" bgcolor="#cccccc">';
            TableInnerHTML += '<th>Timestamp</th>';
            TableInnerHTML += '<th>' + MNode.Type + '</th>';
            TableInnerHTML += '</tr>';

            for (var i = 0; i < MNode.PastLogs.length; i++) {
                var Log = MNode.PastLogs[i];
                var Status = MNode.PastStatus[i];
                if (Status == true) {
                    TableInnerHTML += '<tr align="center">';
                } else {
                    TableInnerHTML += '<tr align="center" bgcolor="#ffaa7d">';
                }
                TableInnerHTML += '<td>' + Log.timestamp + '</td>';
                TableInnerHTML += '<td>' + Log.data + '</td>';
                TableInnerHTML += '</tr>';
            }

            Table.innerHTML = TableInnerHTML;
            Li.innerHTML = Table.outerHTML;
            ReturnValue.push(Li);
            return ReturnValue;
        };

        MonitorNodePlugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
            NodeView.RemoveColorStyle(AssureNote.ColorStyle.Danger);
            NodeView.RemoveColorStyle(AssureNote.ColorStyle.Useless);
            if (NodeView.Label in MNodeManager.NodeColorMap) {
                NodeView.AddColorStyle(MNodeManager.NodeColorMap[NodeView.Label]);
            }
        };
        return MonitorNodePlugin;
    })(AssureNote.Plugin);
    AssureNote.MonitorNodePlugin = MonitorNodePlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});
