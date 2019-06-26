const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator/check');

const User = require("../../models/User");

// @route   POST api/users
// @desc    Register user
// @access  public

// Validação do usuario
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include the valid email!!').isEmail(),
        check('password', 'entre com password correto, mais de 6').isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            name,
            email,
            password
        } = req.body;

        try {
            // ver se usuario existe
            let user = await User.findOne({
                email
            });

            if (user) {
                res.status(400).json({
                    errors: [{
                        msg: "Usuário já existe!"
                    }]
                });
            }

            // pegar o avatar do usuario por email
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password
            })

            // criptografar password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

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