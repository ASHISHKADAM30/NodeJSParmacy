const express = require('express');
const router = express.Router();
const Medicine = require('../models/medicine');
const authenticate = require('../helpers/authenticate');
const User = require('../models/user');

router.get('/', async (req, res) => {
    res.json({
        data: await Medicine.find({}, { __v: 0 })
            .populate('addedBy', { password: 0, __v: 0, medicines: 0 })
    });
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const medicine = await Medicine.findById(id, { __v: 0 })
            .populate('addedBy', { password: 0, __v: 0, medicines: 0 });
        if (medicine) {
            res.json({
                data: medicine
            });
        } else {
            res.status(404).json({
                msg: 'Medicine not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
});


/*
------------medicine data format-----------------------
{
    "name": "Moxikind-CV 625 Tablet",
    "description": "Moxikind-CV 625 Tablet is a penicillin-type of antibiotic that helps your body fight infections caused by bacteria. It is used to treat infections of the lungs (e.g., pneumonia), ear, nasal sinus, urinary tract, skin, and soft tissue. It will not work for viral infections such as the common cold.",
    "expiryDate": "2023-11-23T12:01:52.635Z"
}
 */
router.post('/', authenticate, async (req, res) => {
    const { name, description, expiryDate } = req.body;

    try {
        const user = await User.findById(req.userId, { password: 0 });
        const medicine = new Medicine({
            name,
            description,
            expiryDate,
            addedBy: user._id
        });

        const savedMedicine = await medicine.save();
        user.medicines.push(savedMedicine._id);
        await user.save();
    
        res.status(201).json({
            data: savedMedicine
        });
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, description, expiryDate } = req.body;
    try {
        const medicine = await Medicine.findById(id);
        if (medicine) {
            medicine.name = name;
            medicine.description = description;
            medicine.expiryDate = expiryDate;

            res.json({
                data: await medicine.save()
            });
        } else {
            res.status(404).json({
                msg: 'Medicine not found'
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
    const { name, description, expiryDate } = req.body;
    try {
        const medicine = await Medicine.findById(id);
        if (medicine) {
            if (name !== undefined) {
                medicine.name = name;
            }
            if (description !== undefined) {
                medicine.description = description;
            }
            if (expiryDate !== undefined) {
                medicine.expiryDate = expiryDate;
            }
            res.json({
                data: await medicine.save()
            });
        } else {
            res.status(404).json({
                msg: 'Medicine not found'
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
        const medicine = await Medicine.findById(id);
        if (medicine) {
            await medicine.delete();
            res.sendStatus(204);
        } else {
            res.status(404).json({
                msg: 'Medicine not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            data: err
        });
    }
})

module.exports = router;