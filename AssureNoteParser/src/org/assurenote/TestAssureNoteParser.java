package org.assurenote;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.File;
import java.io.FilenameFilter;

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
		GSNNode TopGoal = LatestDoc.TopGoal;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopGoal);
		assertEquals(TopGoal.NodeType, GSNType.Goal);
		assertNull(TopGoal.SubNodeList);
	}
	
	public void _ParseGoalWithContext(String input) {
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopGoal = LatestDoc.TopGoal;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopGoal);
		assertEquals(TopGoal.NodeType, GSNType.Goal);
		assertNotNull(TopGoal.SubNodeList);
		assertEquals(TopGoal.SubNodeList.size(), 1);
		
		GSNNode SubNode = TopGoal.SubNodeList.get(0);
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
		GSNNode TopGoal = LatestDoc.TopGoal;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopGoal);
		assertEquals(TopGoal.NodeType, GSNType.Goal);
		assertNotNull(TopGoal.SubNodeList);
		assertEquals(TopGoal.SubNodeList.size(), 1);
		
		GSNNode SubNode = TopGoal.SubNodeList.get(0);
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
		GSNNode TopGoal = LatestDoc.TopGoal;
		GSNHistory History = LatestDoc.DocHistory;
		
		assertNotNull(TopGoal);
		
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
			GSNNode TopGoal = MasterRecord.GetLatestDoc().TopGoal;
			
			assertNotNull(TopGoal);
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
		GSNNode TopGoal = LatestDoc.TopGoal;
		
		assertNotNull(TopGoal);
		assertNotNull(TopGoal.SubNodeList);
		
		System.out.println(TopGoal.SubNodeList.size());
		assertEquals(TopGoal.SubNodeList.size(), 2);
		
		assertEquals(TopGoal.SubNodeList.get(0).NodeType, GSNType.Strategy);
		assertEquals(TopGoal.SubNodeList.get(1).NodeType, GSNType.Strategy);
		assertEquals(TopGoal.SubNodeList.get(0).SubNodeList.size(), 1);
		assertEquals(TopGoal.SubNodeList.get(1).SubNodeList.size(), 1);
		assertEquals(TopGoal.SubNodeList.get(0).SubNodeList.get(0).NodeType, GSNType.Goal);
		assertEquals(TopGoal.SubNodeList.get(1).SubNodeList.get(0).NodeType, GSNType.Goal);
	}
	
	@Test
	public void ParseDescription() {
		String input = "*G\nhi, all";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopGoal = LatestDoc.TopGoal;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopGoal);
		assertEquals(TopGoal.NodeType, GSNType.Goal);
		assertNull(TopGoal.SubNodeList);
		System.out.println(TopGoal.NodeDoc);
		assertEquals(TopGoal.NodeDoc, "\nhi, all");
	}
	
	@Test
	public void ParseInvalidDepth() {
		String input = "*G\n**S\n*C";
		
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopGoal = LatestDoc.TopGoal;
		assertNotNull(LatestDoc);
		
		assertNotNull(TopGoal);
		assertNotNull(TopGoal.SubNodeList);
		assertEquals(TopGoal.NodeDoc, "\n**S");
		assertEquals(TopGoal.SubNodeList.size(), 1);
		
		GSNNode SubNode = TopGoal.SubNodeList.get(0);
		assertEquals(SubNode.NodeType, GSNType.Context);
	}
	
	public void _ParseNodeName(String input) {
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopGoal = LatestDoc.TopGoal;
		
		assertEquals(TopGoal.LabelName, "G:TopGoal");
	}
	
	@Test
	public void ParseNodeName() {
		_ParseNodeName("*G:TopGoal");
		_ParseNodeName("*  G:TopGoal");
	}
	
	@Test
	public void Renumber() {
		String input = "*G\n*C";
		GSNRecord MasterRecord = new GSNRecord();
		MasterRecord.Parse(input);
		
		GSNDoc LatestDoc = MasterRecord.GetLatestDoc();
		GSNNode TopGoal = LatestDoc.TopGoal;
		TopGoal.RenumberGoal(1, 2);

		assertEquals(TopGoal.LabelNumber, "1");
		assertEquals(TopGoal.SubNodeList.get(0).LabelNumber, "1.1");
	}
}
