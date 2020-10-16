import { IMessageAttachment, MessageActionButtonsAlignment } from "@rocket.chat/apps-engine/definition/messages";
import { IAttachmentCreator, IFoundIssue, JIRA_ISSUE_ATTACHMENT_TYPE } from "../../definition/messageHandling";

/**
 *
 *
 * @export
 * @param {IFoundIssue} i
 * @returns {IMessageAttachment}
 */
export class AttachmentCreator implements IAttachmentCreator {
    public createAttachment(i: IFoundIssue): IMessageAttachment {
        {
            const issue = i.issue;
            return {
                text: `**${issue.key}** [${issue.fields.summary}](${issue.jiraLinkBrowseAddress}) - ${issue.fields.status.name}`,
                jlTag: i.issue.key,
                color: "cyan",
                thumbnailUrl: i.issue.fields.issuetype.iconUrl,
                actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
                type: JIRA_ISSUE_ATTACHMENT_TYPE
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

}
