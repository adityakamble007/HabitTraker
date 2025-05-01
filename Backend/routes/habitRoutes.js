// routes/habitRoutes.js
const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// Get all habits for a specific user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const habits = await Habit.find({ userId });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Create a new habit
router.post('/', async (req, res) => {
    try {
        const { userId, title } = req.body;
        const newHabit = new Habit({ userId, title });
        await newHabit.save();
        res.status(201).json(newHabit);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create habit', error });
    }
});

// Mark a habit as completed for a specific date
router.post('/complete', async (req, res) => {
    try {
        const { habitId, date } = req.body;
        const habit = await Habit.findById(habitId);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        habit.completedDates.push(new Date(date));
        await habit.save();
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark habit complete', error });
    }
});

// DELETE /habits/:id
router.delete("/:id", async (req, res) => {
    try {
      const habit = await Habit.findByIdAndDelete(req.params.id);
      if (!habit) return res.status(404).json({ message: "Habit not found" });
      res.status(200).json({ message: "Habit deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;
