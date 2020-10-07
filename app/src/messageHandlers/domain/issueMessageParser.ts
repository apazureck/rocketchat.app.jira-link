import {
    ILogger,
    ISettingRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    settingFilterRegex,
    settingRegex,
} from "../../configuration/configuration";
import { IJiraIssueProvider } from "../../definition/jiraConnection";
import {
    IFoundIssue,
    IJiraIssueMessageParser,
} from "../../definition/messageHandling";

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

        const filterRegex = new RegExp(
            await this.settings.getValueById(settingFilterRegex),
            "gm"
        );
        const filteredText = messageText.replace(filterRegex, "");

        const searchIssueRegex = new RegExp(
            await this.settings.getValueById(settingRegex),
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

            if (!issue) {
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
}
