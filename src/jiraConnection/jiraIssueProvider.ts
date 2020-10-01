import {
    ILogger
} from "@rocket.chat/apps-engine/definition/accessors";
import { IJiraConnection, IJiraIssue, IJiraIssueProvider, ISearchResult } from "./jiraConnection.abstraction";

export const ISSUE_URL_PREFIX = "/rest/api/2/issue/";

export class JiraIssueProvider implements IJiraIssueProvider {

    constructor(
        private jiraConnection: IJiraConnection,
        private logger: ILogger
    ) {}

    public async getIssue(issueId: string): Promise<IJiraIssue | undefined> {
        const issueUrl = ISSUE_URL_PREFIX + issueId;
        let response: IJiraIssue;

        try {
            response = await this.jiraConnection.request<IJiraIssue>(issueUrl);
        } catch (error) {
            return undefined;
        }

        this.logger.debug(
            "Found issue entry with the following data:",
            response
        );

        response.jiraLinkAddress = issueUrl;
        response.jiraLinkBrowseAddress = `${this.jiraConnection.serverUrl}/browse/${issueId}`;
        response.jiraLinkServerUrl = this.jiraConnection.serverUrl;
        return response;
    }

    public async searchIssue(searchString: string): Promise<ISearchResult> {
        const queryUrl = `/rest/api/2/search?jql=text~'${searchString}'`;
        this.logger.debug("Seraching Issue query", queryUrl);
        const response = await this.jiraConnection.request<ISearchResult>(queryUrl);

        return response;
    }
}
