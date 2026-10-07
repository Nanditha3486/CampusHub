import request from 'supertest';
import { app } from '../src/index.js';
import { memoryStore } from '../src/services/memoryStore.js';

describe('CampusHub Backend REST API Integration Tests', () => {
  let userToken;
  let testUserId;

  beforeAll(async () => {
    await memoryStore.initialize();
  });

  test('GET /api/health - Returns status 200 and system health metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success || res.body.status === 'ok').toBeTruthy();
    expect(res.body.service).toEqual('CampusHub Backend API');
  });

  test('POST /api/auth/register - Successfully creates a new student user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'test.student@campus.edu',
      password: 'password123',
      college: 'MIT World Peace University',
      department: 'Computer Science',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toEqual('test.student@campus.edu');

    userToken = res.body.token;
    testUserId = res.body.user._id || res.body.user.id;
  });

  test('POST /api/auth/login - Authenticates existing student and returns JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alex.morgan@campus.edu',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toEqual('Alex Morgan');
  });

  test('GET /api/auth/me - Rejects unauthorized requests without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toEqual(401);
  });

  test('GET /api/auth/me - Accepts authorized requests with Bearer JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toEqual('test.student@campus.edu');
  });

  test('GET /api/posts - Fetches community posts list', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  test('POST /api/posts - Creates a new community post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Building an Automated Vulnerability Scanner',
        content: 'We are creating a security scanner for open-source student web projects.',
        category: 'Project',
        tags: 'Security, Python, Docker',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.post.title).toContain('Vulnerability Scanner');
  });

  test('POST /api/ai/idea-lab - Generates structured AI project breakdown', async () => {
    const res = await request(app)
      .post('/api/ai/idea-lab')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Campus Food Rescue App',
        description: 'An app connecting campus cafeterias with student dorms to eliminate food waste.',
        domain: 'Mobile App',
        targetAudience: 'College Students & Dining Services',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis).toBeDefined();
    expect(res.body.analysis.problemStatement).toBeDefined();
    expect(Array.isArray(res.body.analysis.suggestedFeatures)).toBe(true);
  });
});
