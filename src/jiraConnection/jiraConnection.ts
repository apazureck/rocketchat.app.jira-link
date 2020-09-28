import {
    IHttp,
    IHttpResponse,
    ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";

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

    constructor(
        private logger: ILogger,
        private http: IHttp,
        private jira: IJiraAccess
    ) {}

    public async request<T>(url: string): Promise<T> {
        await this.loginIfNoSessionCookieIsSet();

        return await this.requestFromServer<T>(url);
    }

    private async loginIfNoSessionCookieIsSet(): Promise<void> {
        if (!sessionCookie) {
            await this.login();
        }
    }

    private async requestFromServer<T>(relativeUrl: string): Promise<T> {
        let response: IHttpResponse;
        let retry = false;

        do {
            response = await this.performGetRequest(relativeUrl);

            if (this.isSuccessStatusCode(response)) {
                return response.data;
            }

            if (!this.isAuthorized(response)) {
                this.logger.debug("Session cookie expired, logging in again");
                await this.login();
                retry = true;
            } else {
                retry = false;
            }
        } while (retry);

        throw new Error(
            "Could not get Response. Http Status Code: " + response.statusCode
        );
    }

    private createFullUrl(relativeUrl: string): string {
        return this.jira.serverUrl + relativeUrl.startsWith("/")
            ? relativeUrl
            : "/" + relativeUrl;
    }

    private performGetRequest(relativeUrl: string): Promise<IHttpResponse> {
        const absoluteUrl = this.createFullUrl(relativeUrl);
        this.logger.debug(
            "Requesting " + absoluteUrl,
            "Using session cookie: " + sessionCookie
        );
        return this.http.get(absoluteUrl, {
            headers: {
                cookie: sessionCookie,
            },
        });
    }

    private isAuthorized(response: IHttpResponse): boolean {
        return response.statusCode !== 401;
    }

    private async login(): Promise<void> {
        const response = await this.requestLogin();
        this.logger.debug("Got response code " + response.statusCode);
        if (!this.isSuccessStatusCode(response)) {
            throw new Error("Could not login");
        }
        if (response.headers) {
            sessionCookie = response.headers["set-cookie"];
            this.logger.debug(
                "Setting session cookie: " + response.headers["set-cookie"]
            );
        }
    }

    private requestLogin(): Promise<IHttpResponse> {
        return this.http.post(this.serverUrl + "/rest/auth/1/session", {
            data: {
                username: this.jira.username,
                password: this.jira.password,
            },
        });
    }

    private isSuccessStatusCode(response: IHttpResponse): boolean {
        try {
            return response.statusCode < 300;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }
}
