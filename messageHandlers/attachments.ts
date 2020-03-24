import { IMessageAttachment } from "@rocket.chat/apps-engine/definition/messages";
import { IJiraIssue } from "../jiraConnection/issuer";

export interface IFoundIssue {
    /**
     * The issue found on the JIRA server
     *
     * @type {IJiraIssue}
     * @memberof IFoundIssue
     */
    issue: IJiraIssue;

    /**
     * The found match of the search regex
     *
     * @type {RegExpExecArray}
     * @memberof IFoundIssue
     */
    foundMatch: RegExpExecArray;

    /**
     * The found issue ID in the message text (to replace)
     *
     * @type {string}
     * @memberof IFoundIssue
     */
    issueId: string;
}

export function createAttachment(i: IFoundIssue): IMessageAttachment {
    {
        return {
            text: `**${i.issue.key}** [${i.issue.fields.summary}](${i.issue.jiraLinkBrowseAddress}) - ${i.issue.fields.status.name}`,
            jlTag: i.issue.key,
            color: "cyan",
            thumbnailUrl: i.issue.fields.issuetype.iconUrl,
        } as IMessageAttachment;
    }
}
