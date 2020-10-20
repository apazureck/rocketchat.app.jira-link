import {
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    ISlashCommandPreview,
    ISlashCommandPreviewItem,
    SlashCommandContext,
    SlashCommandPreviewItemType
} from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    SETTINGS
} from "../configuration/configuration";
import { IJiraIssueProvider, ISearchResult } from "../definition/jiraConnection";
import { JiraConnection } from "../jiraConnection/jiraConnection";
import { createJiraConnection } from "../jiraConnection/jiraConnectionFactory";
import { JiraIssueProvider } from "../jiraConnection/jiraIssueProvider";
import { ILogProvider } from "../types/ilogprovider";

export class SearchIssueCommand implements ISlashCommand {
    public command = "searchjiraissue";
    public i18nParamsExample = "jira-link-searchIssue-example";
    public i18nDescription = "jira-link-searchIssue-description";
    public providesPreview = true;

    constructor(private logger: ILogger) {}

    public async executor(
        context: SlashCommandContext,
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async previewer(
        context: SlashCommandContext,
        read: IRead,
        __,
        http: IHttp,
    ): Promise<ISlashCommandPreview> {
        try {
            this.logger.log("Searching Issues...");
            this.logger.debug("Using Arguments", context.getArguments());

            const searchString = context.getArguments().join(" ");
            const issueProvider = new JiraIssueProvider(await createJiraConnection(this.logger, http, read.getEnvironmentReader().getSettings()), this.logger);
            const searchResult = await issueProvider.searchIssue(searchString);

            return this.buildPreviewFromSearchResult(searchResult);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    public async executePreviewItem(
        item: ISlashCommandPreviewItem,
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        try {
            this.logger.debug("Creating message for", item);

            this.putIssueIdInMessage(modify, context, item);

        } catch (error) {
            this.logger.error("Failed creating message", error);
        }
    }

    public putIssueIdInMessage(modify: IModify, context: SlashCommandContext, item: ISlashCommandPreviewItem) {
        const creator = modify.getCreator();
        const newMessage = creator.startMessage();

        newMessage
            .setSender(context.getSender())
            .setRoom(context.getRoom())
            .setThreadId(context.getThreadId() as string);

        newMessage.setText(item.id);

        creator.finish(newMessage);
    }

    public buildPreviewFromSearchResult(searchResult: ISearchResult): ISlashCommandPreview {
        return {
            i18nTitle: `Found ${searchResult.total} results for`,
            items: searchResult.issues.map(i => {
                return {
                    id: i.key,
                    type: SlashCommandPreviewItemType.TEXT,
                    value: `[${i.key}]\n${i.fields.summary}`
                } as ISlashCommandPreviewItem;
            })
        };
    }
}
