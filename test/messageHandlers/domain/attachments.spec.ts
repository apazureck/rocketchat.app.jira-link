import { expect } from "chai";
import "mocha";
import { IJiraIssue } from "../../../src/definition/jiraConnection";
import { IFoundIssue } from "../../../src/definition/messageHandling";
import { AttachmentCreator } from "../../../src/messageHandlers/domain/attachmentCreator";

describe("Tests for attachment generation", () => {
    it("Correct Issue should create attachment", () => {
        // Arrange

        const foundIissue: IFoundIssue = {
            issueId: "ISSUE-123",
            foundMatch: { index: 0, length: 1 } as RegExpExecArray,
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

        const cut = new AttachmentCreator();

        // Act

        const attachment = cut.createAttachment(foundIissue);

        // Assert

        expect((attachment as any).jlTag).be.equal(foundIissue.issue.key);
        expect(attachment.text).be.equal(`**${foundIissue.issue.key}** [${foundIissue.issue.fields.summary}](${foundIissue.issue.jiraLinkBrowseAddress}) - ${foundIissue.issue.fields.status.name}`);
        expect(attachment.thumbnailUrl).be.equal(foundIissue.issue.fields.issuetype.iconUrl);
    });
});
