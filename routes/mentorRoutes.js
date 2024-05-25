const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');

// Create Mentor
router.post('/', async (req, res) => {
    try {
        const mentor = new Mentor(req.body);
        await mentor.save();
        res.status(201).send(mentor);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all students for a particular mentor
router.get('/:mentorId/students', async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.mentorId).populate('students');
        if (!mentor) {
            return res.status(404).send();
        }
        res.send(mentor.students);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Assign multiple students to a mentor
router.post('/:mentorId/assign-students', async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.params.mentorId);
        if (!mentor) {
            return res.status(404).send({ message: "Mentor not found." });
        }

        // Check if any student already has a mentor
        const studentIds = req.body.studentIds;
        const existingStudents = await Student.find({ _id: { $in: studentIds }, mentor: { $exists: true } });
        if (existingStudents.length > 0) {
            const existingStudentNames = existingStudents.map(student => student.name).join(', ');
            return res.status(400).send({ message: `Students ${existingStudentNames} already have a mentor.` });
        }

        // Assign students to mentor
        const students = await Student.updateMany({ _id: { $in: studentIds } }, { mentor: mentor._id });
        if (!students) {
            return res.status(404).send({ message: "Students not found." });
        }

        // Update mentor's students list
        mentor.students.push(...studentIds);
        await mentor.save();

        res.status(200).send({ message: "Students assigned to mentor successfully." });
    } catch (error) {
        res.status(500).send({ message: "Internal server error.", error });
    }
});

module.exports = router;
