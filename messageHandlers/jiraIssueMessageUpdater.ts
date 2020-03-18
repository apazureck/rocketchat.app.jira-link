import {
    IHttp,
    ILogger,
    IMessageBuilder,
    IPersistence,
    IRead
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    IMessage,
    IMessageAttachment
} from "@rocket.chat/apps-engine/definition/messages";
import {
    settingJiraPassword,
    settingJiraServerAddress,
    settingJiraUserName,
    settingRegex,
    settingAddAttachments
} from "../configuration/configuration";
import { JiraIssuer } from "../jiraConnection/issuer";
import { createAttachment, IFoundIssue } from "./attachments";

export class JiraIssueMessageUpdater {
    constructor(private logger: ILogger) {}
    public async executePreMessageUpdatedModify(
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
        const serverAddress = await settings.getValueById(
            settingJiraServerAddress
        );

        const foundIssues = await this.getIssuesFromMessage(
            message.text,
            http,
            serverAddress,
            await settings.getValueById(settingJiraPassword),
            await settings.getValueById(settingJiraUserName),
            await settings.getValueById(settingRegex)
        );

        this.logger.debug("Found Issues:", foundIssues);

        await this.createIssueLinks(foundIssues, builder, serverAddress);

        this.clearAttachments(builder);
        if ((await settings.getValueById(settingAddAttachments)) === true) {
            this.createAttachments(foundIssues, builder);
        }

        builder.setParseUrls(false);
        return builder.getMessage();
    }

    private clearAttachments(builder: IMessageBuilder) {
        const toDelete: Array<number> = [];
        builder.getAttachments().forEach((a, i) => {
            if ((a as any).jlTag) {
                toDelete.push(i);
            }
        });
        toDelete.forEach(index => builder.removeAttachment(index));
    }

    private createAttachments(
        foundIssues: Array<IFoundIssue>,
        builder: IMessageBuilder
    ) {
        this.logger.debug("Attachments", builder.getAttachments());
        builder.setAttachments(foundIssues.map(i => createAttachment(i)));
    }

    private async createIssueLinks(
        foundIssues: Array<IFoundIssue>,
        messageBuilder: IMessageBuilder,
        jiraServerUrl: string
    ): Promise<void> {
        let text = messageBuilder.getText();
        for (const issue of foundIssues) {
            text = text.replace(
                issue.foundMatch[0],
                `[${issue.issue.key}](${jiraServerUrl +
                    "/browse/" +
                    issue.issue.key})`
            );
        }
        messageBuilder.setText(text);
    }

    private async getIssuesFromMessage(
        messageText: string,
        http: IHttp,
        serverUrl: string,
        password: string,
        username: string,
        jiraIssueRegex: string
    ): Promise<Array<IFoundIssue>> {
        // Get Regex from the settings
        const regstring = `\\[(${jiraIssueRegex})\\]\\(${serverUrl}/browse/${jiraIssueRegex}\\)`;
        this.logger.debug(
            "Used Regular Expression for replacement:",
            regstring
        );
        const regex = new RegExp(regstring, "gm");

        // Get a new issuer to find the issues on the jira server
        const issuer = new JiraIssuer(
            {
                serverUrl,
                password,
                username
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
            const issueId = foundMatch[1];
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
