// backend/tests/unit/auth.test.js
const { hashPassword, comparePassword } = require('../../src/utils/hash');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const authController = require('../../src/controllers/authController');
const { getPool } = require('../../src/db/db'); // Mock this
const AppError = require('../../src/utils/appError');

// Mock database pool
jest.mock('../../src/db/db', () => ({
    getPool: jest.fn(),
}));

// Mock logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    fatal: jest.fn(),
}));


describe('Auth Utils', () => {
    it('should hash a password correctly', async () => {
        const password = 'testpassword';
        const hashedPassword = await hashPassword(password);
        expect(typeof hashedPassword).toBe('string');
        expect(hashedPassword.length).toBeGreaterThan(0);
        expect(hashedPassword).not.toBe(password);
    });

    it('should compare a password correctly', async () => {
        const password = 'testpassword';
        const hashedPassword = await hashPassword(password);
        const isMatch = await comparePassword(password, hashedPassword);
        expect(isMatch).toBe(true);

        const isNotMatch = await comparePassword('wrongpassword', hashedPassword);
        expect(isNotMatch).toBe(false);
    });
});

describe('Auth Controller - Login', () => {
    let mockPool, mockExecute;

    beforeEach(() => {
        mockExecute = jest.fn();
        mockPool = { execute: mockExecute };
        getPool.mockReturnValue(mockPool);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a token and user on successful login', async () => {
        const password = 'adminpass';
        const hashedPassword = await hashPassword(password);
        const mockUser = { id: 1, username: 'admin', password: hashedPassword, role: 'admin' };

        mockExecute.mockResolvedValueOnce([[mockUser]]); // Mock user lookup

        const req = { body: { username: 'admin', password: password } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'success',
                token: expect.any(String),
                user: {
                    id: mockUser.id,
                    username: mockUser.username,
                    role: mockUser.role,
                },
            })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next with AppError if username or password missing', async () => {
        const req = { body: { username: 'admin' } }; // Missing password
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await authController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Please provide username and password!');
    });

    it('should call next with AppError for incorrect username', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No user found

        const req = { body: { username: 'nonexistent', password: 'password' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await authController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Incorrect username or password.');
    });

    it('should call next with AppError for incorrect password', async () => {
        const password = 'adminpass';
        const hashedPassword = await hashPassword(password);
        const mockUser = { id: 1, username: 'admin', password: hashedPassword, role: 'admin' };

        mockExecute.mockResolvedValueOnce([[mockUser]]); // User found

        const req = { body: { username: 'admin', password: 'wrongpass' } }; // Wrong password
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await authController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Incorrect username or password.');
    });

    it('should call next with AppError on database error', async () => {
        mockExecute.mockRejectedValueOnce(new Error('DB connection error'));

        const req = { body: { username: 'admin', password: 'adminpass' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await authController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next.mock.calls[0][0].message).toBe('Login failed due to a server error.');
    });
});


describe('Auth Controller - initializeAdmin', () => {
    let mockPool, mockExecute;

    beforeEach(() => {
        mockExecute = jest.fn();
        mockPool = { execute: mockExecute };
        getPool.mockReturnValue(mockPool);
        // Clear mock logger info before each test
        require('../../src/utils/logger').info.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an admin user if none exists', async () => {
        mockExecute.mockResolvedValueOnce([[]]); // No existing admin
        mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // Successfully inserted

        await authController.initializeAdmin();

        expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', [config.admin.username]);
        expect(mockExecute).toHaveBeenCalledWith(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [config.admin.username, expect.any(String), 'admin']
        );
        expect(require('../../src/utils/logger').info).toHaveBeenCalledWith('Default admin user created successfully.');
    });

    it('should not create an admin user if one already exists', async () => {
        const password = 'adminpass';
        const hashedPassword = await hashPassword(password);
        const mockUser = { id: 1, username: 'admin', password: hashedPassword, role: 'admin' };

        mockExecute.mockResolvedValueOnce([[mockUser]]); // Admin already exists

        await authController.initializeAdmin();

        expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', [config.admin.username]);
        expect(mockExecute).not.toHaveBeenCalledWith(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            expect.anything()
        );
        expect(require('../../src/utils/logger').info).toHaveBeenCalledWith('Admin user already exists.');
    });

    it('should log an error if admin initialization fails', async () => {
        mockExecute.mockRejectedValueOnce(new Error('DB error during admin check'));

        await authController.initializeAdmin();

        expect(require('../../src/utils/logger').error).toHaveBeenCalledWith(
            'Error initializing admin user:',
            expect.any(Error)
        );
    });
});