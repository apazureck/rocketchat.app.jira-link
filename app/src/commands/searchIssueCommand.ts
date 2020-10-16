import {
    IHttp,
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
import { JiraConnection } from "../jiraConnection/jiraConnection";
import { JiraIssueProvider } from "../jiraConnection/jiraIssueProvider";
import { ILogProvider } from "../types/ilogprovider";

export class SearchIssueCommand implements ISlashCommand {
    public command = "searchjiraissue";
    public i18nParamsExample = "jira-link-searchIssue-example";
    public i18nDescription = "jira-link-searchIssue-description";
    public providesPreview = true;

    constructor(private log: ILogProvider) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public async previewer(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<ISlashCommandPreview> {
        const logger = this.log.getLogger();
        try {
            logger.log("Searching Issues...");
            const settings = read.getEnvironmentReader().getSettings();

            const jc = new JiraConnection(logger, http, {
                serverUrl: await settings.getValueById(
                    SETTINGS.jiraServerAddress
                ),
                password: await settings.getValueById(SETTINGS.jiraPassword),
                username: await settings.getValueById(SETTINGS.jiraUserName)
            });

            const search = new JiraIssueProvider(
                jc,
                logger
            );

            logger.debug("Using Arguments", context.getArguments());
            const searchString = context.getArguments().join(" ");
            const searchResult = await search.searchIssue(searchString);

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
        } catch (error) {
            logger.error(error);
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
        const logger = this.log.getLogger();
        try {
            logger.debug("Creating message for", item);
            const newMessage = modify.getCreator().startMessage();
            newMessage
                .setSender(context.getSender())
                .setRoom(context.getRoom())
                .setThreadId(context.getThreadId() as string);

            newMessage.setText(item.id);
            modify.getCreator().finish(newMessage);
        } catch (error) {
            logger.error("Failed creating message", error);
        }
    }
}
