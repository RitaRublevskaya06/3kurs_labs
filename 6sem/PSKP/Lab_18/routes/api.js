const express = require('express');
const router = express.Router();
const { Faculty, Pulpit, Subject, AuditoriumType, Auditorium, Teacher } = require('../models');

// GET /api/faculties
router.get('/faculties', async (req, res) => {
    try {
        const faculties = await Faculty.findAll();
        res.json(faculties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/pulpits
router.get('/pulpits', async (req, res) => {
    try {
        const pulpits = await Pulpit.findAll({
            include: [{
                model: Faculty,
                as: 'faculty',
                attributes: ['FACULTY', 'FACULTY_NAME']
            }]
        });
        res.json(pulpits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/subjects
router.get('/subjects', async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            include: [{
                model: Pulpit,
                as: 'pulpit',
                attributes: ['PULPIT', 'PULPIT_NAME'],
                include: [{
                    model: Faculty,
                    as: 'faculty',
                    attributes: ['FACULTY', 'FACULTY_NAME']
                }]
            }]
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/teachers
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            include: [{
                model: Pulpit,
                as: 'pulpit',
                attributes: ['PULPIT', 'PULPIT_NAME'],
                include: [{
                    model: Faculty,
                    as: 'faculty',
                    attributes: ['FACULTY', 'FACULTY_NAME']
                }]
            }]
        });
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auditoriumstypes
router.get('/auditoriumstypes', async (req, res) => {
    try {
        const types = await AuditoriumType.findAll();
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auditoriums
router.get('/auditoriums', async (req, res) => {
    try {
        const auditoriums = await Auditorium.findAll({
            include: [{
                model: AuditoriumType,
                as: 'auditoriumType',
                attributes: ['AUDITORIUM_TYPE', 'AUDITORIUM_TYPENAME']
            }]
        });
        res.json(auditoriums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/faculties
router.post('/faculties', async (req, res) => {
    try {
        const faculty = await Faculty.create(req.body);
        res.status(201).json(faculty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/pulpits
router.post('/pulpits', async (req, res) => {
    try {
        const pulpit = await Pulpit.create(req.body);
        res.status(201).json(pulpit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subjects
router.post('/subjects', async (req, res) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auditoriumstypes
router.post('/auditoriumstypes', async (req, res) => {
    try {
        const type = await AuditoriumType.create(req.body);
        res.status(201).json(type);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auditoriums
router.post('/auditoriums', async (req, res) => {
    try {
        const auditorium = await Auditorium.create(req.body);
        res.status(201).json(auditorium);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/faculties
router.put('/faculties', async (req, res) => {
    try {
        const { FACULTY, ...updateData } = req.body;
        const [updated] = await Faculty.update(updateData, {
            where: { FACULTY }
        });
        if (updated) {
            const updatedFaculty = await Faculty.findOne({ where: { FACULTY } });
            res.json(updatedFaculty);
        } else {
            res.status(404).json({ error: 'Faculty not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/pulpits
router.put('/pulpits', async (req, res) => {
    try {
        const { PULPIT, ...updateData } = req.body;
        const [updated] = await Pulpit.update(updateData, {
            where: { PULPIT }
        });
        if (updated) {
            const updatedPulpit = await Pulpit.findOne({ where: { PULPIT } });
            res.json(updatedPulpit);
        } else {
            res.status(404).json({ error: 'Pulpit not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/subjects
router.put('/subjects', async (req, res) => {
    try {
        const { SUBJECT, ...updateData } = req.body;
        const [updated] = await Subject.update(updateData, {
            where: { SUBJECT }
        });
        if (updated) {
            const updatedSubject = await Subject.findOne({ where: { SUBJECT } });
            res.json(updatedSubject);
        } else {
            res.status(404).json({ error: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/auditoriumstypes
router.put('/auditoriumstypes', async (req, res) => {
    try {
        const { AUDITORIUM_TYPE, ...updateData } = req.body;
        const [updated] = await AuditoriumType.update(updateData, {
            where: { AUDITORIUM_TYPE }
        });
        if (updated) {
            const updatedType = await AuditoriumType.findOne({ where: { AUDITORIUM_TYPE } });
            res.json(updatedType);
        } else {
            res.status(404).json({ error: 'Auditorium type not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/auditoriums
router.put('/auditoriums', async (req, res) => {
    try {
        const { AUDITORIUM, ...updateData } = req.body;
        const [updated] = await Auditorium.update(updateData, {
            where: { AUDITORIUM }
        });
        if (updated) {
            const updatedAuditorium = await Auditorium.findOne({ where: { AUDITORIUM } });
            res.json(updatedAuditorium);
        } else {
            res.status(404).json({ error: 'Auditorium not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/faculties/:id
router.delete('/faculties/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ where: { FACULTY: req.params.id } });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        await faculty.destroy();
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/pulpits/:id
router.delete('/pulpits/:id', async (req, res) => {
    try {
        const pulpit = await Pulpit.findOne({ where: { PULPIT: req.params.id } });
        if (!pulpit) {
            return res.status(404).json({ error: 'Pulpit not found' });
        }
        await pulpit.destroy();
        res.json(pulpit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/subjects/:id
router.delete('/subjects/:id', async (req, res) => {
    try {
        const subject = await Subject.findOne({ where: { SUBJECT: req.params.id } });
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        await subject.destroy();
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/auditoriumtypes/:id
router.delete('/auditoriumtypes/:id', async (req, res) => {
    try {
        const type = await AuditoriumType.findOne({ where: { AUDITORIUM_TYPE: req.params.id } });
        if (!type) {
            return res.status(404).json({ error: 'Auditorium type not found' });
        }
        await type.destroy();
        res.json(type);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/auditoriums/:id
router.delete('/auditoriums/:id', async (req, res) => {
    try {
        const auditorium = await Auditorium.findOne({ where: { AUDITORIUM: req.params.id } });
        if (!auditorium) {
            return res.status(404).json({ error: 'Auditorium not found' });
        }
        await auditorium.destroy();
        res.json(auditorium);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;