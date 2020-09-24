import { IHttp, IHttpResponse, ILogger } from "@rocket.chat/apps-engine/definition/accessors";

let sessionCookie: string;

export interface IJiraAccess {
    username: string;
    password: string;
    serverUrl: string;
}

export class JiraConnection {

    public get serverUrl(): string {
        return this.jira.serverUrl;
    }

    constructor(private logger: ILogger, private http: IHttp, private jira: IJiraAccess) {

    }

    public async request<T>(url: string): Promise<T> {

        const fullUrl = this.jira.serverUrl + url.startsWith("/") ? url : ("/" + url);

        this.logger.debug("Requesting: " + fullUrl);

        this.logger.debug("Using session cookie: " + sessionCookie);

        if (!sessionCookie) {
            await this.login();
        }

        this.logger.debug("Used session cookie", sessionCookie);

        const response = await this.http.get(url, {
            headers: {
                cookie: sessionCookie
            }
        });

        this.logger.debug(
            "JIRA Server returned HTTP Status",
            response.statusCode
        );

        if (response.statusCode === 401) {
            this.logger.debug("Unauthorized, trying to log in");
            await this.login();
            this.logger.debug("Using session cookie: " + sessionCookie);
            return await this.request<T>(url);
        }
        this.logger.debug("Received Response", response);

        if (!this.isSuccessStatusCode(response.statusCode)) {
            this.logger.error("Response has error status code", response);
            throw new Error("Could not get Response. Http Status Code: " + response.statusCode);
        }

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

    private isSuccessStatusCode(statusCode: number): boolean {
        try {
            return statusCode < 300;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }
}
