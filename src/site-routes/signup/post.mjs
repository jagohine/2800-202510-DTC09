import bcrypt from 'bcryptjs';
import {Record} from '../../model/record.mjs';
import {User, normalize} from '../../model/user.mjs';

export async function handleSignupPost(req, res) {
    const {username, email, password} = req.body;

    // Basic input check
    if (!username || !password || !email) {
        return res.redirect('/html/signup.html?error=values_missing');
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = normalize(
            await new User({
                username,
                email,
                password: hashedPassword,
                ip: req.ip,
                location:
                    req.body.latitude && req.body.longitude
                        ? {
                              latitude: req.body.latitude,
                              longitude: req.body.longitude,
                              updatedAt: new Date(),
                          }
                        : null,
            }).save(),
        ).pop();
        const newRecord = await new Record({user: newUser.id}).save();
        req.session.user = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
        };

        return res.redirect('/login');
    } catch (error) {
        console.error('Signup error:', error);
        return res.redirect('/html/signup.html?error=validation_failed');
    }
}
