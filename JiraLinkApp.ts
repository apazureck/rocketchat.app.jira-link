import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageBuilder,
    IPersistence,
    IRead
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import {
    IMessage,
    IPreMessageSentModify,
    IPreMessageUpdatedModify
} from "@rocket.chat/apps-engine/definition/messages";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { extendConfiguration } from "./configuration/configuration";
import { JiraIssueMessageHandler } from "./messageHandlers/JiraIssueMessageHandler";
import { JiraIssueMessageUpdater } from "./messageHandlers/jiraIssueMessageUpdater";

export class JiraLinkApp extends App
    implements IPreMessageSentModify, IPreMessageUpdatedModify {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public executePreMessageUpdatedModify(
        message: IMessage,
        builder: IMessageBuilder,
        read: IRead,
        http: IHttp,
        persistence: IPersistence
    ): Promise<IMessage> {
        return new JiraIssueMessageUpdater(
            this.getLogger()
        ).executePreMessageUpdatedModify(
            message,
            read,
            http,
            persistence,
            builder
        );
    }

    public async initialize(
        configurationExtend: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        await this.extendConfiguration(configurationExtend, environmentRead);
        this.getLogger().log("Jira Link started");
    }

    public executePreMessageSentModify(
        message: IMessage,
        builder: IMessageBuilder,
        read: IRead,
        http: IHttp,
        persistence: IPersistence
    ): Promise<IMessage> {
        return new JiraIssueMessageHandler(
            this.getLogger()
        ).executePreMessageSentModify(
            message,
            read,
            http,
            persistence,
            builder
        );
    }

    protected async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {
        extendConfiguration(configuration, environmentRead);
    }
}
