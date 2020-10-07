import { IHttp, ILogger, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { settingJiraPassword, settingJiraServerAddress, settingJiraUserName } from "../configuration/configuration";
import { IJiraConnection } from "../definition/jiraConnection";
import { JiraConnection } from "./jiraConnection";

export async function createJiraConnection(logger: ILogger, http: IHttp, settings: ISettingRead): Promise<IJiraConnection> {
    let cleanserverurl: string = await settings.getValueById(settingJiraServerAddress);
    cleanserverurl = cleanserverurl.endsWith("/") ? cleanserverurl : cleanserverurl + "/";
    return new JiraConnection(logger, http, {
        password: await settings.getValueById(settingJiraPassword),
        serverUrl: cleanserverurl,
        username: await settings.getValueById(settingJiraUserName)
    });
}
