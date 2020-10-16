import {
    ILogger,
    ISettingRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    SETTINGS
} from "../../configuration/configuration";
import { IJiraIssueProvider } from "../../definition/jiraConnection";
import {
    IFoundIssue,
    IJiraIssueMessageParser,
} from "../../definition/messageHandling";
import { replaceInTextByIndexAndLength } from "./issueReplacer";

export class IssueMessageParser implements IJiraIssueMessageParser {
    /**
     *
     */
    constructor(
        private issuer: IJiraIssueProvider,
        private logger: ILogger,
        private settings: ISettingRead
    ) {}
    public async getIssuesFromMessage(
        messageText: string
    ): Promise<Array<IFoundIssue>> {
        // Get Regex from the settings

        const foundIssues: Array<IFoundIssue> = [];

        let foundMatch: RegExpExecArray | null;

        const filteredText = await this.filterText(messageText);

        const searchIssueRegex = new RegExp(
            await this.settings.getValueById(SETTINGS.regex),
            "gm"
        );
        // tslint:disable-next-line: no-conditional-assignment
        while ((foundMatch = searchIssueRegex.exec(filteredText))) {
            const issueId = foundMatch[foundMatch.length - 1];

            if (!issueId) {
                continue;
            }

            this.logger.debug("Found issue", issueId);
            const issue = await this.issuer.getIssue(issueId);

            if (!issue || !issue.fields) {
                continue;
            }

            foundIssues.push({
                issue,
                foundMatch,
                issueId,
            });
        }
        return foundIssues;
    }

    private async filterText(messageText: string) {
        const filterRegex = new RegExp(
            await this.settings.getValueById(SETTINGS.filterRegex),
            "gm"
        );
        let filteredText = messageText;
        let match: RegExpExecArray | null;
        while ((match = filterRegex.exec(messageText)) !== null) {
            filteredText = replaceInTextByIndexAndLength(filteredText, " ".repeat(match[0].length), match.index, match[0].length);
        }
        return filteredText;
    }
}