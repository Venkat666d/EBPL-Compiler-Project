const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const users = require('./register').users;

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user data (without password)
        const userResponse = { ...user };
        delete userResponse.password;

        res.status(200).json({ user: userResponse });

    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};