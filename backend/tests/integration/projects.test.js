// backend/tests/integration/projects.test.js
const request = require('supertest');
const app = require('../../src/app');
const { getPool, connectToDatabase } = require('../../src/db/db');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { hashPassword } = require('../../src/utils/hash');

let pool;
let adminToken;
let adminUserId;

beforeAll(async () => {
    // Ensure DB is connected
    await connectToDatabase();
    pool = getPool();

    // Create a temporary admin user for testing
    const username = 'testadmin';
    const password = 'testpassword';
    const hashedPassword = await hashPassword(password);

    await pool.execute('DELETE FROM users WHERE username = ?', [username]); // Clean up previous test admin
    const [userResult] = await pool.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, 'admin']
    );
    adminUserId = userResult.insertId;

    adminToken = jwt.sign({ id: adminUserId, username: username, role: 'admin' }, config.jwt.secret, { expiresIn: '1h' });

    // Clean up projects table before tests
    await pool.execute('DELETE FROM projects');
}, 30000); // Increased timeout for DB connection and setup

afterAll(async () => {
    // Clean up test projects
    await pool.execute('DELETE FROM projects');
    // Clean up test admin user
    await pool.execute('DELETE FROM users WHERE id = ?', [adminUserId]);
    // Close the pool to ensure graceful shutdown
    if (pool && pool.end) {
        await pool.end();
    }
}, 30000);

describe('Projects API', () => {
    let createdProjectId;

    it('should create a new project (admin)', async () => {
        const newProject = {
            title: 'Test Project 1',
            description: 'A description for test project 1',
            tech_stack: ['Node.js', 'Express', 'MySQL'],
            github_url: 'https://github.com/test/project1',
            live_demo_url: 'https://demo.project1.com',
            image_url: 'https://via.placeholder.com/600x400',
        };

        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newProject);

        expect(res.statusCode).toEqual(201);
        expect(res.body.status).toBe('success');
        expect(res.body.data.project).toHaveProperty('id');
        expect(res.body.data.project.title).toBe(newProject.title);
        createdProjectId = res.body.data.project.id;
    });

    it('should NOT create a project if unauthenticated', async () => {
        const newProject = {
            title: 'Unauthorized Project',
            description: 'This should not be created',
            tech_stack: ['Vue'],
        };

        const res = await request(app)
            .post('/api/projects')
            .send(newProject);

        expect(res.statusCode).toEqual(401);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toBe('No authentication token provided.');
    });

    it('should NOT create a project with invalid data', async () => {
        const invalidProject = {
            title: '', // Missing title
            description: 'Invalid project',
            tech_stack: 'not_an_array', // Invalid tech stack
        };

        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(invalidProject);

        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toContain('Project title is required');
        expect(res.body.message).toContain('Tech stack must be an array');
    });

    it('should get all projects (public)', async () => {
        const res = await request(app).get('/api/projects');
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.projects).toBeInstanceOf(Array);
        expect(res.body.data.projects.length).toBeGreaterThan(0);
        expect(res.body.data.projects[0].tech_stack).toBeInstanceOf(Array); // Should be parsed from JSON
    });

    it('should get a project by ID (public)', async () => {
        const res = await request(app).get(`/api/projects/${createdProjectId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.project).toHaveProperty('id', createdProjectId);
        expect(res.body.data.project.tech_stack).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent project ID', async () => {
        const res = await request(app).get('/api/projects/99999');
        expect(res.statusCode).toEqual(404);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toBe('No project found with ID: 99999');
    });

    it('should update a project (admin)', async () => {
        const updatedData = {
            title: 'Updated Test Project 1',
            description: 'An updated description.',
            tech_stack: ['React', 'Firebase'],
        };

        const res = await request(app)
            .put(`/api/projects/${createdProjectId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('Project updated successfully.');

        // Verify the update
        const getRes = await request(app).get(`/api/projects/${createdProjectId}`);
        expect(getRes.body.data.project.title).toBe(updatedData.title);
        expect(getRes.body.data.project.tech_stack).toEqual(updatedData.tech_stack);
    });

    it('should NOT update a project with invalid ID format', async () => {
        const res = await request(app)
            .put('/api/projects/abc')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Invalid ID Test' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toContain('id must be a positive integer');
    });

    it('should delete a project (admin)', async () => {
        const res = await request(app)
            .delete(`/api/projects/${createdProjectId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(204); // No content on successful delete

        // Verify deletion
        const getRes = await request(app).get(`/api/projects/${createdProjectId}`);
        expect(getRes.statusCode).toEqual(404);
    });

    it('should return 404 when deleting a non-existent project', async () => {
        const res = await request(app)
            .delete('/api/projects/99999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toBe('No project found with ID: 99999 to delete.');
    });
});