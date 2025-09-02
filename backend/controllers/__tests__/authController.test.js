const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const authRoutes = require('../../routes/auth');
const User = require('../../models/User');
const { OAuth2Client } = require('google-auth-library');

jest.mock('google-auth-library');

process.env.JWT_SECRET = 'test-secret';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Controller', () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/google', () => {
    it('should login or register a user with a valid google token', async () => {
      const mockTicket = {
        getPayload: () => ({
          name: 'Test User',
          email: 'test.user@google.com',
          picture: 'https://example.com/avatar.jpg',
        }),
      };
      OAuth2Client.prototype.verifyIdToken.mockResolvedValue(mockTicket);

      const res = await request(app)
        .post('/api/auth/google')
        .send({ token: 'valid-google-token' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.name).toBe('Test User');
      expect(res.body.data.email).toBe('test.user@google.com');

      const user = await User.findOne({ email: 'test.user@google.com' });
      expect(user).not.toBeNull();
      expect(user.authProvider).toBe('google');
    });

    it('should return an error if google token is invalid', async () => {
      OAuth2Client.prototype.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const res = await request(app)
        .post('/api/auth/google')
        .send({ token: 'invalid-google-token' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Google login failed. Invalid token');
    });
  });
});
