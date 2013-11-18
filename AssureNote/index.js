///<reference path='src/Api.ts'/>
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/PluginManager.ts'/>
var AssureNote;
(function (AssureNote) {
    var GSNRecord = (function () {
        function GSNRecord() {
        }
        return GSNRecord;
    })();
    AssureNote.GSNRecord = GSNRecord;

    var GSNDoc = (function () {
        function GSNDoc() {
        }
        return GSNDoc;
    })();
    AssureNote.GSNDoc = GSNDoc;

    var GSNNode = (function () {
        function GSNNode() {
        }
        return GSNNode;
    })();
    AssureNote.GSNNode = GSNNode;

    var Navigator = (function () {
        function Navigator() {
        }
        Navigator.prototype.Display = function (Label, Wx, Wy) {
            //TODO
        };

        Navigator.prototype.Redraw = function () {
            this.Display(this.CurrentLabel, this.CurrentWx, this.CurrentWy);
        };

        Navigator.prototype.NavigateUp = function () {
        };
        Navigator.prototype.NavigateDown = function () {
        };
        Navigator.prototype.NavigateLeft = function () {
        };
        Navigator.prototype.NavigateRight = function () {
        };
        Navigator.prototype.NavigateHome = function () {
        };
        return Navigator;
    })();
    AssureNote.Navigator = Navigator;

    var ColorStyle = (function () {
        function ColorStyle() {
        }
        return ColorStyle;
    })();
    AssureNote.ColorStyle = ColorStyle;

    var NodeView = (function () {
        function NodeView() {
        }
        NodeView.prototype.GetGx = function () {
            if (this.Parent == null) {
                return this.OffsetGx;
            }
            return this.GetGx() + this.OffsetGx;
        };

        NodeView.prototype.GetGy = function () {
            if (this.Parent == null) {
                return this.OffsetGy;
            }
            return this.GetGy() + this.OffsetGy;
        };

        NodeView.prototype.Layout = function (LayoutEngine) {
            LayoutEngine.Layout(this);
            this.OffsetGx = LayoutEngine.Width / 2;
            this.OffsetGy = LevelMargin;
        };

        NodeView.prototype.DisplayContent = function (Content) {
            if (this.IsVisible) {
            }
        };
        return NodeView;
    })();
    AssureNote.NodeView = NodeView;

    var DefaultWidth = 96;
    var DefaultMargin = 32;
    var ContextMargin = 10;
    var LevelMargin = 32;
    var TreeMargin = 12;

    var SimpleLayoutEngine = (function () {
        function SimpleLayoutEngine() {
            this.Width = 0;
            this.Height = 0;
        }
        SimpleLayoutEngine.prototype.GetHeight = function (Node) {
            return 72;
        };

        SimpleLayoutEngine.prototype.Layout = function (ThisNode) {
            this.Width = 0;
            this.Height = 0;
            if (ThisNode.IsVisible) {
                var ParentWidth = DefaultWidth;
                var ParentHeight = this.GetHeight(ThisNode);
                if (ThisNode.Left != null) {
                    var OffsetGyLeft = 0;
                    for (var Node in ThisNode.Left) {
                        if (Node.IsVisible) {
                            Node.OffsetGx = -(DefaultWidth + DefaultMargin);
                            Node.OffsetGy = OffsetGyLeft;
                            OffsetGyLeft + (Node.GetHeight() + ContextMargin);
                        }
                    }
                    if (OffsetGyLeft > 0) {
                        ParentWidth += (DefaultWidth + DefaultMargin);
                        if (OffsetGyLeft > ParentHeight) {
                            ParentHeight = OffsetGyLeft;
                        }
                    }
                }
                if (ThisNode.Right != null) {
                    var OffsetGyRight = 0;
                    for (var Node in ThisNode.Right) {
                        if (Node.IsVisible) {
                            Node.OffsetGx = +(DefaultWidth + DefaultMargin);
                            Node.OffsetGy = OffsetGyRight;
                            OffsetGyRight + (Node.GetHeight() + ContextMargin);
                        }
                    }
                    if (OffsetGyRight > 0) {
                        ParentWidth += (DefaultWidth + DefaultMargin);
                        if (OffsetGyRight > ParentHeight) {
                            ParentHeight = OffsetGyRight;
                        }
                    }
                }
                var ChildrenWidth = 0;
                ParentHeight += LevelMargin;
                this.Height = ParentHeight;
                if (ThisNode.Children != null) {
                    for (var Node in ThisNode.Children) {
                        if (Node.IsVisible) {
                            var LayoutedSubBox = new SimpleLayoutEngine();
                            Node.Layout(LayoutedSubBox);
                            Node.OffsetGx = ChildrenWidth;
                            Node.OffsetGy = ParentHeight;
                            ChildrenWidth += (LayoutedSubBox.Width + TreeMargin);
                            if (ParentHeight + LayoutedSubBox.Height > this.Height) {
                                this.Height = ParentHeight + LayoutedSubBox.Height;
                            }
                        }
                    }
                    for (var Node in ThisNode.Children) {
                        if (Node.IsVisible) {
                            Node.OffsetGx -= (ChildrenWidth / 2);
                        }
                    }
                }
                this.Width = (ChildrenWidth > ParentWidth) ? ChildrenWidth : ParentWidth;
            }
        };
        return SimpleLayoutEngine;
    })();
    AssureNote.SimpleLayoutEngine = SimpleLayoutEngine;
})(AssureNote || (AssureNote = {}));

var AssureNote;
(function (AssureNote) {
    //Deprecated
    var FixMeModel = (function () {
        function FixMeModel() {
        }
        return FixMeModel;
    })();
    AssureNote.FixMeModel = FixMeModel;
})(AssureNote || (AssureNote = {}));

$(function () {
    var AssureNoteApp = new AssureNote.AssureNoteApp();
    //Api.GetCase(1, 1, (CaseData: any) => {
    //	var contents = CaseData.contents;
    //	var summary = CaseData.summary;
    //	Case.SetInitialData(CaseData.DCaseName, JSON.stringify(summary), contents, CaseData.caseId, CaseData.commitId);
    //	//Case.ParseASN(contents, null);
    //	//var casedecoder = new assureit.casedecoder();
    //	//var root = casedecoder.parseasn(case0, contents, null);
    //	//case0.setelementtop(root);
    //	var Screen = new AssureIt.ScreenManager(shapelayer, contentlayer, controllayer, backgroundlayer);
    //	var Viewer = new AssureIt.CaseViewer(Case, pluginManager, Api, Screen);
    //	pluginManager.RegisterKeyEvents(Viewer, Case, Api);
    //	pluginManager.CreateSideMenu(Viewer, Case, Api);
    //	Viewer.Draw();
    //	var TopView = Viewer.ViewMap[Viewer.ElementTop.Label];
    //	Viewer.Screen.SetCaseCenter(TopView.AbsX, TopView.AbsY, TopView.HTMLDoc);
    //});
});
//# sourceMappingURL=index.js.map
