import { ILogger } from "@rocket.chat/apps-engine/definition/accessors";
import { IJiraConnection } from "../../jiraConnection/jiraConnection.abstraction";
import { JiraIssueProvider } from "../../jiraConnection/jiraIssueProvider";
import { IFoundIssue } from "./attachments";

export class IssueMessageParser {
    /**
     *
     */
    constructor(
        private jiraConnection: IJiraConnection,
        private logger: ILogger,
        private regex: RegExp
    ) {}
    public async getIssuesFromMessage(
        messageText: string
    ): Promise<Array<IFoundIssue>> {
        // Get Regex from the settings

        // Get a new issuer to find the issues on the jira server
        const issuer = new JiraIssueProvider(this.jiraConnection, this.logger);

        const foundIssues: Array<IFoundIssue> = [];

        let foundMatch: RegExpExecArray | null;

        // tslint:disable-next-line: no-conditional-assignment
        while ((foundMatch = this.regex.exec(messageText))) {
            const issueId = foundMatch.pop();

            if (!issueId) {
                continue;
            }

            this.logger.debug("Found issue " + issueId);
            const issue = await issuer.getIssue(issueId);

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
