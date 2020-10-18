import { ILogger, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { expect } from "chai";
import "mocha";
import { It, Mock } from "typemoq";
import { SETTINGS } from "../../../app/src/configuration/configuration";
import { IJiraIssue, IJiraIssueProvider } from "../../../app/src/definition/jiraConnection";
import { IssueMessageParser } from "../../../app/src/messageHandlers/domain/issueMessageParser";

const settingsMock = Mock.ofType<ISettingRead>();
settingsMock.setup(s => s.getValueById(SETTINGS.regex)).returns(async () => SETTINGS.DEFAULTS.regex.source);
settingsMock.setup(s => s.getValueById(SETTINGS.filterRegex)).returns(async () => SETTINGS.DEFAULTS.filterRegex.source);

describe("Tests for message parser", () => {
    it("find issue from simple text", async () => {
        // Arrange

        const issuekey = "ISSUE-123";
        const testmessage = `Hello, have a look at ${issuekey}, please`;

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(issuekey)).returns(async () => {
            return {
                key: issuekey,
                fields: {}
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, settingsMock.object);

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
                key: issuekey1,
                fields: {}
            } as IJiraIssue;
        });
        jipMock.setup(jip => jip.getIssue(issuekey2)).returns(async () => {
            return {
                key: issuekey2,
                fields: {}
            } as IJiraIssue;
        });
        jipMock.setup(jip => jip.getIssue(issuekey3)).returns(async () => {
            return {
                key: issuekey3,
                fields: {}
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, settingsMock.object);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result.length).equals(3);
    });

    it("Replace issues already present as hyperlink", async () => {
        // Arrange

        const issuekey1 = "ISSUE-123";
        const issuekey2 = "ISSUE-254";

        const testmessage = `Hello, have a look at [${issuekey1}](http://jira-server/issues/${issuekey1}), and ${issuekey2} please`;

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(issuekey1)).returns(async () => {
            return {
                key: issuekey1,
                fields: {}
            } as IJiraIssue;
        });
        jipMock.setup(jip => jip.getIssue(issuekey2)).returns(async () => {
            return {
                key: issuekey2,
                fields: {}
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, settingsMock.object);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result.length).equals(2);
    });

    it("Replacement location should be correct", async () => {
        // Arrange

        const issuekey1 = "ISSUE-123";
        const issuekey2 = "ISSUE-254";

        const testmessage = `[ISSUE-123](/ISSUE-123), and ISSUE-254 please`;

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(issuekey1)).returns(async () => {
            return {
                key: issuekey1,
                fields: {}
            } as IJiraIssue;
        });
        jipMock.setup(jip => jip.getIssue(issuekey2)).returns(async () => {
            return {
                key: issuekey2,
                fields: {}
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, settingsMock.object);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result[0].foundMatch.index).equals(0);
        expect(result[0].foundMatch[0].length).equals(23);
        expect(result[1].foundMatch.index).equals(29);
        expect(result[1].foundMatch[0].length).equals(9);
    });

    it("No replacement in code blocks", async () => {

        // Arrange

        const issuekey1 = "ISSUE-123";
        const issuekey2 = "ISSUE-254";

        const testmessage = " ``` Ingore " + issuekey1 + " ``` in this and ` " + issuekey2 + "`, but replace " + issuekey2 + "`, please.";

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(issuekey1)).returns(async () => {
            return {
                key: issuekey1,
                fields: {}
            } as IJiraIssue;
        });
        jipMock.setup(jip => jip.getIssue(issuekey2)).returns(async () => {
            return {
                key: issuekey2,
                fields: {}
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, settingsMock.object);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result.length).to.equal(1);
    });

    it("Replace issues after code blocks", async () => {
        const testmessage = "LDRRS-123\n```LDRRS-345```\n\nLDRRS-123";

        const jipMock = Mock.ofType<IJiraIssueProvider>();
        const loggerMock = Mock.ofType<ILogger>();

        jipMock.setup(jip => jip.getIssue(It.isAnyString())).returns(async (key) => {
            return {
                key,
                fields: {}
            } as IJiraIssue;
        });

        const cut = new IssueMessageParser(jipMock.object, loggerMock.object, settingsMock.object);

        // Act

        const result = await cut.getIssuesFromMessage(testmessage);

        // Assert

        expect(result.length).to.equal(2);
        expect(result.findIndex(i => i.issueId === "LDRRS-345")).to.equal(-1);
    });
});
