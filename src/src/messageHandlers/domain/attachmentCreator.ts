import { IMessageAttachment, MessageActionButtonsAlignment } from "@rocket.chat/apps-engine/definition/messages";
import { IAttachmentCreator, IFoundIssue } from "../../definition/messageHandling";

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

}
