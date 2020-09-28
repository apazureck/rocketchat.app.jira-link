// tslint:disable:no-unused-expression

import {
    IHttp,
    IHttpResponse,
    ILogger,
} from "@rocket.chat/apps-engine/definition/accessors";
import { expect } from "chai";
import "mocha";
import { IMock, It, Mock, Times } from "typemoq";
import {
    IJiraAccess,
    JiraConnection,
} from "../src/jiraConnection/jiraConnection";

const loginurl = "server/rest/auth/1/session";

describe("JiraConnection login tests", () => {
    // Arrange globally
    const loggerMock = Mock.ofType<ILogger>();
    const httpMock = Mock.ofType<IHttp>();
    const jiraAccess: IJiraAccess = {
        serverUrl: "server",
        password: "password",
        username: "user",
    };

    beforeEach(() => {
        httpMock.reset();
    })

    it("Session Cookie should be requested on 401", async () => {
        // Arrange

        setupLoginOk(httpMock);

        setupGetOk(httpMock);

        const sut = new JiraConnection(
            loggerMock.object,
            httpMock.object,
            jiraAccess
        );

        // Act

        const result = await sut.request("any");

        // Assert

        httpMock.verify(
            (http) => http.post(It.isValue(loginurl), It.isAny()),
            Times.once()
        );
    });

    it("Login fails should throw error", async () => {
        // Arrange

        setupLoginFailing(httpMock);

        const sut = new JiraConnection(
            loggerMock.object,
            httpMock.object,
            jiraAccess
        );

        // Act

        try {
            const result = await sut.request("any");
        } catch (error) {
            // Assert
            expect(error.message).to.be.equal("Could not login");
        }
    });

    it("Relogin after expired session cookie", async () => {
        // Arrange

        setupLoginOk(httpMock);
        setupLoginOk(httpMock);

        setupGetUnauthorized(httpMock);
        setupGetOk(httpMock);

        const sut = new JiraConnection(
            loggerMock.object,
            httpMock.object,
            jiraAccess
        );

        // Act

        const result = await sut.request("any");

        expect(result).to.exist;
    });

    it("Throw error on not successfull http status code", async () => {
        // Arrange

        setupLoginOk(httpMock);
        setupGetServerError(httpMock);

        const sut = new JiraConnection(
            loggerMock.object,
            httpMock.object,
            jiraAccess
        );

        // Act

        try {
            await sut.request("any");
        } catch (error) {

            // Assert
            expect(error.message).to.equal("Could not get Response. Http Status Code: " + 500);
        }
    });
});

function setupLoginFailing(httpMock: IMock<IHttp>) {
    httpMock
        .setup((http) => http.post(It.isValue(loginurl), It.isAny()))
        .returns(async () => {
            return {
                statusCode: 503,
            } as IHttpResponse;
        });
}

function setupLoginOk(httpMock: IMock<IHttp>) {
    httpMock
        .setup((http) => http.post(It.isValue(loginurl), It.isAny()))
        .returns(async () => {
            return {
                statusCode: 200,
                url: "url",
                method: "post",
                headers: {
                    ["set-cookie"]: "sessioncookie",
                },
            } as IHttpResponse;
        });
}

function setupGetUnauthorized(httpMock: IMock<IHttp>) {
    httpMock.setup(http => http.get(It.isAnyString(), It.isAny()))
        .returns(async () => {
            return { statusCode: 401 } as IHttpResponse;
        });
}

function setupGetOk(httpMock: IMock<IHttp>) {
    httpMock
            .setup((http) => http.get(It.isAnyString(), It.isAny()))
            .returns(async () => {
                return {
                    statusCode: 200,
                    data: {}
                } as IHttpResponse;
            });
}

function setupGetServerError(httpMock: IMock<IHttp>) {
    httpMock
            .setup((http) => http.get(It.isAnyString(), It.isAny()))
            .returns(async () => {
                return {
                    statusCode: 500
                } as IHttpResponse;
            });
}
