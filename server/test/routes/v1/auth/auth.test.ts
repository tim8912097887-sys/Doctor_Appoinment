import request from "supertest";
import fs from 'fs';
import { type Express } from "express";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from "@/db/db.js";
import { users } from "@/db/schema/user.js";
import { eq } from "drizzle-orm";
import { tokens } from "@/db/schema/token.js";
import { hashPassword } from "@/utils/password.js";
import { createRawToken, createToken, hashToken } from "@/utils/token.js";
import { createVerificationToken } from "@/db/query/token.js";
import { env } from "@/configs/env.js";

const firstName = "austin";
const lastName = "river";
const email = "tim8912097887@gmail.com";

// Factory function
function createUserInfo(user: { firstName?: string,lastName?: string,email?: string,password?: string }) {
    const baseInfo = {
        firstName,
        lastName,
        email,
        password: "Aer3489!"
    }
    const userInfo = { ...baseInfo,...user };
    return userInfo;
}

function responseStructure(response: { state: string,data?: object,error?: object }) {
    const baseResponse = {
        data: null,
        error: null,
        meta: {
            timestamp: expect.any(String)
        }
    }
    return {
       ...baseResponse,
       ...response
    }
}

function loginUserInfo(user: { email?: string,password?: string }) {
    const baseInfo = {
        email,
        password: "Aer3489!"
    }
    const userInfo = { ...baseInfo,...user };
    return userInfo;
}

describe("Auth Integration Test",() => {
    let app: Express;
    beforeAll(async() => {
        // Use in ES Modules
              const __filename = fileURLToPath(import.meta.url);
              const __dirname = dirname(__filename);
              
              // Define the logs directory path
              const logDirectory = path.join(__dirname, "logs");
              
              // Ensure the directory exists synchronously before creating the stream
              if (!fs.existsSync(logDirectory)) {
                fs.mkdirSync(logDirectory, { recursive: true });
              }
              
              // For log write
              const appendStream = fs.createWriteStream(path.join(logDirectory, "access.log"),{ flags: 'a' });
              const { initializeApp } = await import("@/app.js");
              app = initializeApp(appendStream);
    })
    describe("SignUp",() => {

        describe("Success",() => {

            it('When Signup with valid data,should response with 201 statusCode and Success message', async() => {
                // Arrange
                const userInfo = createUserInfo({});
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                const [createdUser] = await db.select({
                   firstName: users.firstName,
                   lastName: users.lastName,
                   email: users.email
                }).from(users).where(eq(users.email,userInfo.email));
                const [token] = await db.select({
                     id: tokens.id
                }).from(tokens);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        message: "Please Verify account before login"
                    }
                }))
                // Check actual storage
                expect(createdUser).toMatchObject({
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    email: userInfo.email
                })
                expect(token).toMatchObject({
                    id: expect.any(String)
                });
            },10000)

            it.skip('When Signup with uppercase username,should response with 201 statusCode and check Lowercase name in database', async() => {
                // Arrange
                const userInfo = createUserInfo({ firstName: firstName.toUpperCase(),lastName: lastName.toUpperCase() });
                
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                const [createdUser] = await db.select({
                   firstName: users.firstName,
                   lastName: users.lastName,
                   email: users.email
                }).from(users).where(eq(users.email,userInfo.email));
                const [token] = await db.select({
                     id: tokens.id
                }).from(tokens);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        message: "Please Verify account before login"
                    }
                }))
                // Check actual storage
                expect(createdUser).toMatchObject({
                    firstName: userInfo.firstName.toLowerCase(),
                    lastName: userInfo.lastName.toLowerCase(),
                    email: userInfo.email
                })
                expect(token).toMatchObject({
                    id: expect.any(String)
                });
            },10000)

            it.skip('When Signup with uppercase email,should response with 201 statusCode and Check Lowercase email in database', async() => {
                // Arrange
                const userInfo = createUserInfo({ email: "Tim8912097887@gmail.com" });
                // Prevent gmail rate-limit error
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
               const [createdUser] = await db.select({
                   firstName: users.firstName,
                   lastName: users.lastName,
                   email: users.email
                }).from(users).where(eq(users.email,email));
                const [token] = await db.select({
                     id: tokens.id
                }).from(tokens);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        message: "Please Verify account before login"
                    }
                }))
                // Check actual storage
                expect(createdUser).toMatchObject({
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    email
                })
                expect(token).toMatchObject({
                    id: expect.any(String)
                });
            },10000)
        })

        describe("Validation Fail",() => {

            // Invalid firstName
            it('When provide FirstName less than two character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = createUserInfo({ firstName: "e" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "First name must be at least 2 characters"
                }})
            })

            it('When provide username longer than fifty character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = createUserInfo({ firstName: new Array(17).fill("sdf").join(",") });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject(responseStructure(
                  {
                    state: "error",
                      error: {
                    status: "BadRequest",
                    code: 400,
                    detail: "First name too long"
                }}))
            })

            it('When provide FirstName with ?,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = createUserInfo({ firstName: firstName+"?" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body.data).toBeNull();
                expect(response.body).toMatchObject(responseStructure({
                    state: "error",
                      error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "First Name only allow A-Z,a-z and 0-9"
                }}))
            })
            // Invalid Email
            it('When provide invalid email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = createUserInfo({ email: "invalidemail" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject(responseStructure({
                    state: "error",
                      error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Invalid Email"
                }}))
            })
            // Invalid Password
            it('When provide password less than eight character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = createUserInfo({ password: "Qe25?" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject(responseStructure({
                    state: "error",
                      error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Password at least eight character"
                }}))
            })

            it('When provide password longer than fifty character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = createUserInfo({ password: new Array(6).fill("sodfjwef8").toString() });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject(responseStructure({
                    state: "error",
                      error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Password at most fifty character"
                }}))
            })

            it('When provide invalid password,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = createUserInfo({ password: "invalid89" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject(responseStructure({
                    state: "error",
                      error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Password should include small and big letter and number and one special character"
                }}))
            })
        })

        describe("Duplication Handle",() => {

            it('When provide duplicate and verified email,should response with 201 statusCode and Verify token not create', async() => {
                // Arrange
                const userInfo = createUserInfo({});
                await db.insert(users).values({ ...userInfo,isVerified: true});
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(userInfo);
                const [token] = await db.select({
                     id: tokens.id
                }).from(tokens);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        message: "Please Verify account before login"
                    }
                }))
                expect(token).toBeUndefined();
            },10000)

            it.skip('When provide duplicate and not verified email,should response with 201 statusCode and Verify token create and User update in database', async() => {
                // Arrange
                const userInfo = createUserInfo({});
                await db.insert(users).values(userInfo);
                const updatedInfo = { ...userInfo,firstName: "luka"};
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/signup")
                                .send(updatedInfo);
                const [token] = await db.select({
                     id: tokens.id
                }).from(tokens);
                const [user] = await db.select({
                     firstName: users.firstName
                }).from(users);
                // Assertion
                expect(response.status).toBe(201);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        message: "Please Verify account before login"
                    }
                }))
                expect(token).toMatchObject({
                    id: expect.any(String)
                });
                expect(user).toMatchObject({
                    firstName: "luka"
                });
            },10000)
        })
    })

    describe("Login",() => {
        

        describe("Success",() => {
            // Insert User data for login
            beforeEach(async() => { 
                const user = createUserInfo({});
                const hashedPassword = await hashPassword(user.password);
                user.password = hashedPassword;
                await db.insert(users).values({ ...user,isVerified: true });
            },10000)
            it('When Login with valid and exist user,should response with 200 statusCode and User object and AccessToken', async() => {
                // Arrange
                const userInfo = loginUserInfo({});
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        user: {
                            id: expect.any(String),
                            email: expect.any(String),
                            isVerified: true,
                            loginAttempts: expect.any(Number),
                            lockExpired: null,
                            tokenVersion: expect.any(Number),
                            role: "user"
                        },
                        accessToken: expect.any(String),
                        message: expect.any(String)
                    }
                }))
            },10000)

            it('When Login with Uppercase email,should response with 200 statusCode and lowercase email', async() => {
                // Arrange
                const userInfo = loginUserInfo({ email: "Tim8912097887@gmail.com" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        user: {
                            id: expect.any(String),
                            email,
                            isVerified: true,
                            loginAttempts: expect.any(Number),
                            lockExpired: null,
                            tokenVersion: expect.any(Number),
                            role: "user"
                        },
                        accessToken: expect.any(String),
                        message: expect.any(String)
                    }
                }))
            },10000)
        })

        describe("Validation Fail",() => {
            // Invalid Email
            it('When provide invalid email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = loginUserInfo({ email: "invalidemail" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Invalid Email"
                }})
            })
            // Invalid Password
            it('When provide password less than eight character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = loginUserInfo({ password: "Qe25?" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Password at least eight character"
                }})
            })

            it('When provide password longer than fifty character,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = loginUserInfo({ password: new Array(6).fill("sodfjdwef").toString() });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Password at most fifty character"
                }})
            })

            it('When provide invalid password,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = loginUserInfo({ password: "invalid89" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Password should include small and big letter and number and one special character"
                }})
            })
        })

        describe("Auth Error",() => {

            it('When provide not exist Email,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = loginUserInfo({ email: "notExist@gmail.com" });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Email or Password is not correct"
                }})
            },10000)

            it('When provide exist email but not correct password,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = loginUserInfo({});
                const createInfo = createUserInfo({});
                await db.insert(users).values({ ...createInfo,isVerified: true });
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Email or Password is not correct"
                }})
            },10000)

            it('When attempt three times fail and attempt fourth time,should response with 403 statusCode and Forbidden Error', async() => {
                // Arrange
                const createInfo = createUserInfo({});
                await db.insert(users).values({ ...createInfo,isVerified: true });
                const userInfo = loginUserInfo({ password: "Sdfij34?" })
                // Act
                for (let index = 0; index < 3; index++) {
                    await request(app)
                          .post("/api/v1/auth/login")
                          .send(userInfo);
                }
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(userInfo);
                const [user] = await db.select({
                    loginAttempts: users.loginAttempts,
                    lockExpired: users.lockExpired
                }).from(users);
                // Assertion
                expect(response.status).toBe(403);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Forbidden",
                        code: 403,
                        detail: "User account is locked"
                }})
                expect(user).toMatchObject({
                    loginAttempts: 0,
                    lockExpired: expect.any(Date)
                })
            },10000)

            it('When attempt fail twice and success at third time,should response with 200 statusCode and Verify lock and attempt time reset', async() => {
                // Arrange
                const createInfo = createUserInfo({});
                const hashedPassword = await hashPassword(createInfo.password);
                await db.insert(users).values({ ...createInfo,isVerified: true,password: hashedPassword });
                const incorrectInfo = loginUserInfo({ password: "Sdfij34?" });
                const correctInfo = loginUserInfo({});
                // Act
                // Fail two time
                for (let index = 0; index < 2; index++) {
                    await request(app)
                          .post("/api/v1/auth/login")
                          .send(incorrectInfo);
                }
                // Success at third time
                const response = await request(app)
                                .post("/api/v1/auth/login")
                                .send(correctInfo);
                const [user] = await db.select({
                    loginAttempts: users.loginAttempts,
                    lockExpired: users.lockExpired
                }).from(users);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject({
                    state: "success",
                    data: {
                        user: {
                            id: expect.any(String),
                            email,
                            isVerified: true,
                            loginAttempts: expect.any(Number),
                            lockExpired: null,
                            tokenVersion: expect.any(Number),
                            role: "user"
                        },
                        accessToken: expect.any(String),
                        message: expect.any(String)
                    }
                })
                // Check storage
                expect(user).toMatchObject({
                    loginAttempts: 0,
                    lockExpired: null
                })
            },10000)

    })
})
describe("Verify Account",() => {

        const rawToken = createRawToken();
        describe("Success",() => {
                let userId: string;
                // Create user account and token
                beforeEach(async() => {
                    const userInfo = createUserInfo({});
                    const hashedToken = hashToken(rawToken);
                    const [user] = await db.insert(users).values(userInfo).returning({ id: users.id });
                    userId = user.id;
                    await createVerificationToken(user.id,hashedToken,"VERIFICATION");
                },10000);

              it('When verify with valid token and userId,should response with 200 statusCode and Success message', async() => {
                  // Arrange
                const userInfo = {
                    token: rawToken,
                    userId
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                const [token] = await db.select({
                    id: tokens.id
                }).from(tokens);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        message: expect.any(String)
                    }
                }))
                // Verify Token delete
                expect(token).toBeUndefined();
              },10000)
        })
         describe("Validation Fail",() => {
            const validUserId = "00000000-0000-0000-0000-000000000000";
            // Invalid UserId
            it('When provide invalid userId,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    token: rawToken,
                    userId: "dsofj"
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Invalid UUID"
                }})
            })
            // Invalid token
            it('When provide non-string token,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    token: 5,
                    userId: validUserId
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Token must be string"
                }})
            })
            it('When provide not 64 length token,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    token: "abc",
                    userId: validUserId
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Token must be exactly 64 characters long"
                }})
            })
            it('When provide invalid format token,should response with 400 statusCode and Bad Request Error', async() => {
                // Arrange
                const userInfo = {
                    token: new Array(16).fill("abch").join(""),
                    userId: validUserId
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(400);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "BadRequest",
                        code: 400,
                        detail: "Token must be a valid hexadecimal string"
                }})
            })
        })

        describe("Auth Error",() => {

            let userId: string;
            const hashedToken = hashToken(rawToken);
                // Create user account and token
                beforeEach(async() => {
                    const userInfo = createUserInfo({});
                    const [user] = await db.insert(users).values(userInfo).returning({ id: users.id });
                    userId = user.id;
                    await createVerificationToken(user.id,hashedToken,"VERIFICATION");
                },10000);
            it('When provide not exist userId,should response with 401 statusCode and Unauthorized Error', async() => {
                // Arrange
                const nonExistentUserId = "00000000-0000-0000-0000-000000000000"; // A valid UUID format
                
                const userInfo = {
                    token: rawToken,
                    userId: nonExistentUserId 
                };
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Invalid or Expired Token"
                }})
            })

            it('When provide not exist token,should response with 401 statusCode and Unauthorized Error', async() => {
                // Arrange
                const notExistToken = new Array(8).fill("dbea908c").join("");
                const userInfo = {
                    userId,
                    token: notExistToken
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                const [token] = await db.select()
                                        .from(tokens)
                                        .where(eq(tokens.token,notExistToken));
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Invalid or Expired Token"
                }})
                // Check db storage
                expect(token).toBeUndefined();
            })

            it('When provide expired token,should response with 401 statusCode and Unauthorized Error', async() => {
                // Arrange
                await db.update(tokens).set({
                     expiredAt: new Date(Date.now()-3000)
                }).where(eq(tokens.token,hashedToken))
                const userInfo = {
                    userId,
                    token: rawToken
                }
                // Act
                const response = await request(app)
                                .post("/api/v1/auth/verification")
                                .send(userInfo);
                const [token] = await db.select({
                                           id: tokens.id,
                                           expiredAt: tokens.expiredAt
                                         })
                                        .from(tokens)
                                        .where(eq(tokens.token,hashedToken));
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Invalid or Expired Token"
                }})
                // Check db storage
                expect(token.expiredAt.getTime()).toBeLessThan(Date.now());
            })
        })
    })

     describe("Refresh Token",() => {

        describe("Success",() => {

            it('When successfully refresh token,should response with 200 statusCode and AccessToken', async() => {
                // Arrange
                const [createdUser] = await db.insert(users)
                        .values({ ...createUserInfo({}),isVerified: true})
                        .returning({
                            id: users.id,
                            token_version: users.tokenVersion,
                            role: users.role
                        })       
                const payload = {
                    sub: createdUser.id,
                    v: env.TOKEN_VERSION,
                    token_version: createdUser.token_version,
                    role: createdUser.role
                }
                const refreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,env.REFRESH_TOKEN_EXPIRED);
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh")
                                .set("Cookie",["refreshToken="+refreshToken]);
                // Assertion
                expect(response.status).toBe(200);
                expect(response.body).toMatchObject(responseStructure({
                    state: "success",
                    data: {
                        accessToken: expect.any(String),
                        message: expect.any(String)
                    }
                }))
            })
        })

        describe("Auth Error",() => {

            it('When not send with refresh token,should response with 401 statusCode and UnAuthorized Error', async() => {
                
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh");
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Unauthenticated"
                }})
            })

            it('When send with expired refresh token,should response with 401 statusCode and UnAuthorized Error', async() => {
                // Arrange
                const payload = {
                    sub: "sdfonof",
                    v: env.TOKEN_VERSION,
                    token_version: 1,
                    role: "user" as const
                }
                const refreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,0);
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh")
                                .set("Cookie",["refreshToken="+refreshToken]);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Invalid or Expired token"
                }})
            })

            it('When send with invalid structure version refresh token,should response with 401 statusCode and UnAuthorized Error', async() => {
                // Arrange
                const payload = {
                    sub: "sdfonof",
                    v: 999,
                    token_version: 1,
                    role: "user" as const
                }
                const refreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,env.REFRESH_TOKEN_EXPIRED);
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh")
                                .set("Cookie",["refreshToken="+refreshToken]);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Invalid or Expired token"
                }})
            })

            it('When send with invalid auth version refresh token,should response with 401 statusCode and UnAuthorized Error', async() => {
                // Arrange
                const [createdUser] = await db.insert(users)
                        .values({ ...createUserInfo({}),isVerified: true})
                        .returning({
                            id: users.id,
                            token_version: users.tokenVersion,
                            role: users.role
                        })  
                const payload = {
                    sub: createdUser.id,
                    v: env.TOKEN_VERSION,
                    token_version: 100,
                    role: createdUser.role
                }
                const refreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,env.REFRESH_TOKEN_EXPIRED);
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh")
                                .set("Cookie",["refreshToken="+refreshToken]);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Invalid or Expired token"
                }})
            },10000)

            it('When send with not exist userId refresh token,should response with 401 statusCode and UnAuthorized Error', async() => {
                // Arrange
                const [createdUser] = await db.insert(users)
                        .values({ ...createUserInfo({}),isVerified: true})
                        .returning({
                            id: users.id,
                            token_version: users.tokenVersion,
                            role: users.role
                        })  
                const payload = {
                    sub: "00000000-0000-0000-0000-000000000000",
                    v: env.TOKEN_VERSION,
                    token_version: createdUser.token_version,
                    role: createdUser.role
                }
                const refreshToken = createToken(payload,env.REFRESH_TOKEN_SECRET,env.REFRESH_TOKEN_EXPIRED);
                // Act
                const response = await request(app)
                                .get("/api/v1/auth/refresh")
                                .set("Cookie",["refreshToken="+refreshToken]);
                // Assertion
                expect(response.status).toBe(401);
                expect(response.body).toMatchObject({
                    state: "error",
                    error: {
                        status: "Unauthorized",
                        code: 401,
                        detail: "Invalid or Expired token"
                }})
            },10000)
        })
    
    })
})
