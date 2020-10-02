import { ILogger, IMessageBuilder, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";

import { settingAddAttachments } from "../configuration/configuration";
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

        if (await this.setAttachmentsIsActivated()) {
            await this.createAttachmentLinks(foundIssues, this.messageBuilder);
        }

        return this.messageBuilder.getMessage();
    }

    private async setAttachmentsIsActivated(): Promise<boolean> {
        return ((await this.settings.getValueById(settingAddAttachments)) === true
        );
    }

    private createAttachmentLinks(
        foundIssues: Array<IFoundIssue>,
        builder: IMessageBuilder
    ) {
        this.logger.debug("Attachments", builder.getAttachments());
        builder.setAttachments(foundIssues.map(this.attachmentCreator.createAttachment));
    }

    private async createIssueLinks(
        foundIssues: Array<IFoundIssue>
    ): Promise<void> {
        let text = this.messageBuilder.getText();

        text = this.issueReplacer.replaceIssues(foundIssues, text);

        this.messageBuilder.setText(text);
        this.messageBuilder.setParseUrls(false);
    }
}
