import bcrypt from 'bcryptjs';
import {status} from 'http-status';
import {User} from '../../model/user.mjs';

export async function handleLoginPost(req, res) {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});

        if (!user) {
            return res
                .status(status.UNAUTHORIZED)
                .json({success: false, error: 'Invalid username or password'});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res
                .status(status.UNAUTHORIZED)
                .json({success: false, error: 'Invalid username or password'});
        }

        // Update user location if available
        if (req.body.latitude && req.body.longitude) {
            await User.findByIdAndUpdate(user._id, {
                ip: req.body.ip || req.ip,
                location: {
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    updatedAt: new Date(),
                },
            });
        }

        req.session.user = {id: user.id, username: user.username};
        console.error('Login successful for:', username);
        return res.json({success: true});
    } catch (error) {
        console.error('Login error:', error);
        return res
            .status(status.INTERNAL_SERVER_ERROR)
            .json({success: false, error: 'Internal server error'});
    }
}
