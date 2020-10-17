import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageBuilder,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import {
    IMessage,
    IPreMessageSentModify,
    IPreMessageUpdatedModify
} from "@rocket.chat/apps-engine/definition/messages";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { SearchIssueCommand } from "./src/commands/searchIssueCommand";
import { extendConfiguration } from "./src/configuration/configuration";
import { createJiraConnection } from "./src/jiraConnection/jiraConnectionFactory";
import { JiraIssueProvider } from "./src/jiraConnection/jiraIssueProvider";
import { AttachmentCreator } from "./src/messageHandlers/domain/attachmentCreator";
import { IssueMessageParser } from "./src/messageHandlers/domain/issueMessageParser";
import { IssueReplacer } from "./src/messageHandlers/domain/issueReplacer";
import { JiraIssueMessageHandler } from "./src/messageHandlers/JiraIssueMessageHandler";
import {ILogProvider} from "./src/types/ilogprovider";

export class JiraLinkApp extends App
    implements IPreMessageSentModify, IPreMessageUpdatedModify, ILogProvider {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async initialize(
        configurationExtend: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        await this.extendConfiguration(configurationExtend, environmentRead);
        await configurationExtend.slashCommands.provideSlashCommand(new SearchIssueCommand(this));
        this.getLogger().log("Jira Link started");
    }

    public async executePreMessageUpdatedModify(
        message: IMessage,
        builder: IMessageBuilder,
        read: IRead,
        http: IHttp,
        persistence: IPersistence
    ): Promise<IMessage> {
        return await this.HandleMessage(http, read, builder);
    }

    public async executePreMessageSentModify(
        message: IMessage,
        builder: IMessageBuilder,
        read: IRead,
        http: IHttp,
        persistence: IPersistence
    ): Promise<IMessage> {
        return await this.HandleMessage(http, read, builder);
    }

    protected async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        extendConfiguration(configuration.settings);
    }

    private async HandleMessage(http: IHttp, read: IRead, builder: IMessageBuilder): Promise<IMessage> {
        const jiraConnection = await createJiraConnection(this.getLogger(), http, read.getEnvironmentReader().getSettings());
        const jiraIssueProvider = new JiraIssueProvider(jiraConnection, this.getLogger());
        const messageParser = new IssueMessageParser(jiraIssueProvider, this.getLogger(), read.getEnvironmentReader().getSettings());
        const issueReplacer = new IssueReplacer(read.getEnvironmentReader().getSettings(), this.getLogger());

        return await new JiraIssueMessageHandler(
            this.getLogger(),
            read.getEnvironmentReader().getSettings(),
            messageParser,
            builder,
            issueReplacer,
            new AttachmentCreator()
        ).replaceIssuesInMessage();
    }
}
