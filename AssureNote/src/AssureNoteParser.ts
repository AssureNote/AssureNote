// ***************************************************************************
// Copyright (c) 2013, JST/CREST DEOS project authors. All rights reserved.
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





class StringReader {
	CurrentPos: number;
	PreviousPos: number;
	Linenum: number;
	Text: string;

	constructor(Text: string) {
		this.Text = Text;
		this.CurrentPos = 0;
		this.PreviousPos = 0;
		this.Linenum = 0;
	}

	HasNext(): boolean {
		return this.CurrentPos < this.Text.length;
	}

	ReadLine(): string {
		var StartPos: number = this.CurrentPos;
		var i: number;
		this.PreviousPos = this.CurrentPos;
		for (i = this.CurrentPos; i < this.Text.length; i++) {
			var ch: number = this.Text.charCodeAt(i);
			if (ch == 10) {
				var EndPos: number = i;
				this.CurrentPos = i + 1;
				this.Linenum += 1;
				return this.Text.substring(StartPos, EndPos).trim();
			}
			if (ch == 92) {
				var EndPos: number = i;
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
	}

	RollbackLineFeed(): void {
		this.CurrentPos = this.PreviousPos;
		this.Linenum -= 1;
	}

	ReadLineList(LineList: Array<string>, UntilSection: boolean): void {
		while(this.HasNext()) {
			var Line: string = this.ReadLine();
			if(UntilSection && Line.startsWith("*")) {
				this.RollbackLineFeed();
				break;
			}
			LineList.add(Line);
		}
	}

	GetLineList(UntilSection: boolean): Array<string> {
		var LineList: Array<string> = new Array<string>();
		this.ReadLineList(LineList, UntilSection);
		return LineList;
	}
	
	LogError(Message: string, Line: string): void {
		console.log("(error:" + this.Linenum + ") " + Message + ": " + Line);
	}
	
	LogWarning(Message: string, Line: string): void {
		console.log("(warning:" + this.Linenum + ") " + Message + ": " + Line);
	}

}

class StringWriter {
	sb: StringBuilder;
	constructor() {
		this.sb = new StringBuilder();
	}
	print(s: string): void {
		this.sb.append(s);
	}
	println(s: string): void {
		this.sb.append(s);
		this.sb.append(Lib.LineFeed);
	}
	newline(): void {
		this.sb.append(Lib.LineFeed);
	}
	public toString(): string {
		return this.sb.toString();
	}
}

enum GSNType {
	Goal, Context, Strategy, Evidence, Undefined
}

class GSNHistory {
	Rev: number;
	Author: string;
	Role: string;
	Date: string;
	Process: string;
	Doc: GSNDoc;

	constructor(Rev: number, Author: string, Role: string, DateString: string, Process: string, Doc: GSNDoc) {
		this.Rev = Rev;
		this.Author = Author;
		this.Role = Role;
		this.Date = DateString;
		var Format: SimpleDateFormat = new SimpleDateFormat("yyyy-MM-dd84HH:mm:ssZ");
		if (DateString == null) {
			var d: Date = new Date();
			this.Date = Format.format(d);
		} else {
			try {
				this.Date = Format.format(Format.parse(DateString));
			} catch(e) {
				e.printStackTrace();
			}
		}
		this.Process = Process;
		this.Doc = Doc;
	}

	public toString(): string {
		return this.Date + ";" + this.Author + ";" + this.Role + ";" + this.Process;
	}

	public EqualsHistory(aHistory: GSNHistory): boolean {
		return (this.Date.equals(aHistory.Date) && this.Author.equals(aHistory.Author));
	}
	
	public CompareDate(aHistory: GSNHistory): number {
		return (this.Date.compareTo(aHistory.Date));
	}

}

class WikiSyntax {
	static ParseInt(NumText: string, DefVal: number): number {
		try {
			return Lib.parseInt(NumText);
		} catch(e) {
		}
		return DefVal;
	}
	static ParseGoalLevel(LabelLine: string): number {
		var GoalLevel: number = 0;
		for (var i: number = 0; i < LabelLine.length; i++) {
			if (LabelLine.charCodeAt(i) != 42) break;
			GoalLevel++;
		}
		return GoalLevel;
	}
	static FormatGoalLevel(GoalLevel: number): string {
		var sb: StringBuilder = new StringBuilder();
		for (var i: number = 0; i < GoalLevel; i++) {
			sb.append("*");
		}
		return sb.toString();
	}
	static ParseNodeType(LabelLine: string): GSNType {
		var i: number;
		for (i = 0; i < LabelLine.length; i++) {
			if (LabelLine.charCodeAt(i) != 42) break;
		}
		for (; i < LabelLine.length; i++) {
			if (LabelLine.charCodeAt(i) != 32) break;
		}
		if (i < LabelLine.length) {
			var ch: number = LabelLine.charCodeAt(i);
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
	}

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
		case GSNType.Undefined:
		}
		return "U";
	}

	static ParseLabelNumber(LabelLine: string): string {
		var StartIdx: number = -1;
		for (var i: number = 0; i < LabelLine.length; i++) {
			if (Character.isDigit(LabelLine.charCodeAt(i))) {
				StartIdx = i;
				break;
			}
		}
		if (StartIdx != -1) {
			for (var i: number = StartIdx + 1; i < LabelLine.length; i++) {
				if (Character.isWhitespace(LabelLine.charCodeAt(i))) {
					return LabelLine.substring(StartIdx, i);
				}
			}
			return LabelLine.substring(StartIdx);
		}
		return null;
	}

	public static ParseRevisionHistory(LabelLine: string): string {
		var Loc: number = LabelLine.indexOf("#");
		if (Loc != -1) {
			return LabelLine.substring(Loc).trim();
		}
		return null;
	}

	public static ParseHistory(LabelLine: string, BaseDoc: GSNDoc): GSNHistory[] {
		if(BaseDoc != null) {
			var Loc: number = LabelLine.indexOf("#");
			try {
				if (Loc != -1) {
					var HistoryTriple: GSNHistory[] = new Array<GSNHistory>(2);
					var RevText: string = LabelLine.substring(Loc + 1).trim();
					var RevSet: string[] = RevText.split(":");
					HistoryTriple[0] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[0], -1)); // Created
					HistoryTriple[1] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[1], -1)); // Branched
					if (HistoryTriple[0] == null || HistoryTriple[1] == null) {
						return null;
					}
					return HistoryTriple;
				}
			}
			catch(e) {
			}
		}
		return null;
	}
	public static FormatRefKey(NodeType: GSNType, LabelNumber: string, HistoryTriple: string): string {
		return WikiSyntax.FormatNodeType(NodeType) + LabelNumber + HistoryTriple;
	}
}

class TagUtils {
	static ParseTag(TagMap: HashMap<string, string>, Line: string): void {
		var loc: number = Line.indexOf("::");
		if (loc != -1) {
			var Key: string = Line.substring(0, loc).trim();
			var Value: string = Line.substring(loc + 2).trim();
			TagMap.put(Key, Value);
		}
	}

	static FormatTag(TagMap: HashMap<string, string>, Writer: StringWriter): void {
		if (TagMap != null) {
			var keyArray: string[] = <string[]>TagMap.keySet();
			for (var i: number = 0; i < keyArray.length; i++) {
				var Key: string = keyArray[i];
				Writer.println(Key + ":: " + TagMap.get(Key));
			}
		}
	}

	static FormatHistoryTag(HistoryList: Array<GSNHistory>, Writer: StringWriter): void {
		for (var i: number = 0; i < HistoryList.size(); i++) {
			var History: GSNHistory = HistoryList.get(i);
			if (History != null) {
				Writer.println("#" + i + "::" + History);
			}
		}
	}

	static GetString(TagMap: HashMap<string, string>, Key: string, DefValue: string): string {
		if (TagMap != null) {
			var Value: string = TagMap.get(Key);
			if (Value != null) {
				return Value;
			}
		}
		return DefValue;
	}

	static GetInteger(TagMap: HashMap<string, string>, Key: string, DefValue: number): number {
		if (TagMap != null) {
			return WikiSyntax.ParseInt(TagMap.get(Key), DefValue);
		}
		return DefValue;
	}
}

class GSNNode {
	BaseDoc: GSNDoc;
	ParentNode: GSNNode;
	SubNodeList: Array<GSNNode>;
	NodeType: GSNType;
	LabelNumber: string; /* e.g, G1 G1.1 */
	SectionCount: number;
	
	Created: GSNHistory;
	LastModified: GSNHistory;
	
	NodeDoc: string;
	HasTag: boolean;
	Digest: string;
	TagMap: HashMap<string, string>;

	constructor(BaseDoc: GSNDoc, ParentNode: GSNNode, NodeType: GSNType, LabelNumber: string, HistoryTriple: GSNHistory[]) {
		this.BaseDoc     = BaseDoc;
		this.ParentNode  = ParentNode;
		this.NodeType    = NodeType;
		this.LabelNumber = LabelNumber;    // G1.1
		this.SectionCount = 0;
		this.SubNodeList = null;
		if (HistoryTriple != null) {
			this.Created = HistoryTriple[0];
			this.LastModified = HistoryTriple[1];
		} else {
			if(BaseDoc != null) {
				this.Created = BaseDoc.DocHistory;
			}
			else {
				this.Created = null;
			}
			this.LastModified = this.Created;
		}
		this.Digest = null;
		this.NodeDoc = Lib.LineFeed;
		this.HasTag = false;
		if (this.ParentNode != null) {
			ParentNode.AppendSubNode(this);
		}
	}
	
	DeepCopy(BaseDoc: GSNDoc, ParentNode: GSNNode): GSNNode {
		var NewNode: GSNNode = new GSNNode(BaseDoc, ParentNode, /*this.GoalLevel,*/ this.NodeType, this.LabelNumber, null);
		NewNode.Created = this.Created;
		NewNode.LastModified = this.LastModified;
		NewNode.Digest = this.Digest;
		NewNode.NodeDoc = this.NodeDoc;
		NewNode.HasTag = this.HasTag;
		if(BaseDoc != null) {
			BaseDoc.UncheckAddNode(NewNode);
		}
		for (var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			Node.DeepCopy(BaseDoc, NewNode);
		}
		return NewNode;
	}

	public IsGoal(): boolean {
		return (this.NodeType == GSNType.Goal);
	}
	public IsStrategy(): boolean {
		return (this.NodeType == GSNType.Strategy);
	}
	public IsContext(): boolean {
		return (this.NodeType == GSNType.Context);
	}
	public IsEvidence(): boolean {
		return (this.NodeType == GSNType.Evidence);
	}

	NonNullSubNodeList(): Array<GSNNode> {
		return this.SubNodeList == null ? Lib.EmptyNodeList : this.SubNodeList;
	}

	public Remap(NodeMap: HashMap<string, GSNNode>): void {
		NodeMap.put(this.GetLabel(), this);
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			Node.Remap(NodeMap);
		}
	}
	
	public GetGoalLevel(): number {
		var GoalCount: number = 1;
		var Node: GSNNode = this.ParentNode;
		while(Node != null) {
			if(Node.IsGoal()) {
				GoalCount += 1;
			}
			Node = Node.ParentNode;
		}
		return GoalCount;
	}
	
	GetLabel(): string {
		return WikiSyntax.FormatNodeType(this.NodeType) + this.LabelNumber;
	}
	
	GetHistoryTriple(): string {
		return "#" + this.Created.Rev + ":" + this.LastModified.Rev;
	}

	ReplaceLabels(LabelMap: HashMap<string,string>): void {
		var NewNumber: string = LabelMap.get(this.GetLabel());
		if(NewNumber != null) {
			this.LabelNumber = NewNumber;
		}
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			Node.ReplaceLabels(LabelMap);
		}
	}
	
	IsModified(): boolean {
		return this.LastModified == this.BaseDoc.DocHistory;
	}
	
	SetContent(LineList: Array<string>): void {
		var OldDigest: string = this.Digest;
		var LineCount: number = 0;
		var Writer: StringWriter = new StringWriter();
		var md: MessageDigest = Lib.GetMD5();
		for (var i: number = 0; i < LineList.size(); i++) {
			var Line: string = LineList.get(i);
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
			this.NodeDoc = Writer.toString();
		} else {
			this.Digest = null;
			this.NodeDoc = Lib.LineFeed;
		}
		if(!Lib.EqualsDigest(OldDigest, this.Digest) && this.BaseDoc != null) {
			this.LastModified = this.BaseDoc.DocHistory;
		}		
	}

	UpdateContent(TextDoc: string): void {
		this.SetContent(new StringReader(TextDoc).GetLineList(true/*UntilSection*/));
	}
	
	GetNodeHistoryList(): Array<GSNNode> {
		var NodeList: Array<GSNNode> = new Array<GSNNode>();
		var LastNode: GSNNode = null;
		for(var i: number = 0; i < this.BaseDoc.Record.HistoryList.size(); i++) {
			var NodeHistory: GSNHistory = this.BaseDoc.Record.HistoryList.get(i);
			if(NodeHistory.Doc != null) {
				var Node: GSNNode = NodeHistory.Doc.GetNode(this.GetLabel());
				if(Node != null) {
					if(Node.Created == this.Created) {
						if(LastNode == null || LastNode.LastModified != this.LastModified) {
							NodeList.add(Node);
							LastNode = Node;
						}
					}
				}
			}
		}
		return NodeList;
	}
	
	private AppendSubNode(Node: GSNNode): void {(Node.BaseDoc == this.BaseDoc);
		if (this.SubNodeList == null) {
			this.SubNodeList = new Array<GSNNode>();
		}
		this.SubNodeList.add(Node);
	}

	HasSubNode(NodeType: GSNType): boolean {
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			if (Node.NodeType == NodeType) {
				return true;
			}
		}
		return false;
	}

	GetCloseGoal(): GSNNode {
		var Node: GSNNode = this;
		while (Node.NodeType != GSNType.Goal) {
			Node = Node.ParentNode;
		}
		return Node;
	}

	GetTagMap(): HashMap<string, string> {
		if (this.TagMap == null && this.HasTag) {
			this.TagMap = new HashMap<string, string>();
			var Reader: StringReader = new StringReader(this.NodeDoc);
			while (Reader.HasNext()) {
				var Line: string = Reader.ReadLine();
				var Loc: number = Line.indexOf("::");
				if (Loc > 0) {
					TagUtils.ParseTag(this.TagMap, Line);
				}
			}
		}
		return this.TagMap;
	}
	
	MergeTagMap(BaseMap: HashMap<string, string>, NewMap: HashMap<string, string>): HashMap<string, string> {
		if (BaseMap == null) return NewMap;
		if (NewMap == null) return BaseMap;
		
		var Result: HashMap<string, string> = new HashMap<string, string>();
		var KeySet: string[] = <string[]>BaseMap.keySet();
		for (var i: number = 0; i < KeySet.length; i++) {
			Result.put(KeySet[i],  BaseMap.get(KeySet[i]));
		}
		KeySet = <string[]>NewMap.keySet();
		for (var i: number = 0; i < KeySet.length; i++) {
			Result.put(KeySet[i],  NewMap.get(KeySet[i]));
		}
		return Result;
	}
	
	GetTagMapWithLexicalScope(): HashMap<string, string> {
		var Result: HashMap<string, string> = null;
		if (this.ParentNode != null) {
			Result = this.MergeTagMap(this.ParentNode.GetTagMapWithLexicalScope(), this.GetTagMap());
		} else {
			Result = this.GetTagMap();
		}
		if (this.SubNodeList != null) {
			for (var i: number = 0; i < this.SubNodeList.size(); i++) {
				var Node: GSNNode = this.SubNodeList.get(i);
				if (Node.IsContext()) {
					Result = this.MergeTagMap(Result, Node.GetTagMap());
				}
			}
		}
		return Result;
	}

	GetLastNode(NodeType: GSNType, Creation: boolean): GSNNode {
		if (this.SubNodeList != null) {
			for (var i: number = this.SubNodeList.size() - 1; i >= 0; i--) {
				var Node: GSNNode = this.SubNodeList.get(i);
				if (Node.NodeType == NodeType) {
					return Node;
				}
			}
		}
		if (NodeType == GSNType.Strategy && Creation) {
			return new GSNNode(this.BaseDoc, this, GSNType.Strategy, this.LabelNumber, null);
		}
		return null;
	}

	FormatNode(RefMap: HashMap<string, GSNNode>, Writer: StringWriter): void {
		Writer.print(WikiSyntax.FormatGoalLevel(this.GetGoalLevel()));
		Writer.print(" ");
		Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
		Writer.print(this.LabelNumber);
		// Stream.append(" ");
		// MD5.FormatDigest(this.Digest, Stream);
		var RefKey: string = null;
		var RefNode: GSNNode = null;
		if (this.Created != null) {
			var HistoryTriple: string = this.GetHistoryTriple();
			Writer.print(" " + HistoryTriple);
			RefKey = WikiSyntax.FormatRefKey(this.NodeType, this.LabelNumber, HistoryTriple);
			RefNode = RefMap.get(RefKey);
		}
		if (RefNode == null) {
			Writer.print(this.NodeDoc);
			if (this.Digest != null) {
				Writer.newline();
			}
			if (RefKey != null) {
				RefMap.put(RefKey, this);
			}
		} else {
			Writer.newline();
		}
		for (var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			Node.FormatNode(RefMap, Writer);
		}
	}

	// SubNode
	FormatSubNode(GoalLevel: number, Writer: StringWriter): void {
		Writer.print(WikiSyntax.FormatGoalLevel(GoalLevel));
		Writer.print(" ");
		Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
		Writer.print(this.LabelNumber);
		// Stream.append(" ");
		// MD5.FormatDigest(this.Digest, Stream);
		Writer.print(this.NodeDoc);
		if (this.Digest != null) {
			Writer.newline();
		}
		if (this.NonNullSubNodeList() != null) {
			for (var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
				var Node: GSNNode = this.NonNullSubNodeList().get(i);
				Node.FormatSubNode(Node.IsGoal() ? GoalLevel+1 : GoalLevel, Writer);
			}
		}
	}
	
	ReplaceSubNode(NewNode: GSNNode, LabelMap: HashMap<string,string>): GSNNode {
		this.MergeSubNode(NewNode, LabelMap);
		if(this.ParentNode != null) {
			for(var i: number = 0; i < this.ParentNode.SubNodeList.size(); i++) {
				if(this.ParentNode.SubNodeList.get(i) == this) {
					this.ParentNode.SubNodeList.set(i, NewNode);
				}
			}
		}
		else {(NewNode.IsGoal());
			this.BaseDoc.TopGoal = NewNode;
		}
		return NewNode;
	}

	ReplaceSubNodeAsText(DocText: string): GSNNode {
		var Reader: StringReader = new StringReader(DocText);
		var Parser: ParserContext = new ParserContext(null, this.ParentNode);
		var NewNode: GSNNode = Parser.ParseNode(Reader, null);
		if(NewNode != null) {
			this.ReplaceSubNode(NewNode, null);
		}
		return NewNode;
	}
	
	HasSubNodeLabel(Label: string): boolean {
		if(Label.equals(this.GetLabel())) {
			return true;
		}
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var SubNode: GSNNode = this.NonNullSubNodeList().get(i);
			if(SubNode.HasSubNodeLabel(Label)) return true;
		}
		return false;
	}
	
	MergeSubNode(NewNode: GSNNode, LabelMap: HashMap<string,string>): void {(this.BaseDoc != null);
		NewNode.LastModified = null; // this.BaseDoc has Last
		if(NewNode.LabelNumber != null) {
			var Label: string = NewNode.GetLabel();
			var OldNode: GSNNode = this.BaseDoc.GetNode(Label);
			if(OldNode != null && this.HasSubNodeLabel(Label)) {
				NewNode.Created = OldNode.Created;
				if(Lib.EqualsDigest(OldNode.Digest, NewNode.Digest)) {
					NewNode.LastModified = OldNode.LastModified;
				}
				else {
					NewNode.LastModified = this.BaseDoc.DocHistory;					
				}
			}
		}
		if(NewNode.LastModified == null) {
			var NewLabelNumber: string = this.BaseDoc.CheckLabelNumber(NewNode.ParentNode, this.NodeType, null);
			if(LabelMap != null && this.LabelNumber != null) {
				LabelMap.put(NewNode.GetLabel(), NewLabelNumber);
			}
			NewNode.LabelNumber = NewLabelNumber;
			NewNode.Created = this.BaseDoc.DocHistory;
			NewNode.LastModified = this.BaseDoc.DocHistory;	
		}
		NewNode.BaseDoc = this.BaseDoc;
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var SubNode: GSNNode = this.NonNullSubNodeList().get(i);
			this.MergeSubNode(SubNode, LabelMap);
		}
	}

	// Merge
	IsNewerTree(ModifiedRev: number): boolean {
		if (ModifiedRev <= this.LastModified.Rev) {
			for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
				var Node: GSNNode = this.NonNullSubNodeList().get(i);
				if (!Node.IsNewerTree(ModifiedRev)) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	ListSubGoalNode(BufferList: Array<GSNNode>): void {
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			if(Node.IsGoal()) {
				BufferList.add(Node);
			}
			if(Node.IsStrategy()) {
				Node.ListSubGoalNode(BufferList);
			}
		}
	}

	ListSectionNode(BufferList: Array<GSNNode>): void {
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			if(!Node.IsGoal()) {
				BufferList.add(Node);
			}
			if(Node.IsStrategy() || Node.IsEvidence()) {
				Node.ListSectionNode(BufferList);
			}
		}
	}

	RenumberGoal(GoalCount: number, NextGoalCount: number, LabelMap: HashMap<string, string>): number {(this.IsGoal());
		var OldLabel: string = this.GetLabel();
		this.LabelNumber = "" + GoalCount;
		if(!OldLabel.equals(this.GetLabel())) {
			LabelMap.put(OldLabel, this.LabelNumber);
		}
		var BufferList: Array<GSNNode> = new Array<GSNNode>();
		this.ListSectionNode(BufferList);
		var SectionCount: number = 1;
		for(var i: number = 0; i < BufferList.size(); i++) {
			var SectionNode: GSNNode = BufferList.get(i);
			OldLabel = SectionNode.GetLabel();
			SectionNode.LabelNumber = this.LabelNumber + "." + SectionCount;
			if(!OldLabel.equals(SectionNode.GetLabel())) {
				LabelMap.put(OldLabel, SectionNode.LabelNumber);
			}
			SectionCount+=1;
		}
		BufferList.clear();
		this.ListSubGoalNode(BufferList);
		var NextCount: number = NextGoalCount + BufferList.size();
		for(var i: number = 0; i < BufferList.size(); i++) {
			var GoalNode: GSNNode = BufferList.get(i);
			NextCount = GoalNode.RenumberGoal(NextGoalCount, NextCount, LabelMap);
			NextGoalCount += 1;
		}
		return NextCount;
	}
	
	SearchNode(SearchWord: string): Array<GSNNode> {
		var NodeList: Array<GSNNode> = new Array<GSNNode>();
		if(this.NodeDoc.matches(SearchWord)) {
			NodeList.add(this);
		}
		for(var i: number = 0; i < this.NonNullSubNodeList().size(); i++) {
			var Node: GSNNode = this.NonNullSubNodeList().get(i);
			NodeList.addAll(Node.SearchNode(SearchWord));
		}
		return NodeList;
	}

}

class GSNDoc {
	Record: GSNRecord;
	TopGoal: GSNNode;
	NodeMap: HashMap<string, GSNNode>;
	DocTagMap: HashMap<string, string>;
	DocHistory: GSNHistory;
	GoalCount: number;

	constructor(Record: GSNRecord) {
		this.Record = Record;
		this.TopGoal = null;
		this.NodeMap = new HashMap<string, GSNNode>();
		this.DocTagMap = new HashMap<string, string>();
		this.DocHistory = null;
		this.GoalCount = 0;
	}

	DeepCopy(Author: string, Role: string, Date: string, Process: string): GSNDoc {
		var NewDoc: GSNDoc = new GSNDoc(this.Record);
		NewDoc.GoalCount = this.GoalCount;
		NewDoc.DocHistory = this.Record.NewHistory(Author, Role, Date, Process, NewDoc);
		NewDoc.DocTagMap = this.DuplicateTagMap(this.DocTagMap);
		if (this.TopGoal != null) {
			NewDoc.TopGoal = this.TopGoal.DeepCopy(NewDoc, null);
		}
		return NewDoc;
	}

	DuplicateTagMap(TagMap: HashMap<string, string>): HashMap<string, string> {
		if (TagMap != null) {
			var NewMap: HashMap<string, string> = new HashMap<string, string>();
			var keyArray: string[] = <string[]>TagMap.keySet();
			for(var i: number = 0; i < keyArray.length; i++) {
				var Key: string = keyArray[i];
				NewMap.put(Key, TagMap.get(Key));
			}
			return NewMap;
		}
		return null;
	}

	UpdateDocHeader(Reader: StringReader): void {
		var Revision: number = TagUtils.GetInteger(this.DocTagMap, "Revision", -1);
		if (Revision != -1) {
			this.DocHistory = this.Record.GetHistory(Revision);
			if (this.DocHistory != null) {
				this.DocHistory.Doc = this;
			}
		}
		if(this.DocHistory == null) {
			var Author: string = TagUtils.GetString(this.DocTagMap, "Author", "unknown");
			var Role: string = TagUtils.GetString(this.DocTagMap, "Role", "converter");
			var Date: string = TagUtils.GetString(this.DocTagMap, "Date", null);
			var Process: string = TagUtils.GetString(this.DocTagMap, "Process", "-");
			this.DocHistory = this.Record.NewHistory(Author, Role, Date, Process, this);
		}
	}

	public GetNode(Label: string): GSNNode {
		return this.NodeMap.get(Label);
	}

	UncheckAddNode(Node: GSNNode): void {
		this.NodeMap.put(Node.GetLabel(), Node);
	}

	AddNode(Node: GSNNode): void {
		var Key: string = Node.GetLabel();
		var OldNode: GSNNode = this.NodeMap.get(Key);
		if (OldNode != null) {
			if (Lib.EqualsDigest(OldNode.Digest, Node.Digest)) {
				Node.Created = OldNode.Created;
			}
		}
		this.NodeMap.put(Key, Node);
		if (Node.NodeType == GSNType.Goal) {
			if (Node.GetGoalLevel() == 1) {
				this.TopGoal = Node;
			}
			var num: number = WikiSyntax.ParseInt(Node.LabelNumber, 0);
			if (num > this.GoalCount) {
				this.GoalCount = num;
			}
		}
	}

	private UniqueNumber(NodeType: GSNType, LabelNumber: string): string {
		var Node: GSNNode = this.NodeMap.get(WikiSyntax.FormatNodeType(NodeType) + LabelNumber);
		if (Node == null) {
			return LabelNumber;
		}
		return this.UniqueNumber(NodeType, LabelNumber + "'");
	}

	CheckLabelNumber(ParentNode: GSNNode, NodeType: GSNType, LabelNumber: string): string {
		if (LabelNumber == null) {
			if (NodeType == GSNType.Goal) {
				this.GoalCount += 1;
				LabelNumber = "" + this.GoalCount;
			} else {
				var GoalNode: GSNNode = ParentNode.GetCloseGoal();
				GoalNode.SectionCount += 1;
				LabelNumber = GoalNode.LabelNumber + "." + GoalNode.SectionCount;
			}
		}
		return this.UniqueNumber(NodeType, LabelNumber);
	}

	RemapNodeMap(): void {
		var NodeMap: HashMap<string, GSNNode> = new HashMap<string, GSNNode>();
		if(this.TopGoal != null) {
			this.TopGoal.Remap(NodeMap);
		}
		this.NodeMap = NodeMap;
	}

	RemoveNode(Node: GSNNode): void {(this == Node.BaseDoc);
		if(Node.ParentNode != null) {
			Node.ParentNode.SubNodeList.remove(Node);
		}
		this.RemapNodeMap();
	}
	
	FormatDoc(NodeRef: HashMap<string, GSNNode>, Stream: StringWriter): void {
		if (this.TopGoal != null) {
			Stream.println("Revision:: " + this.DocHistory.Rev);
			this.TopGoal.FormatNode(NodeRef, Stream);
		}
	}
	
}


class GSNRecord {
	HistoryList: Array<GSNHistory>;
	EditingDoc: GSNDoc;

	constructor() {
		this.HistoryList = new Array<GSNHistory>();
		this.EditingDoc = null;
	}

	DeepCopy(): GSNRecord {
		var NewRecord: GSNRecord = new GSNRecord();
		for(var i: number = 0; i < this.HistoryList.size(); i++) {
			var Item: GSNHistory = this.HistoryList.get(i);
			NewRecord.HistoryList.add(Item);
		}
		NewRecord.EditingDoc = this.EditingDoc;
		return NewRecord;
	}
	
	GetHistory(Rev: number): GSNHistory {
		if (Rev < this.HistoryList.size()) {
			return this.HistoryList.get(Rev);
		}
		return null;
	}

	GetHistoryDoc(Rev: number): GSNDoc {
		var history: GSNHistory = this.GetHistory(Rev);
		if(history != null) {
			return history.Doc;
		}
		return null;
	}
	
	NewHistory(Author: string, Role: string, Date: string, Process: string, Doc: GSNDoc): GSNHistory {
		var History: GSNHistory = new GSNHistory(this.HistoryList.size(), Author, Role, Date, Process, Doc);
		this.HistoryList.add(History);
		return History;
	}

	AddHistory(Rev: number, Author: string, Role: string, Date: string, Process: string, Doc: GSNDoc): void {
		if(Rev >= 0) {
			var History: GSNHistory = new GSNHistory(Rev, Author, Role, Date, Process, Doc);
			while (!(Rev < this.HistoryList.size())) {
				this.HistoryList.add(null);
			}
			this.HistoryList.set(Rev, History);
		}
	}

	ParseHistoryTag(Line: string, Reader: StringReader): void {
		var loc: number = Line.indexOf("::");
		if (loc != -1) {
			var Key: string = Line.substring(0, loc).trim();
			try {
				var Value: string = Line.substring(loc + 2).trim();
				var Records: string[] = Value.split(";");
				this.AddHistory(WikiSyntax.ParseInt(Key.substring(1), -1), Records[1], Records[2], Records[0], Records[3], null);
			} catch(e) { // any parse errors are ignored
				Reader.LogError("Invalid format of history tag", e.getMessage());
			}
		}
	}

	Parse(TextDoc: string): void {
		var RefMap: HashMap<string, GSNNode> = new HashMap<string, GSNNode>();
		var Reader: StringReader = new StringReader(TextDoc);
		while (Reader.HasNext()) {
			var Doc: GSNDoc = new GSNDoc(this);
			var Parser: ParserContext = new ParserContext(Doc, null);
			Doc.TopGoal = Parser.ParseNode(Reader, RefMap);
		}
	}
	
	RenumberAll(): void {
		var LabelMap: HashMap<string, string> = new HashMap<string, string>();
		var LatestDoc: GSNDoc = this.GetLatestDoc();
		if(LatestDoc!= null && LatestDoc.TopGoal != null) {
			LatestDoc.TopGoal.RenumberGoal(1, 2, LabelMap);
		}
	}

	public OpenEditor(Author: string, Role: string, Date: string, Process: string): void {
		if (this.EditingDoc == null) {
			var Doc: GSNDoc = this.GetLatestDoc();
			if(Doc != null) {
				this.EditingDoc = Doc.DeepCopy(Author, Role, Date, Process);
			} else {
				this.EditingDoc = new GSNDoc(this);
				this.EditingDoc.DocHistory = this.NewHistory(Author, Role, Date, Process, this.EditingDoc);
			}
		}
	}

	public CloseEditor(): void {
		this.EditingDoc = null;
	}

	public Merge(NewRecord: GSNRecord): void {
		var CommonHistory: number = -1;
		for (var Rev: number = 0; Rev < this.HistoryList.size(); Rev++) {
			var MasterHistory: GSNHistory = this.GetHistory(Rev);
			var NewHistory: GSNHistory = NewRecord.GetHistory(Rev);
			if (NewHistory != null && MasterHistory.EqualsHistory(MasterHistory)) {
				CommonHistory = Rev;
				continue;
			}
			break;
		}
		if(CommonHistory == -1) {
			this.MergeAsReplaceTopGoal(NewRecord);
		}
		else if(CommonHistory == this.HistoryList.size()-1) {
			this.MergeAsFastFoward(NewRecord);
		}
		else {
			var Record1: GSNRecord = this.DeepCopy();
//			MergeAsIncrementalAddition
		}
	}

	public MergeAsFastFoward(NewRecord: GSNRecord): void {
		for (var i: number = this.HistoryList.size(); i < NewRecord.HistoryList.size(); i++) {
			var BranchDoc: GSNDoc = NewRecord.GetHistoryDoc(i);
			if(BranchDoc != null) {
				BranchDoc.Record = this;
				this.HistoryList.add(BranchDoc.DocHistory);
			}
		}
	}

	public MergeAsReplaceTopGoal(NewRecord: GSNRecord): void {
		for(var i: number = 0; i < NewRecord.HistoryList.size(); i++) {
			var NewHistory: GSNHistory = NewRecord.HistoryList.get(i);
			var Doc: GSNDoc = NewHistory != null ? NewHistory.Doc : null;
			if(Doc != null) {
				this.OpenEditor(NewHistory.Author, NewHistory.Role, NewHistory.Date, NewHistory.Process);
				this.EditingDoc.TopGoal.ReplaceSubNode(Doc.TopGoal, null);
				this.CloseEditor();
			}
		}
	}

	public MergeAsIncrementalAddition(Rev1: number, Record1: GSNRecord, Rev2: number, Record2: GSNRecord): void {
		var LabelMap: HashMap<string, string> = new HashMap<string,string>();
		while(Rev1 < Record1.HistoryList.size() && Rev2 < Record2.HistoryList.size()) {
			var History1: GSNHistory = Record1.GetHistory(Rev1);
			var History2: GSNHistory = Record2.GetHistory(Rev2);
			if(History1 == null || History1.Doc == null) {
				if(Rev1 < Record1.HistoryList.size()) {
					Rev1++; continue;
				}
			}
			if(History2 == null || History2.Doc == null) {
				if(Rev2 < Record2.HistoryList.size()) {
					Rev2++; continue;
				}
			}
			if(History1.CompareDate(History2) < 0) {
				this.OpenEditor(History1.Author, History1.Role, History1.Date, History1.Process); Rev1++;
				this.EditingDoc.TopGoal.ReplaceSubNode(History1.Doc.TopGoal, LabelMap);
				this.CloseEditor();
				if(LabelMap.size() > 0) { 
					Record1.ReplaceLabels(Rev1, Record1.HistoryList.size(), LabelMap);
					LabelMap.clear();
				}
			}
			else {
				this.OpenEditor(History2.Author, History2.Role, History2.Date, History2.Process); Rev2++;
				this.EditingDoc.TopGoal.ReplaceSubNode(History2.Doc.TopGoal, LabelMap);
				this.CloseEditor();
				if(LabelMap.size() > 0) {
					Record2.ReplaceLabels(Rev2, Record2.HistoryList.size(), LabelMap);
					LabelMap.clear();
				}
			}
		}
	}
	
	private ReplaceLabels(StartRev: number, EndRev: number, LabelMap: HashMap<string, string>): void {
		for(var i: number = StartRev; i < EndRev; i++) {
			var Doc: GSNDoc = this.GetHistoryDoc(i);
			if(Doc != null) {
				Doc.TopGoal.ReplaceLabels(LabelMap);
			}
		}
		
	}

	GetLatestDoc(): GSNDoc {
		for(var i: number = this.HistoryList.size() - 1; i >= 0; i++) {
			var Doc: GSNDoc = this.GetHistoryDoc(i);
			if(Doc != null) {
				return Doc;
			}
		}
		return null;
	}

	public FormatRecord(Writer: StringWriter): void {
		var DocCount: number = 0;
		var RefMap: HashMap<string, GSNNode> = new HashMap<string, GSNNode>();
		TagUtils.FormatHistoryTag(this.HistoryList, Writer);
		for (var i: number = 0; i < this.HistoryList.size(); i++) {
			var Doc: GSNDoc = this.GetHistoryDoc(i);
			if(Doc != null) {
				if(DocCount > 0) {
					Writer.println(Lib.VersionDelim);
				}
				Doc.FormatDoc(RefMap, Writer);
				DocCount += 1;
			}
		}
	}

}

class ParserContext {
	NullableDoc: GSNDoc;
	GoalStack: Array<GSNNode>;
	FirstNode: GSNNode;
	LastGoalNode: GSNNode;
	LastNonContextNode: GSNNode;

	constructor(NullableDoc: GSNDoc, ParentNode: GSNNode) {
		if(ParentNode == null) {
			ParentNode = new GSNNode(NullableDoc, null, GSNType.Goal, null, null);
		}
		this.NullableDoc = NullableDoc;  // nullabel
		this.FirstNode = null;
		this.LastGoalNode = null;
		this.LastNonContextNode = null;
		this.GoalStack = new Array<GSNNode>();
		this.SetLastNode(ParentNode);
	}

	SetLastNode(Node: GSNNode): void {
		if(Node.IsGoal()) {
			this.LastGoalNode = Node;
			this.SetGoalStackAt(Node);
		}
		if(!Node.IsContext()) {
			this.LastNonContextNode = Node;			
		}
	}
	
	GetStrategyOfGoal(Level: number): GSNNode {
		if (Level - 1 < this.GoalStack.size()) {
			var ParentGoal: GSNNode = this.GoalStack.get(Level - 1);
			if (ParentGoal != null) {
				return ParentGoal.GetLastNode(GSNType.Strategy, true/*Creation*/);
			}
		}
		return null;
	}

//	GSNNode GetGoalStackAt(int Level) {
//		if (Level - 1 < this.GoalStack.size()) {
//			return this.GoalStack.get(Level-1);
//		}
//		return null;
//	}

	SetGoalStackAt(Node: GSNNode): void {
		var GoalLevel: number = Node.GetGoalLevel();
//		System.out.println("GoalLevel="+GoalLevel+ ", stack="+this.GoalStackList.size());
		while (!(GoalLevel - 1 < this.GoalStack.size())) {
			this.GoalStack.add(null);
		}
		this.GoalStack.set(GoalLevel-1, Node);
	}

	IsValidSection(Line: string, Reader: StringReader): boolean {
		var NodeType: GSNType = WikiSyntax.ParseNodeType(Line);
		if (NodeType == GSNType.Goal) {
			var Level: number = WikiSyntax.ParseGoalLevel(Line);
			var ParentNode: GSNNode = this.GetStrategyOfGoal(Level);
			if (ParentNode != null) {
				return true;
			}
			Reader.LogError("Mismatched goal level < " + (this.GoalStack.size()), Line);
			return false;
		}
		if (NodeType == GSNType.Context) {
			if(this.LastNonContextNode == null) {
				Reader.LogError("Context is not linked to Context", Line);
				return false;				
			}
			return true;
		}
		if (NodeType == GSNType.Evidence) {
			if(this.LastGoalNode == null || this.LastGoalNode.HasSubNode(GSNType.Strategy)) {
				Reader.LogError("Evidence is only linked to Goal", Line);
				return false;
			}
			return true;
		}
		if (NodeType == GSNType.Strategy) {
			if(this.LastGoalNode == null || this.LastGoalNode.HasSubNode(GSNType.Evidence)) {
				Reader.LogError("Strategy is only linked to Goal", Line);				
				return false;
			}
			return true;
		}
		Reader.LogError("undefined element", Line);				
		return false;
	}

	CreateNewNode(LabelLine: string, RefMap: HashMap<string, GSNNode>, Reader: StringReader): GSNNode {
		var NodeType: GSNType = WikiSyntax.ParseNodeType(LabelLine);
		var LabelNumber: string = WikiSyntax.ParseLabelNumber(LabelLine);
		var RevisionHistory: string = WikiSyntax.ParseRevisionHistory(LabelLine);
		var RefNode: GSNNode = null;
		var NewNode: GSNNode = null;
		if (RefMap != null && LabelNumber != null && RevisionHistory != null) {
			var RefKey: string = WikiSyntax.FormatRefKey(NodeType, LabelNumber, RevisionHistory);
			RefNode = RefMap.get(RefKey);
		}
		var ParentNode: GSNNode = null;
		var HistoryTriple: GSNHistory[] = WikiSyntax.ParseHistory(LabelLine, this.NullableDoc);
		var Level: number = WikiSyntax.ParseGoalLevel(LabelLine);
		if (NodeType == GSNType.Goal) {
			ParentNode = this.GetStrategyOfGoal(Level);
		} else {
			ParentNode = (NodeType == GSNType.Context) ? this.LastNonContextNode : this.LastGoalNode;
//			if(ParentNode.GoalLevel != Level) {
//				Reader.LogError("mismatched level", Line);
//			}
		}
		if(this.NullableDoc != null) {
			LabelNumber = this.NullableDoc.CheckLabelNumber(ParentNode, NodeType, LabelNumber);
		}
		NewNode = new GSNNode(this.NullableDoc, ParentNode, NodeType, LabelNumber, HistoryTriple);
		if(this.FirstNode == null) {
			this.FirstNode = NewNode;
		}
		this.SetLastNode(NewNode);
		if(this.NullableDoc != null) {
			this.NullableDoc.AddNode(NewNode);
		}
		if (RefMap != null && HistoryTriple != null) {
			var RefKey: string = WikiSyntax.FormatRefKey(NodeType, LabelNumber, NewNode.GetHistoryTriple());
			RefMap.put(RefKey, NewNode);
		}
		if(RefNode != null) {
			NewNode.HasTag = RefNode.HasTag;
			NewNode.NodeDoc = RefNode.NodeDoc;
			NewNode.Digest = RefNode.Digest;
			return null;
		}
		return NewNode;
	}

	ParseNode(Reader: StringReader, RefMap: HashMap<string, GSNNode>): GSNNode {
		while (Reader.HasNext()) {
			var Line: string = Reader.ReadLine();
			if (Line.startsWith("*")) {
				Reader.RollbackLineFeed();
				break;
			}
			if(this.NullableDoc != null) {
				if (Line.startsWith("#")) {
					this.NullableDoc.Record.ParseHistoryTag(Line, Reader);
				} else {
					TagUtils.ParseTag(this.NullableDoc.DocTagMap, Line);
				}
			}
		}
		if(this.NullableDoc != null) {
			this.NullableDoc.UpdateDocHeader(Reader);
		}
		var LastNode: GSNNode = null;
		var LineList: Array<string> = new Array<string>();
		while (Reader.HasNext()) {
			var Line: string = Reader.ReadLine();
			if (Line.startsWith("*")) {
				if (Line.startsWith(Lib.VersionDelim)) {
					break;
				}
				if (this.IsValidSection(Line, Reader)) {
					this.UpdateContent(LastNode, LineList);
					LastNode = this.CreateNewNode(Line, RefMap, Reader);
					continue;
				}
			}
			LineList.add(Line);
		}
		this.UpdateContent(LastNode, LineList);
		return this.FirstNode;
	}

	private UpdateContent(LastNode: GSNNode, LineList: Array<string>): void {
		if (LastNode != null) {
			LastNode.SetContent(LineList);
		}
		LineList.clear();
	}

}

class AssureNoteParser {
	public  static merge(MasterFile: string, BranchFile: string): void {
		var MasterRecord: GSNRecord = new GSNRecord();
		MasterRecord.Parse(Lib.ReadFile(MasterFile));
		if(BranchFile != null) {
			var BranchRecord: GSNRecord = new GSNRecord();
			BranchRecord.Parse(Lib.ReadFile(BranchFile));
			MasterRecord.Merge(BranchRecord);
		}
		else {
			MasterRecord.RenumberAll();
		}
		var Writer: StringWriter = new StringWriter();
		MasterRecord.FormatRecord(Writer);
		console.log(Writer.toString());
	}
	
	public  static ts_merge(): void {
		var MasterFile: string = (Lib.Input.length > 0) ? Lib.Input[0] : null;
		var BranchFile: string = (Lib.Input.length > 1) ? Lib.Input[1] : null;
		var MasterRecord: GSNRecord = new GSNRecord();
		MasterRecord.Parse(MasterFile);
		if(BranchFile != null) {
			var BranchRecord: GSNRecord = new GSNRecord();
			BranchRecord.Parse(Lib.ReadFile(BranchFile));
			MasterRecord.Merge(BranchRecord);
		}
		else {
			MasterRecord.RenumberAll();
		}
		var Writer: StringWriter = new StringWriter();
		MasterRecord.FormatRecord(Writer);
		console.log(Writer.toString());
	}

	public  static main(argv: string[]): void {
		if(argv.length == 2) {
			AssureNoteParser.merge(argv[0], argv[1]);
		}
		if(argv.length == 1) {
			AssureNoteParser.merge(argv[0], null);
		}
//		if(argv.length == 0) {
//			try {
//				PdfConverter.main(argv);
//			} catch (Exception e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			} 
//		}
		console.log("Usage: AssureNoteParser file [margingfile]");
	}
}
/* lib/md5.js */
declare function unescape(str: string) : string;

/* FIXME this class is never used */
class PdfConverter {
	constructor () {}
	static main(args: string[]) {}
}

class StringBuilder {
	str : string;
	constructor() {
		this.str = "";
	}

	append(str) : void {
		this.str += str;
	}

	toString() : string {
		return this.str;
	}
}

class Character {
	static isDigit(c: number) : boolean {
		/* '0' ~ '9' */
		return 48 <= c && c <= 57;
	}

	static isWhitespace(c: number) : boolean {
		/* '\t' '\n' '\f' '\r' ' ' */
		return c == 9 || c == 10 || c == 12 || c == 13 || c == 32;;
	}
}

class SimpleDateFormat {
	constructor(format: string) {
		// Support format string, or is it needless?
	}

	fillZero(digit : number) : string {
		if (digit < 10) {
			return '0'+digit;
		} else {
			return ''+digit;
		}
	}

	parse(date: string) : Date {
		return new Date(date);
	}

	formatTimezone(timezoneOffset: number) : string {
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

	format(date: Date) : string {
		var y       : string = this.fillZero(date.getFullYear());
		var m       : string = this.fillZero(date.getMonth()+1);
		var d       : string = this.fillZero(date.getDate());
		var hr      : string = this.fillZero(date.getHours());
		var min     : string = this.fillZero(date.getMinutes());
		var sec     : string = this.fillZero(date.getSeconds());
		var timezone: string = this.formatTimezone(date.getTimezoneOffset());
		return y + '-' + m + '-' + d + 'T' + hr + ':' + min + ':' + sec + timezone;
	}
}

class HashMap <string, V>{
	/* the type of key must be either string or number */
	hash : {[key: string]: V};
	constructor() {
		this.hash = {};
	}
	put(key: string, value: V) : void {
		this.hash[key] = value;
	}

	get(key: string) : V {
		return this.hash[key];
	}

	size() : number {
		return Object.keys(this.hash).length;
	}

	clear() : void {
		this.hash = {};
	}

	keySet() : string[] {
		return Object.keys(this.hash);
	}

	toArray() : V[] {
		var res: V[] = [];
		for (var key in Object.keys(this.hash)) {
			res.push(this.hash[key]);
		}
		return res;
	}
}

class MessageDigest {
	digestString: string;
	constructor() {
		this.digestString = null;
	}

	digest() : string {
		return this.digestString;
	}
}

class Lib {
	/* To be set on lib/md5.js */
	static md5 : (str: string) => string;

	/* Static Fields */
	static Input: string[] = [];
	static EmptyNodeList = new Array<GSNNode>();
	static LineFeed : string = "\n";
	static VersionDelim : string = "*=====";

	/* Methods */
	static GetMD5() : MessageDigest {
		return new MessageDigest();
	}

	static UpdateMD5(md: MessageDigest, text: string) : void {
		md.digestString = Lib.md5(text);
	}

	static EqualsDigest(digest1: string, digest2: string) : boolean {
		return digest1 == digest2;
	}

	static ReadFile(file: string) : string {
		return "";
	}

	static parseInt(numText: string) : number {
		return Number(numText);
	}
}

class Iterator<T> {//FIX ME!!
}

interface Array {
        get(index: number): any;
        set(index: number, value: any): void;
        add(obj: any): void;
        add(index: number, obj : any): void;
        addAll(obj : any): void;
        size(): number;
        clear(): void;
        remove(index: number): any;
        remove(item: any): any;
        iterator(): Iterator<Array>;
}

Object.defineProperty(Array.prototype, "addAll", {
        enumerable : false,
        value : function(obj) {
			Array.prototype.push.apply(this, obj);
        }
});

Object.defineProperty(Array.prototype, "size", {
        enumerable : false,
        value : function() {
                return this.length;
        }
});

Object.defineProperty(Array.prototype, "add", {
        enumerable : false,
        value : function(arg1) {
                if(arguments.length == 1) {
                        this.push(arg1);
                } else {
                        var arg2 = arguments[1];
                        this.splice(arg1, 0, arg2);
                }
        }
});

Object.defineProperty(Array.prototype, "get", {
        enumerable : false,
        value : function(i) {
                if(i >= this.length){
                        throw new RangeError("invalid array index");
                }
                return this[i];
        }
});

Object.defineProperty(Array.prototype, "set", {
        enumerable : false,
        value : function(i, v) {
                this[i] = v;
        }
});

Object.defineProperty(Array.prototype, "remove", {
        enumerable : false,
        value : function(i) {
                if(typeof i == 'number') {
                        if(i >= this.length){
                                throw new RangeError("invalid array index");
                        }
                } else {
                        var item = i;
                        i = 0;
                        for (var j in this) {
                                if (this[j] === i) break;
                        }
                        if (j == this.length) return null;
                }
                var v = this[i];
                this.splice(i, 1);
                return v;
        }
});

Object.defineProperty(Array.prototype, "clear", {
        enumerable : false,
        value : function() {
                this.length = 0;
        }
});

interface Object {
        equals(other: any): boolean;
        InstanceOf(klass: any): boolean;
}

Object.defineProperty(Object.prototype, "equals", {
        enumerable : false,
        value : function(other) {
                return (this === other);
        }
});

Object.defineProperty(Object.prototype, "InstanceOf", {
        enumerable : false,
        value : function(klass) {
                return (<any>this).constructor == klass;
        }
});

interface String {
        compareTo(anotherString: string): number;
        startsWith(key: string): boolean;
        endsWith(key: string): boolean;
        lastIndexOf(ch: number) : number;
        indexOf(ch: number) : number;
        substring(BeginIdx : number, EndIdx : number) : string;
        matches(str : string) : boolean;
}

Object.defineProperty(String.prototype, "compareTo", {
        enumerable : false,
        value : function(anotherString) {
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
        enumerable : false,
        value : function(key) {
                return this.indexOf(key, 0) == 0;
        }
});

Object.defineProperty(String.prototype, "endsWith", {
        enumerable : false,
        value : function(key) {
                return this.lastIndexOf(key, 0) == 0;
        }
});

Object.defineProperty(String.prototype, "equals", {
        enumerable : false,
        value : function(other) {
                return (this == other);
        }
});

Object.defineProperty(String.prototype, "matches", {
        enumerable : false,
        value : function(str) {
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

(function ($) {
    'use strict';

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
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

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

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
        var i,
            output = '';
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
        var i,
            output = [];
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
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
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
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
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
}(Lib));
