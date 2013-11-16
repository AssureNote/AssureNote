package org.assurenote;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

class LibGSN {
	
	static MessageDigest GetMD5() {
		try {
			/*local*/MessageDigest digest = MessageDigest.getInstance("MD5");
			return digest;
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return null;
	}

	static void UpdateMD5(MessageDigest md, String Text) {
		md.update(Text.getBytes());
	}

	static void FormatDigest(byte[] Digest, StringWriter Writer) {
		if (Digest != null) {
			for (/*local*/int i = 0; i < Digest.length; i++) {
				/*local*/int hex = Digest[i] < 0 ? 256 + Digest[i] : Digest[i];
				// Stream.append(":");
				if (hex < 16) {
					Writer.print("0");
				}
				Writer.print(Integer.toString(hex, 16));
			}
		}
	}

	static boolean EqualsDigest(byte[] Digest, byte[] Digest2) {
		if (Digest != null && Digest2 != null) {
			for (/*local*/int i = 0; i < Digest.length; i++) {
				if (Digest[i] != Digest2[i])
					return false;
			}
			return true;
		}
		return Digest == null && Digest2 == null;
	}
	
}

class StringReader {
	/*field*/int CurrentPos;
	/*field*/int PreviousPos;
	/*field*/int Linenum;
	/*field*/String Text;

	StringReader/*constructor*/(String Text) {
		this.Text = Text;
		this.CurrentPos = 0;
		this.PreviousPos = 0;
		this.Linenum = 0;
	}

	boolean HasNext() {
		return this.CurrentPos < this.Text.length();
	}

	String ReadLine() {
		/*local*/int StartPos = this.CurrentPos;
		/*local*/int i;
		this.PreviousPos = this.CurrentPos;
		for (i = this.CurrentPos; i < this.Text.length(); i++) {
			/*local*/char ch = this.Text.charAt(i);
			if (ch == '\n') {
				/*local*/int EndPos = i;
				this.CurrentPos = i + 1;
				this.Linenum += 1;
				return this.Text.substring(StartPos, EndPos).trim();
			}
			if (ch == '\r') {
				/*local*/int EndPos = i;
				if (i + 1 < this.Text.length() && this.Text.charAt(i + 1) == '\n') {
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

	void RollbackLineFeed() {
		this.CurrentPos = this.PreviousPos;
		this.Linenum -= 1;
	}

	void ReadLineList(ArrayList<String> LineList, boolean UntilSection) {
		while(this.HasNext()) {
			String Line = this.ReadLine();
			if(UntilSection && Line.startsWith("*")) {
				this.RollbackLineFeed();
				break;
			}
			LineList.add(Line);
		}
	}

	ArrayList<String> GetLineList(boolean UntilSection) {
		ArrayList<String> LineList = new ArrayList<String>();
		this.ReadLineList(LineList, UntilSection);
		return LineList;
	}
	
	void LogError(String Message, String Line) {
		System.err.println("(error:" + this.Linenum + ") " + Message + ": " + Line);
	}
	
	void LogWarning(String Message, String Line) {
		System.err.println("(warning:" + this.Linenum + ") " + Message + ": " + Line);
	}

}

class StringWriter {
	public final static String LineFeed = "\n";
	/*field*/StringBuilder sb;

	StringWriter/*constructor*/() {
		this.sb = new StringBuilder();
	}

	void print(String s) {
		this.sb.append(s);
	}

	void println(String s) {
		this.sb.append(s);
		this.sb.append(LineFeed);
	}

	void println() {
		this.sb.append(LineFeed);
	}

	public String toString() {
		return sb.toString();
	}
}

enum GSNType {
	Goal, Context, Strategy, Evidence, Undefined;
}

class History {
	/*field*/int Rev;
	/*field*/String Author;
	/*field*/String Role;
	/*field*/String Date;
	/*field*/String Process;
	/*field*/GSNDoc Doc;

	History/*constructor*/(int Rev, String Author, String Role, String Date, String Process, GSNDoc Doc) {
		this.Rev = Rev;
		this.Author = Author;
		this.Role = Role;
		this.Date = Date;
		if (Date == null) {
			SimpleDateFormat Format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
			this.Date = Format.format(new Date());
		}
		this.Process = Process;
		this.Doc = Doc;
	}

	public String toString() {
		return this.Date + ";" + this.Author + ";" + this.Role + ";" + this.Process;
	}

	public boolean EqualsHistory(History aHistory) {
		return (this.Date.equals(aHistory.Date) && this.Author.equals(aHistory.Author));
	}

	public int CompareDate(History aHistory) {
		return (this.Date.compareTo(aHistory.Date));
	}

}

class WikiSyntax {
	public final static String VersionDelim = "=====";

	static int ParseInt(String NumText, int DefVal) {
		try {
			return Integer.parseInt(NumText);
		} catch (Exception e) {
		}
		return DefVal;
	}

	static int ParseGoalLevel(String LabelLine) {
		/*local*/int GoalLevel = 0;
		for (/*local*/int i = 0; i < LabelLine.length(); i++) {
			if (LabelLine.charAt(i) != '*') break;
			GoalLevel++;
		}
		return GoalLevel;
	}

	static String FormatGoalLevel(int GoalLevel) {
		/*local*/StringBuilder sb = new StringBuilder();
		for (/*local*/int i = 0; i < GoalLevel; i++) {
			sb.append('*');
		}
		return sb.toString();
	}

	static GSNType ParseNodeType(String LabelLine) {
		/*local*/int i;
		for (i = 0; i < LabelLine.length(); i++) {
			if (LabelLine.charAt(i) != '*') break;
		}
		for (; i < LabelLine.length(); i++) {
			if (LabelLine.charAt(i) != ' ') break;
		}
		if (i < LabelLine.length()) {
			char ch = LabelLine.charAt(i);
			if (ch == 'G') {
				return GSNType.Goal;
			}
			if (ch == 'C') {
				return GSNType.Context;
			}
			if (ch == 'E') {
				return GSNType.Evidence;
			}
			if (ch == 'S') {
				return GSNType.Strategy;
			}
		}
		return GSNType.Undefined;
	}

	static String FormatNodeType(GSNType NodeType) {
		switch (NodeType) {
		case Goal:
			return "G";
		case Context:
			return "C";
		case Strategy:
			return "S";
		case Evidence:
			return "E";
		case Undefined:
		}
		return "U";
	}

	static String ParseLabelNumber(String LabelLine) {
		/*local*/int StartIdx = -1;
		for (/*local*/int i = 0; i < LabelLine.length(); i++) {
			if (Character.isDigit(LabelLine.charAt(i))) {
				StartIdx = i;
				break;
			}
		}
		if (StartIdx != -1) {
			for (/*local*/int i = StartIdx + 1; i < LabelLine.length(); i++) {
				if (Character.isWhitespace(LabelLine.charAt(i))) {
					return LabelLine.substring(StartIdx, i);
				}
			}
			return LabelLine.substring(StartIdx);
		}
		return null;
	}

	public static String ParseRevisionHistory(String LabelLine) {
		/*local*/int Loc = LabelLine.indexOf("#");
		if (Loc != -1) {
			return LabelLine.substring(Loc).trim();
		}
		return null;
	}

	public static History[] ParseHistory(String LabelLine, GSNDoc BaseDoc) {
		if(BaseDoc != null) {
			/*local*/int Loc = LabelLine.indexOf("#");
			if (Loc != -1) {
				/*local*/History[] HistoryTriple = new History[3];
				/*local*/String RevText = LabelLine.substring(Loc + 1).trim();
				/*local*/String RevSet[] = RevText.split(":");
				HistoryTriple[0] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[0], -1)); // Created
				HistoryTriple[1] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[1], -1)); // Branched
				HistoryTriple[2] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[2], -1)); // LastModified
				if (HistoryTriple[0] == null || HistoryTriple[1] == null || HistoryTriple[2] == null) {
					return null;
				}
				return HistoryTriple;
			}
		}
		return null;
	}

	public static String FormatRefKey(GSNType NodeType, String LabelNumber, String HistoryTriple) {
		return WikiSyntax.FormatNodeType(NodeType) + LabelNumber + HistoryTriple;
	}

}

class TagUtils {
	static void ParseTag(HashMap<String, String> TagMap, String Line) {
		/*local*/int loc = Line.indexOf("::");
		if (loc != -1) {
			String Key = Line.substring(0, loc).toUpperCase().trim();
			String Value = Line.substring(loc + 2).trim();
			TagMap.put(Key, Value);
		}
	}

	static void FormatTag(HashMap<String, String> TagMap, StringWriter Writer) {
		if (TagMap != null) {
			for (/*local*/String Key : TagMap.keySet()) {
				Writer.println(Key + ":: " + TagMap.get(Key));
			}
		}
	}

	static void FormatHistoryTag(ArrayList<History> HistoryList, StringWriter Writer) {
		for (/*local*/int i = 0; i < HistoryList.size(); i++) {
			/*local*/History History = HistoryList.get(i);
			if (History != null) {
				Writer.println("#" + i + "::" + History);
			}
		}
	}

	static String GetString(HashMap<String, String> TagMap, String Key, String DefValue) {
		if (TagMap != null) {
			/*local*/String Value = TagMap.get(Key);
			if (Value != null) {
				return Value;
			}
		}
		return DefValue;
	}

	static int GetInteger(HashMap<String, String> TagMap, String Key, int DefValue) {
		if (TagMap != null) {
			return WikiSyntax.ParseInt(TagMap.get(Key), DefValue);
		}
		return DefValue;
	}
}

class GSNNode {
	/*field*/GSNDoc  BaseDoc;
	/*field*/GSNNode ParentNode;
	/*field*/ArrayList<GSNNode> SubNodeList;
	/*field*/GSNType NodeType;
	/*field*/int     GoalLevel; /* 1: top level */
	/*field*/String  LabelNumber; /* e.g, G1 G1.1 */
	/*field*/int     SectionCount;
	
	/*field*/History Created;
	/*field*/History Branched;
	/*field*/History LastModified;
	
	/*field*/String  NodeDoc;
	/*field*/boolean HasTag;
	/*field*/byte[]  Digest;
	/*field*/HashMap<String, String> TagMap;

	GSNNode/*constructor*/(GSNDoc BaseDoc, GSNNode ParentNode, int GoalLevel, GSNType NodeType, String LabelNumber, History[] HistoryTriple) {
		this.BaseDoc = BaseDoc;
		this.ParentNode = ParentNode;
		this.GoalLevel = GoalLevel;
		this.NodeType = NodeType;
		this.LabelNumber = LabelNumber;
		this.SectionCount = 0;
		this.SubNodeList = null;
		if (HistoryTriple != null) {
			this.Created = HistoryTriple[0];
			this.Branched = HistoryTriple[1];
			this.LastModified = HistoryTriple[2];
		} else {
			if(BaseDoc != null) {
				this.Created = BaseDoc.DocHistory;
			}
			else {
				this.Created = null;

			}
			this.Branched = this.Created;
			this.LastModified = this.Created;
		}
		this.Digest = null;
		this.NodeDoc = StringWriter.LineFeed;
		this.HasTag = false;
		if (this.ParentNode != null) {
			ParentNode.AppendSubNode(this);
		}
	}

	public GSNNode Duplicate(GSNDoc BaseDoc, GSNNode ParentNode) {
		/*local*/GSNNode NewNode = new GSNNode(BaseDoc, ParentNode, this.GoalLevel, this.NodeType, this.LabelNumber, null);
		NewNode.Created = this.Created;
		NewNode.Branched = this.Branched;
		NewNode.LastModified = this.LastModified;
		NewNode.Digest = this.Digest;
		NewNode.NodeDoc = this.NodeDoc;
		NewNode.HasTag = this.HasTag;
		if(BaseDoc != null) {
			BaseDoc.UncheckAddNode(NewNode);
		}
		if (this.SubNodeList != null) {
			for (/*local*/GSNNode Node : this.SubNodeList) {
				Node.Duplicate(BaseDoc, NewNode);
			}
		}
		return NewNode;
	}

	public boolean IsGoal() {
		return (this.NodeType == GSNType.Goal);
	}
	public boolean IsStrategy() {
		return (this.NodeType == GSNType.Strategy);
	}
	public boolean IsContext() {
		return (this.NodeType == GSNType.Context);
	}
	public boolean IsEvidence() {
		return (this.NodeType == GSNType.Evidence);
	}

	public void Remap(HashMap<String, GSNNode> NodeMap) {
		NodeMap.put(this.GetLabel(), this);
		if(this.SubNodeList != null) {
			for(/*local*/GSNNode Node : this.SubNodeList) {
				Node.Remap(NodeMap);
			}
		}
	}
	
	String GetLabel() {
		String Label = WikiSyntax.FormatNodeType(this.NodeType) + this.LabelNumber;
		return Label;
	}
	
	String GetHistoryTriple() {
		return "#" + this.Created.Rev + ":" + this.Branched.Rev + ":" + this.LastModified.Rev;
	}

	boolean IsModified() {
		return this.LastModified == this.BaseDoc.DocHistory;
	}
	
	void SetContent(ArrayList<String> LineList) {
		byte[] OldDigest = this.Digest;
		/*local*/int LineCount = 0;
		/*local*/StringWriter Writer = new StringWriter();
		/*local*/MessageDigest md = LibGSN.GetMD5();
		for (/*local*/String Line : LineList) {
			/*local*/int Loc = Line.indexOf("::");
			if (Loc > 0) {
				this.HasTag = true;
			}
			Writer.println();
			Writer.print(Line);
			if (Line.length() > 0) {
				LibGSN.UpdateMD5(md, Line);
				LineCount += 1;
			}
		}
		if (LineCount > 0) {
			this.Digest = md.digest();
			this.NodeDoc = Writer.toString();
		} else {
			this.Digest = null;
			this.NodeDoc = StringWriter.LineFeed;
		}
		if(!LibGSN.EqualsDigest(OldDigest, this.Digest) && this.BaseDoc != null) {
			this.LastModified = this.BaseDoc.DocHistory;
		}		
	}

	void UpdateContent(String TextDoc) {
		this.SetContent(new StringReader(TextDoc).GetLineList(true/*UntilSection*/));
	}
	
	private void AppendSubNode(GSNNode Node) {
		assert(Node.BaseDoc == this.BaseDoc);
		if (this.SubNodeList == null) {
			this.SubNodeList = new ArrayList<GSNNode>();
		}
		this.SubNodeList.add(Node);
	}

	boolean HasSubNode(GSNType NodeType) {
		if (this.SubNodeList != null) {
			for (/*local*/int i = this.SubNodeList.size() - 1; i >= 0; i--) {
				/*local*/GSNNode Node = this.SubNodeList.get(i);
				if (Node.NodeType == NodeType) {
					return true;
				}
			}
		}
		return false;
	}

	GSNNode GetCloseGoal() {
		/*local*/GSNNode Node = this;
		while (Node.NodeType != GSNType.Goal) {
			Node = Node.ParentNode;
		}
		return Node;
	}

	HashMap<String, String> GetTagMap() {
		if (this.TagMap == null && this.HasTag) {
			this.TagMap = new HashMap<String, String>();
			/*local*/StringReader Reader = new StringReader(this.NodeDoc);
			while (Reader.HasNext()) {
				/*local*/String Line = Reader.ReadLine();
				/*local*/int Loc = Line.indexOf("::");
				if (Loc > 0) {
					TagUtils.ParseTag(this.TagMap, Line);
				}
			}
		}
		return this.TagMap;
	}

	GSNNode GetLastNode(GSNType NodeType, boolean Creation) {
		if (this.SubNodeList != null) {
			for (/*local*/int i = this.SubNodeList.size() - 1; i >= 0; i--) {
				/*local*/GSNNode Node = this.SubNodeList.get(i);
				if (Node.NodeType == NodeType) {
					return Node;
				}
			}
		}
		if (NodeType == GSNType.Strategy && Creation) {
			return new GSNNode(this.BaseDoc, this, this.GoalLevel, GSNType.Strategy, this.LabelNumber, null);
		}
		return null;
	}

	void FormatNode(HashMap<String, GSNNode> RefMap, StringWriter Writer) {
		Writer.print(WikiSyntax.FormatGoalLevel(this.GoalLevel));
		Writer.print(" ");
		Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
		Writer.print(this.LabelNumber);
		// Stream.append(" ");
		// MD5.FormatDigest(this.Digest, Stream);
		/*local*/String RefKey = null;
		/*local*/GSNNode RefNode = null;
		if (this.Created != null) {
			/*local*/String HistoryTriple = this.GetHistoryTriple();
			Writer.print(" " + HistoryTriple);
			RefKey = WikiSyntax.FormatRefKey(this.NodeType, this.LabelNumber, HistoryTriple);
			RefNode = RefMap.get(RefKey);
		}
		if (RefNode == null) {
			Writer.print(this.NodeDoc);
			if (this.Digest != null) {
				Writer.println();
			}
			if (RefKey != null) {
				RefMap.put(RefKey, this);
			}
		} else {
			Writer.println();
		}
		if (this.SubNodeList != null) {
			for (/*local*/GSNNode Node : this.SubNodeList) {
				Node.FormatNode(RefMap, Writer);
			}
		}
	}

	// SubNode
	void FormatSubNode(int GoalLevel, StringWriter Writer) {
		Writer.print(WikiSyntax.FormatGoalLevel(GoalLevel));
		Writer.print(" ");
		Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
		Writer.print(this.LabelNumber);
		// Stream.append(" ");
		// MD5.FormatDigest(this.Digest, Stream);
		Writer.print(this.NodeDoc);
		if (this.Digest != null) {
			Writer.println();
		}
		if (this.SubNodeList != null) {
			for (/*local*/GSNNode Node : this.SubNodeList) {
				Node.FormatSubNode(Node.IsGoal() ? GoalLevel+1 : GoalLevel, Writer);
			}
		}
	}
	
	void ReplaceSubNode(String DocText) {
		/*local*/StringReader Reader = new StringReader(DocText);
		/*local*/ParserContext Parser = new ParserContext(null, this.ParentNode);
		/*local*/GSNNode NewNode = Parser.ParseNode(Reader, null);
		if(NewNode != null) {
			this.MergeSubNode(NewNode, null);
			if(this.ParentNode != null) {
				for(/*local*/int i = 0; i < this.ParentNode.SubNodeList.size(); i++) {
					if(this.ParentNode.SubNodeList.get(i) == this) {
						this.ParentNode.SubNodeList.set(i, NewNode);
					}
				}
			}
			else {
				this.BaseDoc.TopGoal = NewNode;
			}
			this.BaseDoc.RemapNodeMap();
		}
	}

	boolean HasSubNodeLabel(String Label) {
		if(Label.equals(this.GetLabel())) {
			return true;
		}
		if(this.SubNodeList != null) {
			for(GSNNode SubNode : this.SubNodeList) {
				if(SubNode.HasSubNodeLabel(Label)) return true;
			}
		}
		return false;
	}
	
	void MergeSubNode(GSNNode NewNode, HashMap<String,String> LabelMap) {
		assert(this.BaseDoc != null);
		assert(NewNode.BaseDoc != null);
		if(NewNode.LabelNumber != null) {
			/*local*/String Label = NewNode.GetLabel();
			/*local*/GSNNode OldNode = this.BaseDoc.GetNode(Label);
			if(OldNode != null && this.HasSubNodeLabel(Label)) {
				NewNode.Created = OldNode.Created;
				if(LibGSN.EqualsDigest(OldNode.Digest, NewNode.Digest)) {
					NewNode.LastModified = OldNode.LastModified;
				}
				else {
					NewNode.LastModified = this.BaseDoc.DocHistory;					
				}
			}
		}
		if(NewNode.LastModified == null) {
			String NewLabelNumber = this.BaseDoc.CheckLabelNumber(NewNode.ParentNode, this.NodeType, null);
			if(LabelMap != null && this.LabelNumber != null) {
				LabelMap.put(NewNode.GetLabel(), WikiSyntax.FormatNodeType(NewNode.NodeType) + NewLabelNumber);
			}
			NewNode.LabelNumber = NewLabelNumber;
			NewNode.Created = this.BaseDoc.DocHistory;
			NewNode.LastModified = this.BaseDoc.DocHistory;	
		}
		NewNode.BaseDoc = this.BaseDoc;
		if(this.SubNodeList != null) {
			for(GSNNode SubNode : this.SubNodeList) {
				this.MergeSubNode(SubNode, LabelMap);
			}
		}
	}

	// Merge
	boolean IsNewerTree(int ModifiedRev) {
		if (ModifiedRev <= this.LastModified.Rev) {
			if (this.SubNodeList != null) {
				for (/*local*/GSNNode Node : this.SubNodeList) {
					if (!Node.IsNewerTree(ModifiedRev)) {
						return false;
					}
				}
			}
			return true;
		}
		return false;
	}

	public void Merge(GSNDoc MasterDoc, int ModifiedRev, ArrayList<GSNNode> ConflictList) {
		if (ModifiedRev <= this.LastModified.Rev) {
			GSNNode MasterNode = MasterDoc.GetNode(this.GetLabel());
			if (MasterNode == null || MasterNode.Created.Rev != this.Created.Rev) { // new node
			// GSNNode MasterParentNode =
			// MasterDoc.GetNode(this.ParentNode.GetLabel());
			// if(MasterParentNode != null) {
			// this.MoveWithNewLabel(MasterDoc, MasterParentNode);
			// this.ParentNode = MasterParentNode;
			// MasterParentNode.AppendSubNode(this);
			// }
			// return;
			}
			if (MasterNode.LastModified.Rev == this.Branched.Rev) {
				MasterNode.NodeDoc = this.NodeDoc;
				MasterNode.Digest = this.Digest;
				MasterNode.HasTag = this.HasTag;
				MasterNode.Branched = this.Branched;
				MasterNode.LastModified = this.LastModified;
			} else {
				ConflictList.add(this);
			}
			if (this.SubNodeList != null) {
				for (/*loal*/GSNNode Node : this.SubNodeList) {
					Node.Merge(MasterDoc, ModifiedRev, ConflictList);
				}
			}
		}
	}

}

class GSNDoc {
	/*field*/GSNRecord Record;
	/*field*/GSNNode   TopGoal;
	/*field*/HashMap<String, GSNNode> NodeMap;
	/*field*/HashMap<String, String> DocTagMap;
	/*field*/History   DocHistory;
	/*field*/int GoalCount;

	GSNDoc(GSNRecord Record) {
		this.Record = Record;
		this.TopGoal = null;
		this.NodeMap = new HashMap<String, GSNNode>();
		this.DocTagMap = new HashMap<String, String>();
		this.DocHistory = null;
		this.GoalCount = 0;
	}

	GSNDoc Duplicate(String Author, String Role, String Date, String Process) {
		/*local*/GSNDoc NewDoc = new GSNDoc(this.Record);
		NewDoc.GoalCount = this.GoalCount;
		NewDoc.DocHistory = this.Record.NewHistory(Author, Role, Date, Process, NewDoc);
		NewDoc.DocTagMap = this.DuplicateTagMap(this.DocTagMap);
		if (this.TopGoal != null) {
			NewDoc.TopGoal = this.TopGoal.Duplicate(NewDoc, null);
		}
		return NewDoc;
	}

	HashMap<String, String> DuplicateTagMap(HashMap<String, String> TagMap) {
		if (TagMap != null) {
			/*local*/HashMap<String, String> NewMap = new HashMap<String, String>();
			for (/*local*/String Key : TagMap.keySet()) {
				NewMap.put(Key, TagMap.get(Key));
			}
			return NewMap;
		}
		return null;
	}

	void UpdateDocHeader(StringReader Reader) {
		/*local*/int Revision = TagUtils.GetInteger(this.DocTagMap, "Revision", -1);
		if (Revision != -1) {
			this.DocHistory = this.Record.GetHistory(Revision);
			if (this.DocHistory != null) {
				this.DocHistory.Doc = this;
			}
		}
		if(this.DocHistory == null) {
			String Author = TagUtils.GetString(this.DocTagMap, "Author", "unknown");
			String Role = TagUtils.GetString(this.DocTagMap, "Role", "converter");
			String Date = TagUtils.GetString(this.DocTagMap, "Date", null);
			String Process = TagUtils.GetString(this.DocTagMap, "Process", "-");
			this.DocHistory = this.Record.NewHistory(Author, Role, Date, Process, this);
		}
	}

	public GSNNode GetNode(String Label) {
		return this.NodeMap.get(Label);
	}

	void UncheckAddNode(GSNNode Node) {
		this.NodeMap.put(Node.GetLabel(), Node);
	}

	void AddNode(GSNNode Node) {
		/*local*/String Key = Node.GetLabel();
		/*local*/GSNNode OldNode = this.NodeMap.get(Key);
		if (OldNode != null) {
			if (LibGSN.EqualsDigest(OldNode.Digest, Node.Digest)) {
				Node.Created = OldNode.Created;
			}
		}
		this.NodeMap.put(Key, Node);
		if (Node.NodeType == GSNType.Goal) {
			if (Node.GoalLevel == 1) {
				this.TopGoal = Node;
			}
			/*local*/int num = WikiSyntax.ParseInt(Node.LabelNumber, 0);
			if (num > this.GoalCount) {
				this.GoalCount = num;
			}
		}
	}

	private String UniqueNumber(GSNType NodeType, String LabelNumber) {
		/*local*/GSNNode Node = this.NodeMap.get(WikiSyntax.FormatNodeType(NodeType) + LabelNumber);
		if (Node == null) {
			return LabelNumber;
		}
		return this.UniqueNumber(NodeType, LabelNumber + "'");
	}

	String CheckLabelNumber(GSNNode ParentNode, GSNType NodeType, String LabelNumber) {
		if (LabelNumber == null) {
			if (NodeType == GSNType.Goal) {
				this.GoalCount += 1;
				LabelNumber = "" + this.GoalCount;
			} else {
				/*local*/GSNNode GoalNode = ParentNode.GetCloseGoal();
				/*local*/GoalNode.SectionCount += 1;
				LabelNumber = GoalNode.LabelNumber + "." + GoalNode.SectionCount;
			}
		}
		return this.UniqueNumber(NodeType, LabelNumber);
	}


	void RemapNodeMap() {
		/*local*/HashMap<String, GSNNode> NodeMap = new HashMap<String, GSNNode>();
		if(this.TopGoal != null) {
			this.TopGoal.Remap(NodeMap);
		}
		this.NodeMap = NodeMap;
	}

	void RemoveNode(GSNNode Node) {
		assert(this == Node.BaseDoc);
		if(Node.ParentNode != null) {
			Node.ParentNode.SubNodeList.remove(Node);
		}
		this.RemapNodeMap();
	}
	
	void FormatDoc(HashMap<String, GSNNode> NodeRef, StringWriter Stream) {
		if (this.TopGoal != null) {
			Stream.println("Revision:: " + this.DocHistory.Rev);
			this.TopGoal.FormatNode(NodeRef, Stream);
		}
	}
}


class GSNRecord {
	/*field*/ArrayList<History> HistoryList;
	/*field*/ArrayList<GSNDoc>  DocList;
	/*field*/GSNDoc             EditingDoc;

	GSNRecord() {
		this.HistoryList = new ArrayList<History>();
		this.DocList = new ArrayList<GSNDoc>();
		this.EditingDoc = null;
	}

	History GetHistory(int Rev) {
		if (Rev < this.HistoryList.size()) {
			return this.HistoryList.get(Rev);
		}
		return null;
	}

	History NewHistory(String Author, String Role, String Date, String Process, GSNDoc Doc) {
		/*local*/History History = new History(this.HistoryList.size(), Author, Role, Date, Process, Doc);
		this.HistoryList.add(History);
		return History;
	}

	void AddHistory(int Rev, String Author, String Role, String Date, String Process, GSNDoc Doc) {
		if(Rev >= 0) {
			/*local*/History History = new History(Rev, Author, Role, Date, Process, Doc);
			while (!(Rev < this.HistoryList.size())) {
				this.HistoryList.add(null);
			}
			this.HistoryList.set(Rev, History);
		}
	}

	void ParseHistoryTag(String Line, StringReader Reader) {
		/*local*/int loc = Line.indexOf("::");
		if (loc != -1) {
			/*local*/String Key = Line.substring(0, loc).trim();
			try {
				/*local*/String Value = Line.substring(loc + 2).trim();
				/*local*/String[] Records = Value.split(";");
				this.AddHistory(WikiSyntax.ParseInt(Key.substring(1), -1), Records[2], Records[0], Records[1], Records[3], null);
			} catch (Exception e) { // any parse errors are ignored
				Reader.LogError("Invalid format of history tag", e.getMessage());
			}
		}
	}

	void Parse(String TextDoc) {
		/*local*/HashMap<String, GSNNode> RefMap = new HashMap<String, GSNNode>();
		/*local*/StringReader Reader = new StringReader(TextDoc);
		while (Reader.HasNext()) {
			/*local*/GSNDoc Doc = new GSNDoc(this);
			ParserContext Parser = new ParserContext(Doc, null);
			Doc.TopGoal = Parser.ParseNode(Reader, RefMap);
			this.DocList.add(Doc);
		}
	}
	
	void CheckHistory() {
		/*local*/int Rev = 0;
		for (/*local*/int i = this.DocList.size() - 1; i >= 0; i--) {
			/*local*/GSNDoc Doc = this.DocList.get(i);
			if (Doc.DocHistory == null) {
				/*local*/History History = this.GetHistory(Rev);
				if (History == null) {
					String Author = TagUtils.GetString(Doc.DocTagMap, "Author", "-");
					String Role = TagUtils.GetString(Doc.DocTagMap, "Role", "-");
					String Date = TagUtils.GetString(Doc.DocTagMap, "Date", "-");
					String Process = TagUtils.GetString(Doc.DocTagMap, "Process", "-");
					this.AddHistory(Rev, Author, Role, Date, Process, Doc);
				}
				Doc.DocHistory = History;
			}
			Rev++;
		}
	}

	// public void Renumber() {
	// HashMap<String, String> LabelMap = new HashMap<String, String>();
	// GSNDoc LatestDoc = this.DocList.get(0);
	// if(LatestDoc.TopGoal != null) {
	// LatestDoc.TopGoal.CreateLabelMap(1, LabelMap);
	// }
	// for(GSNDoc Doc : this.DocList) {
	// if(Doc.TopGoal != null) {
	// Doc.TopGoal.Renumber(LabelMap);
	// }
	// }
	// }

	public void StartToEdit(String Author, String Role, String Date, String Process) {
		if (this.EditingDoc == null) {
			if (this.DocList.size() > 0) {
				this.EditingDoc = this.DocList.get(0).Duplicate(Author, Role, Date, Process);
			} else {
				this.EditingDoc = new GSNDoc(this);
				this.EditingDoc.DocHistory = this.NewHistory(Author, Role, Date, Process, this.EditingDoc);
			}
		}
	}

	public void Commit() {
		// TODO Auto-generated method stub
	}

	public void Merge(GSNRecord BranchRecord) {
		/*local*/int CommonRev = this.HistoryList.size();
		/*local*/boolean IsLinearHistory = true;
		for (/*local*/int Rev = 0; Rev < BranchRecord.HistoryList.size(); Rev++) {
			/*local*/History BranchHistory = BranchRecord.GetHistory(Rev);
			/*local*/History MasterHistory = this.GetHistory(Rev);
			if (MasterHistory == null || !MasterHistory.EqualsHistory(BranchHistory)) {
				if (BranchHistory.Rev != this.HistoryList.size()) {
					IsLinearHistory = false;
				}
				BranchHistory.Rev = this.HistoryList.size();
				this.HistoryList.add(BranchHistory);
			}
		}
		if (IsLinearHistory) {
			for (/*local*/int i = CommonRev; i < BranchRecord.DocList.size(); i++) {
				/*local*/GSNDoc BranchDoc = BranchRecord.DocList.get(i);
				BranchDoc.Record = this;
				this.DocList.add(BranchDoc);
			}
		} else {
			/*local*/ArrayList<GSNNode> ConflictList = new ArrayList<GSNNode>();
			/*local*/GSNDoc Doc = BranchRecord.GetLatestDoc();
			Doc.TopGoal.Merge(this.GetLatestDoc(), CommonRev, ConflictList);
			// for(GSNNode BranchNode : MergedNodeList) {
			// String Label = BranchNode.GetLabel();
			// GSNNode MasterNode = Doc.NodeMap.get(Label);
			// if(MasterNode != null || MasterNode.Created.Rev ==
			// BranchNode.Created.Rev) {
			// if(MasterNode.IsSameParent(BranchNode)) {
			// if(MasterNode.LastModified.Rev == BranchNode.Branched.Rev) {
			// MasterNode.NodeDoc = BranchNode.NodeDoc;
			// MasterNode.Digest = BranchNode.Digest;
			// MasterNode.HasTag = BranchNode.HasTag;
			// MasterNode.Branched = BranchNode.Branched;
			// MasterNode.LastModified = BranchNode.LastModified;
			// }
			// else {
			// MasterNode.ConflictedWith(BranchNode.NodeDoc);
			// }
			// }
			// }
			// }
		}
	}

	GSNDoc GetLatestDoc() {
		if (this.DocList.size() > 0) {
			this.DocList.get(this.DocList.size() - 1);
		}
		return null;
	}

	public void FormatRecord(StringWriter Writer) {
		/*local*/HashMap<String, GSNNode> RefMap = new HashMap<String, GSNNode>();
		TagUtils.FormatHistoryTag(this.HistoryList, Writer);
		for (int i = 0; i < this.DocList.size(); i++) {
			GSNDoc Doc = this.DocList.get(i);
			Doc.FormatDoc(RefMap, Writer);
			if (i != this.DocList.size() - 1) {
				Writer.println(WikiSyntax.VersionDelim);
			}
		}
	}

}

class ParserContext {
	/*field*/GSNDoc NullableDoc;
	/*field*/ArrayList<GSNNode> GoalStackList;
	/*field*/GSNNode FirstNode;
	/*field*/GSNNode LastGoalNode;
	/*field*/GSNNode LastNonContextNode;

	ParserContext(GSNDoc NullableDoc, GSNNode ParentNode) {
		if(ParentNode == null) {
			ParentNode = new GSNNode(NullableDoc, null, 0, GSNType.Goal, null, null);
		}
		this.NullableDoc = NullableDoc;  // nullabel
		this.FirstNode = null;
		this.LastGoalNode = null;
		this.LastNonContextNode = null;
		this.GoalStackList = new ArrayList<GSNNode>();
		this.SetLastNode(ParentNode);
	}

	void SetLastNode(GSNNode Node) {
		if(Node.IsGoal()) {
			this.LastGoalNode = Node;
			this.SetGoalStackAt(Node);
		}
		if(!Node.IsContext()) {
			this.LastNonContextNode = Node;			
		}
		else {
			this.LastNonContextNode = null;
		}
	}
	
	GSNNode GetParentNodeOfGoal(int Level) {
		if (Level - 1 < this.GoalStackList.size()) {
			/*local*/GSNNode ParentGoal = this.GoalStackList.get(Level - 1);
			if (ParentGoal != null) {
				return ParentGoal.GetLastNode(GSNType.Strategy, true/*Creation*/);
			}
		}
		return null;
	}

	GSNNode GetGoalStackAt(int Level) {
		if (Level < this.GoalStackList.size()) {
			return this.GoalStackList.get(Level);
		}
		return null;
	}

	void SetGoalStackAt(GSNNode Node) {
		while (this.GoalStackList.size() < Node.GoalLevel + 1) {
			this.GoalStackList.add(null);
		}
		this.GoalStackList.set(Node.GoalLevel, Node);
	}

	boolean IsValidSection(String Line, StringReader Reader) {
		/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(Line);
		if (NodeType == GSNType.Goal) {
			/*local*/int Level = WikiSyntax.ParseGoalLevel(Line);
			/*local*/GSNNode ParentNode = this.GetParentNodeOfGoal(Level);
			if (ParentNode != null) {
				return true;
			}
			Reader.LogError("Mismatched goal level < " + (this.GoalStackList.size() + 2), Line);
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

	GSNNode CreateNewNode(String LabelLine, HashMap<String, GSNNode> RefMap, StringReader Reader) {
		/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(LabelLine);
		/*local*/String LabelNumber = WikiSyntax.ParseLabelNumber(LabelLine);
		/*local*/String RevisionHistory = WikiSyntax.ParseRevisionHistory(LabelLine);
		/*local*/GSNNode RefNode = null;
		/*local*/GSNNode NewNode = null;
		if (RefMap != null && LabelNumber != null && RevisionHistory != null) {
			/*local*/String RefKey = WikiSyntax.FormatRefKey(NodeType, LabelNumber, RevisionHistory);
			RefNode = RefMap.get(RefKey);
		}
		/*local*/GSNNode ParentNode = null;
		/*local*/History[] HistoryTriple = WikiSyntax.ParseHistory(LabelLine, this.NullableDoc);
		/*local*/int Level = WikiSyntax.ParseGoalLevel(LabelLine);
		if (NodeType == GSNType.Goal) {
			ParentNode = this.GetParentNodeOfGoal(Level);
		} else {
			ParentNode = (NodeType == GSNType.Context) ? this.LastNonContextNode : this.LastGoalNode;
//			if(ParentNode.GoalLevel != Level) {
//				Reader.LogError("mismatched level", Line);
//			}
			Level = ParentNode.GoalLevel;
		}
		if(this.NullableDoc != null) {
			LabelNumber = this.NullableDoc.CheckLabelNumber(ParentNode, NodeType, LabelNumber);
		}
		NewNode = new GSNNode(this.NullableDoc, ParentNode, Level, NodeType, LabelNumber, HistoryTriple);
		if(this.FirstNode == null) {
			this.FirstNode = NewNode;
		}
		this.SetLastNode(NewNode);
		if(this.NullableDoc != null) {
			this.NullableDoc.AddNode(NewNode);
		}
		if (RefMap != null && HistoryTriple != null) {
			/*local*/String RefKey = WikiSyntax.FormatRefKey(NodeType, LabelNumber, NewNode.GetHistoryTriple());
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

	GSNNode ParseNode(StringReader Reader, HashMap<String, GSNNode> RefMap) {
		while (Reader.HasNext()) {
			/*local*/String Line = Reader.ReadLine();
			if (Line.startsWith("*") || Line.startsWith(WikiSyntax.VersionDelim)) {
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
		/*local*/GSNNode LastNode = null;
		/*local*/ArrayList<String> LineList = new ArrayList<String>();
		while (Reader.HasNext()) {
			/*local*/String Line = Reader.ReadLine();
			if (Line.startsWith(WikiSyntax.VersionDelim)) {
				break;
			}
			if (Line.startsWith("*")) {
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

	private void UpdateContent(GSNNode LastNode, ArrayList<String> LineList) {
		if (LastNode != null) {
			LastNode.SetContent(LineList);
		}
		LineList.clear();
	}

}


public class AssureNoteParser {
	public static String ReadFile(String File) {
		/*local*/StringWriter sb = new StringWriter();
		try {
			/*local*/BufferedReader br = new BufferedReader(new FileReader(File));
			/*local*/String Line;
			/*local*/int linenum = 0;
			while ((Line = br.readLine()) != null) {
				if (linenum > 0) {
					sb.print(StringWriter.LineFeed);
				}
				sb.print(Line);
				linenum++;
			}
			br.close();
		} catch (IOException e) {
			System.err.println("cannot open: " + File);
			System.exit(1);
		}
		return sb.toString();
	}
	
//	public final Srting initData
//		= "*G\n"
//		+ "*C\n"
//		+ "*S\n"
//		+ "**G\n"
//		+ "**G\n"
//		+ "must be G3.\n"
//		+ "**C\n"
//		+ "**G\n";
//	
//	public final static void test() {
//		GSNRecord Record = new GSNRecord();
//		Record.StartToEdit("Robbin", "Master", null, "Planing");
//		GSNDoc Doc = Record.GetEditingDoc();
//		Doc.UpdateNode(null, Reader, RefMap);
//	}
	
	public final static void cat(String[] argv) {
		/*local*/GSNRecord Record = new GSNRecord();
		for(int i = 1; i < argv.length; i++) {
			String TextDoc = ReadFile(argv[i]);
			Record.Parse(TextDoc);
		}
		/*local*/StringWriter Writer = new StringWriter();
		Record.FormatRecord(Writer);
		System.out.println(Writer.toString());
		System.exit(0);
	}
	
	public final static void main(String[] argv) {
		if(argv.length > 1) {
			if(argv[0].equals("-c")) {
				cat(argv);
			}
		}
		System.out.println("Usage: AssureNoteParser");
		System.out.println(" -c files: join files");
//		
//		/*local*/String TextDoc = ReadFile(file[0]);
//		/*local*/GSNRecord Record = new GSNRecord();
//		Record.Parse(TextDoc);
//		// Record.StartToEdit("u", "r", "d", "p");
//		// Record.GetEditingNode();
//		// Record.ApplyTemplate("Label", Template);
//		// Record.Commit();
//		// Record.Merge(Record);
//		/*local*/StringWriter Writer = new StringWriter();
//		Record.FormatRecord(Writer);
//		System.out.println("--------\n" + Writer.toString());
	}
}
