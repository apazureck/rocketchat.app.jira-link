import { IMessageAttachment, MessageActionButtonsAlignment, MessageProcessingType } from "@rocket.chat/apps-engine/definition/messages";
import { IJiraIssueBase } from "../jiraConnection/jiraIssueProvider";

export interface IFoundIssue {
    /**
     * The issue found on the JIRA server
     *
     * @type {IJiraIssueBase}
     * @memberof IFoundIssue
     */
    issue: IJiraIssueBase;

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
/**
 *
 *
 * @export
 * @param {IFoundIssue} i
 * @returns {IMessageAttachment}
 */
export function createAttachment(i: IFoundIssue): IMessageAttachment {
    {
        return {
            text: `**${i.issue.key}** [${i.issue.fields.summary}](${i.issue.jiraLinkBrowseAddress}) - ${i.issue.fields.status.name}`,
            jlTag: i.issue.key,
            color: "cyan",
            thumbnailUrl: i.issue.fields.issuetype.iconUrl,
            actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
            // actions: [
            //     {
            //         type: MessageActionType.BUTTON,
            //         text: "Vote",
            //         msg_processing_type: MessageProcessingType.RespondWithMessage,
            //         url: "http://google.com"
            //     }
            // ]
        } as IMessageAttachment;
    }
}
