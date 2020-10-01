import { IConfigurationExtend, IEnvironmentRead, ISettingsExtend } from "@rocket.chat/apps-engine/definition/accessors";
import { config, expect } from "chai";
import "mocha";
import { Mock } from "typemoq";
import { extendConfiguration } from "../../src/configuration/configuration";

describe("Tests for configuration generation", () => {
    it("Settings should work properly", () => {
        // Arrange

        const settingsMock = Mock.ofType<ISettingsExtend>();

        // Act

        extendConfiguration(settingsMock.object);

        // Assert

    });
});
