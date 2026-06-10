import request from 'supertest';
import app from '../app.js';

const userPayload = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
};

describe('Auth API', () => {
  it('registers a user and sets auth cookies', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userPayload)
      .expect(201);

    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.token).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
    const cookies = res.headers['set-cookie'].join(';');
    expect(cookies).toMatch(/accessToken=/);
    expect(cookies).toMatch(/refreshToken=/);
  });

  it('logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(userPayload);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    expect(res.body.user.username).toBe('testuser');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(userPayload);

    await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('returns current user when authenticated via cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(userPayload);

    const res = await agent.get('/api/auth/me').expect(200);
    expect(res.body.username).toBe('testuser');
    expect(res.body.email).toBe('test@example.com');
  });

  it('does not count session checks as auth attempts', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(userPayload);

    for (let attempt = 0; attempt < 25; attempt += 1) {
      await agent.get('/api/auth/me').expect(200);
    }
  });

  it('refreshes access token with refresh cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(userPayload);

    await agent.post('/api/auth/refresh').expect(200);
    await agent.get('/api/auth/me').expect(200);
  });

  it('logs out and clears session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send(userPayload);

    await agent.post('/api/auth/logout').expect(200);
    await agent.get('/api/auth/me').expect(401);
  });
});

describe('Health check', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
  });
});
