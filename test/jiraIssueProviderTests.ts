import { ILogger } from "@rocket.chat/apps-engine/definition/accessors";
import { expect } from "chai";
import "mocha";
import { anyString, anything, mock, when } from "ts-mockito";
import { It, Mock } from "typemoq";
// tslint:disable:no-unused-expression

import { JiraConnection } from "../src/jiraConnection/jiraConnection";
import { IJiraIssue, ISSUE_URL_PREFIX, JiraIssueProvider } from "../src/jiraConnection/jiraIssueProvider";

describe("Jira Issue Provider Tests", () => {
    it("Fail should return undefined", async () => {
        const issueId = "PRJ-123";
        const requestUrl = ISSUE_URL_PREFIX + issueId;
        const logger: ILogger = mock<ILogger>();
        const jiraConnectionMock = Mock.ofType<JiraConnection>();
        jiraConnectionMock.setup(jc => jc.request(It.isAny())).throws(new Error());

        const cut = new JiraIssueProvider(jiraConnectionMock.object, logger);

        const result = await cut.getIssue(issueId);

        expect(result).to.be.undefined;
    });
});
