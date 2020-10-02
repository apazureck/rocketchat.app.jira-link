import { expect } from "chai";
import "mocha";
import { IJiraIssue } from "../../../src/definition/jiraConnection";
import { IFoundIssue, IJiraIssueMessageParser } from "../../../src/definition/messageHandling";
import { IssueReplacer } from "../../../src/messageHandlers/domain/issueReplacer";

describe("Tests for issue replacement", () => {
    it("Correct Issue should be replaced", () => {
        // Arrange

        let text = "ISSUE-123 needs to be done immediately";

        const foundIissue: IFoundIssue = {
            issueId: "ISSUE-123",
            foundMatch: { index: 0, length: 9 } as RegExpExecArray,
            issue: {
                key: "ISSUE-123",
                fields: {
                    summary: "Summary",
                    description: "Description",
                    issuetype: {
                        name: "IssuetypeName",
                        iconUrl: "IssuetypeIconurl"
                    },
                    status: { name: "statusName" }
                }
            } as IJiraIssue
        };

        const cut = new IssueReplacer();
        cut.callback = (issue: IJiraIssue) => "REPLACED!";

        // Act

        text = cut.replaceIssues([foundIissue], text);

        // Assert

        expect(text.startsWith("REPLACED!"));
    });
});
