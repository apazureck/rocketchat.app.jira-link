import { ILogger } from "@rocket.chat/apps-engine/definition/accessors";
import {  IJiraIssueProvider } from "../../jiraConnection/jiraConnection.abstraction";
import { IFoundIssue } from "./attachments";

export class IssueMessageParser {
    /**
     *
     */
    constructor(
        private issuer: IJiraIssueProvider,
        private logger: ILogger,
        private regex: RegExp,
        private filterRegex: RegExp,
    ) {}
    public async getIssuesFromMessage(
        messageText: string
    ): Promise<Array<IFoundIssue>> {
        // Get Regex from the settings

        const foundIssues: Array<IFoundIssue> = [];

        let foundMatch: RegExpExecArray | null;

        const filteredText = messageText.replace(this.filterRegex, "");

        // tslint:disable-next-line: no-conditional-assignment
        while ((foundMatch = this.regex.exec(filteredText))) {
            const issueId = foundMatch.pop();

            if (!issueId) {
                continue;
            }

            this.logger.debug("Found issue " + issueId);
            const issue = await this.issuer.getIssue(issueId);

            if (!issue) {
                continue;
            }

            this.logger.debug(
                "Found matching issue on JIRA sever: " + issue.key
            );
            foundIssues.push({
                issue,
                foundMatch,
                issueId,
            });
        }
        return foundIssues;
    }
}
