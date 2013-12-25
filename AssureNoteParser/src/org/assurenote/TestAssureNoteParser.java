package org.assurenote;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.File;
import java.io.FilenameFilter;

import org.junit.Test;

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
	
	@Test
	public void ParseGoalWithContext() {
		String input = "*G\n*C";
		
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

	class WGSNFilter implements FilenameFilter {
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
}
