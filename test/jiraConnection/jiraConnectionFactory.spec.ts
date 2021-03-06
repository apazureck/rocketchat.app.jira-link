import {
  IHttp,
  ILogger,
  ISettingRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { expect } from "chai";
import "mocha";
import { It, Mock, Times } from "typemoq";
import {
  SETTINGS
} from "../../app/src/configuration/configuration";
import { createJiraConnection } from "../../app/src/jiraConnection/jiraConnectionFactory";

describe("Tests for creating jira connections", () => {
  it("Server Url without slash should append slash", async () => {
    // Arrange
    const serverUrl = "serverUrl";
    const settingsMock = Mock.ofType<ISettingRead>();
    const loggerMock = Mock.ofType<ILogger>();
    const httpMock = Mock.ofType<IHttp>();

    settingsMock
      .setup((s) => s.getValueById(SETTINGS.jiraServerAddress))
      .returns(async () => serverUrl);

    // Act

    const connection = await createJiraConnection(
      loggerMock.object,
      httpMock.object,
      settingsMock.object
    );

    // Assert

    expect(connection.serverUrl).equals(serverUrl + "/");
  });

  it("Server Url with slash should do nothing", async () => {
    // Arrange
    const serverUrl = "serverUrl/";
    const settingsMock = Mock.ofType<ISettingRead>();
    const loggerMock = Mock.ofType<ILogger>();
    const httpMock = Mock.ofType<IHttp>();

    settingsMock
      .setup((s) => s.getValueById(SETTINGS.jiraServerAddress))
      .returns(async () => serverUrl);

    // Act

    const connection = await createJiraConnection(
      loggerMock.object,
      httpMock.object,
      settingsMock.object
    );

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

    settingsMock
      .setup((s) => s.getValueById(SETTINGS.jiraServerAddress))
      .returns(async () => serverUrl);
    settingsMock
      .setup((s) => s.getValueById(SETTINGS.jiraPassword))
      .returns(async () => password);
    settingsMock
      .setup((s) => s.getValueById(SETTINGS.jiraUserName))
      .returns(async () => username);

    // Act

    const connection = await createJiraConnection(
      loggerMock.object,
      httpMock.object,
      settingsMock.object
    );
    connection.request("testurl");

    // Assert

    httpMock.verify(
      (http) =>
        http.post(
          It.is((url) => url.indexOf("/rest/auth/1/session") > -1),
          It.isObjectWith({
            data: {
              username,
              password,
            },
          })
        ),
      Times.once()
    );

    expect(connection.serverUrl).equals(serverUrl + "/");
  });
});
