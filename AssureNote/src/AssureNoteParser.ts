
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

module AssureNote {
    export class StringWriter {
        private parts: string[] = [];
        constructor() {
        }
        print(s: string): void {
            this.parts.push(s);
        }
        println(s: string): void {
            this.print(s);
            this.newline();
        }
        newline(): void {
            this.print("\n");
        }

        /**
         * @method toString
         * @return {String}
         */
        public toString(): string {
            return this.parts.join("");
        }
    }

    export enum GSNType {
        Goal, Context, Strategy, Evidence, Undefined, Justification, Assumption, Exception, Contract
    }


    export class GSNHistory {
        Rev: number;
        Author: string;
        Role: string;
        Date: Date;
        Process: string;
        Doc: GSNDoc;
        IsCommitRevision: boolean;

        constructor(Rev: number, Author: string, Role: string, ModifiedDate: Date, Process: string, Doc: GSNDoc) {
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
        public toString(): string {
            return (new SimpleDateFormat("").format(this.Date)) + ";" + this.Author + ";" + this.Role + ";" + this.Process;
        }

        /**
         * @method Equals
         * @param {GSNHistory} aHistory
         * @return {Boolean}
         */
        public Equals(aHistory: GSNHistory): boolean {
            return this.Date == aHistory.Date && this.Author == aHistory.Author;
        }

        /**
         * @method CompareDate
         * @param {GSNHistory} aHistory
         * @return {Number}
         */
        public CompareDate(aHistory: GSNHistory): number {
            return this.Date.getTime() - aHistory.Date.getTime();
        }

        /**
         * @method UpdateHistory
         * @param {Number} Rev
         * @param {String} Author
         * @param {String} Role
         * @param {Date} ModifiedDate
         * @param {String} Process
         * @param {GSNDoc} Doc
         */
        public UpdateHistory(Rev: number, Author: string, Role: string, ModifiedDate: Date, Process: string, Doc: GSNDoc): void {
            this.Rev = Rev;
            this.Author = Author;
            this.Role = Role;
            this.Process = Process;
            this.Doc = Doc;
            this.Date = ModifiedDate;
        }

        /**
         * @method GetCommitMessage
         */
        public GetCommitMessage(): string {
            return this.Doc.GetTagValue("CommitMessage") || "";
        }
    }

    /**
     * @class WikiSyntax
     * @constructor
     */
    export class WikiSyntax {

        private static GoalLevelString = "";

        /**
         * @method FormatGoalLevel
         * @param {Number} GoalLevel
         * @return {String}
         */
        static FormatGoalLevel(GoalLevel: number): string {
            var N = WikiSyntax.GoalLevelString.length;
            if (N < GoalLevel) {
                return WikiSyntax.GoalLevelString = new Array(GoalLevel + 1).join("*");
            } else if (N == GoalLevel) {
                return WikiSyntax.GoalLevelString;
            }
            return WikiSyntax.GoalLevelString.substr(0, GoalLevel);
        }

        /**
         * @method FormatNodeType
         * @param {GSNType} NodeType
         * @return {String}
         */
        static FormatNodeType(NodeType: GSNType): string {
            switch (NodeType) {
                case GSNType.Goal:
                    return "G";
                case GSNType.Context:
                    return "C";
                case GSNType.Strategy:
                    return "S";
                case GSNType.Evidence:
                    return "E";
                case GSNType.Justification:
                    return "J";
                case GSNType.Assumption:
                    return "A";
                case GSNType.Exception:
                    return "X";
                case GSNType.Contract:
                    return "T";
                default:
                    break;
            }
            return "U";
        }

        /**
         * @method CommentOutAll
         * @param {String} DocText
         * @return {String}
         */
        public static CommentOutAll(DocText: string): string {
            return DocText.replace(/^/mg, "# ")
        }
        
        /**
         * @method CommentOutSubNode
         * @static
         * @param {String} DocText
         * @return {String}
         */
        public static CommentOutSubNode(DocText: string): string {
            DocText.match(/^\*/m);
            var beforeFirstNode = (<any>RegExp).leftContext + RegExp.lastMatch;
            if ((<any>RegExp).rightContext.match(/^\*/m)) {
                var beforeSecondNode = beforeFirstNode + (<any>RegExp).leftContext;
                return beforeSecondNode + this.CommentOutAll(RegExp.lastMatch + (<any>RegExp).rightContext);
            }
            return DocText;
        }

        /**
         * @method FormatDateString
         * @static
         * @param {String} DateString
         * @return {String}
         */
        public static FormatDateString(DateString: string): string {
            var Format: SimpleDateFormat = new SimpleDateFormat("yyyy-MM-dd84HH:mm:ssZ");
            if (DateString != null) {
                try {
                    return Format.format(Format.parse(DateString));
                } catch (e) {
                    e.printStackTrace();
                }
            }
            var d: Date = new Date();
            return Format.format(d);
        }
    }

    /**
     * @class TagUtils
     * @static
     *
     */
    export class TagUtils {

        /**
         * @method FormatTag
         * @static
         * @param {Object} TagMap
         * @param {StringWriter} Writer
         */
        static FormatTag(TagMap: { [index: string]: string }, Writer: StringWriter): void {
            if (TagMap != null) {
                for(var Key in TagMap){
                    Writer.println(Key + ":: " + TagMap[Key]);
                }
            }
        }

        /**
         * @method FormatHistoryTag
         * @param {Array<GSNHistory>} HistoryList
         * @param {Number} i
         * @param {StringWriter} Writer
         */
        static FormatHistoryTag(HistoryList: GSNHistory[], i: number, Writer: StringWriter): void {
            var History: GSNHistory = HistoryList[i];
            if (History != null) {
                Writer.println("#" + i + "::" + History);
            }
        }

        /**
         * @method GetString
         * @param {Object} TagMap
         * @param {String} Key
         * @param {String} DefValue
         * @return {String}
         */
        static GetString(TagMap: { [index: string]: string }, Key: string, DefValue: string): string {
            if (TagMap != null) {
                var Value: string = TagMap[Key];
                if (Value != null) {
                    return Value;
                }
            }
            return DefValue;
        }

        /**
         * @method GetInteger
         * @param {Object} TagMap
         * @param {String} Key
         * @param {Number} DefValue
         * @return
         */
        static GetInteger(TagMap: { [index: string]: string }, Key: string, DefValue: number): number {
            if (TagMap != null && TagMap[Key] != null) {
                return parseInt(TagMap[Key]);
            }
            return DefValue;
        }
    }

    interface BodyFlags {
        HasTagDefinition: boolean;
        HasTagReference: boolean;
        HasNodeReference: boolean;
    };

    class TreeParser {
        private Index: number = 0; /// Index for current looking node
        private TopNode: GSNNode = null;
        constructor(private BaseDoc: GSNDoc, private Nodes: WGSNParser.Node[]) {
        }

        private ConvertBody(Body: WGSNParser.NodeLinePart[][], Flags: BodyFlags, Tags: { [index: string]: string }): string {
            if (Body == null) {
                return "";
            }
            return Body.map((line) => {
                if (line == null) {
                    return "";
                }
                return line.map((part) => {
                    switch(part.type){
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
        }

        private ConvertNode(Parent: GSNNode, Node: WGSNParser.Node): GSNNode {
            var NodeTypeSymbol = Node.type == "Exception" ? "X" : Node.type.charAt(0);
            var Revision = Node.revision ? [Node.revision.created, Node.revision.modified] : [0, 0];
            var History = Revision.map(rev => this.BaseDoc.Record.GetHistory(rev));
            var Flags: BodyFlags = { HasNodeReference: false, HasTagReference: false, HasTagDefinition: false };
            var Tags: { [index: string]: string } = {};
            var UID = Node.key ? parseInt(Node.key, 16) : AssureNoteUtils.GenerateUID();

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
        }

        private PrevNode: GSNNode;

        private ParseTree(Parent: GSNNode): GSNNode {
            var TopNode = this.Nodes[this.Index++];
            var TopGSNNode = this.ConvertNode(Parent, TopNode);
            this.PrevNode = TopGSNNode;
            while (this.Index < this.Nodes.length) {
                var Node = this.Nodes[this.Index];
                if (!GSNNode.IsCollectRelation(TopGSNNode.NodeType, TopNode.depth, GSNType[Node.type], Node.depth)) {
                    var NextNode = this.Nodes[this.Index + 1];
                    if (Parent == null || NextNode
                        && GSNNode.IsCollectRelation(TopGSNNode.NodeType, TopNode.depth, GSNType[NextNode.type], NextNode.depth)
                        && !GSNNode.IsCollectRelation(GSNType[Node.type], Node.depth, GSNType[NextNode.type], NextNode.depth)) {
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
        }

        Parse(): GSNNode {
            if (this.TopNode == null) {
                this.Index = 0;
                this.TopNode = this.ParseTree(null);
            }
            if (this.Index < this.Nodes.length) {
                throw new Error("WGSNSyntaxError");
            }
            return this.TopNode;
        }
        static Parse(BaseDoc: GSNDoc, Nodes: WGSNParser.Node[]): GSNNode {
            return new TreeParser(BaseDoc, Nodes).Parse();
        }
    }

    export class Parser {

        private static InvokePegJSParser(Source: string): WGSNParser.ParseResult {
            while (true) {
                try {
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
        }

        static ParseTree(BaseDoc: GSNDoc, Source: string): GSNNode {
            var ParseResult = Parser.InvokePegJSParser(Source);
            var Nodes = ParseResult.revisions[0].nodes;
            return new TreeParser(BaseDoc, Nodes).Parse();
        }

        /**
         * @method ParseRecord
         * @param {String} TextDoc
         */
        static ParseRecord(TextDoc: string): GSNRecord {
            var Record = new GSNRecord();
            var ParseResult = Parser.InvokePegJSParser(TextDoc.replace(/^\s+/mg, ""));

            ParseResult.revisions.forEach((revision) => {
                var Doc: GSNDoc = new GSNDoc(Record);
                if (revision.header) {
                    Doc.SetTagValue("Author", revision.header.user);
                    Doc.SetTagValue("Revision", revision.header.revision.toString());
                    Doc.SetTagValue("Date", revision.header.modified.toISOString());
                    Doc.SetTagValue("CommitMessage", revision.header.tags["CommitMessage"]);
                }
                Doc.UpdateDocHeader();
                Doc.TopNode = new TreeParser(Doc, revision.nodes).Parse(); 
                Doc.RemapNodeMap();
                Doc.RenumberAll();
            });
            Record.HistoryList.forEach((History) => {
                if (History.Doc.GetTagValue("CommitMessage") == null) {
                    History.IsCommitRevision = false;
                }
            });

            return Record;
        }
    }


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
    export class GSNNode {
        BaseDoc: GSNDoc;
        ParentNode: GSNNode;
        SubNodeList: GSNNode[];
        NodeType: GSNType;
        LabelName: string;   /* e.g, G:TopGoal */
        AssignedLabelNumber: string; /* This field is used only if LabelNumber is null */
        SectionCount: number;
        HasTagOrLabelReference: boolean;

        Created: GSNHistory;
        LastModified: GSNHistory;

        NodeDoc: string;
        HasTag: boolean;
        Digest: string;
        TagMap: { [index: string]: string };

        UID: number; /* Unique ID */

        constructor(BaseDoc: GSNDoc, ParentNode: GSNNode, NodeType: GSNType, LabelName: string, UID: number, HistoryTaple: GSNHistory[]) {
            this.BaseDoc = BaseDoc;
            this.ParentNode = ParentNode;
            this.NodeType = NodeType;
            this.LabelName = LabelName;      // G:TopGoal
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
                }
                else {
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

        toString(): string {
            var Writer = new StringWriter();
            this.FormatNode(Writer);
            return Writer.toString();
        }

        DeepCopy(BaseDoc: GSNDoc, ParentNode: GSNNode): GSNNode {
            var NewNode: GSNNode = new GSNNode(BaseDoc, ParentNode, this.NodeType, this.LabelName, this.UID, null);
            NewNode.Created = this.Created;
            NewNode.LastModified = this.LastModified;
            NewNode.Digest = this.Digest;
            NewNode.NodeDoc = this.NodeDoc;
            NewNode.HasTag = this.HasTag;
            NewNode.HasTagOrLabelReference = this.HasTagOrLabelReference;
            if (BaseDoc != null) {
                BaseDoc.AddNodeWithoutCheck(NewNode);
            }
            this.NonNullSubNodeList().forEach((Node) => {
                Node.DeepCopy(BaseDoc, NewNode);
            });
            return NewNode;
        }

        /**
         * @method IsGoal
         * @return {Boolean}
         */
        public IsGoal(): boolean {
            return (this.NodeType == GSNType.Goal);
        }

        /**
         * @method IsStrategy
         * @return {Boolean}
         */
        public IsStrategy(): boolean {
            return (this.NodeType == GSNType.Strategy);
        }

        /**
         * @method IsContext
         * @return {Boolean}
         */
        public IsContext(): boolean {
            return (this.NodeType == GSNType.Context);
        }

        /**
         * @method IsEvidence
         * @return {Boolean}
         */
        public IsEvidence(): boolean {
            return (this.NodeType == GSNType.Evidence);
        }

        /**
         * @method IsTypeContextLike
         * @return {Boolean}
         */
        public static IsTypeContextLike(Type: GSNType): boolean {
            return Type == GSNType.Context || Type == GSNType.Assumption || Type == GSNType.Justification || Type == GSNType.Exception;
        }

        /**
         * @method IsContextLike
         * @return {Boolean}
         */
        public IsContextLike(): boolean {
            return GSNNode.IsTypeContextLike(this.NodeType);
        }

        public static IsCollectRelation(ParentType: GSNType, ParentDepth: number, ChildType: GSNType, ChildDepth: number): boolean {
            if (ChildDepth == ParentDepth) {
                if (ChildType == GSNType.Goal) {
                    return false;
                }
                if (ParentType != GSNType.Goal && (ChildType == GSNType.Evidence || ChildType == GSNType.Strategy)) {
                    return false;
                }
                if ((ParentType == GSNType.Evidence || ParentType == GSNType.Strategy) && !GSNNode.IsTypeContextLike(ChildType)) {
                    return false;
                }
                if (GSNNode.IsTypeContextLike(ParentType)) {
                    return false;
                }
                return true;
            }
            if (ParentDepth + 1 == ChildDepth) {
                return ParentType == GSNType.Strategy && ChildType == GSNType.Goal;
            }
            return false;
        }

        /**
         * @method NonNullSubNodeList
         * @return {Array<GSNNode>}
         */
        NonNullSubNodeList(): GSNNode[] {
            return this.SubNodeList == null ? Lib.EmptyNodeList : this.SubNodeList;
        }

        /**
         * @method Remap
         * @param {Object} NodeMap
         */
        public Remap(NodeMap: { [index: number]: GSNNode }): void {
            NodeMap[this.UID] = this;
            var List = this.NonNullSubNodeList();
            for (var i: number = 0; i < List.length; i++) {
                var Node: GSNNode = List[i];
                Node.Remap(NodeMap);
            }
        }

        /**
         * @method GetGoalLevel
         * @return {Number}
         */
        public GetGoalLevel(): number {
            var GoalCount: number = this.IsGoal() ? 1 : 0;
            var Node: GSNNode = this.ParentNode;
            while (Node != null) {
                if (Node.IsGoal()) {
                    GoalCount += 1;
                }
                Node = Node.ParentNode;
            }
            return GoalCount;
        }

        /**
         * @method GetLabel
         * @return {String}
         */
        GetLabel(): string {
            return WikiSyntax.FormatNodeType(this.NodeType) + this.GetLabelNumber();
        }

        /**
         * @method @GetHistoryTaple
         * @return {String}
         */
        GetHistoryTaple(): string {
            return "#" + this.Created.Rev + ":" + this.LastModified.Rev;
        }

        /**
         * @method GetLabelNumber
         * @return
         */
        GetLabelNumber(): string {
            return this.AssignedLabelNumber;
        }

        /**
         * @method IsModified
         * @return {Boolean}
         */
        IsModified(): boolean {
            return this.LastModified == this.BaseDoc.DocHistory;
        }

        /**
         * @method SetContent
         * @param {Array<String>} LineList
         */
        SetContent(LineList: string[]): void {
            var OldDigest: string = this.Digest;
            var LineCount: number = 0;
            var Writer: StringWriter = new StringWriter();
            var md: MessageDigest = Lib.GetMD5();
            for (var i: number = 0; i < LineList.length; i++) {
                var Line: string = LineList[i];
                var Loc: number = Line.indexOf("::");
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
        }

        /**
         * @method UpdateContent
         * @param {String} TextDoc
         */
        UpdateContent(TextDoc: string): void {
            TextDoc.match(/^.*/m)
            var Lines: string[] = (<any>RegExp).leftContext.match(/^.*$/mg);
            this.SetContent(Lines);
        }

        /**
         * GetNodeHistoryList
         * @return {Array<GSNHistory>}
         */
        GetNodeHistoryList(): GSNHistory[] {
            var Revisions: GSNHistory[] = this.BaseDoc.Record.HistoryList;
            var PrevRev = this.Created.Rev;
            var LastRev = this.LastModified.Rev;
            var HistoryList = [this.Created];

            for (var rev: number = this.Created.Rev + 1; rev <= LastRev && rev < Revisions.length; rev++) {
                var FormarNodeModel = Revisions[rev].Doc.GetNode(this.UID);
                var FormarHistory = FormarNodeModel ? FormarNodeModel.LastModified : null;

                if (FormarHistory && FormarHistory.Rev != PrevRev) {
                    HistoryList.push(FormarHistory);
                    PrevRev = FormarHistory.Rev;
                }
            }

            return HistoryList;
        }

        /**
         * @method AppendSubNode
         * @private
         * @param {GSNNode} Node
         */
        AppendSubNode(Node: GSNNode): void {
            if (this.SubNodeList == null) {
                this.SubNodeList = [Node];
            } else {
                this.SubNodeList.push(Node);
            }
        }

        /**
         * @method HasSubNode
         * @param {GSNType} NodeType
         * @return {Boolean}
         */
        HasSubNode(NodeType: GSNType): boolean {
            var SubNodes = this.NonNullSubNodeList();
            for (var i: number = 0; i < SubNodes.length; i++) {
                var Node: GSNNode = SubNodes[i];
                if (Node.NodeType == NodeType) {
                    return true;
                }
            }
            return false;
        }

        /**
         * @method GetUpperNearestGoal
         * @return {GSNNode}
         */
        GetUpperNearestGoal(): GSNNode {
            var Node: GSNNode = this;
            while (Node.NodeType != GSNType.Goal) {
                Node = Node.ParentNode;
            }
            return Node;
        }

        /**
         * @method GetTagMap
         * @return {Object}
         */
        GetTagMap(): { [index: string]: string } {
            if (this.TagMap == null && this.HasTag) {
                this.TagMap = {};
            }
            return this.TagMap;
        }

        /**
         * @method MergeTagMap
         * @param {Object} BaseMap
         * @param {Object} NewMap
         * @return {Object}
         */
        MergeTagMap(BaseMap: { [index: string]: string }, NewMap: { [index: string]: string }): { [index: string]: string } {
            if (BaseMap == null) return NewMap;
            if (NewMap == null) return BaseMap;

            var Result: { [index: string]: string } = {};
            //for (var key in BaseMap) {
            //    Result[key] = BaseMap[key];
            //}
            (<any>Result).__proto__ = BaseMap;
            for (var key in NewMap) {
                Result[key] = NewMap[key];
            }
            return Result;
        }

        /**
         * @method  GetTagMapWithLexicalScope
         * @return {Object}
         */
        GetTagMapWithLexicalScope(): { [index: string]: string } {
            var Result: { [index: string]: string } = null;
            if (this.ParentNode != null) {
                Result = this.MergeTagMap(this.ParentNode.GetTagMapWithLexicalScope(), this.GetTagMap());
            } else {
                Result = this.GetTagMap();
            }
            if (this.SubNodeList != null) {
                for (var i: number = 0; i < this.SubNodeList.length; i++) {
                    var Node: GSNNode = this.SubNodeList[i];
                    if (Node.IsContext()) {
                        Result = this.MergeTagMap(Result, Node.GetTagMap());
                    }
                }
            }
            return Result;
        }

        /**
         * @method GetLastNode
         * @param {GSNType} NodeType
         * @param {Boolean} Creation
         * @return {GSNNode}
         */
        GetLastNode(NodeType: GSNType, Creation: boolean): GSNNode {
            if (this.SubNodeList != null) {
                for (var i: number = this.SubNodeList.length - 1; i >= 0; i--) {
                    var Node: GSNNode = this.SubNodeList[i];
                    if (Node.NodeType == NodeType) {
                        return Node;
                    }
                }
            }
            if (NodeType == GSNType.Strategy && Creation) {
                return new GSNNode(this.BaseDoc, this, GSNType.Strategy, this.LabelName, this.UID, null);
            }
            return null;
        }

        /**
         * @method FormatNode
         * Stringfy subtree for saving WGSN file.
         * @param {StringWriter} Writer
         */
        FormatNode(Writer: StringWriter): void {
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
                var HistoryTaple: string = this.GetHistoryTaple();
                Writer.print(" " + HistoryTaple);
            }
            Writer.newline();
            if (this.NodeDoc != null && this.NodeDoc.length != 0) {
                Writer.print(this.NodeDoc);
                Writer.newline();
            }
            Writer.newline();
            for (var i: number = 0; i < this.NonNullSubNodeList().length; i++) {
                var Node: GSNNode = this.NonNullSubNodeList()[i];
                if (Node.IsContext()) {
                    Node.FormatNode(Writer);
                }
            }
            for (var i: number = 0; i < this.NonNullSubNodeList().length; i++) {
                var Node: GSNNode = this.NonNullSubNodeList()[i];
                if (!Node.IsContext()) {
                    Node.FormatNode(Writer);
                }
            }
        }

        /**
         * @method FormatSubNode
         * Stringfy subtree for editing.
         * @param {Number} GoalLevel
         * @param {StringWriter} Writer
         * @param {Boolean} IsRecursive
         */
        FormatSubNode(GoalLevel: number, Writer: StringWriter, IsRecursive: boolean): void {
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
            if (!IsRecursive) return;
            Writer.newline();
            this.NonNullSubNodeList().forEach((Node) => {
                if (Node.IsContext()) {
                    Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer, IsRecursive);
                }
            });
            this.NonNullSubNodeList().forEach((Node) => {
                if (!Node.IsContext()) {
                    Node.FormatSubNode(Node.IsGoal() ? GoalLevel + 1 : GoalLevel, Writer, IsRecursive);
                }
            });
        }

        /**
         * @method ReplaceSubNode
         * Replace this subtree with given tree.
         * @param {GSNNode} NewNode The tree with which replace this subtree.
         * @param {Boolean} IsRecursive If true is given, replace all nodes under this node. Otherwise, replace only this node.
         * @param {Boolean} IsAppendOnly If true is given, append newly appeared nodes but do not remove disappeared nodes.
         * @return {GSNNode}
         */
        ReplaceSubNode(NewNode: GSNNode, IsRecursive?: boolean, IsAppendOnly?: boolean): GSNNode {
            this.MergeDocHistory(NewNode);
            if (this.ParentNode != null) {
                for (var i: number = 0; i < this.ParentNode.SubNodeList.length; i++) {
                    if (this.ParentNode.SubNodeList[i] == this) {
                        this.ParentNode.SubNodeList[i] = NewNode;
                        NewNode.ParentNode = this.ParentNode;
                        break;
                    }
                }
            }
            else {
                this.BaseDoc.TopNode = NewNode;
            }
            if (!IsRecursive) {
                NewNode.SubNodeList = this.SubNodeList;
                NewNode.SubNodeList.forEach(Node => Node.ParentNode = NewNode);
            }
            if (IsAppendOnly && this.SubNodeList) {
                if (NewNode.SubNodeList) {
                    NewNode.SubNodeList.forEach(Node => {
                        if (Node) {
                            Node.ParentNode = NewNode;
                            this.SubNodeList.push(Node);
                        }
                    });
                }
                NewNode.SubNodeList = this.SubNodeList;
            }
            return NewNode;
        }

        /**
         * @method ReplaceSubNodeWithText
         * Replace this subtree with given tree.
         * @param {String} DocText The tree in WGSN format with which replace this subtree.
         * @param {Boolean} IsRecursive If true is given, replace all nodes under this node. Otherwise, replace only this node.
         * @param {Boolean} IsAppendOnly If true is given, append newly appeared nodes but do not remove disappeared nodes.
         * @return {GSNNode}
         */
        ReplaceSubNodeWithText(DocText: string, IsRecursive?: boolean, IsAppendOnly? : boolean): GSNNode {
            if (!IsRecursive) {
                DocText = WikiSyntax.CommentOutSubNode(DocText);
            }

            var NewNode: GSNNode = Parser.ParseTree(this.BaseDoc, DocText);
            if (NewNode.NodeType != this.NodeType) {
                var Writer: StringWriter = new StringWriter();
                NewNode.FormatNode(Writer);
                this.NodeDoc = WikiSyntax.CommentOutAll(Writer.toString());
                NewNode = this;
            }
            if (NewNode != null) {
                NewNode = this.ReplaceSubNode(NewNode, IsRecursive, IsAppendOnly);
            }
            return NewNode;
        }

        /**
         * @method HasSubNodeUID
         * @param {Number} UID
         * @return {Boolean}
         */
        HasSubNodeUID(UID: number): boolean {
            if (UID == this.UID) {
                return true;
            }
            for (var i: number = 0; i < this.NonNullSubNodeList().length; i++) {
                var SubNode: GSNNode = this.NonNullSubNodeList()[i];
                if (SubNode.HasSubNodeUID(UID)) return true;
            }
            return false;
        }

        /**
         * We have to assume that node-level conflict never happen.
         * @method Merge
         * @param {GSNNode} NewNode
         */
        Merge(NewNode: GSNNode, CommonRevision: number): GSNNode {
            if (NewNode.LastModified.Rev > CommonRevision) {
                this.ReplaceSubNode(NewNode, true);
                return this;
            }

            for (var i: number = 0, j = 0; NewNode.SubNodeList != null && i < NewNode.SubNodeList.length; i++) {
                var SubNewNode: GSNNode = NewNode.SubNodeList[i];
                for (; this.SubNodeList != null && j < this.SubNodeList.length; j++) {
                    var SubMasterNode: GSNNode = this.SubNodeList[j];
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
        }

        /**
         * Update GSNNode.(Created/LastModified)
         * @method MergeDocHistory
         * @param {GSNNode} NewNode
         */
        MergeDocHistory(NewNode: GSNNode): void {
            (this.BaseDoc != null);
            NewNode.LastModified = null; // this.BaseDoc has Last
            var UID: number = NewNode.UID;
            var OldNode: GSNNode = this.BaseDoc.GetNode(UID);
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
            for (var i: number = 0; i < NewNode.NonNullSubNodeList().length; i++) {
                var SubNode: GSNNode = NewNode.NonNullSubNodeList()[i];
                this.MergeDocHistory(SubNode);
            }
        }

        /**
         * @method IsNewerTree
         * @param {Number} ModifiedRev
         * @return {Boolean}
         */
        // Merge
        IsNewerTree(ModifiedRev: number): boolean {
            if (ModifiedRev <= this.LastModified.Rev) {
                for (var i: number = 0; i < this.NonNullSubNodeList().length; i++) {
                    var Node: GSNNode = this.NonNullSubNodeList()[i];
                    if (!Node.IsNewerTree(ModifiedRev)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }

        /**
         * @method ListSubGoalNode
         * @param {Array<GSNNode>} BufferList
         */
        private ListSubGoalNode(BufferList: GSNNode[]): void {
            this.NonNullSubNodeList().forEach((Node) => {
                if (Node.IsGoal()) {
                    BufferList.push(Node);
                }
                if (Node.IsStrategy()) {
                    Node.ListSubGoalNode(BufferList);
                }
            });
        }

        /**
         * @method ListSectionNode
         * @param {Array<GSNNode>} BufferList
         */
        private ListSectionNode(BufferList: GSNNode[]): void {
            this.NonNullSubNodeList().forEach((Node) => {
                if (!Node.IsGoal()) {
                    BufferList.push(Node);
                }
                if (Node.IsStrategy() || Node.IsEvidence()) {
                    Node.ListSectionNode(BufferList);
                }
            });
        }

        /**
         * @method RenumberGoalRecursive
         * @param {Number} GoalCount
         * @param {Number} NextGoalCount
         * @param {Object} LabelMap
         */
        private RenumberGoalRecursive(GoalCount: number, NextGoalCount: number, LabelMap: { [index: string]: string }): void {
            var queue: GSNNode[] = [this];
            var CurrentNode: GSNNode;
            while ((CurrentNode = queue.shift()) != null) {
                while (LabelMap[GoalCount.toString()] != null) {
                    GoalCount++;
                }
                CurrentNode.AssignedLabelNumber = GoalCount.toString();
                GoalCount++;
                var BufferList: GSNNode[] = [];
                CurrentNode.ListSectionNode(BufferList);
                var SectionCount: number = 1;
                for (var i: number = 0; i < BufferList.length; i++, SectionCount += 1) {
                    var SectionNode: GSNNode = BufferList[i];
                    var LabelNumber: string = CurrentNode.GetLabelNumber() + "." + SectionCount;
                    if (LabelMap[LabelNumber] != null) continue;
                    SectionNode.AssignedLabelNumber = LabelNumber;
                }
                BufferList = [];
                CurrentNode.ListSubGoalNode(BufferList);
                Array.prototype.push.apply(queue, BufferList);
                NextGoalCount += BufferList.length;
            }
        }

        /**
         * @method RenumberGoal
         * @param {Number} GoalCount
         * @param {Number} NextGoalCount
         */
        RenumberGoal(GoalCount: number, NextGoalCount: number): void {
            this.RenumberGoalRecursive(GoalCount, NextGoalCount, {});
        }

        /**
         * @method SearchNode
         * @param {String} SearchWord
         * @return {Array<GSNNode>}
         */
        SearchNode(SearchWord: string): Array<GSNNode> {
            var NodeList: Array<GSNNode> = [];
            if (this.NodeDoc.indexOf(SearchWord) >= 0) {
                NodeList.push(this);
            }
            this.NonNullSubNodeList().forEach((Node) => {
                Array.prototype.push.apply(NodeList, Node.SearchNode(SearchWord));
            });
            return NodeList;
        }

        /**
         * @method GetNodeCount
         * @return {Number}
         */
        GetNodeCount(): number {
            var res: number = 1;
            this.NonNullSubNodeList().forEach((Node) => {
                res += Node.GetNodeCount();
            });
            return res;
        }

        GetNodeCountTypeOf(type: GSNType): number {
            var res: number = this.NodeType == type ? 1 : 0;
            this.NonNullSubNodeList().forEach((Node) => {
                res += Node.GetNodeCountTypeOf(type);
            });
            return res;
        }

        /**
         * @method GetNodeCountForEachType
         * @return A map from GSNType to count 
         */
        GetNodeCountForEachType(map?: { [index: number]: number }): { [index: number]: number } {
            if (!map) {
                map = {};
                map[GSNType.Assumption] = 0;
                map[GSNType.Context] = 0;
                map[GSNType.Contract] = 0;
                map[GSNType.Evidence] = 0;
                map[GSNType.Exception] = 0;
                map[GSNType.Goal] = 0;
                map[GSNType.Justification] = 0;
                map[GSNType.Strategy] = 0;
                map[GSNType.Undefined] = 0;
            }
            ++map[this.NodeType];
            this.NonNullSubNodeList().forEach((Node) => {
                Node.GetNodeCountForEachType(map);
            });
            return map;
        }

    }

    /**
     * @class GSNDoc
     * @constructor
     * @param {GSNRecord} Record
     */
    export class GSNDoc {
        Record: GSNRecord;
        TopNode: GSNNode = null;
        private NodeMap: { [index: number]: GSNNode } = {};
        private DocTagMap: { [index: string]: string } = {};
        DocHistory: GSNHistory = null;
        GoalCount: number = 0;

        constructor(Record: GSNRecord) {
            this.Record = Record;
        }

        GetTagValue(Key: string): string {
            return this.DocTagMap[Key];
        }

        SetTagValue(Key: string, Value: string) {
            this.DocTagMap[Key] = Value;
        }

        ForEachNode(Action: (GSNNode) => void): void {
            if (Action) {
                for (var key in this.NodeMap) {
                    Action(this.NodeMap[key]);
                }
            }
        }  

        /**
         * @method DeepCopy
         * @param {String} Author
         * @param {String} Role
         * @param {String} Date
         * @param {String} Process
         * @return {GSNDoc}
         */
        DeepCopy(Author: string, Role: string, ModefiedDate: Date, Process: string): GSNDoc {
            var NewDoc: GSNDoc = new GSNDoc(this.Record);
            NewDoc.GoalCount = this.GoalCount;
            NewDoc.DocHistory = this.Record.NewHistory(Author, Role, ModefiedDate, Process, NewDoc);
            NewDoc.DocTagMap = this.CloneTagMap(this.DocTagMap);
            if (this.TopNode != null) {
                NewDoc.TopNode = this.TopNode.DeepCopy(NewDoc, null);
            }
            return NewDoc;
        }

        /**
         * @method CloneTagMap
         * @param {Object} TagMap
         * @return {Object}
         */
        CloneTagMap(TagMap: { [index: string]: string }): { [index: string]: string } {
            if (TagMap != null) {
                var NewMap: { [index: string]: string } = {};
                for (var key in TagMap) {
                    NewMap[key] = TagMap[key];
                }
                return NewMap;
            }
            return null;
        }

        /**
         * @method UpdateDocHeader
         * @param {StringReader} Reader
         */
        UpdateDocHeader(): void {
            var Revision: number = TagUtils.GetInteger(this.DocTagMap, "Revision", -1);
            if (Revision != -1) {
                this.DocHistory = this.Record.GetHistory(Revision);
                if (this.DocHistory != null) {
                    this.DocHistory.Doc = this;
                }
            }
            if (this.DocHistory == null) {
                var Author: string = TagUtils.GetString(this.DocTagMap, "Author", "unknown");
                var Role: string = TagUtils.GetString(this.DocTagMap, "Role", "converter");
                var ModefiedDate: Date = new Date(TagUtils.GetString(this.DocTagMap, "Date", null));
                var Process: string = TagUtils.GetString(this.DocTagMap, "Process", "-");
                this.DocHistory = this.Record.NewHistory(Author, Role, ModefiedDate, Process, this);
            }
        }

        /**
         * @method GetNode
         * @param {Number} UID
         * @return {GSNNode}
         */
        public GetNode(UID: number): GSNNode {
            return this.NodeMap[UID];
        }

        /**
         * @method UncheckAddNode
         * @param {GSNNode} Node
         */
        AddNodeWithoutCheck(Node: GSNNode): void {
            this.NodeMap[Node.UID] = Node;
        }

        /**
         * @method AddNode
         * @param {GSNNode} Node
         */
        AddNode(Node: GSNNode): void {
            var Key: number = Node.UID;
            var OldNode: GSNNode = this.NodeMap[Key];
            if (OldNode != null) {
                if (OldNode.Digest == Node.Digest) {
                    Node.Created = OldNode.Created;
                }
            }
            this.NodeMap[Key] = Node;
            if (Node.NodeType == GSNType.Goal) {
                if (Node.GetGoalLevel() == 1) {
                    this.TopNode = Node;
                }
            }
        }

        /**
         * @method RemapNodeMap
         */
        RemapNodeMap(): void {
            var NodeMap: { [index: number]: GSNNode } = {};
            if (this.TopNode != null) {
                this.TopNode.Remap(NodeMap);
            }
            this.NodeMap = NodeMap;
        }

        /**
         * @method RemoveNode
         * @param Node
         */
        RemoveNode(Node: GSNNode): void {
            (this == Node.BaseDoc);
            if (Node.ParentNode != null) {
                var index = Node.ParentNode.SubNodeList.indexOf(Node);
                Node.ParentNode.SubNodeList.splice(index, 1);
            }
            this.RemapNodeMap();
        }

        /**
         * @method FormatDoc
         * @param {StringWriter} Stream
         */
        FormatDoc(Stream: StringWriter): void {
            if (this.TopNode != null) {
                /* FIXME Format DocTagMap */
                Stream.println("Revision:: " + this.DocHistory.Rev);
                if (TagUtils.GetString(this.DocTagMap, "CommitMessage", null) != null) {
                    Stream.println("CommitMessage:: " + TagUtils.GetString(this.DocTagMap, "CommitMessage", null));
                }
                this.TopNode.FormatNode(Stream);
            }
        }

        /**
         * @method GetLabelMap
         * @return {Object}
         */
        GetLabelMap(): { [index: string]: string } {
            var LabelMap: { [index: string]: string } = {};
            var CurrentNode: GSNNode;
            var queue: GSNNode[] = [this.TopNode];
            while ((CurrentNode = queue.shift()) != null) {
                if (CurrentNode.LabelName != null) {
                    LabelMap[CurrentNode.LabelName] = CurrentNode.GetLabel();
                }
                if (CurrentNode.SubNodeList) {
                    Array.prototype.push.apply(queue, CurrentNode.SubNodeList);
                }
            }
            return LabelMap;
        }

        /**
         * @method GetNodeCount
         * @return {Number}
         */
        GetNodeCount(): number {
            return Object.keys(this.NodeMap).length;
        }

        /**
         * @method GetNodeCountTypeOf
         * @param {GSNType} type
         * @return {Number}
         */
        GetNodeCountTypeOf(type: GSNType): number {
            var count = 0;
            this.ForEachNode((Node) => { count += Node.NodeType == type ? 1 : 0; });
            return count;
        }

        /**
         * @method GetNodeCountForEachType
         * @return A map from GSNType to count 
         */
        GetNodeCountForEachType(): { [index: number]: number } {
            var map : any = {};
            map[GSNType.Assumption] = 0;
            map[GSNType.Context] = 0;
            map[GSNType.Contract] = 0;
            map[GSNType.Evidence] = 0;
            map[GSNType.Exception] = 0;
            map[GSNType.Goal] = 0;
            map[GSNType.Justification] = 0;
            map[GSNType.Strategy] = 0;
            map[GSNType.Undefined] = 0;
            this.ForEachNode((Node) => { ++map[Node.NodeType]; });
            return map;
        }

        /**
         * @method RenumberAll
         */
        RenumberAll(): void {
            if (this.TopNode != null) {
                this.TopNode.RenumberGoal(1, 2);
            }
        }

    }

    /**
     * @class GSNRecord
     * @constructor
     *
     */
    export class GSNRecord {
        HistoryList: GSNHistory[] = [];
        private HistoryListToRedo: GSNHistory[] = [];
        EditingDoc: GSNDoc = null;

        /* TODO Use this field to enable undo/redo */
        CurrentRevision: number;

        constructor() {
        }

        /**
         * @method DeepCopy
         * @return GSNRecord
         */
        DeepCopy(): GSNRecord {
            var NewRecord: GSNRecord = new GSNRecord();
            NewRecord.HistoryList = this.HistoryList.map(x => x);
            NewRecord.EditingDoc = this.EditingDoc;
            return NewRecord;
        }

        /**
         * @method GetHistory
         * @param {Number} Rev
         * @return {GSNHistory}
         */
        GetHistory(Rev: number): GSNHistory {
            if (Rev < this.HistoryList.length) {
                return this.HistoryList[Rev];
            }
            return null;
        }

        /**
         * @method GetHistoryDoc
         * @param {Number} Rev
         * @return {GSNDoc}
         */
        GetHistoryDoc(Rev: number): GSNDoc {
            var history: GSNHistory = this.GetHistory(Rev);
            if (history != null) {
                return history.Doc;
            }
            return null;
        }

        /**
         * @method NewHistory
         * @param {String} Author
         * @param {String} Role
         * @param {String} Date
         * @param {String} Process
         * @param {GSNDoc} Doc
         * @return {GSNHistory}
         */
        NewHistory(Author: string, Role: string, ModefiedDate: Date, Process: string, Doc: GSNDoc): GSNHistory {
            var History: GSNHistory = new GSNHistory(this.HistoryList.length, Author, Role, ModefiedDate, Process, Doc);
            this.HistoryList.push(History);
            return History;
        }

        /**
         * @method AddHistory
         * @param {Number} Rev
         * @param {String} Author
         * @param {String} Role
         * @param {String} Date
         * @param {String} Process
         * @param {GSNDoc} Doc
         */
        AddHistory(Rev: number, Author: string, Role: string, ModefiedDate: Date, Process: string, Doc: GSNDoc): void {
            if (Rev >= 0) {
                var History: GSNHistory = new GSNHistory(Rev, Author, Role, ModefiedDate, Process, Doc);
                while (Rev >= this.HistoryList.length) {
                    this.HistoryList.push(new GSNHistory(Rev, Author, Role, ModefiedDate, Process, Doc));
                }
                if (0 <= Rev && Rev < this.HistoryList.length) {
                    var OldHistory: GSNHistory = this.HistoryList[Rev];
                    OldHistory.UpdateHistory(Rev, Author, Role, ModefiedDate, Process, Doc);
                }
                this.HistoryList[Rev] = History;
                if (Doc != null) {
                    Doc.DocHistory = History;
                }
            }
        }

        /**
         * @method RenumberAll
         */
        RenumberAll(): void {
            var LatestDoc: GSNDoc = this.GetLatestDoc();
            if (LatestDoc != null && LatestDoc.TopNode != null) {
                LatestDoc.RenumberAll();
            }
        }

        /**
         * @method OpenEditor
         * @param {String} Author
         * @param {String} Role
         * @param {String} Date
         * @param {String} Process
         */
        public OpenEditor(Author: string, Role: string, ModefiedDate: Date, Process: string): void {
            if (this.EditingDoc == null) {
                var Doc: GSNDoc = this.GetLatestDoc();
                if (Doc != null) {
                    this.EditingDoc = Doc.DeepCopy(Author, Role, ModefiedDate, Process);
                } else {
                    this.EditingDoc = new GSNDoc(this);
                    this.EditingDoc.DocHistory = this.NewHistory(Author, Role, ModefiedDate, Process, this.EditingDoc);
                }
                this.EditingDoc.DocHistory.IsCommitRevision = false;
            } else {
                throw new Error("OpenEditor is called before CloseEditor called.");
            }
        }

        /**
         * @method CloseEditor
         */
        public CloseEditor(): void {
            if (this.EditingDoc) {
                this.EditingDoc = null;
                this.HistoryListToRedo = [];
            } else {
                throw new Error("CloseEditor is called before OpenEditor called.");
            }
        }

        /**
         * @method DiscardEditor
         */
        public DiscardEditor(): void {
            if (this.EditingDoc) {
                this.EditingDoc = null;
                this.HistoryList.pop();
            } else {
                throw new Error("DiscardEditor is called before OpenEditor called.");
            }
        }

        /**
         * @method CanUndo
         */
        public CanUndo(): boolean {
            return this.HistoryList.length > 1 && !this.GetLatestDoc().DocHistory.IsCommitRevision
        }

        /**
         * @method CanRedo
         */
        public CanRedo(): boolean {
            return this.HistoryListToRedo.length > 0;
        }

        /**
         * @method Undo
         */
        public Undo(): void {
            if (!this.EditingDoc) {
                if (this.CanUndo()) {
                    this.HistoryListToRedo.push(this.HistoryList.pop());
                }
            } else {
                throw new Error("Undo is called while editor is opened.");
            }
        }

        /**
         * @method Redo
         */
        public Redo(): void {
            if (!this.EditingDoc) {
                if (this.CanRedo()) {
                    this.HistoryList.push(this.HistoryListToRedo.pop());
                }
            } else {
                throw new Error("Redo is called while editor is opened.");
            }
        }

        /**
         * @method Merge
         * @param {GSNRecord} NewRecord
         */
        public Merge(NewRecord: GSNRecord): void {
            var CommonRevision: number = -1;
            for (var Rev: number = 0; Rev < this.HistoryList.length; Rev++) {
                var MasterHistory: GSNHistory = this.GetHistory(Rev);
                var NewHistory: GSNHistory = NewRecord.GetHistory(Rev);
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
        }

        /**
         * Resolve conflict and create new record to merge records.
         * Node-level conflict will never happen.
         * @method MergeConflict
         * @param {GSNRecord} NewRecord
         * @param {Number} CommonRevision Both this and NewRecord have one or more newer revisions.
         */
        private MergeConflict(BranchRecord: GSNRecord, CommonRevision: number): void {
            var MasterHistory: GSNHistory = this.HistoryList[this.HistoryList.length - 1];
            var BranchHistory: GSNHistory = null;
            for (var i: number = CommonRevision + 1; i < BranchRecord.HistoryList.length; i++) {
                BranchHistory = BranchRecord.HistoryList[i];
                this.HistoryList.push(BranchHistory);
            }

            var MergeDoc: GSNDoc = new GSNDoc(this);
            MergeDoc.TopNode = MasterHistory.Doc.TopNode.Merge(BranchHistory.Doc.TopNode, CommonRevision);
            MergeDoc.DocHistory = this.NewHistory(BranchHistory.Author, BranchHistory.Role, null, "merge", MergeDoc);
        }

        /**
         * @method MergeAsFastFoward
         * @param {GSNRecord} NewRecord
         */
        public MergeAsFastFoward(NewRecord: GSNRecord): void {
            for (var i: number = this.HistoryList.length; i < NewRecord.HistoryList.length; i++) {
                var BranchDoc: GSNDoc = NewRecord.GetHistoryDoc(i);
                if (BranchDoc != null) {
                    BranchDoc.Record = this;
                    this.HistoryList.push(BranchDoc.DocHistory);
                }
            }
        }

        /**
         * @method MergeAsReplaceTopGoal
         * @param {GSNRecord} NewRecord
         */
        public MergeAsReplaceTopGoal(NewRecord: GSNRecord): void {
            for (var i: number = 0; i < NewRecord.HistoryList.length; i++) {
                var NewHistory: GSNHistory = NewRecord.HistoryList[i];
                var Doc: GSNDoc = NewHistory != null ? NewHistory.Doc : null;
                if (Doc != null) {
                    this.OpenEditor(NewHistory.Author, NewHistory.Role, NewHistory.Date, NewHistory.Process);
                    this.EditingDoc.TopNode.ReplaceSubNode(Doc.TopNode, true);
                    this.CloseEditor();
                }
            }
        }

        /**
         * @method MergeAsIncrementalAddition
         * @param {Number} Rev1
         * @param {GSNRecord} Record1
         * @param {Number} Rev2
         * @param {GSNRecord} Record2
         */
        public MergeAsIncrementalAddition(Rev1: number, Record1: GSNRecord, Rev2: number, Record2: GSNRecord): void {
            while (Rev1 < Record1.HistoryList.length && Rev2 < Record2.HistoryList.length) {
                var History1: GSNHistory = Record1.GetHistory(Rev1);
                var History2: GSNHistory = Record2.GetHistory(Rev2);
                if (History1 == null || History1.Doc == null) {
                    if (Rev1 < Record1.HistoryList.length) {
                        Rev1++; continue;
                    }
                }
                if (History2 == null || History2.Doc == null) {
                    if (Rev2 < Record2.HistoryList.length) {
                        Rev2++; continue;
                    }
                }
                if (History1.CompareDate(History2) < 0) {
                    this.OpenEditor(History1.Author, History1.Role, History1.Date, History1.Process); Rev1++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History1.Doc.TopNode, true);
                    this.CloseEditor();
                }
                else {
                    this.OpenEditor(History2.Author, History2.Role, History2.Date, History2.Process); Rev2++;
                    this.EditingDoc.TopNode.ReplaceSubNode(History2.Doc.TopNode, true);
                    this.CloseEditor();
                }
            }
        }

        /**
         * @method GetLatestDoc
         * @return {GSNDoc}
         */
        GetLatestDoc(): GSNDoc {
            for (var i: number = this.HistoryList.length - 1; i >= 0; i++) {
                var Doc: GSNDoc = this.GetHistoryDoc(i);
                if (Doc != null) {
                    return Doc;
                }
            }
            return null;
        }

        /**
         * @method Commit
         */
        public Commit(message: string): void {
            this.GetLatestDoc().DocHistory.IsCommitRevision = true;
            this.GetLatestDoc().SetTagValue("CommitMessage", message);
        }

        /**
         * @method FormatRecord
         * @param {StringWriter} Writer
         */
        public FormatRecord(Writer: StringWriter): void {
            var DocCount: number = 0;
            for (var i: number = this.HistoryList.length - 1; i >= 0; i--) {
                var Doc: GSNDoc = this.GetHistoryDoc(i);
                if (Doc != null) {
                    if (DocCount > 0) {
                        Writer.println(Lib.VersionDelim);
                    }
                    TagUtils.FormatHistoryTag(this.HistoryList, i, Writer);
                    Doc.FormatDoc(Writer);
                    DocCount += 1;
                }
            }
        }
    }


    /* lib/md5.js */
    declare function unescape(str: string): string;

    export class Random {
        constructor(seed: number) { }

        nextInt(): number {
            return Math.floor(Math.random() * 2147483647);
        }
    }

    export class System {
        static currentTimeMillis() {
            return new Date().getTime();
        }
    }

    export class SimpleDateFormat {
        constructor(format: string) {
            // Support format string, or is it needless?
        }

        fillZero(digit: number): string {
            if (digit < 10) {
                return '0' + digit;
            } else {
                return '' + digit;
            }
        }

        parse(date: string): Date {
            return new Date(date);
        }

        formatTimezone(timezoneOffset: number): string {
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
        }

        format(date: Date): string {
            var y: string = this.fillZero(date.getFullYear());
            var m: string = this.fillZero(date.getMonth() + 1);
            var d: string = this.fillZero(date.getDate());
            var hr: string = this.fillZero(date.getHours());
            var min: string = this.fillZero(date.getMinutes());
            var sec: string = this.fillZero(date.getSeconds());
            var timezone: string = this.formatTimezone(date.getTimezoneOffset());
            return y + '-' + m + '-' + d + 'T' + hr + ':' + min + ':' + sec + timezone;
        }
    }

    export class MessageDigest {
        digestString: string;
        constructor() {
            this.digestString = null;
        }

        digest(): string {
            return this.digestString;
        }
    }

    export class Lib {
        /* To be set on lib/md5.js */
        static md5: (str: string) => string;

        /* Static Fields */
        static Input: string[] = [];
        static EmptyNodeList = new Array<GSNNode>();
        static LineFeed: string = "\n";
        static VersionDelim: string = "*=====";

        /* Methods */
        static GetMD5(): MessageDigest {
            return new MessageDigest();
        }

        static UpdateMD5(md: MessageDigest, text: string): void {
            md.digestString = Lib.md5(text);
        }

        static EqualsDigest(digest1: string, digest2: string): boolean {
            return digest1 == digest2;
        }

        static HexToDec(v: string): number {
            return parseInt(v, 16);
        }

        static DecToHex(n: number): string {
            return n.toString(16);
        }

        static String_startsWith(self: string, key: string): boolean {
            return self.indexOf(key, 0) == 0;
        }

        static String_compareTo(self: string, anotherString: string): number {
            if (self < anotherString) {
                return -1;
            } else if (self > anotherString) {
                return 1;
            } else {
                return 0;
            }
        }

        static String_endsWith(self: string, key: string): boolean {
            return self.lastIndexOf(key, 0) == 0;
        }

        static String_matches(self: string, str: string): boolean {
            return self.match(str) != null;
        }
    }

}
