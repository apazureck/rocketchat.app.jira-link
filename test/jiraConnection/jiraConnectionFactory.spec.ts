import { IHttp, ILogger, ISettingRead } from "@rocket.chat/apps-engine/definition/accessors";
import { expect } from "chai";
import "mocha";
import { It, Mock, Times } from "typemoq";
import { settingJiraPassword, settingJiraServerAddress, settingJiraUserName } from "../../src/configuration/configuration";
import { createJiraConnection } from "../../src/jiraConnection/jiraConnectionFactory";

describe("Tests for creating jira connections", () => {
    it("Server Url should be set correctly", async () => {
        // Arrange
        const serverUrl = "serverUrl";
        const settingsMock = Mock.ofType<ISettingRead>();
        const loggerMock = Mock.ofType<ILogger>();
        const httpMock = Mock.ofType<IHttp>();

        settingsMock.setup(s => s.getValueById(settingJiraServerAddress)).returns(async () => serverUrl);

        // Act

        const connection = await createJiraConnection(loggerMock.object, httpMock.object, settingsMock.object);

        // Assert

        expect(connection.serverUrl).equals(serverUrl);
    });

    it("username and password should be set correctly", async () => {
        // Arrange
        const serverUrl = "serverUrl";
        const password = "password";
        const username = "johndoe";
        const settingsMock = Mock.ofType<ISettingRead>();
        const loggerMock = Mock.ofType<ILogger>();
        const httpMock = Mock.ofType<IHttp>();

        settingsMock.setup(s => s.getValueById(settingJiraServerAddress)).returns(async () => serverUrl);
        settingsMock.setup(s => s.getValueById(settingJiraPassword)).returns(async () => password);
        settingsMock.setup(s => s.getValueById(settingJiraUserName)).returns(async () => username);

        // Act

        const connection = await createJiraConnection(loggerMock.object, httpMock.object, settingsMock.object);
        connection.request("testurl");

        // Assert

        httpMock.verify(http => http.post(It.is(url => url.indexOf("/rest/auth/1/session") > -1), It.isObjectWith({
            data: {
                username,
                password
            }
        })), Times.once());

        expect(connection.serverUrl).equals(serverUrl);
    });
});
