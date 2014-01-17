package org.assurenote;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertNotNull;

import java.io.File;
import java.io.FilenameFilter;
import java.util.HashMap;

import org.junit.Test;
import org.junit.Ignore;

public class TestAssureNoteParser {

	@Test
	public void AlwaysPassed() {
		assertNotNull("Non-Null String");
	}
	
	@Test
	public void Instantiation() {
		GSNRecord MasterRecord = new GSNRecord();
		assertNotNull(MasterRecord);
	}
	
	@Test
	public void ParseGoal() {
		String input = "*G";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopNode);
		assertEquals(TopNode.NodeType, GSNType.Goal);
		assertNull(TopNode.SubNodeList);
	}
	
	@Test
	public void ParseContext() {
		String input = "*C";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		assertNotNull(LatestDoc);
		
		//assertNotNull(TopNode);
		assertEquals(TopNode.NodeType, GSNType.Context);
		assertNull(TopNode.SubNodeList);
	}
	
	public void _ParseGoalWithContext(String input) {
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopNode);
		assertEquals(TopNode.NodeType, GSNType.Goal);
		assertNotNull(TopNode.SubNodeList);
		assertEquals(TopNode.SubNodeList.size(), 1);
		
		GSNNode SubNode = TopNode.SubNodeList.get(0);
		assertEquals(SubNode.NodeType, GSNType.Context);
		assertNull(SubNode.SubNodeList);
	}
	@Test
	public void ParseGoalWithContext() {
		_ParseGoalWithContext("*G\n*C");
		_ParseGoalWithContext("*G\n*J");
		_ParseGoalWithContext("*G\n*R");
	}
	
	@Test
	public void ParseNestedGoal() {
		String input = "*G\n*S\n**G";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopNode);
		assertEquals(TopNode.NodeType, GSNType.Goal);
		assertNotNull(TopNode.SubNodeList);
		assertEquals(TopNode.SubNodeList.size(), 1);
		
		GSNNode SubNode = TopNode.SubNodeList.get(0);
		assertEquals(SubNode.NodeType, GSNType.Strategy);
		assertNotNull(SubNode.SubNodeList);
		assertEquals(SubNode.SubNodeList.size(), 1);
		
		SubNode = SubNode.SubNodeList.get(0);
		assertEquals(SubNode.NodeType, GSNType.Goal);
		assertNull(SubNode.SubNodeList);
	}

	@Test
	public void ParseMetaData() {
		String input = "Author:: test\nRole:: -\nDate:: 2000-01-01T00:00:00+0900\n*G\n*S\n**G";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		GSNHistory History = LatestDoc.DocHistory;
		
		assertNotNull(TopNode);
		
		assertNotNull(History);
		assertEquals(History.Author, "test");
		assertEquals(History.Role, "-");
		assertEquals(History.Date, "2000-01-01T00:00:00+0900");
	}

	private class WGSNFilter implements FilenameFilter {
		public boolean accept(File file, String name) {
			return name.endsWith(".wgsn");
		}
	}
	
	@Test
	public void ParseAllSamples() {
		String path = "./sample/";
		File dir = new File(path);
		File[] files = dir.listFiles(new WGSNFilter());
		for (File file : files) {
			if (!file.canRead()) continue;
			
			GSNRecord MasterRecord = new GSNRecord();
			MasterRecord.Parse(Lib.ReadFile(path + file.getName()));
			GSNNode TopNode = MasterRecord.GetLatestDoc().TopNode;
			
			assertNotNull(TopNode);
		}
	}
	
	@Test
	public void ParseMultipleGSNDiagrams() {
		String old = "*G";
		String next = "*G\n*C";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(old);
		
		assertNotNull(MasterRecord);
		assertEquals(MasterRecord.HistoryList.size(), 1);
		
		MasterRecord.Parse(next);
		
		assertEquals(MasterRecord.HistoryList.size(), 2);
	}
	
	@Test
	public void ParseGoalWithStrategies() {
		String input = "*G\n*S\n**G\n*S\n**G";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input); 
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		
		assertNotNull(TopNode);
		assertNotNull(TopNode.SubNodeList);
		
		System.out.println(TopNode.SubNodeList.size());
		assertEquals(TopNode.SubNodeList.size(), 2);
		
		assertEquals(TopNode.SubNodeList.get(0).NodeType, GSNType.Strategy);
		assertEquals(TopNode.SubNodeList.get(1).NodeType, GSNType.Strategy);
		assertEquals(TopNode.SubNodeList.get(0).SubNodeList.size(), 1);
		assertEquals(TopNode.SubNodeList.get(1).SubNodeList.size(), 1);
		assertEquals(TopNode.SubNodeList.get(0).SubNodeList.get(0).NodeType, GSNType.Goal);
		assertEquals(TopNode.SubNodeList.get(1).SubNodeList.get(0).NodeType, GSNType.Goal);
	}
	
	@Test
	public void ParseDescription() {
		String input = "*G\nhi, all";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopNode);
		assertEquals(TopNode.NodeType, GSNType.Goal);
		assertNull(TopNode.SubNodeList);
		System.out.println(TopNode.NodeDoc);
		assertEquals(TopNode.NodeDoc, "hi, all");
	}
	
	@Test
	public void ParseInvalidDepth() {
		String input = "*G\n**S\n*C";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopNode);
		assertNotNull(TopNode.SubNodeList);
		assertEquals(TopNode.NodeDoc, "**S");
		assertEquals(TopNode.SubNodeList.size(), 1);
		
		GSNNode SubNode = TopNode.SubNodeList.get(0);
		assertEquals(SubNode.NodeType, GSNType.Context);
	}
	
	public void _ParseNodeName(String input) {
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		
		assertEquals(TopNode.LabelName, "G:TopNode");
	}
	
	@Test
	public void ParseNodeName() {
		_ParseNodeName("*G:TopNode");
		_ParseNodeName("*  G:TopNode");
	}
	
	@Test
	public void Renumber() {
		String input = "*G\n*C";
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;

		assertEquals(TopNode.AssignedLabelNumber, "1");
		assertEquals(TopNode.SubNodeList.get(0).AssignedLabelNumber, "1.1");
		System.out.println(Integer.MAX_VALUE);
		System.out.println(Integer.toHexString(Integer.MAX_VALUE));
	}
	
	@Test
	public void Renumber2() {
		String input = "*G\n*S\n**G\n**G";
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		
		GSNNode Strategy = TopNode.SubNodeList.get(0);
		assertNotEquals(Strategy.SubNodeList.get(0).AssignedLabelNumber, Strategy.SubNodeList.get(1).AssignedLabelNumber);
	}
	
	@Test
	public void UID() {
		String input = "*G &0\n*C:Context &ff";
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		
		assertEquals(TopNode.UID, 0);
		assertEquals(TopNode.SubNodeList.get(0).LabelName, "C:Context");
		assertEquals(TopNode.SubNodeList.get(0).UID, 255);
	}
	
	@Test
	public void GetLabelMap() {
		String input = "*G:TopGoal\n*C:SubNode";
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		HashMap<String, String> LabelMap = LatestDoc.GetLabelMap();
		
		assertEquals(LabelMap.size(), 2);
		assertEquals(LabelMap.get("G:TopGoal"), "G1");
		assertEquals(LabelMap.get("C:SubNode"), "C1.1");
		
		LatestDoc.RenumberAll();
		LabelMap = LatestDoc.GetLabelMap();
		
		assertEquals(LabelMap.size(), 2);
		assertEquals(LabelMap.get("G:TopGoal"), "G1");
		assertEquals(LabelMap.get("C:SubNode"), "C1.1");
	}
	
	@Test
	public void NeverReserveLabel() {
		String input = "*G123\n*C";
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopNode = LatestDoc.TopNode;
		
		assertNotEquals(TopNode.AssignedLabelNumber, "123");
	}
	
	@Test
	public void GetNodeCount() {
		String input = "*G\n*S\n**G\n**G";
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		assertEquals(LatestDoc.GetNodeCount(), 4);
	}
	
	@Test
	public void LastModified() {
		String input = "#0::2014-01-16T18:36:03+0900;unknown;converter;-\n#1::2014-01-16T18:37:47+0900;shidasan;todo;test\nRevision:: 0\n* G &2422f9c3 #0:0\nゴール: ある性質が成り立つという主張\n\n* C &45255f17 #0:0\n前提: 主張が成り立つ状況\n\n* E &654abc0c #0:0\n証拠: サブゴールの成立を支持する事実\n\n*=====\nRevision:: 1\n* G &2422f9c3 #0:0\nゴール: ある性質が成り立つという主張\n\n* C &45255f17 #0:1\n前提: 主張が成り立つ状況\n更新\n\n* E &654abc0c #0:1\n証拠: サブゴールの成立を支持する事実\n更新\n";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		assertEquals(LatestDoc.TopNode.LastModified.Author, "unknown");
		assertEquals(LatestDoc.TopNode.Created.Author, "unknown");
		assertEquals(LatestDoc.TopNode.SubNodeList.get(0).LastModified.Author, "shidasan");
		assertEquals(LatestDoc.TopNode.SubNodeList.get(0).Created.Author, "unknown");
	}
	
	@Test
	public void HandWriting() {
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.OpenEditor("test", "test", null, "test");
		GSNDoc Doc = MasterRecord.EditingDoc;
	
		GSNNode TopNode = new GSNNode(Doc, null, GSNType.Goal, null, 1, null);
		GSNNode SubNode = new GSNNode(Doc, TopNode, GSNType.Context, null, 1, null);
		Doc.TopNode = TopNode;
		
		MasterRecord.CloseEditor();
		StringWriter Writer = new StringWriter();
		MasterRecord.FormatRecord(Writer);

		GSNRecord NewRecord = new GSNRecord();
		NewRecord.Parse(Writer.toString());
		
		GSNDoc NewDoc = NewRecord.GetLatestDoc();
		assertEquals(true, NewDoc.TopNode.IsGoal());
		assertEquals(1, NewDoc.TopNode.SubNodeList.size());
		assertEquals(true, NewDoc.TopNode.SubNodeList.get(0).IsContext());
		
		StringWriter NewWriter = new StringWriter();
		NewRecord.FormatRecord(NewWriter);
		assertEquals(Writer.toString(), NewWriter.toString());
	}
}
