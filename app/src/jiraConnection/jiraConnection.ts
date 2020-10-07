import {
    IHttp,
    IHttpResponse,
    ILogger,
    ISettingsExtend,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IJiraConnection } from "../definition/jiraConnection";

export interface IJiraAccess {
    username: string;
    password: string;
    serverUrl: string;
}

export class JiraConnection implements IJiraConnection {

    private sessionCookie: string;

    public get serverUrl(): string {
        return this.jira.serverUrl;
    }

    constructor(
        private logger: ILogger,
        private http: IHttp,
        private jira: IJiraAccess
    ) {
        logger.debug("Creating Jira Conection", jira);
    }

    public async request<T>(url: string): Promise<T> {
        await this.loginIfNoSessionCookieIsSet();

        return await this.requestGetFromServer<T>(url);
    }

    private async loginIfNoSessionCookieIsSet(): Promise<void> {
        if (!this.sessionCookie) {
            await this.login();
        }
    }

    private async requestGetFromServer<T>(relativeUrl: string): Promise<T> {
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
        return this.jira.serverUrl + (relativeUrl.startsWith("/")
            ? relativeUrl.substring(1)
            : relativeUrl);
    }

    private performGetRequest(relativeUrl: string): Promise<IHttpResponse> {
        const absoluteUrl = this.createFullUrl(relativeUrl);
        this.logger.debug("Requesting from url", absoluteUrl);
        this.logger.debug(
            "Requesting " + absoluteUrl,
            "Using session cookie: " + this.sessionCookie
        );
        return this.http.get(absoluteUrl, {
            headers: {
                cookie: this.sessionCookie,
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
            this.sessionCookie = response.headers["set-cookie"];
            this.logger.debug(
                "Setting session cookie: " + response.headers["set-cookie"]
            );
        }
    }

    private requestLogin(): Promise<IHttpResponse> {
        const absoluteUrl = this.createFullUrl("/rest/auth/1/session");
        this.logger.debug("Requesting login from url", absoluteUrl);
        return this.http.post(absoluteUrl, {
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
