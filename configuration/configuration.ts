import {
    IConfigurationExtend,
    IEnvironmentRead
} from "@rocket.chat/apps-engine/definition/accessors";
import { SettingType } from "@rocket.chat/apps-engine/definition/settings";

export const settingJiraServerAddress = "jira-link-server-address";
export const settingJiraUserName = "jira-link-username";
export const settingJiraPassword = "jira-link-password";
export const settingRegex = "jira-link-regex";

export function extendConfiguration(
    configuration: IConfigurationExtend,
    environmentRead: IEnvironmentRead
): void {
    configuration.settings.provideSetting({
        id: settingJiraServerAddress,
        packageValue: "http://localhost:5000",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: "jira_link_server_address_label",
        i18nDescription: "jira_link_server_address_description"
    });
    configuration.settings.provideSetting({
        id: settingJiraUserName,
        packageValue: "<your-jira-user>",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: settingJiraUserName + "-label",
        i18nDescription: settingJiraUserName + "-description"
    });
    configuration.settings.provideSetting({
        id: settingJiraPassword,
        packageValue: "***",
        public: false,
        type: SettingType.STRING,
        multiline: false,
        required: true,
        i18nLabel: "Password",
        i18nDescription: "The password of the user."
    });
    configuration.settings.provideSetting({
        id: settingRegex,
        packageValue: "\\b\\w+-\\d+\\b",
        public: false,
        type: SettingType.CODE,
        multiline: true,
        required: true,
        i18nLabel: "Jira Issue Regex",
        i18nDescription:
            "A javascript regular expression to identify potential JIRA issue candidates in text messages.\nTo use multiple expression put one expression in each line. If first expression will not find anything, next expression is used."
    });
}
