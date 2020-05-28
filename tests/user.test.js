const request = require("supertest");

const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, setupDB } = require("./db");

beforeEach(async () => {
  await setupDB();
});

test("Should sign up new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Jayesh",
      email: "Jayesh@sample.com",
      password: "1234567",
    })
    .expect(201);

  // Assert that the database was changed correctly!
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertion about reponse
  expect(response.body).toMatchObject({
    user: {
      name: "Jayesh",
      email: "jayesh@sample.com",
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("1234567");
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body.token).toBe(user.tokens[0].token);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "123450987",
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload a avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "./tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update a valid user field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "Hemant" })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toEqual("Hemant");
});

test("Should not update a invalid user field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ role: "SE" })
    .expect(404);
});
