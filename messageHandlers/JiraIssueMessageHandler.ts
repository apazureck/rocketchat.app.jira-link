import {
    IHttp,
    ILogger,
    IMessageBuilder,
    IPersistence,
    IRead,
    ISettingRead
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IMessage,
} from "@rocket.chat/apps-engine/definition/messages";
import {
    settingJiraPassword,
    settingJiraServerAddress,
    settingJiraUserName,
    settingRegex
} from "../configuration/configuration";
import { JiraIssuer } from "../jiraConnection/issuer";
import { createAttachment, IFoundIssue } from "./attachments";

export class JiraIssueMessageHandler {
    constructor(private logger: ILogger) {}
    public async executePreMessageSentModify(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        builder: IMessageBuilder
    ): Promise<IMessage> {
        if (!message.text) {
            return message;
        }

        this.logger.log(message.text);

        const settings = read.getEnvironmentReader().getSettings();

        const foundIssues = await this.getIssuesFromMessage(
            message.text,
            settings,
            http
        );

        await this.createIssueLinks(
            foundIssues,
            builder,
            await settings.getValueById(settingJiraServerAddress)
        );

        await this.createAttachmentLinks(foundIssues, builder);

        return builder.getMessage();
    }

    private createAttachmentLinks(
        foundIssues: Array<IFoundIssue>,
        builder: IMessageBuilder
    ) {
        this.logger.debug("Attachments", builder.getAttachments());
        builder.setAttachments(foundIssues.map(createAttachment));
    }

    private async createIssueLinks(
        foundIssues: Array<IFoundIssue>,
        messageBuilder: IMessageBuilder,
        jiraServerUrl: string
    ): Promise<void> {
        let text = messageBuilder.getText();
        for (const issue of foundIssues) {
            text = text.replace(
                issue.issueId,
                `[${issue.issue.key}](${jiraServerUrl +
                    "/browse/" +
                    issue.issue.key})`
            );
        }
        messageBuilder.setText(text);
        messageBuilder.setParseUrls(false);
    }

    private async getIssuesFromMessage(
        messageText: string,
        settings: ISettingRead,
        http: IHttp
    ): Promise<Array<IFoundIssue>> {
        // Get Regex from the settings
        const regex = new RegExp(
            await settings.getValueById(settingRegex),
            "gm"
        );

        // Get a new issuer to find the issues on the jira server
        const issuer = new JiraIssuer(
            {
                serverUrl: await settings.getValueById(
                    settingJiraServerAddress
                ),
                password: await settings.getValueById(settingJiraPassword),
                username: await settings.getValueById(settingJiraUserName)
            },
            http,
            this.logger
        );

        // Find all issues in the message that are available on the server
        const foundIssues: Array<IFoundIssue> = [];
        let foundMatch: RegExpExecArray | null;

        // Push all found issues on the match array for later replacement
        // tslint:disable-next-line: no-conditional-assignment
        while ((foundMatch = regex.exec(messageText))) {
            const issueId = foundMatch[0];
            this.logger.debug("Found issue " + issueId);
            const issue = await issuer.getIssue(issueId);
            if (issue) {
                this.logger.debug(
                    "Found matching issue on JIRA sever: " + issue.key
                );
                foundIssues.push({
                    issue,
                    foundMatch,
                    issueId
                });
            }
        }
        return foundIssues;
    }
}
