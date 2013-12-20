///<reference path='SideMenu.ts'/>
///<reference path='Socket.ts'/>
var AssureNote;
(function (AssureNote) {
    (function (AssureNoteUtils) {
        function SaveAs(ContentString, FileName) {
            var blob = new Blob([ContentString], { type: 'text/plain; charset=UTF-8' });
            saveAs(blob, FileName);
        }
        AssureNoteUtils.SaveAs = SaveAs;

        function GetNodeLabelFromEvent(event) {
            var element = event.srcElement;
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
                case GSNType.Goal:
                    return new AssureNote.GSNGoalShape(NodeView);
                case GSNType.Context:
                    return new AssureNote.GSNContextShape(NodeView);
                case GSNType.Strategy:
                    return new AssureNote.GSNStrategyShape(NodeView);
                case GSNType.Evidence:
                    return new AssureNote.GSNEvidenceShape(NodeView);
            }
        }
        AssureNoteUtils.CreateGSNShape = CreateGSNShape;

        function CreateSVGElement(name) {
            return document.createElementNS('http://www.w3.org/2000/svg', name);
        }
        AssureNoteUtils.CreateSVGElement = CreateSVGElement;

        var SVGMoveAnimateElementMaster = null;
        var SVGArrowAnimateElementMaster = null;
        var SVGFadeinAnimateElementMaster = null;

        function CreateSVGMoveAnimateElement(Duration, FromGX, FromGY) {
            if (SVGMoveAnimateElementMaster == null) {
                SVGMoveAnimateElementMaster = AssureNoteUtils.CreateSVGElement("animateTransform");
                SVGMoveAnimateElementMaster.setAttribute("attributeName", "transform");
                SVGMoveAnimateElementMaster.setAttribute("attributeType", "XML");
                SVGMoveAnimateElementMaster.setAttribute("type", "translate");
                SVGMoveAnimateElementMaster.setAttribute("calcMode", "spline");
                SVGMoveAnimateElementMaster.setAttribute("keyTimes", "0;1");
                SVGMoveAnimateElementMaster.setAttribute("keySplines", "0.0 0.0 0.58 1.0");
                SVGMoveAnimateElementMaster.setAttribute("restart", "never");
                SVGMoveAnimateElementMaster.setAttribute("begin", "indefinite");
                SVGMoveAnimateElementMaster.setAttribute("repeatCount", "1");
                SVGMoveAnimateElementMaster.setAttribute("additive", "sum");
                SVGMoveAnimateElementMaster.setAttribute("to", "0,0");
            }
            var AnimateElement = SVGMoveAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            AnimateElement.setAttribute("from", "" + FromGX + "," + FromGY);
            return AnimateElement;
        }
        AssureNoteUtils.CreateSVGMoveAnimateElement = CreateSVGMoveAnimateElement;

        function CreateSVGArrowAnimateElement(Duration, OldPath, NewPath) {
            if (SVGArrowAnimateElementMaster == null) {
                SVGArrowAnimateElementMaster = AssureNoteUtils.CreateSVGElement("animate");
                SVGArrowAnimateElementMaster.setAttribute("attributeName", "d");
                SVGArrowAnimateElementMaster.setAttribute("attributeType", "XML");
                SVGArrowAnimateElementMaster.setAttribute("calcMode", "spline");
                SVGArrowAnimateElementMaster.setAttribute("keyTimes", "0;1");
                SVGArrowAnimateElementMaster.setAttribute("keySplines", "0.0 0.0 0.58 1.0");
                SVGArrowAnimateElementMaster.setAttribute("restart", "never");
                SVGArrowAnimateElementMaster.setAttribute("begin", "indefinite");
                SVGArrowAnimateElementMaster.setAttribute("repeatCount", "1");
            }
            var AnimateElement = SVGArrowAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            if (OldPath) {
                AnimateElement.setAttribute("from", OldPath);
            }
            AnimateElement.setAttribute("to", NewPath);
            return AnimateElement;
        }
        AssureNoteUtils.CreateSVGArrowAnimateElement = CreateSVGArrowAnimateElement;

        function CreateSVGFadeinAnimateElement(Duration) {
            if (SVGFadeinAnimateElementMaster == null) {
                SVGFadeinAnimateElementMaster = AssureNoteUtils.CreateSVGElement("animate");
                SVGFadeinAnimateElementMaster.setAttribute("attributeName", "fill-opacity");
                SVGFadeinAnimateElementMaster.setAttribute("attributeType", "XML");
                SVGFadeinAnimateElementMaster.setAttribute("calcMode", "spline");
                SVGFadeinAnimateElementMaster.setAttribute("keyTimes", "0;1");
                SVGFadeinAnimateElementMaster.setAttribute("keySplines", "0.0 0.0 0.58 1.0");
                SVGFadeinAnimateElementMaster.setAttribute("restart", "never");
                SVGFadeinAnimateElementMaster.setAttribute("begin", "indefinite");
                SVGFadeinAnimateElementMaster.setAttribute("repeatCount", "1");
                SVGFadeinAnimateElementMaster.setAttribute("from", "0");
                SVGFadeinAnimateElementMaster.setAttribute("to", "1");
            }
            var AnimateElement = SVGFadeinAnimateElementMaster.cloneNode();
            AnimateElement.setAttribute("dur", Duration.toString() + "ms");
            return AnimateElement;
        }
        AssureNoteUtils.CreateSVGFadeinAnimateElement = CreateSVGFadeinAnimateElement;

        function CreateCSSMoveAnimationDefinition(Prefix, Name, FromGX, FromGY) {
            return "@" + Prefix + "keyframes " + Name + " { 0% { left: " + FromGX + "px; top: " + FromGY + "px; } }";
        }
        AssureNoteUtils.CreateCSSMoveAnimationDefinition = CreateCSSMoveAnimationDefinition;

        function CreateCSSFadeinAnimationDefinition(Prefix, Name) {
            return "@" + Prefix + "keyframes " + Name + " { 0% { opacity: 0; } }";
        }
        AssureNoteUtils.CreateCSSFadeinAnimationDefinition = CreateCSSFadeinAnimationDefinition;
    })(AssureNote.AssureNoteUtils || (AssureNote.AssureNoteUtils = {}));
    var AssureNoteUtils = AssureNote.AssureNoteUtils;

    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            //var Api = new AssureNote.ServerAPI("http://", "", "");
            this.PluginManager = new AssureNote.PluginManager(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.PluginPanel = new AssureNote.PluginPanel(this);
            this.Commands = new AssureNote.CommandLineBuiltinFunctions();
        }
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
            Plugin.ExecDoubleClicked(NodeView);
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var Method = ParsedCommand.GetMethod();
            if (Method == "search") {
                return;
            }
            var BuiltinCommand = this.Commands.GetFunction(Method);
            if (BuiltinCommand != null) {
                BuiltinCommand(this, ParsedCommand.GetArgs());
                return;
            }
            var Plugin = this.PluginManager.GetCommandPlugin(Method);
            if (Plugin != null) {
                Plugin.ExecCommand(this, ParsedCommand.GetArgs());
            } else {
                //TODO split jump-node function
                var Label = Method.toUpperCase();
                if (this.PictgramPanel.ViewMap == null) {
                    this.DebugP("Jump is diabled.");
                    return;
                }
                var Node = this.PictgramPanel.ViewMap[Label];
                if (Method == "" && Node == null) {
                    Label = this.PictgramPanel.FocusedLabel;
                    Node = this.PictgramPanel.ViewMap[Label];
                }
                if (Node != null) {
                    if ($("#" + Label.replace(/\./g, "\\.")).length > 0) {
                        this.PictgramPanel.Viewport.SetCaseCenter(Node.GetCenterGX(), Node.GetCenterGY());
                    } else {
                        this.DebugP("Invisible node " + Label + " Selected.");
                    }
                    return;
                }
                this.DebugP("undefined command: " + Method);
            }
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            this.WGSNName = Name;
            this.MasterRecord = new GSNRecord();
            this.MasterRecord.Parse(WGSN);

            var LatestDoc = this.MasterRecord.GetLatestDoc();
            var TopGoalNode = LatestDoc.TopGoal;

            this.PictgramPanel.SetView(new AssureNote.NodeView(TopGoalNode, true));
            this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

            this.PictgramPanel.Draw();

            var Shape = this.PictgramPanel.MasterView.GetShape();
            var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
            var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
            this.PictgramPanel.Viewport.SetScale(1);
            this.PictgramPanel.Viewport.SetOffset(WX, WY);
        };

        AssureNoteApp.prototype.ProcessDroppedFiles = function (Files) {
            var _this = this;
            if (Files[0]) {
                var reader = new FileReader();
                reader.onerror = function (event) {
                    console.log('error', (event.target).error.code);
                };

                reader.onload = function (event) {
                    var Contents = (event.target).result;
                    var Name = Files[0].name;
                    _this.LoadNewWGSN(Name, Contents);

                    /* TODO resolve conflict */
                    _this.SocketManager.UpdateWGSN();
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNote.js.map
