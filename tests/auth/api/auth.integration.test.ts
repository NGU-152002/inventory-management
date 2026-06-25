import type { FastifyInstance } from "fastify";
import { MongoMemoryServer } from "mongodb-memory-server";

type AppModule = typeof import("../../../apps/api/src/app.ts");
type StoreModule = typeof import("../../../apps/api/src/modules/auth/store.ts");
type MongoModule = typeof import("../../../apps/api/src/infrastructure/db/mongo.ts");

let mongoServer: MongoMemoryServer;
let appModule: AppModule | undefined;
let storeModule: StoreModule | undefined;
let mongoModule: MongoModule | undefined;
let app: FastifyInstance | undefined;

const ownerCredentials = {
  email: "owner@inventory.local",
  password: "ChangeMe123!"
};

async function login() {
  const response = await app!.inject({
    method: "POST",
    url: "/auth/login",
    payload: ownerCredentials
  });

  return {
    statusCode: response.statusCode,
    body: response.json()
  };
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  appModule = await import("../../../apps/api/src/app.ts");
  storeModule = await import("../../../apps/api/src/modules/auth/store.ts");
  mongoModule = await import("../../../apps/api/src/infrastructure/db/mongo.ts");

  await mongoModule.connectMongo();
});

beforeEach(async () => {
  await mongoModule!.database.dropDatabase();
  await storeModule!.ensureAuthSeed();
  app = appModule!.buildApp();
  await app.ready();
});

afterEach(async () => {
  if (app) {
    await app.close();
    app = undefined;
  }
});

afterAll(async () => {
  if (mongoModule) {
    await mongoModule.mongoClient.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("auth API", () => {
  it("logs in with valid seeded owner credentials", async () => {
    const response = await login();

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.activeBranchId).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({
      _id: expect.any(String),
      email: ownerCredentials.email,
      name: "System Owner",
      role: "owner",
      branchIds: [expect.any(String)]
    });
    expect(response.body.branches).toHaveLength(1);
    expect(response.body.branches[0]).toMatchObject({
      _id: expect.any(String),
      code: "MAIN",
      name: "Main Branch"
    });
  });

  it("rejects login with an unknown email", async () => {
    const response = await app!.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: "missing@inventory.local",
        password: ownerCredentials.password
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: "Invalid credentials" });
  });

  it("rejects login with an invalid password", async () => {
    const response = await app!.inject({
      method: "POST",
      url: "/auth/login",
      payload: {
        email: ownerCredentials.email,
        password: "WrongPass123!"
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: "Invalid credentials" });
  });

  it("returns the current session for a valid token", async () => {
    const loginResponse = await login();

    const response = await app!.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: `Bearer ${loginResponse.body.token}`
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      token: "",
      activeBranchId: loginResponse.body.activeBranchId,
      user: {
        _id: loginResponse.body.user._id,
        email: ownerCredentials.email
      }
    });
  });

  it("rejects /auth/me without a token", async () => {
    const response = await app!.inject({
      method: "GET",
      url: "/auth/me"
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: "Unauthorized" });
  });

  it("revokes the session on logout", async () => {
    const loginResponse = await login();

    const logoutResponse = await app!.inject({
      method: "POST",
      url: "/auth/logout",
      headers: {
        authorization: `Bearer ${loginResponse.body.token}`
      }
    });

    const meResponse = await app!.inject({
      method: "GET",
      url: "/auth/me",
      headers: {
        authorization: `Bearer ${loginResponse.body.token}`
      }
    });

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.json()).toEqual({ success: true });
    expect(meResponse.statusCode).toBe(401);
    expect(meResponse.json()).toEqual({ message: "Session expired" });
  });

  it("seeds the default branch and owner idempotently", async () => {
    await storeModule!.ensureAuthSeed();
    await storeModule!.ensureAuthSeed();

    const userCount = await mongoModule!.database.collection("users").countDocuments({ email: ownerCredentials.email });
    const branchCount = await mongoModule!.database.collection("branches").countDocuments({ code: "MAIN" });

    expect(userCount).toBe(1);
    expect(branchCount).toBe(1);
  });
});
