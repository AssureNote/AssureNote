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

class StringReader {
	/*field*/int CurrentPos;
	/*field*/int PreviousPos;
	/*field*/String Text;

	StringReader(String Text) {
		this.Text = Text;
		this.CurrentPos = 0;
		this.PreviousPos = 0;
	}

	boolean HasNext() {
		return this.CurrentPos < this.Text.length();
	}

	String ReadLine() {
		/*local*/int StartPos = this.CurrentPos;
		this.PreviousPos = this.CurrentPos;
		/*local*/int i;
		for (i = this.CurrentPos; i < this.Text.length(); i++) {
			/*local*/char ch = this.Text.charAt(i);
			if (ch == '\n') {
				/*local*/int EndPos = i;
				this.CurrentPos = i + 1;
				return this.Text.substring(StartPos, EndPos).trim();
			}
			if (ch == '\r') {
				/*local*/int EndPos = i;
				if (i + 1 < this.Text.length()
						&& this.Text.charAt(i + 1) == '\n') {
					i++;
				}
				this.CurrentPos = i + 1;
				return this.Text.substring(StartPos, EndPos).trim();
			}
		}
		this.CurrentPos = i;
		if (StartPos == this.CurrentPos) {
			return null;
		}
		return this.Text.substring(StartPos, this.CurrentPos).trim();
	}

	public void LineBack() {
		this.CurrentPos = this.PreviousPos;
	}
}

class StringWriter {
	public final static String LineFeed = "\n";
	/*field*/StringBuilder sb;

	StringWriter() {
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

	History(int Rev, String Author, String Role, String Date, String Process, GSNDoc Doc) {
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
		return this.Author + ";" + this.Role + ";" + this.Date + ";" + this.Process;
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

	public static String ParseRevisionHistory(String LabelLine, GSNRecord Record) {
		/*local*/int Loc = LabelLine.indexOf("#");
		if (Loc != -1) {
			return LabelLine.substring(Loc).trim();
		}
		return null;
	}

	public static History[] ParseHistory(String LabelLine, GSNRecord Record) {
		/*local*/int Loc = LabelLine.indexOf("#");
		if (Loc != -1) {
			/*local*/History[] HistoryTriple = new History[3];
			/*local*/String RevText = LabelLine.substring(Loc + 1).trim();
			/*local*/String RevSet[] = RevText.split(":");
			HistoryTriple[0] = Record.GetHistory(WikiSyntax.ParseInt(RevSet[0], -1)); // Created
			HistoryTriple[1] = Record.GetHistory(WikiSyntax.ParseInt(RevSet[1], -1)); // Branched
			HistoryTriple[2] = Record.GetHistory(WikiSyntax.ParseInt(RevSet[2], -1)); // LastModified
			if (HistoryTriple[0] == null || HistoryTriple[1] == null || HistoryTriple[2] == null) {
				return null;
			}
			return HistoryTriple;
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
			String Value = Line.substring(loc + 1).trim();
			TagMap.put(Key, Value);
		}
	}

	static void ParseHistoryTag(GSNRecord Record, String Line) {
		/*local*/int loc = Line.indexOf("::");
		if (loc != -1) {
			/*local*/String Key = Line.substring(0, loc).trim();
			try {
				/*local*/String Value = Line.substring(loc + 1).trim();
				/*local*/String[] Records = Value.split(";");
				Record.AddHistory(Integer.parseInt(Key.substring(1)), Records[0], Records[1], Records[2], Records[3]);
			} catch (Exception e) { // any parse errors are ignored
			}
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

class MD5 {
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

class GSNNode {
	/*field*/GSNDoc BaseDoc;
	/*field*/GSNNode ParentNode;
	/*field*/ArrayList<GSNNode> SubNodeList;
	/*field*/GSNType NodeType;
	/*field*/int    GoalLevel; /* 1: top level */
	/*field*/String LabelNumber; /* e.g, G1 G1.1 */
	/*field*/int SectionCount;
	
	/*field*/History Created;
	/*field*/History Branched;
	/*field*/History LastModified;
	
	/*field*/String  NodeDoc;
	/*field*/boolean HasTag;
	/*field*/byte[]  Digest;
	/*field*/HashMap<String, String> TagMap;

	GSNNode(GSNDoc BaseDoc, GSNNode ParentNode, int GoalLevel, GSNType NodeType, String LabelNumber, History[] HistoryTriple) {
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
			this.Created = BaseDoc.DocHistory;
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
		BaseDoc.UncheckAddNode(NewNode);
		if (this.SubNodeList != null) {
			for (/*local*/GSNNode Node : this.SubNodeList) {
				Node.Duplicate(BaseDoc, NewNode);
			}
		}
		return NewNode;
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
		return WikiSyntax.FormatNodeType(this.NodeType) + this.LabelNumber;
	}

	String GetHistoryTriple() {
		return "#" + this.Created.Rev + ":" + this.Branched.Rev + ":" + this.LastModified.Rev;
	}

	void Renumber(GSNDoc BaseDoc, GSNNode ParentNode, HashMap<String,String> LabelMap) {
		/*local*/GSNNode OldNode = null;
		assert(this.BaseDoc == null);
		this.BaseDoc = BaseDoc;
		if(this.LabelNumber != null) {
			/*local*/String Label = this.GetLabel();
			OldNode = BaseDoc.GetNode(Label);
			if(OldNode != null) {
				if(LabelMap != null) {
					OldNode = null;
					this.LabelNumber = BaseDoc.CheckLabelNumber(ParentNode, this.NodeType, null);
					LabelMap.put(Label, this.GetLabel());				
				}
				else {
					if(OldNode.ParentNode != null) {
						OldNode.ParentNode.SubNodeList.remove(OldNode);
					}
					if(MD5.EqualsDigest(OldNode.Digest, this.Digest)) {
						this.Created = OldNode.Created;
						this.Branched = OldNode.Branched;
						this.LastModified = OldNode.Branched;
					}
					else {
						this.Created = OldNode.Created;
						this.Branched = OldNode.LastModified;
						this.LastModified = BaseDoc.DocHistory;
					}
				}
			}
		}
		if(this.LabelNumber == null) {
			this.LabelNumber = BaseDoc.CheckLabelNumber(ParentNode, this.NodeType, null);			
		}
		if(OldNode == null) {
			this.Created = BaseDoc.DocHistory;
			this.Branched = BaseDoc.DocHistory;
			this.LastModified = BaseDoc.DocHistory;
		}
		if(this.SubNodeList != null) {
			for(GSNNode SubNode : this.SubNodeList) {
				SubNode.Renumber(BaseDoc, this, LabelMap);
			}
		}
	}
	
	void AppendSubTree(GSNNode SubTree) {
		assert(SubTree.BaseDoc == null);
		SubTree.Renumber(this.BaseDoc, this,  null);
	}

	void UpdateContent(ArrayList<String> LineList) {
		/*local*/int LineCount = 0;
		/*local*/StringWriter Writer = new StringWriter();
		/*local*/MessageDigest md = MD5.GetMD5();
		for (/*local*/String Line : LineList) {
			/*local*/int Loc = Line.indexOf("::");
			if (Loc > 0) {
				this.HasTag = true;
			}
			Writer.println();
			Writer.print(Line);
			if (Line.length() > 0) {
				MD5.UpdateMD5(md, Line);
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
	}

	boolean UpdateText(String DocText) {
		/*local*/ArrayList<String> LineList = new ArrayList<String>();
		/*local*/StringReader Reader = new StringReader(DocText);
		/*local*/String Line = Reader.ReadLine();
		if(Line.startsWith("*")) {  // has Label
			/*local*/int GoalLevel = WikiSyntax.ParseGoalLevel(Line);
			/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(Line);
			/*local*/String LabelNumber = WikiSyntax.ParseLabelNumber(Line);
			if(this.NodeType != NodeType || !this.LabelNumber.equals(LabelNumber)) {
				return false;
			}
		}
		else {
			LineList.add(Line);
		}
		/*local*/boolean HasSubNode = false;
		while (Reader.HasNext()) {
			Line = Reader.ReadLine();
			if(Line.startsWith("*")) {
				HasSubNode = true;
				break;
			}
			LineList.add(Line);
		}
		this.UpdateContent(LineList);
		if(HasSubNode) {
			LineList.clear();
//			ParserContext Context = new ParserContext(this, Node);
//			GSNNode LastNode = null;
//			while (Reader.HasNext()) {
//				Line = Reader.ReadLine();
//				if (Line.startsWith("*")) {
//					if (Context.IsValidNode(Line)) {
//						if (LastNode != null) {
//							LastNode.UpdateContent(LineList);
//						}
//						LineList.clear();
//						LastNode = Context.AppendNewNode(Line, RefMap);
//						continue;
//					}
//				}
//				LineList.add(Line);
//			}
//			if (LastNode != null) {
//				LastNode.UpdateContent(LineList);
//			}
		}
		return true;
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

	void AppendSubNode(GSNNode Node) {
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

	GSNNode GetLastNodeOrSelf() {
		if (this.SubNodeList != null) {
			return this.SubNodeList.get(this.SubNodeList.size() - 1);
		}
		return this;
	}

	GSNNode GetLastNode(GSNType NodeType) {
		if (this.SubNodeList != null) {
			for (/*local*/int i = this.SubNodeList.size() - 1; i >= 0; i--) {
				/*local*/GSNNode Node = this.SubNodeList.get(i);
				if (Node.NodeType == NodeType) {
					return Node;
				}
			}
		}
		if (NodeType == GSNType.Strategy) {
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
	/*field*/GSNNode TopGoal;
	/*field*/HashMap<String, GSNNode> NodeMap;
	/*field*/HashMap<String, String> DocTagMap;
	/*field*/History DocHistory;
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

	void UpdateDocHeader1() {
		/*local*/int Revision = TagUtils.GetInteger(this.DocTagMap, "Revision", -1);
		if (Revision != -1) {
			this.DocHistory = this.Record.GetHistory(Revision);
			if (this.DocHistory != null) {
				this.DocHistory.Doc = this;
			}
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
			if (MD5.EqualsDigest(OldNode.Digest, Node.Digest)) {
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

	void UpdateNode(GSNNode Node, StringReader Reader, HashMap<String, GSNNode> RefMap) {
		/*local*/ParserContext Context = new ParserContext(this, Node);
		while (Reader.HasNext()) {
			/*local*/String Line = Reader.ReadLine();
			if (Line.startsWith(WikiSyntax.VersionDelim)) {
				Reader.LineBack();
				break;
			}
			if (Line.startsWith("*")) {
				Reader.LineBack();
				break;
			}
			if (Line.startsWith("#")) {
				TagUtils.ParseHistoryTag(Context.BaseDoc.Record, Line);
			} else {
				TagUtils.ParseTag(Context.BaseDoc.DocTagMap, Line);
			}
		}
		Context.BaseDoc.UpdateDocHeader1();
		/*local*/GSNNode LastNode = null;
		/*local*/ArrayList<String> LineList = new ArrayList<String>();
		while (Reader.HasNext()) {
			/*local*/String Line = Reader.ReadLine();
			if (Line.startsWith(WikiSyntax.VersionDelim)) {
				break;
			}
			if (Line.startsWith("*")) {
				if (Context.IsValidNode(Line)) {
					if (LastNode != null) {
						LastNode.UpdateContent(LineList);
					}
					LineList.clear();
					if (!Context.CheckRefMap(RefMap, Line)) {
						LastNode = Context.AppendNewNode(Line, RefMap);
					} else {
						LastNode = null;
					}
					continue;
				}
			}
			LineList.add(Line);
		}
		if (LastNode != null) {
			LastNode.UpdateContent(LineList);
		}
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
	
//	boolean AppendNode(GSNNode ParentNode, GSNNode NewNode) {
//		if(ParentNode == null) {
//			if(NewNode.IsGoal()) {
//				this.TopGoal = NewGoal;
//				return true;
//			}
//			return false;
//		}
//		
//	}
	
	void ReplaceNode(GSNNode Node, GSNNode NewNode) {
		
	}


	void FormatDoc(HashMap<String, GSNNode> NodeRef, StringWriter Stream) {
		if (this.TopGoal != null) {
			this.TopGoal.FormatNode(NodeRef, Stream);
		}
	}
}

class ParserContext {
	/*field*/GSNDoc BaseDoc;
	/*field*/ArrayList<GSNNode> GoalStackList;
	/*field*/GSNNode LastGoalNode;

	ParserContext(GSNDoc BaseDoc, GSNNode BaseNode) {
		this.BaseDoc = BaseDoc;
		this.GoalStackList = new ArrayList<GSNNode>();
		if (BaseNode != null) {
			this.LastGoalNode = BaseNode.GetCloseGoal();
			if (BaseNode.NodeType == GSNType.Goal) {
				this.SetGoalStackAt(BaseNode.GoalLevel, BaseNode);
			}
		} else {
			this.LastGoalNode = null;
		}
	}

	GSNNode GetGoalStackAt(int Level) {
		if (Level < this.GoalStackList.size()) {
			return this.GoalStackList.get(Level);
		}
		return null;
	}

	GSNNode GetParentNodeOfGoal(int Level) {
		if (Level - 1 < this.GoalStackList.size()) {
			/*local*/GSNNode ParentGoal = this.GoalStackList.get(Level - 1);
			if (ParentGoal != null) {
				return ParentGoal.GetLastNode(GSNType.Strategy);
			}
		}
		return null;
	}

	void SetGoalStackAt(int Level, GSNNode Node) {
		while (this.GoalStackList.size() < Level + 1) {
			this.GoalStackList.add(null);
		}
		this.GoalStackList.set(Level, Node);
	}

	public boolean IsValidNode_(String Line) {
		/*local*/int Level = WikiSyntax.ParseGoalLevel(Line);
		/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(Line);
		if (NodeType == GSNType.Goal) {
			/*local*/GSNNode ParentNode = this.GetParentNodeOfGoal(Level);
			if (ParentNode != null) {
				return true;
			}
			if (Level == 1 && this.LastGoalNode == null) {
				return true;
			}
			return false;
		}
		if (this.LastGoalNode != null) {
			if (NodeType == GSNType.Context) {
				/*local*/GSNNode LastNode = this.LastGoalNode.GetLastNodeOrSelf();
				if (LastNode.NodeType == GSNType.Context) {
					return false;
				}
				return true;
			}
			if (NodeType == GSNType.Strategy) {
				return !this.LastGoalNode.HasSubNode(GSNType.Evidence);
			}
			if (NodeType == GSNType.Evidence) {
				return !this.LastGoalNode.HasSubNode(GSNType.Strategy);
			}
		}
		return false;
	}

	public boolean IsValidNode(String Line) {
		/*local*/boolean b = IsValidNode_(Line);
		// System.err.println("IsValidNode? '" + Line + "' ? " + b);
		return b;
	}

	boolean CheckRefMap(HashMap<String, GSNNode> RefMap, String LabelLine) {
		if (RefMap != null) {
			/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(LabelLine);
			/*local*/String LabelNumber = WikiSyntax.ParseLabelNumber(LabelLine);
			/*local*/String RevisionHistory = WikiSyntax.ParseRevisionHistory(LabelLine, this.BaseDoc.Record);
			if (LabelNumber != null && RevisionHistory != null) {
				/*local*/String RefKey = WikiSyntax.FormatRefKey(NodeType, LabelNumber, RevisionHistory);
				/*local*/GSNNode RefNode = RefMap.get(RefKey);
				/*local*/GSNNode NewNode = null;
				if (RefNode != null) {
					/*local*/History[] HistoryTriple = WikiSyntax.ParseHistory(LabelLine, this.BaseDoc.Record);
					if (NodeType == GSNType.Goal) {
						/*local*/int Level = WikiSyntax.ParseGoalLevel(LabelLine);
						/*local*/GSNNode ParentNode = this.GetParentNodeOfGoal(Level);
						NewNode = new GSNNode(this.BaseDoc, ParentNode, Level, NodeType, LabelNumber, HistoryTriple);
						this.SetGoalStackAt(Level, NewNode);
						this.LastGoalNode = NewNode;
					} else {
						/*local*/GSNNode ParentNode = this.LastGoalNode;
						if (NodeType == GSNType.Context) {
							ParentNode = ParentNode.GetLastNodeOrSelf();
						}
						NewNode = new GSNNode(this.BaseDoc, ParentNode,ParentNode.GoalLevel, NodeType, LabelNumber, HistoryTriple);
					}
					this.BaseDoc.AddNode(NewNode);
					NewNode.NodeDoc = RefNode.NodeDoc;
					NewNode.Digest = RefNode.Digest;
					return true;
				}
			}
		}
		return false;
	}

	public GSNNode AppendNewNode(String LabelLine, HashMap<String, GSNNode> RefMap) {
		/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(LabelLine);
		/*local*/String LabelNumber = WikiSyntax.ParseLabelNumber(LabelLine);
		/*local*/History[] HistoryTriple = WikiSyntax.ParseHistory(LabelLine, this.BaseDoc.Record);
		/*local*/GSNNode NewNode = null;
		if (NodeType == GSNType.Goal) {
			/*local*/int Level = WikiSyntax.ParseGoalLevel(LabelLine);
			/*local*/GSNNode ParentNode = this.GetParentNodeOfGoal(Level);
			LabelNumber = this.BaseDoc.CheckLabelNumber(ParentNode, NodeType, LabelNumber);
			NewNode = new GSNNode(this.BaseDoc, ParentNode, Level, NodeType, LabelNumber, HistoryTriple);
			this.SetGoalStackAt(Level, NewNode);
			this.LastGoalNode = NewNode;
		} else {
			/*local*/GSNNode ParentNode = this.LastGoalNode;
			if (NodeType == GSNType.Context) {
				ParentNode = ParentNode.GetLastNodeOrSelf();
			}
			LabelNumber = this.BaseDoc.CheckLabelNumber(ParentNode, NodeType, LabelNumber);
			NewNode = new GSNNode(this.BaseDoc, ParentNode, ParentNode.GoalLevel, NodeType, LabelNumber, HistoryTriple);
		}
		this.BaseDoc.AddNode(NewNode);
		if (RefMap != null && HistoryTriple != null) {
			/*local*/String RefKey = WikiSyntax.FormatRefKey(NodeType, LabelNumber, NewNode.GetHistoryTriple());
			RefMap.put(RefKey, NewNode);
		}
		return NewNode;
	}
}

class GSNRecord {
	/*field*/ArrayList<History> HistoryList;
	/*field*/ArrayList<GSNDoc> DocList;
	/*field*/GSNDoc EditingDoc;

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

	public History NewHistory(String Author, String Role, String Date, String Process, GSNDoc Doc) {
		/*local*/History History = new History(this.HistoryList.size(), Author, Role, Date, Process, Doc);
		this.HistoryList.add(History);
		return History;
	}

	public void AddHistory(int Rev, String Author, String Role, String Date, String Process) {
		/*local*/History History = new History(Rev, Author, Role, Date, Process, null);
		while (!(Rev < this.HistoryList.size())) {
			this.HistoryList.add(null);
		}
		this.HistoryList.set(Rev, History);
	}

	void Parse(String TextDoc) {
		/*local*/HashMap<String, GSNNode> RefMap = new HashMap<String, GSNNode>();
		/*local*/StringReader Reader = new StringReader(TextDoc);
		while (Reader.HasNext()) {
			/*local*/GSNDoc Doc = new GSNDoc(this);
			Doc.UpdateNode(null, Reader, RefMap);
			this.DocList.add(Doc);
		}
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
					History = new History(Rev, Author, Role, Date, Process, Doc);
					while (!(Rev < this.HistoryList.size())) {
						this.HistoryList.add(null);
					}
					this.HistoryList.set(Rev, History);
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

	public void FormatCase(StringWriter Writer) {
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
	
	public final static void main(String[] file) {
		/*local*/String TextDoc = ReadFile(file[0]);
		/*local*/GSNRecord Record = new GSNRecord();
		Record.Parse(TextDoc);
		// Record.StartToEdit("u", "r", "d", "p");
		// Record.GetEditingNode();
		// Record.ApplyTemplate("Label", Template);
		// Record.Commit();
		// Record.Merge(Record);
		/*local*/StringWriter Writer = new StringWriter();
		Record.FormatCase(Writer);
		System.out.println("--------\n" + Writer.toString());
	}
}
