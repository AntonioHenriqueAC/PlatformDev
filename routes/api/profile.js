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
router.get(
   '/me',
   auth,
   async (req, res) => {
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

// @route   POST api/profile
// @desc    create or update user profile
// @access  private
router.post(
   '/',
   [
      auth,
      [
         check('status', 'Status is required').not().isEmpty(),
         check('skills', 'Skills is required').not().isEmpty()
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

router.get(
   '/',
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

router.get(
   '/user/:user_id',
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

// @route   DELETE api/profile
// @desc    delete profile, user and posts
// @access  private

router.delete(
   '/',
   auth,
   async (req, res) => {
      try {

         // remove profile
         await Profile.findOneAndRemove({
            user: req.user.id
         });

         // remove user
         await User.findOneAndRemove({
            _id: req.user.id
         });

         res.json({
            msg: 'User deleted!'
         });
      } catch (err) {
         console.error(err.message);
         res.status(500).send('Server Error');
      }
   });

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  private

router.put(
   '/experience',
   // validation
   [
      auth,
      [
         check('title', 'Title is required').not().isEmpty(),
         check('company', 'Company is required').not().isEmpty(),
         check('from', 'From date is required').not().isEmpty()
      ]
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            errors: errors.array()
         });
      }

      // creating field variable
      const {
         title,
         company,
         location,
         from,
         current,
         to,
         description
      } = req.body;

      // creating object
      const newExp = {
         title,
         company,
         location,
         from,
         current,
         to,
         description
      };

      // code to execute
      try {
         const profile = await Profile.findOne({
            user: req.user.id
         });

         profile.experiences.unshift(newExp);

         await profile.save();

         res.json(profile);

      } catch (err) {
         console.error(err.message);
         res.status(500).send('Server error');
      }

   });



// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  private

router.delete(
   '/experience/:exp_id',
   auth,
   async (req, res) => {

      // code to execute
      try {
         const profile = await Profile.findOne({
            user: req.user.id
         });

         // get remove index
         const removeIndex = profile.experiences.map(item => item.id).indexOf(req.params.exp_id);

         profile.experiences.splice(removeIndex, 1);

         await profile.save();

         res.json(profile);

      } catch (err) {
         console.error(err.message);
         res.status(500).send('Server error');
      }

   });

module.exports = router;