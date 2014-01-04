/// <reference path="./AssureNoteParser.ts" />
var AssureNote;
(function (AssureNote) {
    var Search = (function () {
        function Search(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.SearchWord = "";
            this.DestinationX = 0;
            this.DestinationY = 0;
            this.NodeIndex = 0;
            this.IsMoving = false;
            this.HitNodes = [];
            this.Searching = false;
        }
        Search.prototype.Search = function (TargetView, IsTurn, SearchWord) {
            var _this = this;
            var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
            var ViewPort = this.AssureNoteApp.PictgramPanel.Viewport;
            if (SearchWord != null) {
                this.SearchWord = SearchWord;

                if (this.SearchWord == "") {
                    return;
                }
                this.HitNodes = TargetView.Model.SearchNode(this.SearchWord);
                this.AssureNoteApp.DebugP(this.HitNodes);

                if (this.HitNodes.length == 0) {
                    this.SearchWord = "";
                    return;
                }

                this.IsMoving = true;
                this.Searching = true;
                this.CreateHitNodeView(ViewMap);
                ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;

                this.SetAllNodesColor(ViewMap, AssureNote.ColorStyle.Searched);
                this.SetDestination(this.HitNodes[0], ViewMap);
                ViewMap[this.HitNodes[0].GetLabel()].Shape.ChangeColorStyle(AssureNote.ColorStyle.SearchHighlight);
                this.MoveToNext(ViewPort, function () {
                    _this.IsMoving = false;
                });
            } else {
                if (this.HitNodes.length == 1) {
                    return;
                }
                if (!IsTurn) {
                    this.NodeIndex++;
                    if (this.NodeIndex >= this.HitNodes.length) {
                        this.NodeIndex = 0;
                    }
                } else {
                    this.NodeIndex--;
                    if (this.NodeIndex < 0) {
                        this.NodeIndex = this.HitNodes.length - 1;
                    }
                }

                this.IsMoving = true;
                this.SetDestination(this.HitNodes[this.NodeIndex], ViewMap);
                this.MoveToNext(this.AssureNoteApp.PictgramPanel.Viewport, function () {
                    ViewMap[_this.HitNodes[_this.NodeIndex].GetLabel()].Shape.ChangeColorStyle(AssureNote.ColorStyle.SearchHighlight);
                    var index = 0;
                    if (!IsTurn) {
                        index = (_this.NodeIndex == 0) ? _this.HitNodes.length - 1 : _this.NodeIndex - 1;
                    } else {
                        index = (_this.NodeIndex == _this.HitNodes.length - 1) ? 0 : _this.NodeIndex + 1;
                    }
                    ViewMap[_this.HitNodes[index].GetLabel()].Shape.ChangeColorStyle(AssureNote.ColorStyle.Searched);
                    _this.IsMoving = false;
                });
            }
        };

        Search.prototype.CreateHitNodeView = function (ViewMap) {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Node = ViewMap[this.HitNodes[i].GetLabel()];
                while (Node != null) {
                    Node.IsFolded = false;
                    Node = Node.Parent;
                }
            }

            var TopGoal = this.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode;
            var NewNodeView = new AssureNote.NodeView(TopGoal, true);
            NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.SetView(NewNodeView);
            this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);
        };

        Search.prototype.IsSearching = function () {
            return this.Searching;
        };

        Search.prototype.ResetParam = function () {
            this.SetAllNodesColor(this.AssureNoteApp.PictgramPanel.ViewMap, AssureNote.ColorStyle.Default);
            this.HitNodes = [];
            this.NodeIndex = 0;
            this.SearchWord = "";
            this.Searching = false;
        };

        Search.prototype.SetAllNodesColor = function (ViewMap, ColorCode) {
            for (var i = 0; i < this.HitNodes.length; i++) {
                var Label = this.HitNodes[i].GetLabel();
                ViewMap[Label].GetShape().ChangeColorStyle(ColorCode);
            }
        };

        Search.prototype.SetDestination = function (HitNode, ViewMap) {
            if (HitNode == null) {
                return;
            }
            var TargetView = ViewMap[HitNode.GetLabel()];
            var Viewport = this.AssureNoteApp.PictgramPanel.Viewport;
            this.DestinationX = Viewport.GetPageCenterX() - TargetView.GetCenterGX();
            this.DestinationY = Viewport.GetPageCenterY() - TargetView.GetCenterGY();
            return;
        };

        Search.prototype.MoveToNext = function (ViewPort, Callback) {
            this.Move(this.DestinationX, this.DestinationY, 100, ViewPort);
            Callback();
        };

        Search.prototype.Move = function (logicalOffsetX, logicalOffsetY, duration, ViewPort) {
            var cycle = 1000 / 30;
            var cycles = duration / cycle;
            var initialX = ViewPort.GetOffsetX();
            var initialY = ViewPort.GetOffsetY();

            var deltaX = (logicalOffsetX - initialX) / cycles;
            var deltaY = (logicalOffsetY - initialY) / cycles;

            var currentX = initialX;
            var currentY = initialY;
            var count = 0;

            var move = function () {
                if (count < cycles) {
                    count += 1;
                    currentX += deltaX;
                    currentY += deltaY;
                    ViewPort.SetLogicalOffset(currentX, currentY, 1);
                    setTimeout(move, cycle);
                } else {
                    ViewPort.SetLogicalOffset(logicalOffsetX, logicalOffsetY, 1);
                    return;
                }
            };
            move();
        };
        return Search;
    })();
    AssureNote.Search = Search;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=SearchNode.js.map
