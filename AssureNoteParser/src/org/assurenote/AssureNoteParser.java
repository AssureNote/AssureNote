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

//ifdef JAVA
package org.assurenote;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Queue;
import java.util.Random;

import com.itextpdf.text.DocumentException;
//endif VAJA

//ifdef JAVA
class Lib {
	public final static ArrayList<GSNNode> EmptyNodeList = new ArrayList<GSNNode>();
	public final static String LineFeed = "\n";
	public final static String VersionDelim = "*=====";
	public final static String Input[] = {};

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

	public static String ReadFile(String File) {
		/*local*/StringWriter sb = new StringWriter();
		try {
			/*local*/BufferedReader br = new BufferedReader(new FileReader(File));
			/*local*/String Line;
			/*local*/int linenum = 0;
			while ((Line = br.readLine()) != null) {
				if (linenum > 0) {
					sb.print(Lib.LineFeed);
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
	public static int parseInt(String numText) {
		return Integer.parseInt(numText);
	}
	
	static int hexToDec(String v) {
		return Integer.valueOf(v, 16);
	}
		
}
//endif VAJA

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
			/*local*/String Line = this.ReadLine();
			if(UntilSection && Line.startsWith("*")) {
				this.RollbackLineFeed();
				break;
			}
			LineList.add(Line);
		}
	}

	ArrayList<String> GetLineList(boolean UntilSection) {
		/*local*/ArrayList<String> LineList = new ArrayList<String>();
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
	/*field*/StringBuilder sb;
	StringWriter/*constructor*/() {
		this.sb = new StringBuilder();
	}
	void print(String s) {
		this.sb.append(s);
	}
	void println(String s) {
		this.sb.append(s);
		this.sb.append(Lib.LineFeed);
	}
	void newline() {
		this.sb.append(Lib.LineFeed);
	}
	public String toString() {
		return this.sb.toString();
	}
}

enum GSNType {
	Goal, Context, Strategy, Evidence, Undefined
}

class GSNHistory {
	/*field*/int Rev;
	/*field*/String Author;
	/*field*/String Role;
	/*field*/String Date;
	/*field*/String Process;
	/*field*/GSNDoc Doc;

	GSNHistory/*constructor*/(int Rev, String Author, String Role, String DateString, String Process, GSNDoc Doc) {
		this.Rev = Rev;
		this.Author = Author;
		this.Role = Role;
		this.Date = DateString;
		/*local*/SimpleDateFormat Format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
		if (DateString == null) {
			/*local*/Date d = new Date();
			this.Date = Format.format(d);
		} else {
			try {
				this.Date = Format.format(Format.parse(DateString));
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		this.Process = Process;
		this.Doc = Doc;
	}

	public String toString() {
		return this.Date + ";" + this.Author + ";" + this.Role + ";" + this.Process;
	}

	public boolean EqualsHistory(GSNHistory aHistory) {
		return (this.Date.equals(aHistory.Date) && this.Author.equals(aHistory.Author));
	}
	
	public int CompareDate(GSNHistory aHistory) {
		return (this.Date.compareTo(aHistory.Date));
	}

}

class WikiSyntax {
	static int ParseInt(String NumText, int DefVal) {
		try {
			return Lib.parseInt(NumText);
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
			sb.append("*");
		}
		return sb.toString();
	}
	
	static int GetLabelPos (String LabelLine) {
		/* Returns the row of the abel (e.g., 'G'). */
		/*local*/int i;
		for (i = 0; i < LabelLine.length(); i++) {
			if (LabelLine.charAt(i) != '*') break;
		}
		for (; i < LabelLine.length(); i++) {
			if (LabelLine.charAt(i) != ' ') break;
		}
		return i;
	}
	
	static GSNType ParseNodeType(String LabelLine) {
		/*local*/int i = WikiSyntax.GetLabelPos(LabelLine);
		if (i < LabelLine.length()) {
			/*local*/char ch = LabelLine.charAt(i);
			if (ch == 'G') {
				return GSNType.Goal;
			}
			if (ch == 'S') {
				return GSNType.Strategy;
			}
			if (ch == 'E' || ch == 'M' || ch == 'A') {
				return GSNType.Evidence;
			}
			if (ch == 'C' || ch == 'J' || ch == 'R') {
				return GSNType.Context;
			}
		}
		return GSNType.Undefined;
	}
	
	static String ParseLabelName(String LabelLine) {
		/*local*/int i = WikiSyntax.GetLabelPos(LabelLine);
		/*local*/StringBuilder sb = new StringBuilder();
		i = i + 1; // eat label
		
		if (i >= LabelLine.length() || LabelLine.charAt(i) != ':') return null;
		sb.append(LabelLine.charAt(i-1));
		
		while(i < LabelLine.length() && LabelLine.charAt(i) != ' ') {
			sb.append(LabelLine.substring(i, i+1));
			i = i + 1;
		}
		return sb.toString();
	}

	static String FormatNodeType(GSNType NodeType) {
		switch (NodeType) {
		case /*enum(GSNType)*/Goal:
			return "G";
		case /*enum(GSNType)*/Context:
			return "C";
		case /*enum(GSNType)*/Strategy:
			return "S";
		case /*enum(GSNType)*/Evidence:
			return "E";
		case /*enum(GSNType)*/Undefined:
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
	
	static String ParseUID(String LabelLine) {
		/*local*/int StartIdx = LabelLine.indexOf('&') + 1; // eat '&'
		if (StartIdx == 0) return null;
		/*local*/int EndIdx = StartIdx;
		while(EndIdx < LabelLine.length() && LabelLine.charAt(EndIdx) != ' ') EndIdx++;
		/*local*/String UID = LabelLine.substring(StartIdx, EndIdx);
		return UID;
	}

	public static String ParseRevisionHistory(String LabelLine) {
		/*local*/int Loc = LabelLine.indexOf("#");
		if (Loc != -1) {
			return LabelLine.substring(Loc).trim();
		}
		return null;
	}

	public static GSNHistory[] ParseHistory(String LabelLine, GSNDoc BaseDoc) {
		if(BaseDoc != null) {
			/*local*/int Loc = LabelLine.indexOf("#");
			try {
				if (Loc != -1) {
					/*local*/GSNHistory[] HistoryTriple = new GSNHistory[2];
					/*local*/String RevText = LabelLine.substring(Loc + 1).trim();
					/*local*/String RevSet[] = RevText.split(":");
					HistoryTriple[0] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[0], -1)); // Created
					HistoryTriple[1] = BaseDoc.Record.GetHistory(WikiSyntax.ParseInt(RevSet[1], -1)); // Branched
					if (HistoryTriple[0] == null || HistoryTriple[1] == null) {
						return null;
					}
					return HistoryTriple;
				}
			}
			catch(Exception e) {
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
			/*local*/String Key = Line.substring(0, loc).trim();
			/*local*/String Value = Line.substring(loc + 2).trim();
			TagMap.put(Key, Value);
		}
	}

	static void FormatTag(HashMap<String, String> TagMap, StringWriter Writer) {
		if (TagMap != null) {
			/*local*/String[] keyArray = (/*cast*/String[])TagMap.keySet().toArray();
			for (/*local*/int i = 0; i < keyArray.length; i++) {
				/*local*/String Key = keyArray[i];
				Writer.println(Key + ":: " + TagMap.get(Key));
			}
		}
	}

	static void FormatHistoryTag(ArrayList<GSNHistory> HistoryList, StringWriter Writer) {
		for (/*local*/int i = 0; i < HistoryList.size(); i++) {
			/*local*/GSNHistory History = HistoryList.get(i);
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
	/*field*/String  LabelName;   /* e.g, G:TopGoal */
	/*field*/String  LabelNumber; /* e.g, G1 G1.1. Null-able */
	/*field*/String  AssignedLabelNumber; /* This field is used only if LabelNumber is null */
	/*field*/int     SectionCount;
	
	/*field*/GSNHistory Created;
	/*field*/GSNHistory LastModified;
	
	/*field*/String  NodeDoc;
	/*field*/boolean HasTag;
	/*field*/byte[]  Digest;
	/*field*/HashMap<String, String> TagMap;
	
	/*field*/int UID; /* Unique ID */

	GSNNode/*constructor*/(GSNDoc BaseDoc, GSNNode ParentNode, GSNType NodeType,String LabelName, String LabelNumber, int UID, GSNHistory[] HistoryTriple) {
		this.BaseDoc     = BaseDoc;
		this.ParentNode  = ParentNode;
		this.NodeType    = NodeType;	
		this.LabelName   = LabelName;      // G:TopGoal
		this.LabelNumber = LabelNumber;    // G1.1
		this.AssignedLabelNumber = "";
		this.UID = UID;
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
	
	GSNNode DeepCopy(GSNDoc BaseDoc, GSNNode ParentNode) {
		/*local*/GSNNode NewNode = new GSNNode(BaseDoc, ParentNode, this.NodeType, this.LabelName, this.LabelNumber, this.UID, null);
		NewNode.Created = this.Created;
		NewNode.LastModified = this.LastModified;
		NewNode.Digest = this.Digest;
		NewNode.NodeDoc = this.NodeDoc;
		NewNode.HasTag = this.HasTag;
		if(BaseDoc != null) {
			BaseDoc.UncheckAddNode(NewNode);
		}
		for (/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			Node.DeepCopy(BaseDoc, NewNode);
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

	ArrayList<GSNNode> NonNullSubNodeList() {
		return this.SubNodeList == null ? Lib.EmptyNodeList : this.SubNodeList;
	}

	public void Remap(HashMap<String, GSNNode> NodeMap) {
		NodeMap.put(this.GetLabel(), this);
		for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			Node.Remap(NodeMap);
		}
	}
	
	public int GetGoalLevel() {
		/*local*/int GoalCount = this.IsGoal() ? 1 : 0;
		/*local*/GSNNode Node = this.ParentNode;
		while(Node != null) {
			if(Node.IsGoal()) {
				GoalCount += 1;
			}
			Node = Node.ParentNode;
		}
		return GoalCount;
	}
	
	String GetLabel() {
		return WikiSyntax.FormatNodeType(this.NodeType) + this.GetLabelNumber();
	}
	
	String GetHistoryTriple() {
		return "#" + this.Created.Rev + ":" + this.LastModified.Rev;
	}

	void ReplaceLabels(HashMap<String,String> LabelMap) {
		/*local*/String NewNumber = LabelMap.get(this.GetLabel());
		if(NewNumber != null) {
			this.LabelNumber = NewNumber;
		}
		for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			Node.ReplaceLabels(LabelMap);
		}
	}
	
	String GetLabelNumber() {
		if (this.LabelNumber == null) return this.AssignedLabelNumber;
		return this.LabelNumber;
	}
	
	boolean IsModified() {
		return this.LastModified == this.BaseDoc.DocHistory;
	}
	
	void SetContent(ArrayList<String> LineList) {
		/*local*/byte[] OldDigest = this.Digest;
		/*local*/int LineCount = 0;
		/*local*/StringWriter Writer = new StringWriter();
		/*local*/MessageDigest md = Lib.GetMD5();
		for (/*local*/int i = 0; i < LineList.size(); i++) {
			/*local*/String Line = LineList.get(i);
			/*local*/int Loc = Line.indexOf("::");
			if (Loc > 0) {
				this.HasTag = true;
			}
			Writer.newline();
			Writer.print(Line);
			if (Line.length() > 0) {
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

	void UpdateContent(String TextDoc) {
		this.SetContent(new StringReader(TextDoc).GetLineList(true/*UntilSection*/));
	}
	
	void GetHtmlContent() {
		if(this.Digest != null) {
			/*local*/StringReader Reader = new StringReader(this.NodeDoc);
			/*local*/StringWriter Writer = new StringWriter();
			/*local*/String Paragraph = "";
			while(Reader.HasNext()) {
				/*local*/String Line = Reader.ReadLine();
				Paragraph += Line;
				if(Line.length() == 0 && Paragraph.length() > 0) {
					Writer.println("<p>" + Paragraph + "</p>");
					continue;
				}
				/*local*/int Loc = Line.indexOf("::");
				if(Loc > 0) {
					Writer.println("<p class='tag'>" + Line + "</p>");
					continue;
				}
			}
		}
	}

	
	ArrayList<GSNNode> GetNodeHistoryList() {
		/*local*/ArrayList<GSNNode> NodeList = new ArrayList<GSNNode>();
		/*local*/GSNNode LastNode = null;
		for(/*local*/int i = 0; i < this.BaseDoc.Record.HistoryList.size(); i++) {
			/*local*/GSNHistory NodeHistory = this.BaseDoc.Record.HistoryList.get(i);
			if(NodeHistory.Doc != null) {
				/*local*/GSNNode Node = NodeHistory.Doc.GetNode(this.GetLabel());
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
	
	private void AppendSubNode(GSNNode Node) {
		assert(Node.BaseDoc == this.BaseDoc);
		if (this.SubNodeList == null) {
			this.SubNodeList = new ArrayList<GSNNode>();
		}
		this.SubNodeList.add(Node);
	}

	boolean HasSubNode(GSNType NodeType) {
		for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			if (Node.NodeType == NodeType) {
				return true;
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
	
	HashMap<String, String> MergeTagMap(HashMap<String, String> BaseMap, HashMap<String, String> NewMap) {
		if (BaseMap == null) return NewMap;
		if (NewMap == null) return BaseMap;
		
		/*local*/HashMap<String, String> Result = new HashMap<String, String>();
		/*local*/String[] KeySet = (/*cast*/String[])BaseMap.keySet().toArray();
		for (/*local*/int i = 0; i < KeySet.length; i++) {
			Result.put(KeySet[i],  BaseMap.get(KeySet[i]));
		}
		KeySet = (/*cast*/String[])NewMap.keySet().toArray();
		for (/*local*/int i = 0; i < KeySet.length; i++) {
			Result.put(KeySet[i],  NewMap.get(KeySet[i]));
		}
		return Result;
	}
	
	HashMap<String, String> GetTagMapWithLexicalScope() {
		/*local*/HashMap<String, String> Result = null;
		if (this.ParentNode != null) {
			Result = this.MergeTagMap(this.ParentNode.GetTagMapWithLexicalScope(), this.GetTagMap());
		} else {
			Result = this.GetTagMap();
		}
		if (this.SubNodeList != null) {
			for (/*local*/int i = 0; i < this.SubNodeList.size(); i++) {
				/*local*/GSNNode Node = this.SubNodeList.get(i);
				if (Node.IsContext()) {
					Result = this.MergeTagMap(Result, Node.GetTagMap());
				}
			}
		}
		return Result;
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
			return new GSNNode(this.BaseDoc, this, GSNType.Strategy, this.LabelName, this.LabelNumber, this.UID, null);
		}
		return null;
	}

	void FormatNode(HashMap<String, GSNNode> RefMap, StringWriter Writer) {
		Writer.print(WikiSyntax.FormatGoalLevel(this.GetGoalLevel() - 1));
		Writer.print(" ");
		Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
		if (this.LabelNumber != null) Writer.print(this.LabelNumber);
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
				Writer.newline();
			}
			if (RefKey != null) {
				RefMap.put(RefKey, this);
			}
		} else {
			Writer.newline();
		}
		for (/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			Node.FormatNode(RefMap, Writer);
		}
	}

	// SubNode
	void FormatSubNode(int GoalLevel, StringWriter Writer) {
		Writer.print(WikiSyntax.FormatGoalLevel(GoalLevel));
		Writer.print(" ");
		Writer.print(WikiSyntax.FormatNodeType(this.NodeType));
		if (this.LabelNumber != null) Writer.print(this.LabelNumber);
		// Stream.append(" ");
		// MD5.FormatDigest(this.Digest, Stream);
		Writer.print(this.NodeDoc);
		if (this.Digest != null) {
			Writer.newline();
		}
		if (this.NonNullSubNodeList() != null) {
			for (/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
				/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
				Node.FormatSubNode(Node.IsGoal() ? GoalLevel+1 : GoalLevel, Writer);
			}
		}
	}
	
	GSNNode ReplaceSubNode(GSNNode NewNode) {
		this.MergeSubNode(NewNode);
		if(this.ParentNode != null) {
			for(/*local*/int i = 0; i < this.ParentNode.SubNodeList.size(); i++) {
				if(this.ParentNode.SubNodeList.get(i) == this) {
					this.ParentNode.SubNodeList.set(i, NewNode);
				}
			}
		}
		else {
			assert(NewNode.IsGoal());
			this.BaseDoc.TopGoal = NewNode;
		}
		return NewNode;
	}

	GSNNode ReplaceSubNodeAsText(String DocText) {
		/*local*/StringReader Reader = new StringReader(DocText);
		/*local*/ParserContext Parser = new ParserContext(null);
		/*local*/GSNNode NewNode = Parser.ParseNode(Reader, null);
		if(NewNode != null) {
			NewNode = this.ReplaceSubNode(NewNode);
		}
		return NewNode;
	}
	
	boolean HasSubNodeLabel(String Label) {
		if(Label.equals(this.GetLabel())) {
			return true;
		}
		for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode SubNode = this.NonNullSubNodeList().get(i);
			if(SubNode.HasSubNodeLabel(Label)) return true;
		}
		return false;
	}
	
	void MergeSubNode(GSNNode NewNode) {
		assert(this.BaseDoc != null);
		NewNode.LastModified = null; // this.BaseDoc has Last
		if(NewNode.LabelNumber != null) {
			/*local*/String Label = NewNode.GetLabel();
			/*local*/GSNNode OldNode = this.BaseDoc.GetNode(Label);
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
			NewNode.Created = this.BaseDoc.DocHistory;
			NewNode.LastModified = this.BaseDoc.DocHistory;	
		}
		NewNode.BaseDoc = this.BaseDoc;
		for(/*local*/int i = 0; i < NewNode.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode SubNode = NewNode.NonNullSubNodeList().get(i);
			this.MergeSubNode(SubNode);
		}
	}

	// Merge
	boolean IsNewerTree(int ModifiedRev) {
		if (ModifiedRev <= this.LastModified.Rev) {
			for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
				/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
				if (!Node.IsNewerTree(ModifiedRev)) {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	void ListSubGoalNode(ArrayList<GSNNode> BufferList) {
		for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			if(Node.IsGoal()) {
				BufferList.add(Node);
			}
			if(Node.IsStrategy()) {
				Node.ListSubGoalNode(BufferList);
			}
		}
	}

	void ListSectionNode(ArrayList<GSNNode> BufferList) {
		for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			if(!Node.IsGoal()) {
				BufferList.add(Node);
			}
			if(Node.IsStrategy() || Node.IsEvidence()) {
				Node.ListSectionNode(BufferList);
			}
		}
	}
	
	void ReserveLabelMap(HashMap<String, String> LabelMap) {
		if (this.LabelNumber != null) LabelMap.put(this.LabelNumber,  "exists"); // Non-null value
		for (/*local*/int i = 0; this.SubNodeList != null && i < this.SubNodeList.size(); i++) {
			this.SubNodeList.get(i).ReserveLabelMap(LabelMap);
		}
	}

	void RenumberGoalRecursive(int GoalCount, int NextGoalCount, HashMap<String, String> LabelMap) {
		assert(this.IsGoal());
		
		/*local*/Queue<GSNNode> queue = new LinkedList<GSNNode>();
		queue.add(this);
		/*local*/GSNNode CurrentNode;
		while ((CurrentNode = queue.poll()) != null) {
			while(LabelMap.get("" + GoalCount) != null) GoalCount++;
			CurrentNode.AssignedLabelNumber = "" + GoalCount;
			/*local*/ArrayList<GSNNode> BufferList = new ArrayList<GSNNode>();
			CurrentNode.ListSectionNode(BufferList);
			/*local*/int SectionCount = 1;
			for(/*local*/int i = 0; i < BufferList.size(); i++, SectionCount += 1) {
				/*local*/GSNNode SectionNode = BufferList.get(i);
				/*local*/String LabelNumber = CurrentNode.LabelNumber + "." + SectionCount;
				if (LabelMap.get(LabelNumber) != null) continue;
				SectionNode.AssignedLabelNumber = CurrentNode.LabelNumber + "." + SectionCount;
			}
			BufferList.clear();
			
			CurrentNode.ListSubGoalNode(BufferList);
			for(/*local*/int i = 0; i < BufferList.size(); i++) {
				/*local*/GSNNode GoalNode = BufferList.get(i);
				queue.add(GoalNode);
				//NextCount = GoalNode.RenumberGoalRecursive(NextGoalCount, NextCount, LabelMap);
				NextGoalCount += 1;
			}
		}
	}
	
	void RenumberGoal(int GoalCount, int NextGoalCount) {
		/*local*/HashMap<String, String> LabelMap = new HashMap<String, String>();
		this.ReserveLabelMap(LabelMap);
		this.RenumberGoalRecursive(GoalCount, NextGoalCount, LabelMap);
	}
	
	ArrayList<GSNNode> SearchNode(String SearchWord) {
		/*local*/ArrayList<GSNNode> NodeList = new ArrayList<GSNNode>();
		if(this.NodeDoc.matches(SearchWord)) {
			NodeList.add(this);
		}
		for(/*local*/int i = 0; i < this.NonNullSubNodeList().size(); i++) {
			/*local*/GSNNode Node = this.NonNullSubNodeList().get(i);
			NodeList.addAll(Node.SearchNode(SearchWord));
		}
		return NodeList;
	}

}

class GSNDoc {
	/*field*/GSNRecord Record;
	/*field*/GSNNode   TopGoal;
	/*field*/HashMap<String, GSNNode> NodeMap;
	/*field*/HashMap<String, String> DocTagMap;
	/*field*/GSNHistory DocHistory;
	/*field*/int GoalCount;

	GSNDoc/*constructor*/(GSNRecord Record) {
		this.Record = Record;
		this.TopGoal = null;
		this.NodeMap = new HashMap<String, GSNNode>();
		this.DocTagMap = new HashMap<String, String>();
		this.DocHistory = null;
		this.GoalCount = 0;
	}

	GSNDoc DeepCopy(String Author, String Role, String Date, String Process) {
		/*local*/GSNDoc NewDoc = new GSNDoc(this.Record);
		NewDoc.GoalCount = this.GoalCount;
		NewDoc.DocHistory = this.Record.NewHistory(Author, Role, Date, Process, NewDoc);
		NewDoc.DocTagMap = this.DuplicateTagMap(this.DocTagMap);
		if (this.TopGoal != null) {
			NewDoc.TopGoal = this.TopGoal.DeepCopy(NewDoc, null);
		}
		return NewDoc;
	}

	HashMap<String, String> DuplicateTagMap(HashMap<String, String> TagMap) {
		if (TagMap != null) {
			/*local*/HashMap<String, String> NewMap = new HashMap<String, String>();
			/*local*/String[] keyArray = (/*cast*/String[])TagMap.keySet().toArray();
			for(/*local*/int i = 0; i < keyArray.length; i++) {
				/*local*/String Key = keyArray[i];
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
			/*local*/String Author = TagUtils.GetString(this.DocTagMap, "Author", "unknown");
			/*local*/String Role = TagUtils.GetString(this.DocTagMap, "Role", "converter");
			/*local*/String Date = TagUtils.GetString(this.DocTagMap, "Date", null);
			/*local*/String Process = TagUtils.GetString(this.DocTagMap, "Process", "-");
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
			if (Lib.EqualsDigest(OldNode.Digest, Node.Digest)) {
				Node.Created = OldNode.Created;
			}
		}
		this.NodeMap.put(Key, Node);
		if (Node.NodeType == GSNType.Goal) {
			if (Node.GetGoalLevel() == 1) {
				this.TopGoal = Node;
			}
			/*local*/int num = WikiSyntax.ParseInt(Node.LabelNumber, 0);
			if (num > this.GoalCount) {
				this.GoalCount = num;
			}
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
	
	void FormatDoc(HashMap<String, GSNNode> NodeRef, StringWriter Stream) {
		if (this.TopGoal != null) {
			Stream.println("Revision:: " + this.DocHistory.Rev);
			this.TopGoal.FormatNode(NodeRef, Stream);
		}
	}
	
}


class GSNRecord {
	/*field*/ArrayList<GSNHistory> HistoryList;
	/*field*/GSNDoc                EditingDoc;

	GSNRecord/*constructor*/() {
		this.HistoryList = new ArrayList<GSNHistory>();
		this.EditingDoc = null;
	}

	GSNRecord DeepCopy() {
		/*local*/GSNRecord NewRecord = new GSNRecord();
		for(/*local*/int i = 0; i < this.HistoryList.size(); i++) {
			/*local*/GSNHistory Item = this.HistoryList.get(i);
			NewRecord.HistoryList.add(Item);
		}
		NewRecord.EditingDoc = this.EditingDoc;
		return NewRecord;
	}
	
	GSNHistory GetHistory(int Rev) {
		if (Rev < this.HistoryList.size()) {
			return this.HistoryList.get(Rev);
		}
		return null;
	}

	GSNDoc GetHistoryDoc(int Rev) {
		/*local*/GSNHistory history = this.GetHistory(Rev);
		if(history != null) {
			return history.Doc;
		}
		return null;
	}
	
	GSNHistory NewHistory(String Author, String Role, String Date, String Process, GSNDoc Doc) {
		/*local*/GSNHistory History = new GSNHistory(this.HistoryList.size(), Author, Role, Date, Process, Doc);
		this.HistoryList.add(History);
		return History;
	}

	void AddHistory(int Rev, String Author, String Role, String Date, String Process, GSNDoc Doc) {
		if(Rev >= 0) {
			/*local*/GSNHistory History = new GSNHistory(Rev, Author, Role, Date, Process, Doc);
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
				this.AddHistory(WikiSyntax.ParseInt(Key.substring(1), -1), Records[1], Records[2], Records[0], Records[3], null);
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
			/*local*/ParserContext Parser = new ParserContext(Doc);
			Doc.TopGoal = Parser.ParseNode(Reader, RefMap);
		}
	}
	
	void RenumberAll() {
		/*local*/GSNDoc LatestDoc = this.GetLatestDoc();
		if(LatestDoc!= null && LatestDoc.TopGoal != null) {
			LatestDoc.TopGoal.RenumberGoal(1, 2);
		}
	}

	public void OpenEditor(String Author, String Role, String Date, String Process) {
		if (this.EditingDoc == null) {
			/*local*/GSNDoc Doc = this.GetLatestDoc();
			if(Doc != null) {
				this.EditingDoc = Doc.DeepCopy(Author, Role, Date, Process);
			} else {
				this.EditingDoc = new GSNDoc(this);
				this.EditingDoc.DocHistory = this.NewHistory(Author, Role, Date, Process, this.EditingDoc);
			}
		}
	}

	public void CloseEditor() {
		this.EditingDoc = null;
	}

	public void Merge(GSNRecord NewRecord) {
		/*local*/int CommonHistory = -1;
		for (/*local*/int Rev = 0; Rev < this.HistoryList.size(); Rev++) {
			/*local*/GSNHistory MasterHistory = this.GetHistory(Rev);
			/*local*/GSNHistory NewHistory = NewRecord.GetHistory(Rev);
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
			///*local*/GSNRecord Record1 = this.DeepCopy();
			// MergeAsIncrementalAddition
		}
	}

	public void MergeAsFastFoward(GSNRecord NewRecord) {
		for (/*local*/int i = this.HistoryList.size(); i < NewRecord.HistoryList.size(); i++) {
			/*local*/GSNDoc BranchDoc = NewRecord.GetHistoryDoc(i);
			if(BranchDoc != null) {
				BranchDoc.Record = this;
				this.HistoryList.add(BranchDoc.DocHistory);
			}
		}
	}

	public void MergeAsReplaceTopGoal(GSNRecord NewRecord) {
		for(/*local*/int i = 0; i < NewRecord.HistoryList.size(); i++) {
			/*local*/GSNHistory NewHistory = NewRecord.HistoryList.get(i);
			/*local*/GSNDoc Doc = NewHistory != null ? NewHistory.Doc : null;
			if(Doc != null) {
				this.OpenEditor(NewHistory.Author, NewHistory.Role, NewHistory.Date, NewHistory.Process);
				this.EditingDoc.TopGoal.ReplaceSubNode(Doc.TopGoal);
				this.CloseEditor();
			}
		}
	}

	public void MergeAsIncrementalAddition(int Rev1, GSNRecord Record1, int Rev2, GSNRecord Record2) {
		while(Rev1 < Record1.HistoryList.size() && Rev2 < Record2.HistoryList.size()) {
			/*local*/GSNHistory History1 = Record1.GetHistory(Rev1);
			/*local*/GSNHistory History2 = Record2.GetHistory(Rev2);
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
				this.EditingDoc.TopGoal.ReplaceSubNode(History1.Doc.TopGoal);
				this.CloseEditor();
			}
			else {
				this.OpenEditor(History2.Author, History2.Role, History2.Date, History2.Process); Rev2++;
				this.EditingDoc.TopGoal.ReplaceSubNode(History2.Doc.TopGoal);
				this.CloseEditor();
			}
		}
	}

	GSNDoc GetLatestDoc() {
		for(/*local*/int i = this.HistoryList.size() - 1; i >= 0; i++) {
			/*local*/GSNDoc Doc = this.GetHistoryDoc(i);
			if(Doc != null) {
				return Doc;
			}
		}
		return null;
	}

	public void FormatRecord(StringWriter Writer) {
		/*local*/int DocCount = 0;
		/*local*/HashMap<String, GSNNode> RefMap = new HashMap<String, GSNNode>();
		TagUtils.FormatHistoryTag(this.HistoryList, Writer);
		for (/*local*/int i = 0; i < this.HistoryList.size(); i++) {
			/*local*/GSNDoc Doc = this.GetHistoryDoc(i);
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
	/*field*/GSNDoc NullableDoc;
	/*field*/ArrayList<GSNNode> GoalStack;
	/*field*/GSNNode FirstNode;
	/*field*/GSNNode LastGoalNode;
	/*field*/GSNNode LastNonContextNode;
	/*field*/Random random;

	ParserContext/*constructor*/(GSNDoc NullableDoc) {
		/*local*/GSNNode ParentNode = new GSNNode(NullableDoc, null, GSNType.Goal, null, null, -1, null);
		this.NullableDoc = NullableDoc;  // nullabel
		this.FirstNode = null;
		this.LastGoalNode = null;
		this.LastNonContextNode = null;
		this.GoalStack = new ArrayList<GSNNode>();
		this.random = new Random(System.currentTimeMillis());
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
	}
	
	GSNNode GetStrategyOfGoal(int Level) {
		if (Level - 1 < this.GoalStack.size()) {
			/*local*/GSNNode ParentGoal = this.GoalStack.get(Level - 1);
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

	void SetGoalStackAt(GSNNode Node) {
		/*local*/int GoalLevel = Node.GetGoalLevel();
//		System.out.println("GoalLevel="+GoalLevel+ ", stack="+this.GoalStackList.size());
		while (!(GoalLevel - 1 < this.GoalStack.size())) {
			this.GoalStack.add(null);
		}
		this.GoalStack.set(GoalLevel-1, Node);
	}

	boolean IsValidSection(String Line, StringReader Reader) {
		/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(Line);
		/*local*/int Level = WikiSyntax.ParseGoalLevel(Line);
		if (NodeType == GSNType.Goal) {
			/*local*/GSNNode ParentNode = this.GetStrategyOfGoal(Level);
			if (ParentNode != null) {
				return true;
			}
			Reader.LogError("Mismatched goal level < " + (this.GoalStack.size()), Line);
			return false;
		}
		if (this.GoalStack.size() <= Level) {
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

	GSNNode CreateNewNode(String LabelLine, HashMap<String, GSNNode> RefMap, StringReader Reader) {
		/*local*/GSNType NodeType = WikiSyntax.ParseNodeType(LabelLine);
		/*local*/String LabelName = WikiSyntax.ParseLabelName(LabelLine);
		/*local*/String LabelNumber = WikiSyntax.ParseLabelNumber(LabelLine);
		/*local*/int UID = (WikiSyntax.ParseUID(LabelLine) == null) ? this.random.nextInt() : Lib.hexToDec(WikiSyntax.ParseUID(LabelLine));
		/*local*/String RevisionHistory = WikiSyntax.ParseRevisionHistory(LabelLine);
		/*local*/GSNNode RefNode = null;
		/*local*/GSNNode NewNode = null;
		if (RefMap != null && LabelNumber != null && RevisionHistory != null) {
			/*local*/String RefKey = WikiSyntax.FormatRefKey(NodeType, LabelNumber, RevisionHistory);
			RefNode = RefMap.get(RefKey);
		}
		/*local*/GSNNode ParentNode = null;
		/*local*/GSNHistory[] HistoryTriple = WikiSyntax.ParseHistory(LabelLine, this.NullableDoc);
		/*local*/int Level = WikiSyntax.ParseGoalLevel(LabelLine);
		if (NodeType == GSNType.Goal) {
			ParentNode = this.GetStrategyOfGoal(Level);
		} else {
			ParentNode = (NodeType == GSNType.Context) ? this.LastNonContextNode : this.GoalStack.get(Level);
//			if(ParentNode.GoalLevel != Level) {
//				Reader.LogError("mismatched level", Line);
//			}
		}
		NewNode = new GSNNode(this.NullableDoc, ParentNode, NodeType, LabelName, LabelNumber, UID, HistoryTriple);
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
		/*local*/GSNNode LastNode = null;
		/*local*/ArrayList<String> LineList = new ArrayList<String>();
		while (Reader.HasNext()) {
			/*local*/String Line = Reader.ReadLine();
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

	private void UpdateContent(GSNNode LastNode, ArrayList<String> LineList) {
		if (LastNode != null) {
			LastNode.SetContent(LineList);
		}
		LineList.clear();
	}
}

public class AssureNoteParser {
	public final static void merge(String MasterFile, String BranchFile) {
		/*local*/GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(Lib.ReadFile(MasterFile));
		if(BranchFile != null) {
			/*local*/GSNRecord BranchRecord = new GSNRecord();
			BranchRecord.Parse(Lib.ReadFile(BranchFile));
			MasterRecord.Merge(BranchRecord);
		}
		else {
			//MasterRecord.RenumberAll();
		}
		/*local*/StringWriter Writer = new StringWriter();
		MasterRecord.FormatRecord(Writer);
		System.out.println(Writer.toString());
	}
	
	public final static void ts_merge() {
		/*local*/String MasterFile = (Lib.Input.length > 0) ? Lib.Input[0] : null;
		/*local*/String BranchFile = (Lib.Input.length > 1) ? Lib.Input[1] : null;
		/*local*/GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(MasterFile);
		if(BranchFile != null) {
			/*local*/GSNRecord BranchRecord = new GSNRecord();
			BranchRecord.Parse(Lib.ReadFile(BranchFile));
			MasterRecord.Merge(BranchRecord);
		}
		else {
			MasterRecord.RenumberAll();
		}
		/*local*/StringWriter Writer = new StringWriter();
		MasterRecord.FormatRecord(Writer);
		System.out.println(Writer.toString());
	}

	public final static void main(String[] argv) {
		if(argv.length == 2) {
			//AssureNoteParser.merge(argv[0], argv[1]);
			/*local*/GSNRecord MasterRecord = new GSNRecord();
			MasterRecord.Parse(Lib.ReadFile(argv[0]));
			/*local*/GSNNode NewNode = MasterRecord.GetLatestDoc().TopGoal.ReplaceSubNodeAsText(Lib.ReadFile(argv[1]));
			/*local*/StringWriter Writer = new StringWriter();
			NewNode.FormatNode(new HashMap<String, GSNNode>(), Writer);
			//MasterRecord.FormatRecord(Writer);
			System.out.println(Writer.toString());
		}
		if(argv.length == 1) {
			AssureNoteParser.merge(argv[0], null);
		}
		System.out.println("Usage: AssureNoteParser file [margingfile]");
	}
}
