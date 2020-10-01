import { ILogger } from "@rocket.chat/apps-engine/definition/accessors";
import { expect } from "chai";
import "mocha";
import { It, Mock } from "typemoq";
import { IJiraIssue, IJiraIssueProvider } from "../../../src/jiraConnection/jiraConnection.abstraction";
import { IssueMessageParser } from "../../../src/messageHandlers/domain/issueMessageParser";

const defaultRegex = /\b\w+-\d+\b/gm;
const filterRegex = /\[.*?(\w+-\d+).*?\]\(.*?\1.*?\)/gm;

describe("Tests for message parser", () => {
    it("find issue from simple text", async () => {
        // Arrange

        const issuekey = "ISSUE-123";
        const testmessage = `Hello, have a look at ${issuekey}, please`;

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(It.is(v => v === issuekey))).returns(async () => {
            return {
                key: issuekey
            } as IJiraIssue;
        });
        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, defaultRegex, filterRegex);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result.length).equals(1);
    });

    it("Get Multiple Issues in text", async () => {
        // Arrange

        const issuekey1 = "ISSUE-123";
        const issuekey2 = "ISSUE-343";
        const issuekey3 = "ISSUE-2343";
        const testmessage = `Hello, have a look at ${issuekey1}, ${issuekey2} and ${issuekey3}, please`;

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(issuekey1)).returns(async () => {
            return {
                key: issuekey1
            } as IJiraIssue;
        });
        jipMock.setup(jip => jip.getIssue(issuekey2)).returns(async () => {
            return {
                key: issuekey2
            } as IJiraIssue;
        });
        jipMock.setup(jip => jip.getIssue(issuekey3)).returns(async () => {
            return {
                key: issuekey3
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, defaultRegex, filterRegex);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result.length).equals(3);
    });

    it("Ignore Issue, which is already in hyperlink", async () => {
        // Arrange

        const issuekey1 = "ISSUE-123";

        const testmessage = `Hello, have a look at [${issuekey1}](http://jira-server/issues/${issuekey1}), please`;

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(issuekey1)).returns(async () => {
            return {
                key: issuekey1
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, defaultRegex, filterRegex);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result.length).equals(0);
    });
});
