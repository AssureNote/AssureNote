var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
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
            this.Rev = Rev;
            this.Author = Author;
            this.Role = Role;
            this.Date = DateString;
            var Format = new SimpleDateFormat("yyyy-MM-dd84HH:mm:ssZ");
            if (DateString == null) {
                var d = new Date();
                this.Date = Format.format(d);
            } else {
                try  {
                    this.Date = Format.format(Format.parse(DateString));
                } catch (e) {
                    e.printStackTrace();
                }
            }
            this.Process = Process;
            this.Doc = Doc;
        }
        GSNHistory.prototype.toString = function () {
            return this.Date + ";" + this.Author + ";" + this.Role + ";" + this.Process;
        };

        GSNHistory.prototype.EqualsHistory = function (aHistory) {
            return (Lib.Object_equals(this.Date, aHistory.Date) && Lib.Object_equals(this.Author, aHistory.Author));
        };

        GSNHistory.prototype.CompareDate = function (aHistory) {
            return (Lib.String_compareTo(this.Date, aHistory.Date));
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
            /* Returns the row of the abel (e.g., 71). */
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
                    return GSNType.Goal;
                }
                if (ch == 83) {
                    return GSNType.Strategy;
                }
                if (ch == 69 || ch == 77 || ch == 65) {
                    return GSNType.Evidence;
                }
                if (ch == 67 || ch == 74 || ch == 82) {
                    return GSNType.Context;
                }
            }
            return GSNType.Undefined;
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
                case GSNType.Goal:
                    return "G";
                case GSNType.Context:
                    return "C";
                case GSNType.Strategy:
                    return "S";
                case GSNType.Evidence:
                    return "E";
                case GSNType.Undefined:
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
                        var HistoryTriple = new Array(2);
                        var RevText = LabelLine.substring(Loc + 1).trim();
                        var RevSet = RevText.split(":");
                        HistoryTriple[0] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[0], -1));
                        HistoryTriple[1] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[1], -1));
                        if (HistoryTriple[0] == null || HistoryTriple[1] == null) {
                            return null;
                        }
                        return HistoryTriple;
                    }
                } catch (e) {
                }
            }
            return null;
        };
        WikiSyntax.FormatRefKey = function (NodeType, HistoryTriple) {
            return WikiSyntax.FormatNodeType(NodeType) + HistoryTriple;
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

        TagUtils.FormatHistoryTag = function (HistoryList, Writer) {
            for (var i = 0; i < Lib.Array_size(HistoryList); i++) {
                var History = Lib.Array_get(HistoryList, i);
                if (History != null) {
                    Writer.println("#" + i + "::" + History);
                }
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
        function GSNNode(BaseDoc, ParentNode, NodeType, LabelName, UID, HistoryTriple) {
            this.BaseDoc = BaseDoc;
            this.ParentNode = ParentNode;
            this.NodeType = NodeType;
            this.LabelName = LabelName;
            this.AssignedLabelNumber = "";
            this.UID = UID;
            this.SectionCount = 0;
            this.SubNodeList = null;
            if (HistoryTriple != null) {
                this.Created = HistoryTriple[0];
                this.LastModified = HistoryTriple[1];
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
            return (this.NodeType == GSNType.Goal);
        };
        GSNNode.prototype.IsStrategy = function () {
            return (this.NodeType == GSNType.Strategy);
        };
        GSNNode.prototype.IsContext = function () {
            return (this.NodeType == GSNType.Context);
        };
        GSNNode.prototype.IsEvidence = function () {
            return (this.NodeType == GSNType.Evidence);
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

        GSNNode.prototype.GetHistoryTriple = function () {
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
            if (!Lib.EqualsDigest(OldDigest, this.Digest) && this.BaseDoc != null) {
                this.LastModified = this.BaseDoc.DocHistory;
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
            while (Node.NodeType != GSNType.Goal) {
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
            if (NodeType == GSNType.Strategy && Creation) {
                return new GSNNode(this.BaseDoc, this, GSNType.Strategy, this.LabelName, this.UID, null);
            }
            return null;
        };

        GSNNode.prototype.FormatNode = function (Writer) {
            Writer.print(WikiSyntax.FormatGoalLevel(this.GetGoalLevel() - 1));
            Writer.print(" ");
            if (this.LabelName != null) {
                Writer.print(this.LabelName);
            } else {
                Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
            }
            Writer.print(" &");
            Writer.print(Lib.DecToHex(this.UID));

            if (this.Created != null) {
                var HistoryTriple = this.GetHistoryTriple();
                Writer.print(" " + HistoryTriple);
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

        // SubNode
        GSNNode.prototype.FormatSubNode = function (GoalLevel, Writer) {
            Writer.print(WikiSyntax.FormatGoalLevel(GoalLevel));
            Writer.print(" ");
            if (this.LabelName != null) {
                Writer.print(this.LabelName);
            } else {
                Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
            }
            Writer.print(" &");
            Writer.print(Lib.DecToHex(this.UID));

            // Stream.append(" ");
            // MD5.FormatDigest(this.Digest, Stream);
            Writer.newline();
            if (this.NodeDoc != null && !Lib.Object_equals(this.NodeDoc, "")) {
                Writer.print(this.NodeDoc);
                Writer.newline();
            }
            Writer.newline();
            if (this.NonNullSubNodeList() != null) {
                for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                    var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                    if (Node.IsContext()) {
                        Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer);
                    }
                }
                for (var i = 0; i < Lib.Array_size(this.NonNullSubNodeList()); i++) {
                    var Node = Lib.Array_get(this.NonNullSubNodeList(), i);
                    if (!Node.IsContext()) {
                        Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer);
                    }
                }
            }
        };

        GSNNode.prototype.ReplaceSubNode = function (NewNode) {
            this.MergeSubNode(NewNode);
            if (this.ParentNode != null) {
                for (var i = 0; i < Lib.Array_size(this.ParentNode.SubNodeList); i++) {
                    if (Lib.Array_get(this.ParentNode.SubNodeList, i) == this) {
                        Lib.Array_set(this.ParentNode.SubNodeList, i, NewNode);
                    }
                }
            } else {
                (NewNode.IsGoal());
                this.BaseDoc.TopNode = NewNode;
            }
            return NewNode;
        };

        GSNNode.prototype.ReplaceSubNodeAsText = function (DocText) {
            var Reader = new StringReader(DocText);
            var Parser = new ParserContext(null);
            var NewNode = Parser.ParseNode(Reader, null);
            if (NewNode != null) {
                NewNode = this.ReplaceSubNode(NewNode);
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

        GSNNode.prototype.MergeSubNode = function (NewNode) {
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
                this.MergeSubNode(SubNode);
            }
        };

        // Merge
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

                    //NextCount = GoalNode.RenumberGoalRecursive(NextGoalCount, NextCount, LabelMap);
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
                var NewMap = new HashMap();
                var keyArray = TagMap.keySet();
                for (var i = 0; i < keyArray.length; i++) {
                    var Key = keyArray[i];
                    NewMap.put(Key, TagMap.get(Key));
                }
                return NewMap;
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
            if (Node.NodeType == GSNType.Goal) {
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
                    Lib.Array_add(this.HistoryList, null);
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
            var RefMap = new HashMap();
            var Reader = new StringReader(TextDoc);
            while (Reader.HasNext()) {
                var Doc = new GSNDoc(this);
                var Parser = new ParserContext(Doc);
                Doc.TopNode = Parser.ParseNode(Reader, RefMap);
                Doc.RenumberAll();
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
        };

        GSNRecord.prototype.CloseEditor = function () {
            this.EditingDoc = null;
        };

        GSNRecord.prototype.Merge = function (NewRecord) {
            var CommonHistory = -1;
            for (var Rev = 0; Rev < Lib.Array_size(this.HistoryList); Rev++) {
                var MasterHistory = this.GetHistory(Rev);
                var NewHistory = NewRecord.GetHistory(Rev);
                if (NewHistory != null && MasterHistory.EqualsHistory(MasterHistory)) {
                    CommonHistory = Rev;
                    continue;
                }
                break;
            }
            if (CommonHistory == -1) {
                this.MergeAsReplaceTopGoal(NewRecord);
            } else if (CommonHistory == Lib.Array_size(this.HistoryList) - 1) {
                this.MergeAsFastFoward(NewRecord);
            } else {
                //#Local#GSNRecord Record1 = this.DeepCopy();
                // MergeAsIncrementalAddition
            }
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
                    this.OpenEditor(NewHistory.Author, NewHistory.Role, NewHistory.Date, NewHistory.Process);
                    this.EditingDoc.TopNode.ReplaceSubNode(Doc.TopNode);
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
                    this.OpenEditor(History1.Author, History1.Role, History1.Date, History1.Process);
                    Rev1++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History1.Doc.TopNode);
                    this.CloseEditor();
                } else {
                    this.OpenEditor(History2.Author, History2.Role, History2.Date, History2.Process);
                    Rev2++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History2.Doc.TopNode);
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

        GSNRecord.prototype.FormatRecord = function (Writer) {
            var DocCount = 0;
            TagUtils.FormatHistoryTag(this.HistoryList, Writer);
            for (var i = 0; i < Lib.Array_size(this.HistoryList); i++) {
                var Doc = this.GetHistoryDoc(i);
                if (Doc != null) {
                    if (DocCount > 0) {
                        Writer.println(Lib.VersionDelim);
                    }
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
            var ParentNode = new GSNNode(NullableDoc, null, GSNType.Goal, null, -1, null);
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
                var ParentGoal = Lib.Array_get(this.GoalStack, Level - 1);
                if (ParentGoal != null) {
                    return ParentGoal.GetLastNode(GSNType.Strategy, true);
                }
            }
            return null;
        };

        //	GSNNode GetGoalStackAt(int Level) {
        //		if (Level - 1 < this.GoalStack.size()) {
        //			return this.GoalStack.get(Level-1);
        //		}
        //		return null;
        //	}
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
            if (NodeType == GSNType.Goal) {
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
            if (NodeType == GSNType.Context) {
                return true;
            }
            if (NodeType == GSNType.Evidence) {
                if (this.LastGoalNode == null || this.LastGoalNode.HasSubNode(GSNType.Strategy)) {
                    Reader.LogError("Evidence is only linked to Goal", Line);
                    return false;
                }
                return true;
            }
            if (NodeType == GSNType.Strategy) {
                if (this.LastGoalNode == null || this.LastGoalNode.HasSubNode(GSNType.Evidence)) {
                    Reader.LogError("Strategy is only linked to Goal", Line);
                    return false;
                }
                return true;
            }
            Reader.LogError("undefined element", Line);
            return false;
        };

        ParserContext.prototype.CreateNewNode = function (LabelLine, RefMap, Reader) {
            var NodeType = WikiSyntax.ParseNodeType(LabelLine);
            var LabelName = WikiSyntax.ParseLabelName(LabelLine);
            var LabelNumber = WikiSyntax.ParseLabelNumber(LabelLine);
            var UID = (WikiSyntax.ParseUID(LabelLine) == null) ? this.random.nextInt() : Lib.HexToDec(WikiSyntax.ParseUID(LabelLine));
            var RevisionHistory = WikiSyntax.ParseRevisionHistory(LabelLine);
            var RefNode = null;
            var NewNode = null;
            if (RefMap != null && LabelNumber != null && RevisionHistory != null) {
                var RefKey = WikiSyntax.FormatRefKey(NodeType, RevisionHistory);
                RefNode = RefMap.get(RefKey);
            }
            var ParentNode = null;
            var HistoryTriple = WikiSyntax.ParseHistory(LabelLine, this.NullableDoc);
            var Level = WikiSyntax.ParseGoalLevel(LabelLine);
            if (NodeType == GSNType.Goal) {
                ParentNode = this.GetStrategyOfGoal(Level);
            } else {
                ParentNode = (NodeType == GSNType.Context) ? this.LastNonContextNode : Lib.Array_get(this.GoalStack, Level);
                //			if(ParentNode.GoalLevel != Level) {
                //				Reader.LogError("mismatched level", Line);
                //			}
            }
            NewNode = new GSNNode(this.NullableDoc, ParentNode, NodeType, LabelName, UID, HistoryTriple);
            if (this.FirstNode == null) {
                this.FirstNode = NewNode;
            }
            this.SetLastNode(NewNode);
            if (this.NullableDoc != null) {
                this.NullableDoc.AddNode(NewNode);
            }
            if (RefMap != null && HistoryTriple != null) {
                var RefKey = WikiSyntax.FormatRefKey(NodeType, NewNode.GetHistoryTriple());
                RefMap.put(RefKey, NewNode);
            }
            if (RefNode != null) {
                NewNode.HasTag = RefNode.HasTag;
                NewNode.NodeDoc = RefNode.NodeDoc;
                NewNode.Digest = RefNode.Digest;
                return null;
            }
            return NewNode;
        };

        ParserContext.prototype.ParseNode = function (Reader, RefMap) {
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
                        LastNode = this.CreateNewNode(Line, RefMap, Reader);
                        continue;
                    }
                }
                Lib.Array_add(LineList, Line);
            }
            this.UpdateContent(LastNode, LineList);
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
                //MasterRecord.RenumberAll();
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
                //AssureNoteParser.merge(argv[0], argv[1]);
                var MasterRecord = new GSNRecord();
                MasterRecord.Parse(Lib.ReadFile(argv[0]));
                var NewNode = MasterRecord.GetLatestDoc().TopNode.ReplaceSubNodeAsText(Lib.ReadFile(argv[1]));
                var Writer = new StringWriter();
                NewNode.FormatNode(Writer);

                //MasterRecord.FormatRecord(Writer);
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

    /* FIXME this class is never used */
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
            /* '0' ~ '9' */
            return 48 <= c && c <= 57;
        };

        Character.isWhitespace = function (c) {
            /* '\t' '\n' '\f' '\r' ' ' */
            return c == 9 || c == 10 || c == 12 || c == 13 || c == 32;
            ;
        };
        return Character;
    })();
    AssureNote.Character = Character;

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
        function HashMap() {
            this.hash = {};
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
        Lib.GetMD5 = /* Methods */
        function () {
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
            return (self).constructor == klass;
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

    //export interface Array<T> {
    //        get(index: number): any;
    //        set(index: number, value: any): void;
    //        add(obj: any): void;
    //        add(index: number, obj : any): void;
    //        addAll(obj : any): void;
    //        size(): number;
    //        clear(): void;
    //        remove(index: number): any;
    //        remove(item: any): any;
    //        iterator(): Iterator<Array>;
    //}
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
            return (this).constructor == klass;
        }
    });

    //export interface String {
    //        compareTo(anotherString: string): number;
    //        startsWith(key: string): boolean;
    //        endsWith(key: string): boolean;
    //        lastIndexOf(ch: number) : number;
    //        indexOf(ch: number) : number;
    //        substring(BeginIdx : number, EndIdx : number) : string;
    //        matches(str : string) : boolean;
    //}
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

    /*
    * JavaScript MD5 1.0.1
    * https://github.com/blueimp/JavaScript-MD5
    *
    * Copyright 2011, Sebastian Tschan
    * https://blueimp.net
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    *
    * Based on
    * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    * Digest Algorithm, as defined in RFC 1321.
    * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
    * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    * Distributed under the BSD License
    * See http://pajhome.org.uk/crypt/md5 for more info.
    */
    /*jslint bitwise: true */
    /*global unescape, define */
    ((function ($) {
        'use strict';

        /*
        * Add integers, wrapping at 2^32. This uses 16-bit operations internally
        * to work around bugs in some JS interpreters.
        */
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /*
        * Bitwise rotate a 32-bit number to the left.
        */
        function bit_rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
        * These functions implement the four basic operations the algorithm uses.
        */
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

        /*
        * Calculate the MD5 of an array of little-endian words, and a bit length.
        */
        function binl_md5(x, len) {
            /* append padding */
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

        /*
        * Convert an array of little-endian words to a string
        */
        function binl2rstr(input) {
            var i, output = '';
            for (i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
            }
            return output;
        }

        /*
        * Convert a raw string to an array of little-endian words
        * Characters >255 have their high-byte silently ignored.
        */
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

        /*
        * Calculate the MD5 of a raw string
        */
        function rstr_md5(s) {
            return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
        }

        /*
        * Calculate the HMAC-MD5, of a key and some data (raw strings)
        */
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

        /*
        * Convert a raw string to a hex string
        */
        function rstr2hex(input) {
            var hex_tab = '0123456789abcdef', output = '', x, i;
            for (i = 0; i < input.length; i += 1) {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
            }
            return output;
        }

        /*
        * Encode a string as utf-8
        */
        function str2rstr_utf8(input) {
            return unescape(encodeURIComponent(input));
        }

        /*
        * Take string arguments and return either raw or hex encoded strings
        */
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
    })(Lib));
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNoteParser.js.map
