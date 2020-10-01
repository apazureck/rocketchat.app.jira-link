import {
    ILogger
} from "@rocket.chat/apps-engine/definition/accessors";
import { IJiraConnection } from "./jiraConnection.abstraction";

export interface IJiraIssueBase {
    key: string;
    fields: {
        issuetype: {
            name: string;
            iconUrl: string;
        };
        description: string;
        summary: string;
        status: {
            name: string;
        };
    };

    /**
     * These field is set by the issuer for link creation in the attachment
     *
     * @type {string}
     * @memberof IJiraIssue
     */
    jiraLinkAddress: string;

    /**
     * This field is set by the issuer. This is the browse link to the server
     *
     * @type {string}
     * @memberof IJiraIssue
     */
    jiraLinkBrowseAddress: string;

    /**
     * Server the issue was found on
     *
     * @type {string}
     * @memberof IJiraIssue
     */
    jiraLinkServerUrl: string;
}

export interface ISearchResult {
    expand: string;
    startAt: number;
    maxResults: number;
    total: number;
    issues: Array<IJiraIssueBase>;
}

export interface IJiraLinkEntity {
    jiraLinkAddress: string;
    jiraLinkBrowseAddress: string;
    jiraLinkServerUrl: string;
}

export const ISSUE_URL_PREFIX = "/rest/api/2/issue/";

export interface IJiraIssue extends IJiraIssueBase, IJiraLinkEntity {}

export class JiraIssueProvider {

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
