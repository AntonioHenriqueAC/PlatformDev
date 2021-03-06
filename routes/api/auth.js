const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator/check');

const User = require('../../models/User');

// @route   GET api/auth
// @desc    teste route
// @access  public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth
// @desc    authenticate user & get token
// @access  public

// Validação do usuario
router.post('/', [
        check('email', 'Please include the valid email!!').isEmail(),
        check('password', 'É necessário um password').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            email,
            password
        } = req.body;

        try {
            // ver se usuario existe
            let user = await User.findOne({
                email
            });

            if (!user) {
                res.status(400).json({
                    errors: [{
                        msg: "Usuário ou senha inválidos!"
                    }]
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                res.status(400).json({
                    errors: [{
                        msg: "Usuário ou senha inválidos!"
                    }]
                });
            }
            // return json web token (JWT)
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'), {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token
                    })
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error!!');
        }

    });

module.exports = router;