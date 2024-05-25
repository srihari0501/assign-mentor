const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');

// Create Student
router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Change mentor for a particular student
router.put('/:studentId/mentor/:mentorId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        const mentor = await Mentor.findById(req.params.mentorId);

        if (!student || !mentor) {
            return res.status(404).send();
        }

        if (student.mentor) {
            const previousMentor = await Mentor.findById(student.mentor);
            previousMentor.students.pull(student._id);
            await previousMentor.save();
            student.previousMentors.push(student.mentor);
        }

        student.mentor = mentor._id;
        await student.save();

        mentor.students.push(student._id);
        await mentor.save();

        res.send(student);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Show the previously assigned mentor for a particular student
router.get('/:studentId/previous-mentors', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('previousMentors');
        if (!student) {
            return res.status(404).send();
        }
        res.send(student.previousMentors);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
