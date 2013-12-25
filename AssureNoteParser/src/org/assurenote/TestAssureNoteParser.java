package org.assurenote;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

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
	}
}