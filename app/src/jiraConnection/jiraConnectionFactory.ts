import { IHttp, ILogger, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { settingJiraPassword, settingJiraServerAddress, settingJiraUserName } from "../configuration/configuration";
import { IJiraConnection } from "../definition/jiraConnection";
import { JiraConnection } from "./jiraConnection";

export async function createJiraConnection(logger: ILogger, http: IHttp, settings: ISettingRead): Promise<IJiraConnection> {
    return new JiraConnection(logger, http, {
        password: await settings.getValueById(settingJiraPassword),
        serverUrl: await settings.getValueById(settingJiraServerAddress),
        username: await settings.getValueById(settingJiraUserName)
    });
}
