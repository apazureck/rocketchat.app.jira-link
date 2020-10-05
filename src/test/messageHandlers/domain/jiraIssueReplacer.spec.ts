// tslint:disable:no-unused-expression

import { expect } from "chai";
import "mocha";
import { IJiraIssue } from "../../../src/definition/jiraConnection";
import {
    IFoundIssue,
} from "../../../src/definition/messageHandling";
import { IssueReplacer, replaceInTextByIndexAndLength } from "../../../src/messageHandlers/domain/issueReplacer";

describe("Tests for issue replacement", () => {
    it("Correct Issue should be replaced", () => {
        // Arrange
        const issueKey = "ISSUE-123";
        let text = `${issueKey} needs to be done immediately`;
        const issueRegex = /ISSUE-123(?=\s)/gm;
        const foundIssues = createFoundIssue({ key: issueKey, match: issueRegex.exec(text) as RegExpExecArray });

        const cut = new IssueReplacer();
        cut.callback = (issue: IJiraIssue) => "REPLACED!";

        // Act

        text = cut.replaceIssues(foundIssues, text);

        // Assert

        expect(text.startsWith("REPLACED!")).to.be.equal(true);
    });

    it("Not recognized issues should not be replaced", () => {
        // Arrange
        const issueKey1 = "ISSUE-123";
        const issueKey2 = "ISSUE-456";
        const replaced = "REPLACED!";
        let text = `${issueKey1} needs to be done immediately, [${issueKey1}], ${issueKey2} `;
        const expectedResultText = `${replaced} needs to be done immediately, [${issueKey1}], ${replaced} `;
        const issueRegex = /ISSUE-\d+(?=\s)/gm;

        const foundIssues = createFoundIssue({
            key: issueKey1,
            match: issueRegex.exec(text) as RegExpExecArray,
        }, {
            key: issueKey2,
            match: issueRegex.exec(text) as RegExpExecArray
        });

        const cut = new IssueReplacer();
        cut.callback = (issue: IJiraIssue) => replaced;

        // Act

        text = cut.replaceIssues(foundIssues, text);

        // Assert

        expect(text).to.be.equal(expectedResultText);
    });

    it("Test Replace function", () => {

        // Arrange
        const text = "Text should be DONE by this algorithm";
        const done = "DONE";
        const replaced = "REPLACED";

        // Act

        const replacedText = replaceInTextByIndexAndLength(text, replaced, text.indexOf(done), done.length);

        // Assert

        expect(replacedText).to.be.equal("Text should be REPLACED by this algorithm");
    });
});

function createFoundIssue(
    ...issues: Array<{
        key: string;
        match: RegExpExecArray;
    }>
): Array<IFoundIssue> {
    const retarray: Array<IFoundIssue> = [];
    for (const issue of issues) {
        retarray.push({
            issueId: issue.key,
            foundMatch: issue.match,
            issue: {
                key: issue.key,
                fields: {
                    summary: "Summary",
                    description: "Description",
                    issuetype: {
                        name: "IssuetypeName",
                        iconUrl: "IssuetypeIconurl",
                    },
                    status: { name: "statusName" },
                },
            },
        });
    }

    return retarray;
}
