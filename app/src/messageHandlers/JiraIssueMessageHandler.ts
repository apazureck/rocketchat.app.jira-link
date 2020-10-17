import { ILogger, IMessageBuilder, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";

import { SETTINGS } from "../configuration/configuration";
import { IAttachmentCreator, IFoundIssue, IIssueReplacer, IJiraIssueMessageParser } from "../definition/messageHandling";

export class JiraIssueMessageHandler {
    private get messageText(): string | undefined {
        return this.messageBuilder.getText();
    }

    constructor(
        private logger: ILogger,
        private settings: ISettingRead,
        private messageparser: IJiraIssueMessageParser,
        private messageBuilder: IMessageBuilder,
        private issueReplacer: IIssueReplacer,
        private attachmentCreator: IAttachmentCreator,
    ) {}

    public async replaceIssuesInMessage(): Promise<IMessage> {
        if (!this.messageText) {
            return this.messageBuilder.getMessage();
        }

        this.logger.debug("Message Text", this.messageText);

        const foundIssues = await this.messageparser.getIssuesFromMessage(
            this.messageText
        );

        await this.createIssueLinks(foundIssues);

        if (await this.addAttachmentsIsActivated()) {
            await this.createAttachmentLinks(foundIssues, this.messageBuilder);
        }

        return this.messageBuilder.getMessage();
    }

    private async addAttachmentsIsActivated(): Promise<boolean> {
        const addAttachments = await this.settings.getValueById(SETTINGS.addAttachments) as boolean;
        this.logger.debug("Should add attachments", addAttachments);
        return addAttachments === true;
    }

    private createAttachmentLinks(
        foundIssues: Array<IFoundIssue>,
        builder: IMessageBuilder
    ) {
        this.logger.debug("Attachments alreadey on message", builder.getAttachments());
        builder.setAttachments(this.attachmentCreator.createDistinctAttachments(foundIssues));
    }

    private async createIssueLinks(
        foundIssues: Array<IFoundIssue>
    ): Promise<void> {
        let text = this.messageBuilder.getText();

        text = await this.issueReplacer.replaceIssues(foundIssues, text);

        this.messageBuilder.setText(text);
        this.messageBuilder.setParseUrls(false);
    }

    private clearAttachments(builder: IMessageBuilder) {
        const toDelete: Array<number> = [];
        builder.getAttachments().forEach((a, i) => {
            if (a.type === "jira-link-attachment") {
                toDelete.push(i);
            }
        });
        toDelete.forEach((index) => builder.removeAttachment(index));
    }
}
