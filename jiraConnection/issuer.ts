import { IHttp, ILogger } from "@rocket.chat/apps-engine/definition/accessors";

let sessionCookie: string;

export interface IJiraAccess {
    username: string;
    password: string;
    serverUrl: string;
}

export interface IJiraIssue {
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
}

export class JiraIssuer {
    constructor(
        private jira: IJiraAccess,
        private http: IHttp,
        private logger: ILogger
    ) {}

    public async getIssue(issueName: string): Promise<IJiraIssue | undefined> {
        const issueUrl = this.jira.serverUrl + "/rest/api/2/issue/" + issueName;
        this.logger.debug("Requesting Jira Issue: " + issueUrl);
        this.logger.debug("Using session cookie: " + sessionCookie);
        let response = await this.http.get(issueUrl, {
            headers: {
                cookie: sessionCookie
            }
        });

        this.logger.debug(
            "JIRA Server returned HTTP Status " + response.statusCode
        );

        if (response.statusCode === 401) {
            this.logger.debug("Unauthorized, trying to log in");
            await this.login();
            this.logger.debug("Using session cookie: " + sessionCookie);
            response = await this.http.get(issueUrl, {
                headers: {
                    cookie: sessionCookie
                }
            });
        }

        if (response.statusCode === 404) {
            this.logger.debug("Issue was not found on server");
            return undefined;
        }

        this.logger.debug(
            "Found issue entry with the following data:",
            response.data
        );
        response.data.jiraLinkAddress = issueUrl;
        return response.data;
    }

    private async login(): Promise<void> {
        const response = await this.http.post(
            this.jira.serverUrl + "/rest/auth/1/session",
            {
                data: {
                    username: this.jira.username,
                    password: this.jira.password
                }
            }
        );
        this.logger.debug("Got response code " + response.statusCode);
        if (response.statusCode !== 200) {
            throw new Error("Could not login");
        }
        if (response.headers) {
            sessionCookie = response.headers["set-cookie"];
            this.logger.debug(
                "Setting session cookie: " + response.headers["set-cookie"]
            );
        }
    }
}
