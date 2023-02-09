const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;
const authenticate = require('../helpers/authenticate');

// require('crypto').randomBytes(32).toString('hex');

router.get('/', authenticate, async (req, res) => {
    res.json({
        data: await User.find({}, { password: 0, __v: 0 })
    });
});

router.get('/search', async (req, res) => {
    const { name, age } = req.query;
    res.json({
        users: await User.find({
            // AND operation
            // name: new RegExp(name, 'i'),
            // age: +age

            // OR operation
            $or: [
                {
                    name: new RegExp(name, 'i')
                },
                {
                    age: +age
                }
            ]
        }, { password: 0, __v: 0 })
    });
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // const user = await User.findOne({
        //     _id: mongoose.Schema.Types.ObjectId(id)
        // });
        const user = await User.findById(id, { password: 0, __v: 0 })
            .populate('medicines', { __v: 0 });
        if (user) {
            res.json({
                data: user
            });
        } else {
            res.status(404).json({
                msg: 'User not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
});

router.post('/', authenticate, async (req, res) => {
    const { firstName, lastName, email, password, age } = req.body;

    try {
        const user = new User({
            name: {
                first: firstName,
                last: lastName
            },
            email,
            password,
            age
        });

        const savedUser = await user.save();
        savedUser.password = undefined;
    
        res.status(201).json({
            data: savedUser
        });
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({
                    message: err
                });
            }

            if (isMatch) {
                const token = jwt.sign({ id: user._id }, SECRET, {
                    expiresIn: '1d'     // '20s', '5m', '2h', '120' <=> '120ms'
                });
                res.json({
                    message: 'Login successful',
                    token
                });
            } else {
                res.status(400).json({
                    message: 'Invalid email or password'
                });
            }
        });
    } else {
        res.status(400).json({
            message: 'Invalid email or password'
        });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, age } = req.body;
    try {
        const user = await User.findById(id);
        if (user) {
            user.name.first = firstName;
            user.name.last = lastName;
            user.email = email;
            user.age = age;

            res.json({
                data: await user.save()
            });
        } else {
            res.status(404).json({
                msg: 'User not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
});

router.patch('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, age } = req.body;
    try {
        const user = await User.findById(id);
        if (user) {
            if (firstName !== undefined) {
                user.name.first = firstName;
            }
            if (lastName !== undefined) {
                user.name.last = lastName;
            }
            if (email !== undefined) {
                user.email = email;
            }
            if (age !== undefined) {
                user.age = age;
            }
            res.json({
                data: await user.save()
            });
        } else {
            res.status(404).json({
                msg: 'User not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        // await User.findByIdAndDelete(id);
        const user = await User.findById(id);
        if (user) {
            await user.delete();
            res.sendStatus(204);
        } else {
            res.status(404).json({
                msg: 'User not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
})

module.exports = router;