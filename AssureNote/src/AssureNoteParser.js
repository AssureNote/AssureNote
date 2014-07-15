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
var AssureNote;
(function (AssureNote) {
    var StringWriter = (function () {
        function StringWriter() {
            this.parts = [];
        }
        StringWriter.prototype.print = function (s) {
            this.parts.push(s);
        };
        StringWriter.prototype.println = function (s) {
            this.print(s);
            this.newline();
        };
        StringWriter.prototype.newline = function () {
            this.print("\n");
        };

        /**
        * @method toString
        * @return {String}
        */
        StringWriter.prototype.toString = function () {
            return this.parts.join("");
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
        GSNType[GSNType["Justification"] = 5] = "Justification";
        GSNType[GSNType["Assumption"] = 6] = "Assumption";
        GSNType[GSNType["Exception"] = 7] = "Exception";
        GSNType[GSNType["Contract"] = 8] = "Contract";
    })(AssureNote.GSNType || (AssureNote.GSNType = {}));
    var GSNType = AssureNote.GSNType;

    var GSNHistory = (function () {
        function GSNHistory(Rev, Author, Role, ModifiedDate, Process, Doc) {
            if (ModifiedDate == null) {
                ModifiedDate = new Date();
            }
            this.UpdateHistory(Rev, Author, Role, ModifiedDate, Process, Doc);
            this.IsCommitRevision = true;
        }
        /**
        * @method toString
        * @return {String}
        */
        GSNHistory.prototype.toString = function () {
            return (new SimpleDateFormat("").format(this.Date)) + ";" + this.Author + ";" + this.Role + ";" + this.Process;
        };

        /**
        * @method Equals
        * @param {GSNHistory} aHistory
        * @return {Boolean}
        */
        GSNHistory.prototype.Equals = function (aHistory) {
            return this.Date == aHistory.Date && this.Author == aHistory.Author;
        };

        /**
        * @method CompareDate
        * @param {GSNHistory} aHistory
        * @return {Number}
        */
        GSNHistory.prototype.CompareDate = function (aHistory) {
            return this.Date.getTime() - aHistory.Date.getTime();
        };

        /**
        * @method UpdateHistory
        * @param {Number} Rev
        * @param {String} Author
        * @param {String} Role
        * @param {Date} ModifiedDate
        * @param {String} Process
        * @param {GSNDoc} Doc
        */
        GSNHistory.prototype.UpdateHistory = function (Rev, Author, Role, ModifiedDate, Process, Doc) {
            this.Rev = Rev;
            this.Author = Author;
            this.Role = Role;
            this.Process = Process;
            this.Doc = Doc;
            this.Date = ModifiedDate;
        };

        /**
        * @method GetCommitMessage
        */
        GSNHistory.prototype.GetCommitMessage = function () {
            return this.Doc.GetTagValue("CommitMessage") || "";
        };
        return GSNHistory;
    })();
    AssureNote.GSNHistory = GSNHistory;

    /**
    * @class WikiSyntax
    * @constructor
    */
    var WikiSyntax = (function () {
        function WikiSyntax() {
        }
        /**
        * @method FormatGoalLevel
        * @param {Number} GoalLevel
        * @return {String}
        */
        WikiSyntax.FormatGoalLevel = function (GoalLevel) {
            var N = WikiSyntax.GoalLevelString.length;
            if (N < GoalLevel) {
                return WikiSyntax.GoalLevelString = new Array(GoalLevel + 1).join("*");
            } else if (N == GoalLevel) {
                return WikiSyntax.GoalLevelString;
            }
            return WikiSyntax.GoalLevelString.substr(0, GoalLevel);
        };

        /**
        * @method FormatNodeType
        * @param {GSNType} NodeType
        * @return {String}
        */
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
                case 5 /* Justification */:
                    return "J";
                case 6 /* Assumption */:
                    return "A";
                case 7 /* Exception */:
                    return "X";
                case 8 /* Contract */:
                    return "T";
                default:
                    break;
            }
            return "U";
        };

        /**
        * @method CommentOutAll
        * @param {String} DocText
        * @return {String}
        */
        WikiSyntax.CommentOutAll = function (DocText) {
            return DocText.replace(/^/mg, "# ");
        };

        /**
        * @method CommentOutSubNode
        * @static
        * @param {String} DocText
        * @return {String}
        */
        WikiSyntax.CommentOutSubNode = function (DocText) {
            DocText.match(/^\*/m);
            var beforeFirstNode = RegExp.leftContext + RegExp.lastMatch;
            if (RegExp.rightContext.match(/^\*/m)) {
                var beforeSecondNode = beforeFirstNode + RegExp.leftContext;
                return beforeSecondNode + this.CommentOutAll(RegExp.lastMatch + RegExp.rightContext);
            }
            return DocText;
        };

        /**
        * @method FormatDateString
        * @static
        * @param {String} DateString
        * @return {String}
        */
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
        WikiSyntax.GoalLevelString = "";
        return WikiSyntax;
    })();
    AssureNote.WikiSyntax = WikiSyntax;

    /**
    * @class TagUtils
    * @static
    *
    */
    var TagUtils = (function () {
        function TagUtils() {
        }
        /**
        * @method FormatTag
        * @static
        * @param {Object} TagMap
        * @param {StringWriter} Writer
        */
        TagUtils.FormatTag = function (TagMap, Writer) {
            if (TagMap != null) {
                for (var Key in TagMap) {
                    Writer.println(Key + ":: " + TagMap[Key]);
                }
            }
        };

        /**
        * @method FormatHistoryTag
        * @param {Array<GSNHistory>} HistoryList
        * @param {Number} i
        * @param {StringWriter} Writer
        */
        TagUtils.FormatHistoryTag = function (HistoryList, i, Writer) {
            var History = HistoryList[i];
            if (History != null) {
                Writer.println("#" + i + "::" + History);
            }
        };

        /**
        * @method GetString
        * @param {Object} TagMap
        * @param {String} Key
        * @param {String} DefValue
        * @return {String}
        */
        TagUtils.GetString = function (TagMap, Key, DefValue) {
            if (TagMap != null) {
                var Value = TagMap[Key];
                if (Value != null) {
                    return Value;
                }
            }
            return DefValue;
        };

        /**
        * @method GetInteger
        * @param {Object} TagMap
        * @param {String} Key
        * @param {Number} DefValue
        * @return
        */
        TagUtils.GetInteger = function (TagMap, Key, DefValue) {
            if (TagMap != null && TagMap[Key] != null) {
                return parseInt(TagMap[Key]);
            }
            return DefValue;
        };
        return TagUtils;
    })();
    AssureNote.TagUtils = TagUtils;

    ;

    var TreeParser = (function () {
        function TreeParser(BaseDoc, Nodes) {
            this.BaseDoc = BaseDoc;
            this.Nodes = Nodes;
            this.Index = 0;
            this.TopNode = null;
        }
        TreeParser.IsTypeContextLike = function (Type) {
            return Type == 1 /* Context */ || Type == 6 /* Assumption */ || Type == 5 /* Justification */ || Type == 7 /* Exception */;
        };

        TreeParser.IsCollectRelation = function (ParentType, ParentDepth, ChildType, ChildDepth) {
            if (ChildDepth == ParentDepth) {
                if (ChildType == 0 /* Goal */) {
                    return false;
                }
                if (ParentType != 0 /* Goal */ && (ChildType == 3 /* Evidence */ || ChildType == 2 /* Strategy */)) {
                    return false;
                }
                if ((ParentType == 3 /* Evidence */ || ParentType == 2 /* Strategy */) && !TreeParser.IsTypeContextLike(ChildType)) {
                    return false;
                }
                if (TreeParser.IsTypeContextLike(ParentType)) {
                    return false;
                }
                return true;
            }
            if (ParentDepth + 1 == ChildDepth) {
                return ParentType == 2 /* Strategy */ && ChildType == 0 /* Goal */;
            }
            return false;
        };

        TreeParser.prototype.ConvertBody = function (Body, Flags, Tags) {
            if (Body == null) {
                return "";
            }
            return Body.map(function (line) {
                if (line == null) {
                    return "";
                }
                return line.map(function (part) {
                    switch (part.type) {
                        case "text":
                            return part.value;
                        case "def":
                            Flags.HasTagDefinition = true;
                            if (part.value) {
                                Tags[part.name] = part.value;
                                return part.name + ":: " + part.value;
                            }
                            return part.name + ":: ";
                        case "param":
                            Flags.HasTagReference = true;
                            return "[" + part.ref + "]";
                        case "node":
                            Flags.HasNodeReference = true;
                            return "[" + part.ref + "]";
                    }
                }).join("");
            }).join("\n");
        };

        TreeParser.prototype.ConvertNode = function (Parent, Node) {
            var _this = this;
            var NodeTypeSymbol = Node.type == "Exception" ? "X" : Node.type.charAt(0);
            var Revision = Node.revision ? [Node.revision.created, Node.revision.modified] : [0, 0];
            var History = Revision.map(function (rev) {
                return _this.BaseDoc.Record.GetHistory(rev);
            });
            var Flags = { HasNodeReference: false, HasTagReference: false, HasTagDefinition: false };
            var Tags = {};
            var UID = Node.key ? parseInt(Node.key, 16) : AssureNote.AssureNoteUtils.GenerateUID();

            var ParsedNode = new GSNNode(this.BaseDoc, Parent, GSNType[Node.type], null, UID, History);
            ParsedNode.NodeDoc = this.ConvertBody(Node.body, Flags, Tags);
            if (Node.id != null && Node.id.length > 0) {
                ParsedNode.LabelName = NodeTypeSymbol + ":" + Node.id;
            }

            if (Flags.HasTagDefinition) {
                ParsedNode.TagMap = Tags;
                ParsedNode.HasTag = true;
            }
            if (Flags.HasNodeReference || Flags.HasTagReference) {
                ParsedNode.HasTagOrLabelReference = true;
            }

            return ParsedNode;
        };

        TreeParser.prototype.ParseTree = function (Parent) {
            var TopNode = this.Nodes[this.Index++];
            var TopGSNNode = this.ConvertNode(Parent, TopNode);
            this.PrevNode = TopGSNNode;
            while (this.Index < this.Nodes.length) {
                var Node = this.Nodes[this.Index];
                if (!TreeParser.IsCollectRelation(TopGSNNode.NodeType, TopNode.depth, GSNType[Node.type], Node.depth)) {
                    var NextNode = this.Nodes[this.Index + 1];
                    if (Parent == null || NextNode && TreeParser.IsCollectRelation(TopGSNNode.NodeType, TopNode.depth, GSNType[NextNode.type], NextNode.depth) && !TreeParser.IsCollectRelation(GSNType[Node.type], Node.depth, GSNType[NextNode.type], NextNode.depth)) {
                        this.PrevNode.NodeDoc += "\n\n" + this.ConvertNode(null, Node).toString().replace(/^/mg, "# ");
                        this.Index++;
                    } else {
                        break;
                    }
                } else {
                    this.ParseTree(TopGSNNode);
                }
            }
            return TopGSNNode;
        };

        TreeParser.prototype.Parse = function () {
            if (this.TopNode == null) {
                this.Index = 0;
                this.TopNode = this.ParseTree(null);
            }
            if (this.Index < this.Nodes.length) {
                throw new Error("WGSNSyntaxError");
            }
            return this.TopNode;
        };
        TreeParser.Parse = function (BaseDoc, Nodes) {
            return new TreeParser(BaseDoc, Nodes).Parse();
        };
        return TreeParser;
    })();

    var Parser = (function () {
        function Parser() {
        }
        Parser.InvokePegJSParser = function (Source) {
            while (true) {
                try  {
                    return WGSN.parse(Source);
                } catch (e) {
                    if (e.constructor.name == "SyntaxError") {
                        var splitPoint = e.offset - e.column + 1;
                        Source = Source.substr(0, splitPoint) + "# " + Source.substr(splitPoint);
                    } else {
                        throw e;
                    }
                }
            }
        };

        Parser.ParseTree = function (BaseDoc, Source) {
            var ParseResult = Parser.InvokePegJSParser(Source);
            var Nodes = ParseResult.revisions[0].nodes;
            return new TreeParser(BaseDoc, Nodes).Parse();
        };

        /**
        * @method ParseRecord
        * @param {String} TextDoc
        */
        Parser.ParseRecord = function (TextDoc) {
            var Record = new GSNRecord();
            var ParseResult = Parser.InvokePegJSParser(TextDoc.replace(/^\s+/mg, ""));

            ParseResult.revisions.forEach(function (revision) {
                var Doc = new GSNDoc(Record);
                if (revision.header) {
                    Doc.SetTagValue("Author", revision.header.user);
                    Doc.SetTagValue("Revision", revision.header.revision.toString());
                    Doc.SetTagValue("Date", revision.header.modified.toISOString());
                    Doc.SetTagValue("CommitMessage", revision.header.messsage);
                }
                Doc.UpdateDocHeader();
                Doc.TopNode = new TreeParser(Doc, revision.nodes).Parse();
                Doc.RemapNodeMap();
                Doc.RenumberAll();
            });
            var first = true;
            Record.HistoryList.forEach(function (History) {
                if (!first && History.Doc.GetTagValue("CommitMessage") == null) {
                    History.IsCommitRevision = false;
                }
                first = false;
            });

            return Record;
        };
        return Parser;
    })();
    AssureNote.Parser = Parser;

    /**
    * @class GSNNode
    * @constructor
    * @param {GSNDoc} BaseDoc
    * @param {GSNNode} ParentNode
    * @param {GSNType} NodeType
    * @param {String} LabelName
    * @param {Number} UID
    * @param {Array<GSNHistory>} HistoryTaple
    */
    var GSNNode = (function () {
        function GSNNode(BaseDoc, ParentNode, NodeType, LabelName, UID, HistoryTaple) {
            this.BaseDoc = BaseDoc;
            this.ParentNode = ParentNode;
            this.NodeType = NodeType;
            this.LabelName = LabelName; // G:TopGoal
            this.AssignedLabelNumber = "";
            this.UID = UID;
            this.SectionCount = 0;
            this.SubNodeList = null;
            this.HasTagOrLabelReference = false;
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
            this.NodeDoc = "";
            this.HasTag = false;
            if (this.ParentNode != null) {
                ParentNode.AppendSubNode(this);
            }
        }
        GSNNode.prototype.toString = function () {
            var Writer = new StringWriter();
            this.FormatNode(Writer);
            return Writer.toString();
        };

        GSNNode.prototype.DeepCopy = function (BaseDoc, ParentNode) {
            var NewNode = new GSNNode(BaseDoc, ParentNode, this.NodeType, this.LabelName, this.UID, null);
            NewNode.Created = this.Created;
            NewNode.LastModified = this.LastModified;
            NewNode.Digest = this.Digest;
            NewNode.NodeDoc = this.NodeDoc;
            NewNode.HasTag = this.HasTag;
            NewNode.HasTagOrLabelReference = this.HasTagOrLabelReference;
            if (BaseDoc != null) {
                BaseDoc.AddNodeWithoutCheck(NewNode);
            }
            this.NonNullSubNodeList().forEach(function (Node) {
                Node.DeepCopy(BaseDoc, NewNode);
            });
            return NewNode;
        };

        /**
        * @method IsGoal
        * @return {Boolean}
        */
        GSNNode.prototype.IsGoal = function () {
            return (this.NodeType == 0 /* Goal */);
        };

        /**
        * @method IsStrategy
        * @return {Boolean}
        */
        GSNNode.prototype.IsStrategy = function () {
            return (this.NodeType == 2 /* Strategy */);
        };

        /**
        * @method IsContext
        * @return {Boolean}
        */
        GSNNode.prototype.IsContext = function () {
            return (this.NodeType == 1 /* Context */);
        };

        /**
        * @method IsEvidence
        * @return {Boolean}
        */
        GSNNode.prototype.IsEvidence = function () {
            return (this.NodeType == 3 /* Evidence */);
        };

        /**
        * @method NonNullSubNodeList
        * @return {Array<GSNNode>}
        */
        GSNNode.prototype.NonNullSubNodeList = function () {
            return this.SubNodeList == null ? Lib.EmptyNodeList : this.SubNodeList;
        };

        /**
        * @method Remap
        * @param {Object} NodeMap
        */
        GSNNode.prototype.Remap = function (NodeMap) {
            NodeMap[this.UID] = this;
            var List = this.NonNullSubNodeList();
            for (var i = 0; i < List.length; i++) {
                var Node = List[i];
                Node.Remap(NodeMap);
            }
        };

        /**
        * @method GetGoalLevel
        * @return {Number}
        */
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

        /**
        * @method GetLabel
        * @return {String}
        */
        GSNNode.prototype.GetLabel = function () {
            return WikiSyntax.FormatNodeType(this.NodeType) + this.GetLabelNumber();
        };

        /**
        * @method @GetHistoryTaple
        * @return {String}
        */
        GSNNode.prototype.GetHistoryTaple = function () {
            return "#" + this.Created.Rev + ":" + this.LastModified.Rev;
        };

        /**
        * @method GetLabelNumber
        * @return
        */
        GSNNode.prototype.GetLabelNumber = function () {
            return this.AssignedLabelNumber;
        };

        /**
        * @method IsModified
        * @return {Boolean}
        */
        GSNNode.prototype.IsModified = function () {
            return this.LastModified == this.BaseDoc.DocHistory;
        };

        /**
        * @method SetContent
        * @param {Array<String>} LineList
        */
        GSNNode.prototype.SetContent = function (LineList) {
            var OldDigest = this.Digest;
            var LineCount = 0;
            var Writer = new StringWriter();
            var md = Lib.GetMD5();
            for (var i = 0; i < LineList.length; i++) {
                var Line = LineList[i];
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

        /**
        * @method UpdateContent
        * @param {String} TextDoc
        */
        GSNNode.prototype.UpdateContent = function (TextDoc) {
            TextDoc.match(/^*/m);
            var Lines = RegExp.leftContext.match(/^.*$/mg);
            this.SetContent(Lines);
        };

        /**
        * GetNodeHistoryList
        * @return {Array<GSNHistory>}
        */
        GSNNode.prototype.GetNodeHistoryList = function () {
            var Revisions = this.BaseDoc.Record.HistoryList;
            var PrevRev = this.Created.Rev;
            var LastRev = this.LastModified.Rev;
            var HistoryList = [this.Created];

            for (var rev = this.Created.Rev + 1; rev <= LastRev && rev < Revisions.length; rev++) {
                var FormarNodeModel = Revisions[rev].Doc.GetNode(this.UID);
                var FormarHistory = FormarNodeModel ? FormarNodeModel.LastModified : null;

                if (FormarHistory && FormarHistory.Rev != PrevRev) {
                    HistoryList.push(FormarHistory);
                    PrevRev = FormarHistory.Rev;
                }
            }

            return HistoryList;
        };

        /**
        * @method AppendSubNode
        * @private
        * @param {GSNNode} Node
        */
        GSNNode.prototype.AppendSubNode = function (Node) {
            if (this.SubNodeList == null) {
                this.SubNodeList = [Node];
            } else {
                this.SubNodeList.push(Node);
            }
        };

        /**
        * @method HasSubNode
        * @param {GSNType} NodeType
        * @return {Boolean}
        */
        GSNNode.prototype.HasSubNode = function (NodeType) {
            var SubNodes = this.NonNullSubNodeList();
            for (var i = 0; i < SubNodes.length; i++) {
                var Node = SubNodes[i];
                if (Node.NodeType == NodeType) {
                    return true;
                }
            }
            return false;
        };

        /**
        * @method GetUpperNearestGoal
        * @return {GSNNode}
        */
        GSNNode.prototype.GetUpperNearestGoal = function () {
            var Node = this;
            while (Node.NodeType != 0 /* Goal */) {
                Node = Node.ParentNode;
            }
            return Node;
        };

        /**
        * @method GetTagMap
        * @return {Object}
        */
        GSNNode.prototype.GetTagMap = function () {
            if (this.TagMap == null && this.HasTag) {
                this.TagMap = {};
            }
            return this.TagMap;
        };

        /**
        * @method MergeTagMap
        * @param {Object} BaseMap
        * @param {Object} NewMap
        * @return {Object}
        */
        GSNNode.prototype.MergeTagMap = function (BaseMap, NewMap) {
            if (BaseMap == null)
                return NewMap;
            if (NewMap == null)
                return BaseMap;

            var Result = {};

            //for (var key in BaseMap) {
            //    Result[key] = BaseMap[key];
            //}
            Result.__proto__ = BaseMap;
            for (var key in NewMap) {
                Result[key] = NewMap[key];
            }
            return Result;
        };

        /**
        * @method  GetTagMapWithLexicalScope
        * @return {Object}
        */
        GSNNode.prototype.GetTagMapWithLexicalScope = function () {
            var Result = null;
            if (this.ParentNode != null) {
                Result = this.MergeTagMap(this.ParentNode.GetTagMapWithLexicalScope(), this.GetTagMap());
            } else {
                Result = this.GetTagMap();
            }
            if (this.SubNodeList != null) {
                for (var i = 0; i < this.SubNodeList.length; i++) {
                    var Node = this.SubNodeList[i];
                    if (Node.IsContext()) {
                        Result = this.MergeTagMap(Result, Node.GetTagMap());
                    }
                }
            }
            return Result;
        };

        /**
        * @method GetLastNode
        * @param {GSNType} NodeType
        * @param {Boolean} Creation
        * @return {GSNNode}
        */
        GSNNode.prototype.GetLastNode = function (NodeType, Creation) {
            if (this.SubNodeList != null) {
                for (var i = this.SubNodeList.length - 1; i >= 0; i--) {
                    var Node = this.SubNodeList[i];
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

        /**
        * @method FormatNode
        * Stringfy subtree for saving WGSN file.
        * @param {StringWriter} Writer
        */
        GSNNode.prototype.FormatNode = function (Writer) {
            Writer.print(WikiSyntax.FormatGoalLevel(this.GetGoalLevel()));
            Writer.print(" ");
            Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
            Writer.print(this.AssignedLabelNumber);
            if (this.LabelName != null) {
                Writer.print(this.LabelName.substr(1));
            }
            Writer.print(" &");
            Writer.print(this.UID.toString(16));
            if (this.Created != null) {
                var HistoryTaple = this.GetHistoryTaple();
                Writer.print(" " + HistoryTaple);
            }
            Writer.newline();
            if (this.NodeDoc != null && this.NodeDoc.length != 0) {
                Writer.print(this.NodeDoc);
                Writer.newline();
            }
            Writer.newline();
            for (var i = 0; i < this.NonNullSubNodeList().length; i++) {
                var Node = this.NonNullSubNodeList()[i];
                if (Node.IsContext()) {
                    Node.FormatNode(Writer);
                }
            }
            for (var i = 0; i < this.NonNullSubNodeList().length; i++) {
                var Node = this.NonNullSubNodeList()[i];
                if (!Node.IsContext()) {
                    Node.FormatNode(Writer);
                }
            }
        };

        /**
        * @method FormatSubNode
        * Stringfy subtree for editing.
        * @param {Number} GoalLevel
        * @param {StringWriter} Writer
        * @param {Boolean} IsRecursive
        */
        GSNNode.prototype.FormatSubNode = function (GoalLevel, Writer, IsRecursive) {
            Writer.print(WikiSyntax.FormatGoalLevel(GoalLevel));
            Writer.print(" ");

            // "G1"
            Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
            Writer.print(this.AssignedLabelNumber);
            if (this.LabelName != null) {
                // ":TopGoal"
                Writer.print(this.LabelName.substr(1));
            }
            Writer.print(" &");
            Writer.print(Lib.DecToHex(this.UID));
            Writer.newline();
            if (this.NodeDoc != null && this.NodeDoc.length != 0) {
                Writer.println(this.NodeDoc);
            }
            if (!IsRecursive)
                return;
            Writer.newline();
            this.NonNullSubNodeList().forEach(function (Node) {
                if (Node.IsContext()) {
                    Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer, IsRecursive);
                }
            });
            this.NonNullSubNodeList().forEach(function (Node) {
                if (!Node.IsContext()) {
                    Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer, IsRecursive);
                }
            });
        };

        /**
        * @method ReplaceSubNode
        * Replace this subtree with given tree.
        * @param {GSNNode} NewNode The tree with which replace this subtree.
        * @param {Boolean} IsRecursive If true is given, replace all nodes under this node. Otherwise, replace only this node.
        * @param {Boolean} IsAppendOnly If true is given, append newly appeared nodes but do not remove disappeared nodes.
        * @return {GSNNode}
        */
        GSNNode.prototype.ReplaceSubNode = function (NewNode, IsRecursive, IsAppendOnly) {
            var _this = this;
            this.MergeDocHistory(NewNode);
            if (this.ParentNode != null) {
                for (var i = 0; i < this.ParentNode.SubNodeList.length; i++) {
                    if (this.ParentNode.SubNodeList[i] == this) {
                        this.ParentNode.SubNodeList[i] = NewNode;
                        NewNode.ParentNode = this.ParentNode;
                        break;
                    }
                }
            } else {
                this.BaseDoc.TopNode = NewNode;
            }
            if (!IsRecursive) {
                NewNode.SubNodeList = this.SubNodeList;
                NewNode.SubNodeList.forEach(function (Node) {
                    return Node.ParentNode = NewNode;
                });
            }
            if (IsAppendOnly && this.SubNodeList) {
                if (NewNode.SubNodeList) {
                    NewNode.SubNodeList.forEach(function (Node) {
                        if (Node) {
                            Node.ParentNode = NewNode;
                            _this.SubNodeList.push(Node);
                        }
                    });
                }
                NewNode.SubNodeList = this.SubNodeList;
            }
            return NewNode;
        };

        /**
        * @method ReplaceSubNodeWithText
        * Replace this subtree with given tree.
        * @param {String} DocText The tree in WGSN format with which replace this subtree.
        * @param {Boolean} IsRecursive If true is given, replace all nodes under this node. Otherwise, replace only this node.
        * @param {Boolean} IsAppendOnly If true is given, append newly appeared nodes but do not remove disappeared nodes.
        * @return {GSNNode}
        */
        GSNNode.prototype.ReplaceSubNodeWithText = function (DocText, IsRecursive, IsAppendOnly) {
            if (!IsRecursive) {
                DocText = WikiSyntax.CommentOutSubNode(DocText);
            }

            var NewNode = Parser.ParseTree(this.BaseDoc, DocText);
            if (NewNode.NodeType != this.NodeType) {
                var Writer = new StringWriter();
                NewNode.FormatNode(Writer);
                this.NodeDoc = WikiSyntax.CommentOutAll(Writer.toString());
                NewNode = this;
            }
            if (NewNode != null) {
                NewNode = this.ReplaceSubNode(NewNode, IsRecursive, IsAppendOnly);
            }
            return NewNode;
        };

        /**
        * @method HasSubNodeUID
        * @param {Number} UID
        * @return {Boolean}
        */
        GSNNode.prototype.HasSubNodeUID = function (UID) {
            if (UID == this.UID) {
                return true;
            }
            for (var i = 0; i < this.NonNullSubNodeList().length; i++) {
                var SubNode = this.NonNullSubNodeList()[i];
                if (SubNode.HasSubNodeUID(UID))
                    return true;
            }
            return false;
        };

        /**
        * We have to assume that node-level conflict never happen.
        * @method Merge
        * @param {GSNNode} NewNode
        */
        GSNNode.prototype.Merge = function (NewNode, CommonRevision) {
            if (NewNode.LastModified.Rev > CommonRevision) {
                this.ReplaceSubNode(NewNode, true);
                return this;
            }

            for (var i = 0, j = 0; NewNode.SubNodeList != null && i < NewNode.SubNodeList.length; i++) {
                var SubNewNode = NewNode.SubNodeList[i];
                for (; this.SubNodeList != null && j < this.SubNodeList.length; j++) {
                    var SubMasterNode = this.SubNodeList[j];
                    if (SubMasterNode.UID == SubNewNode.UID) {
                        SubMasterNode.Merge(SubNewNode, CommonRevision);
                        break;
                    }
                }
                if (j == this.SubNodeList.length) {
                    this.SubNodeList.push(SubNewNode);
                }
            }
            return this;
        };

        /**
        * Update GSNNode.(Created/LastModified)
        * @method MergeDocHistory
        * @param {GSNNode} NewNode
        */
        GSNNode.prototype.MergeDocHistory = function (NewNode) {
            (this.BaseDoc != null);
            NewNode.LastModified = null; // this.BaseDoc has Last
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
            for (var i = 0; i < NewNode.NonNullSubNodeList().length; i++) {
                var SubNode = NewNode.NonNullSubNodeList()[i];
                this.MergeDocHistory(SubNode);
            }
        };

        /**
        * @method IsNewerTree
        * @param {Number} ModifiedRev
        * @return {Boolean}
        */
        // Merge
        GSNNode.prototype.IsNewerTree = function (ModifiedRev) {
            if (ModifiedRev <= this.LastModified.Rev) {
                for (var i = 0; i < this.NonNullSubNodeList().length; i++) {
                    var Node = this.NonNullSubNodeList()[i];
                    if (!Node.IsNewerTree(ModifiedRev)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };

        /**
        * @method ListSubGoalNode
        * @param {Array<GSNNode>} BufferList
        */
        GSNNode.prototype.ListSubGoalNode = function (BufferList) {
            this.NonNullSubNodeList().forEach(function (Node) {
                if (Node.IsGoal()) {
                    BufferList.push(Node);
                }
                if (Node.IsStrategy()) {
                    Node.ListSubGoalNode(BufferList);
                }
            });
        };

        /**
        * @method ListSectionNode
        * @param {Array<GSNNode>} BufferList
        */
        GSNNode.prototype.ListSectionNode = function (BufferList) {
            this.NonNullSubNodeList().forEach(function (Node) {
                if (!Node.IsGoal()) {
                    BufferList.push(Node);
                }
                if (Node.IsStrategy() || Node.IsEvidence()) {
                    Node.ListSectionNode(BufferList);
                }
            });
        };

        /**
        * @method RenumberGoalRecursive
        * @param {Number} GoalCount
        * @param {Number} NextGoalCount
        * @param {Object} LabelMap
        */
        GSNNode.prototype.RenumberGoalRecursive = function (GoalCount, NextGoalCount, LabelMap) {
            var queue = [this];
            var CurrentNode;
            while ((CurrentNode = queue.shift()) != null) {
                while (LabelMap[GoalCount.toString()] != null) {
                    GoalCount++;
                }
                CurrentNode.AssignedLabelNumber = GoalCount.toString();
                GoalCount++;
                var BufferList = [];
                CurrentNode.ListSectionNode(BufferList);
                var SectionCount = 1;
                for (var i = 0; i < BufferList.length; i++, SectionCount += 1) {
                    var SectionNode = BufferList[i];
                    var LabelNumber = CurrentNode.GetLabelNumber() + "." + SectionCount;
                    if (LabelMap[LabelNumber] != null)
                        continue;
                    SectionNode.AssignedLabelNumber = LabelNumber;
                }
                BufferList = [];
                CurrentNode.ListSubGoalNode(BufferList);
                Array.prototype.push.apply(queue, BufferList);
                NextGoalCount += BufferList.length;
            }
        };

        /**
        * @method RenumberGoal
        * @param {Number} GoalCount
        * @param {Number} NextGoalCount
        */
        GSNNode.prototype.RenumberGoal = function (GoalCount, NextGoalCount) {
            this.RenumberGoalRecursive(GoalCount, NextGoalCount, {});
        };

        /**
        * @method SearchNode
        * @param {String} SearchWord
        * @return {Array<GSNNode>}
        */
        GSNNode.prototype.SearchNode = function (SearchWord) {
            var NodeList = [];
            if (this.NodeDoc.indexOf(SearchWord) >= 0) {
                NodeList.push(this);
            }
            this.NonNullSubNodeList().forEach(function (Node) {
                Array.prototype.push.apply(NodeList, Node.SearchNode(SearchWord));
            });
            return NodeList;
        };

        /**
        * @method GetNodeCount
        * @return {Number}
        */
        GSNNode.prototype.GetNodeCount = function () {
            var res = 1;
            this.NonNullSubNodeList().forEach(function (Node) {
                res += Node.GetNodeCount();
            });
            return res;
        };

        GSNNode.prototype.GetNodeCountTypeOf = function (type) {
            var res = this.NodeType == type ? 1 : 0;
            this.NonNullSubNodeList().forEach(function (Node) {
                res += Node.GetNodeCountTypeOf(type);
            });
            return res;
        };
        return GSNNode;
    })();
    AssureNote.GSNNode = GSNNode;

    /**
    * @class GSNDoc
    * @constructor
    * @param {GSNRecord} Record
    */
    var GSNDoc = (function () {
        function GSNDoc(Record) {
            this.TopNode = null;
            this.NodeMap = {};
            this.DocTagMap = {};
            this.DocHistory = null;
            this.GoalCount = 0;
            this.Record = Record;
        }
        GSNDoc.prototype.GetTagValue = function (Key) {
            return this.DocTagMap[Key];
        };

        GSNDoc.prototype.SetTagValue = function (Key, Value) {
            this.DocTagMap[Key] = Value;
        };

        GSNDoc.prototype.ForEachNode = function (Action) {
            if (Action) {
                for (var key in this.NodeMap) {
                    Action(this.NodeMap[key]);
                }
            }
        };

        /**
        * @method DeepCopy
        * @param {String} Author
        * @param {String} Role
        * @param {String} Date
        * @param {String} Process
        * @return {GSNDoc}
        */
        GSNDoc.prototype.DeepCopy = function (Author, Role, ModefiedDate, Process) {
            var NewDoc = new GSNDoc(this.Record);
            NewDoc.GoalCount = this.GoalCount;
            NewDoc.DocHistory = this.Record.NewHistory(Author, Role, ModefiedDate, Process, NewDoc);
            NewDoc.DocTagMap = this.CloneTagMap(this.DocTagMap);
            if (this.TopNode != null) {
                NewDoc.TopNode = this.TopNode.DeepCopy(NewDoc, null);
            }
            return NewDoc;
        };

        /**
        * @method CloneTagMap
        * @param {Object} TagMap
        * @return {Object}
        */
        GSNDoc.prototype.CloneTagMap = function (TagMap) {
            if (TagMap != null) {
                var NewMap = {};
                for (var key in TagMap) {
                    NewMap[key] = TagMap[key];
                }
                return NewMap;
            }
            return null;
        };

        /**
        * @method UpdateDocHeader
        * @param {StringReader} Reader
        */
        GSNDoc.prototype.UpdateDocHeader = function () {
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
                var ModefiedDate = new Date(TagUtils.GetString(this.DocTagMap, "Date", null));
                var Process = TagUtils.GetString(this.DocTagMap, "Process", "-");
                this.DocHistory = this.Record.NewHistory(Author, Role, ModefiedDate, Process, this);
            }
        };

        /**
        * @method GetNode
        * @param {Number} UID
        * @return {GSNNode}
        */
        GSNDoc.prototype.GetNode = function (UID) {
            return this.NodeMap[UID];
        };

        /**
        * @method UncheckAddNode
        * @param {GSNNode} Node
        */
        GSNDoc.prototype.AddNodeWithoutCheck = function (Node) {
            this.NodeMap[Node.UID] = Node;
        };

        /**
        * @method AddNode
        * @param {GSNNode} Node
        */
        GSNDoc.prototype.AddNode = function (Node) {
            var Key = Node.UID;
            var OldNode = this.NodeMap[Key];
            if (OldNode != null) {
                if (OldNode.Digest == Node.Digest) {
                    Node.Created = OldNode.Created;
                }
            }
            this.NodeMap[Key] = Node;
            if (Node.NodeType == 0 /* Goal */) {
                if (Node.GetGoalLevel() == 1) {
                    this.TopNode = Node;
                }
            }
        };

        /**
        * @method RemapNodeMap
        */
        GSNDoc.prototype.RemapNodeMap = function () {
            var NodeMap = {};
            if (this.TopNode != null) {
                this.TopNode.Remap(NodeMap);
            }
            this.NodeMap = NodeMap;
        };

        /**
        * @method RemoveNode
        * @param Node
        */
        GSNDoc.prototype.RemoveNode = function (Node) {
            (this == Node.BaseDoc);
            if (Node.ParentNode != null) {
                var index = Node.ParentNode.SubNodeList.indexOf(Node);
                Node.ParentNode.SubNodeList.splice(index, 1);
            }
            this.RemapNodeMap();
        };

        /**
        * @method FormatDoc
        * @param {StringWriter} Stream
        */
        GSNDoc.prototype.FormatDoc = function (Stream) {
            if (this.TopNode != null) {
                /* FIXME Format DocTagMap */
                Stream.println("Revision:: " + this.DocHistory.Rev);
                if (TagUtils.GetString(this.DocTagMap, "CommitMessage", null) != null) {
                    Stream.println("CommitMessage:: " + TagUtils.GetString(this.DocTagMap, "CommitMessage", null));
                }
                this.TopNode.FormatNode(Stream);
            }
        };

        /**
        * @method GetLabelMap
        * @return {Object}
        */
        GSNDoc.prototype.GetLabelMap = function () {
            var LabelMap = {};
            var CurrentNode;
            var queue = [this.TopNode];
            while ((CurrentNode = queue.shift()) != null) {
                if (CurrentNode.LabelName != null) {
                    LabelMap[CurrentNode.LabelName] = CurrentNode.GetLabel();
                }
                if (CurrentNode.SubNodeList) {
                    Array.prototype.push.apply(queue, CurrentNode.SubNodeList);
                }
            }
            return LabelMap;
        };

        /**
        * @method GetNodeCount
        * @return {Number}
        */
        GSNDoc.prototype.GetNodeCount = function () {
            return this.TopNode.GetNodeCount();
        };

        /**
        * @method GetNodeCountTypeOf
        * @param {GSNType} type
        * @return {Number}
        */
        GSNDoc.prototype.GetNodeCountTypeOf = function (type) {
            return this.TopNode.GetNodeCountTypeOf(type);
        };

        /**
        * @method RenumberAll
        */
        GSNDoc.prototype.RenumberAll = function () {
            if (this.TopNode != null) {
                this.TopNode.RenumberGoal(1, 2);
            }
        };
        return GSNDoc;
    })();
    AssureNote.GSNDoc = GSNDoc;

    /**
    * @class GSNRecord
    * @constructor
    *
    */
    var GSNRecord = (function () {
        function GSNRecord() {
            this.HistoryList = [];
            this.EditingDoc = null;
        }
        /**
        * @method DeepCopy
        * @return GSNRecord
        */
        GSNRecord.prototype.DeepCopy = function () {
            var NewRecord = new GSNRecord();
            NewRecord.HistoryList = this.HistoryList.map(function (x) {
                return x;
            });
            NewRecord.EditingDoc = this.EditingDoc;
            return NewRecord;
        };

        /**
        * @method GetHistory
        * @param {Number} Rev
        * @return {GSNHistory}
        */
        GSNRecord.prototype.GetHistory = function (Rev) {
            if (Rev < this.HistoryList.length) {
                return this.HistoryList[Rev];
            }
            return null;
        };

        /**
        * @method GetHistoryDoc
        * @param {Number} Rev
        * @return {GSNDoc}
        */
        GSNRecord.prototype.GetHistoryDoc = function (Rev) {
            var history = this.GetHistory(Rev);
            if (history != null) {
                return history.Doc;
            }
            return null;
        };

        /**
        * @method NewHistory
        * @param {String} Author
        * @param {String} Role
        * @param {String} Date
        * @param {String} Process
        * @param {GSNDoc} Doc
        * @return {GSNHistory}
        */
        GSNRecord.prototype.NewHistory = function (Author, Role, ModefiedDate, Process, Doc) {
            var History = new GSNHistory(this.HistoryList.length, Author, Role, ModefiedDate, Process, Doc);
            this.HistoryList.push(History);
            return History;
        };

        /**
        * @method AddHistory
        * @param {Number} Rev
        * @param {String} Author
        * @param {String} Role
        * @param {String} Date
        * @param {String} Process
        * @param {GSNDoc} Doc
        */
        GSNRecord.prototype.AddHistory = function (Rev, Author, Role, ModefiedDate, Process, Doc) {
            if (Rev >= 0) {
                var History = new GSNHistory(Rev, Author, Role, ModefiedDate, Process, Doc);
                while (Rev >= this.HistoryList.length) {
                    this.HistoryList.push(new GSNHistory(Rev, Author, Role, ModefiedDate, Process, Doc));
                }
                if (0 <= Rev && Rev < this.HistoryList.length) {
                    var OldHistory = this.HistoryList[Rev];
                    OldHistory.UpdateHistory(Rev, Author, Role, ModefiedDate, Process, Doc);
                }
                this.HistoryList[Rev] = History;
                if (Doc != null) {
                    Doc.DocHistory = History;
                }
            }
        };

        /**
        * @method RenumberAll
        */
        GSNRecord.prototype.RenumberAll = function () {
            var LatestDoc = this.GetLatestDoc();
            if (LatestDoc != null && LatestDoc.TopNode != null) {
                LatestDoc.RenumberAll();
            }
        };

        /**
        * @method OpenEditor
        * @param {String} Author
        * @param {String} Role
        * @param {String} Date
        * @param {String} Process
        */
        GSNRecord.prototype.OpenEditor = function (Author, Role, ModefiedDate, Process) {
            if (this.EditingDoc == null) {
                var Doc = this.GetLatestDoc();
                if (Doc != null) {
                    this.EditingDoc = Doc.DeepCopy(Author, Role, ModefiedDate, Process);
                } else {
                    this.EditingDoc = new GSNDoc(this);
                    this.EditingDoc.DocHistory = this.NewHistory(Author, Role, ModefiedDate, Process, this.EditingDoc);
                }
            }
            this.EditingDoc.DocHistory.IsCommitRevision = false;
        };

        /**
        * @method CloseEditor
        */
        GSNRecord.prototype.CloseEditor = function () {
            this.EditingDoc = null;
        };

        /**
        * @method DiscardEditor
        */
        GSNRecord.prototype.DiscardEditor = function () {
            this.EditingDoc = null;
            this.HistoryList.pop();
        };

        /**
        * @method Merge
        * @param {GSNRecord} NewRecord
        */
        GSNRecord.prototype.Merge = function (NewRecord) {
            var CommonRevision = -1;
            for (var Rev = 0; Rev < this.HistoryList.length; Rev++) {
                var MasterHistory = this.GetHistory(Rev);
                var NewHistory = NewRecord.GetHistory(Rev);
                if (NewHistory != null && MasterHistory.Equals(NewHistory)) {
                    CommonRevision = Rev;
                    continue;
                }
                break;
            }
            if (CommonRevision == -1) {
                this.MergeAsReplaceTopGoal(NewRecord);
            } else if (CommonRevision == this.HistoryList.length - 1) {
                this.MergeAsFastFoward(NewRecord);
            } else if (CommonRevision != NewRecord.HistoryList.length - 1) {
                this.MergeConflict(NewRecord, CommonRevision);
            }
        };

        /**
        * Resolve conflict and create new record to merge records.
        * Node-level conflict will never happen.
        * @method MergeConflict
        * @param {GSNRecord} NewRecord
        * @param {Number} CommonRevision Both this and NewRecord have one or more newer revisions.
        */
        GSNRecord.prototype.MergeConflict = function (BranchRecord, CommonRevision) {
            var MasterHistory = this.HistoryList[this.HistoryList.length - 1];
            var BranchHistory = null;
            for (var i = CommonRevision + 1; i < BranchRecord.HistoryList.length; i++) {
                BranchHistory = BranchRecord.HistoryList[i];
                this.HistoryList.push(BranchHistory);
            }

            var MergeDoc = new GSNDoc(this);
            MergeDoc.TopNode = MasterHistory.Doc.TopNode.Merge(BranchHistory.Doc.TopNode, CommonRevision);
            MergeDoc.DocHistory = this.NewHistory(BranchHistory.Author, BranchHistory.Role, null, "merge", MergeDoc);
        };

        /**
        * @method MergeAsFastFoward
        * @param {GSNRecord} NewRecord
        */
        GSNRecord.prototype.MergeAsFastFoward = function (NewRecord) {
            for (var i = this.HistoryList.length; i < NewRecord.HistoryList.length; i++) {
                var BranchDoc = NewRecord.GetHistoryDoc(i);
                if (BranchDoc != null) {
                    BranchDoc.Record = this;
                    this.HistoryList.push(BranchDoc.DocHistory);
                }
            }
        };

        /**
        * @method MergeAsReplaceTopGoal
        * @param {GSNRecord} NewRecord
        */
        GSNRecord.prototype.MergeAsReplaceTopGoal = function (NewRecord) {
            for (var i = 0; i < NewRecord.HistoryList.length; i++) {
                var NewHistory = NewRecord.HistoryList[i];
                var Doc = NewHistory != null ? NewHistory.Doc : null;
                if (Doc != null) {
                    this.OpenEditor(NewHistory.Author, NewHistory.Role, NewHistory.Date, NewHistory.Process);
                    this.EditingDoc.TopNode.ReplaceSubNode(Doc.TopNode, true);
                    this.CloseEditor();
                }
            }
        };

        /**
        * @method MergeAsIncrementalAddition
        * @param {Number} Rev1
        * @param {GSNRecord} Record1
        * @param {Number} Rev2
        * @param {GSNRecord} Record2
        */
        GSNRecord.prototype.MergeAsIncrementalAddition = function (Rev1, Record1, Rev2, Record2) {
            while (Rev1 < Record1.HistoryList.length && Rev2 < Record2.HistoryList.length) {
                var History1 = Record1.GetHistory(Rev1);
                var History2 = Record2.GetHistory(Rev2);
                if (History1 == null || History1.Doc == null) {
                    if (Rev1 < Record1.HistoryList.length) {
                        Rev1++;
                        continue;
                    }
                }
                if (History2 == null || History2.Doc == null) {
                    if (Rev2 < Record2.HistoryList.length) {
                        Rev2++;
                        continue;
                    }
                }
                if (History1.CompareDate(History2) < 0) {
                    this.OpenEditor(History1.Author, History1.Role, History1.Date, History1.Process);
                    Rev1++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History1.Doc.TopNode, true);
                    this.CloseEditor();
                } else {
                    this.OpenEditor(History2.Author, History2.Role, History2.Date, History2.Process);
                    Rev2++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History2.Doc.TopNode, true);
                    this.CloseEditor();
                }
            }
        };

        /**
        * @method GetLatestDoc
        * @return {GSNDoc}
        */
        GSNRecord.prototype.GetLatestDoc = function () {
            for (var i = this.HistoryList.length - 1; i >= 0; i++) {
                var Doc = this.GetHistoryDoc(i);
                if (Doc != null) {
                    return Doc;
                }
            }
            return null;
        };

        /**
        * @method Commit
        */
        GSNRecord.prototype.Commit = function (message) {
            this.GetLatestDoc().DocHistory.IsCommitRevision = true;
            this.GetLatestDoc().SetTagValue("CommitMessage", message);
        };

        /**
        * @method FormatRecord
        * @param {StringWriter} Writer
        */
        GSNRecord.prototype.FormatRecord = function (Writer) {
            var DocCount = 0;
            for (var i = this.HistoryList.length - 1; i >= 0; i--) {
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

        /**
        * @method Undo
        */
        GSNRecord.prototype.Undo = function () {
            /*
            * TODO
            * TO enable undo/redo, GSNRecord is needed to have the current revision.
            */
            return null;
        };

        /**
        * @method Redo
        */
        GSNRecord.prototype.Redo = function () {
            /*
            * TODO
            */
            return null;
        };
        return GSNRecord;
    })();
    AssureNote.GSNRecord = GSNRecord;

    

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

    var SimpleDateFormat = (function () {
        function SimpleDateFormat(format) {
            // Support format string, or is it needless?
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
        /* Methods */
        Lib.GetMD5 = function () {
            return new MessageDigest();
        };

        Lib.UpdateMD5 = function (md, text) {
            md.digestString = Lib.md5(text);
        };

        Lib.EqualsDigest = function (digest1, digest2) {
            return digest1 == digest2;
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
        Lib.Input = [];
        Lib.EmptyNodeList = new Array();
        Lib.LineFeed = "\n";
        Lib.VersionDelim = "*=====";
        return Lib;
    })();
    AssureNote.Lib = Lib;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNoteParser.js.map
