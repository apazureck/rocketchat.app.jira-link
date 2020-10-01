import { IHttp, ILogger, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { settingJiraPassword, settingJiraServerAddress, settingJiraUserName } from "../configuration/configuration";
import { JiraConnection } from "./jiraConnection";
import { IJiraConnection } from "./jiraConnection.abstraction";

export async function createJiraConnection(logger: ILogger, http: IHttp, settings: ISettingRead): Promise<IJiraConnection> {
    return new JiraConnection(logger, http, {
        password: await settings.getValueById(settingJiraPassword),
        serverUrl: await settings.getValueById(settingJiraServerAddress),
        username: await settings.getValueById(settingJiraUserName)
    });
}
