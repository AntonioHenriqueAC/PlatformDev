const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
   check,
   validationResult
} = require('express-validator/check')

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    get current user
// @access  private
router.get('/me', auth, async (req, res) => {
   try {
      const profile = await Profile.findOne({
         user: req.user.id
      }).populate('user', ['name', 'avatar']);

      if (!profile) {
         return res.status(400).json({
            msg: 'Não há perfil para esse usuário'
         })
      }

      res.json(profile);

   } catch (err) {
      console.error(err.message);
      res.status(500).send('server error');
   }
});

// @route   post api/profile
// @desc    create or update user profile
// @access  private
router.post(
   '/',
   [
      auth,
      [
         check('status', 'Status is required')
         .not()
         .isEmpty(),
         check('skills', 'Skills is required')
         .not()
         .isEmpty()
      ]
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            errors: errors.array()
         })
      }

      const {
         company,
         website,
         location,
         bio,
         status,
         githubusername,
         skills,
         youtube,
         facebook,
         twitter,
         instagram,
         linkedin
      } = req.body

      // build profile object
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (bio) profileFields.bio = bio;
      if (location) profileFields.location = location;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;

      // Remove the space between "," when user write in label.
      if (skills) {
         profileFields.skills = skills.split(',').map(skill => skill.trim());
      }

      // Build social arrays
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (facebook) profileFields.social.facebook = facebook;
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;

      try {
         let profile = await Profile.findOne({
            user: req.user.id
         });

         if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate({
               user: req.user.id
            }, {
               $set: profileFields
            }, {
               new: true
            });
            return res.json(profile);
         }

         // Create
         profile = new Profile(profileFields);

         await profile.save();
         res.json(profile);

      } catch (err) {}
   });

// @route   GET api/profile
// @desc    geet all profiles
// @access  public

router.get('/',
   async (req, res) => {
      try {
         const profiles = await Profile.find().populate('user', ['name', 'avatar']);
         res.json(profiles);
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Server Error');
      }
   });


// @route   GET api/profile/user/:user_id
// @desc    get profile by user id
// @access  public

router.get('/user/:user_id',
   async (req, res) => {
      try {
         const profile = await Profile.findOne({
            user: req.params.user_id
         }).populate('user', ['name', 'avatar']);

         if (!profile) return res.status(400).json({
            msg: 'Profile not found'
         });

         res.json(profile);

      } catch (err) {
         console.error(err.message);

         if (err.kind == 'ObjectId') {
            return res.status(400).json({
               msg: 'Profile not found'
            });
         }

         res.status(500).send('Server Error');
      }
   });



module.exports = router;