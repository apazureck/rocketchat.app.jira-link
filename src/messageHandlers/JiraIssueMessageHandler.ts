import {
    ILogger,
    IMessageBuilder,
    ISettingRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import {
    settingAddAttachments,
    settingRegex,
    settingsFilterRegex,
} from "../configuration/configuration";
import { IJiraIssueProvider } from "../jiraConnection/jiraConnection.abstraction";
import { createAttachment, IFoundIssue } from "./domain/attachments";
import { IssueMessageParser } from "./domain/issueMessageParser";

export class JiraIssueMessageHandler {
    constructor(
        private logger: ILogger,
        private settings: ISettingRead,
        private jiraIssueProvider: IJiraIssueProvider,
        private messageBuilder: IMessageBuilder
    ) {}

    public async executePreMessageSentModify(
        message: IMessage
    ): Promise<IMessage> {
        if (!message.text) {
            return message;
        }

        this.logger.log(message.text);

        const messageparser = new IssueMessageParser(
            this.jiraIssueProvider,
            this.logger,
            new RegExp(await this.settings.getValueById(settingRegex), "gm"),
            new RegExp(await this.settings.getValueById(settingsFilterRegex), "gm")
        );

        const foundIssues = await messageparser.getIssuesFromMessage(
            message.text
        );

        await this.createIssueLinks(foundIssues);

        if (await this.setAttachmentsIsActivated()) {
            await this.createAttachmentLinks(foundIssues, this.messageBuilder);
        }

        return this.messageBuilder.getMessage();
    }

    private async setAttachmentsIsActivated(): Promise<boolean> {
        return (
            (await this.settings.getValueById(settingAddAttachments)) === true
        );
    }

    private createAttachmentLinks(
        foundIssues: Array<IFoundIssue>,
        builder: IMessageBuilder
    ) {
        this.logger.debug("Attachments", builder.getAttachments());
        builder.setAttachments(foundIssues.map(createAttachment));
    }

    private async createIssueLinks(
        foundIssues: Array<IFoundIssue>
    ): Promise<void> {
        let text = this.messageBuilder.getText();
        for (const issue of foundIssues) {
            text = text.replace(
                issue.issueId,
                `[${issue.issue.key}](${issue.issue.jiraLinkBrowseAddress})`
            );
        }
        this.messageBuilder.setText(text);
        this.messageBuilder.setParseUrls(false);
    }
}
