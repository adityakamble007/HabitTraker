"use client";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

function Habits() {
  const { user } = useUser();
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const today = dayjs().format("YYYY-MM-DD");
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (user) {
      axios
        .get(`${backendURL}/habits/${user.id}`)
        .then((res) => setHabits(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    axios
      .post(`${backendURL}/habits`, {
        userId: user.id,
        title: newHabit,
      })
      .then((res) => {
        setHabits([...habits, res.data]);
        setNewHabit("");
      })
      .catch((err) => console.error(err));
  };

  const markHabitComplete = (habitId) => {
    const today = new Date().toISOString();
    axios
      .post(`${backendURL}/habits/complete`, {
        habitId,
        date: today,
      })
      .then((res) => {
        const updated = habits.map((habit) =>
          habit._id === habitId ? res.data : habit
        );
        setHabits(updated);
      })
      .catch((err) => console.error(err));
  };

  const deleteHabit = (habitId) => {
    axios
      .delete(`${backendURL}/habits/${habitId}`)
      .then(() => {
        setHabits((prev) => prev.filter((habit) => habit._id !== habitId));
      })
      .catch((err) => console.error(err));
  };

  if (!user) return <div>Loading...</div>;

  const completedHabits = habits.filter((habit) =>
    habit.completedDates?.some(
      (date) => dayjs(date).format("YYYY-MM-DD") === today
    )
  );

  const ongoingHabits = habits.filter((habit) => {
    const completedToday = habit.completedDates?.some(
      (date) => dayjs(date).format("YYYY-MM-DD") === today
    );
    return !completedToday;
  });

  const handleCheckboxChange = (habitId) => {
    markHabitComplete(habitId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.firstName}!</h1>

      {/* Add Habit Form */}
      <Card className="mb-6">
        <CardContent className="p-4 flex gap-2">
          <Input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="New Habit"
          />
          <Button onClick={addHabit}>Add Habit</Button>
        </CardContent>
      </Card>

      {/* Ongoing Habits Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ongoing Habits</h2>
        <AnimatePresence>
          {ongoingHabits.length === 0 ? (
            <p className="text-gray-500">
              No ongoing habits. Add some to track your progress!
            </p>
          ) : (
            ongoingHabits.map((habit) => (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <span>{habit.title}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        onChange={() => handleCheckboxChange(habit._id)}
                        className="h-5 w-5"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteHabit(habit._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Separator className="my-6" />

      {/* Completed Habits Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Completed Habits</h2>
        <AnimatePresence>
          {completedHabits.map((habit) => (
            <motion.div
              key={habit._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span>{habit.title}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteHabit(habit._id)}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    <p>Completed on:</p>
                    {habit.completedDates.map((date, index) => (
                      <p key={index}>
                        {new Date(date).toLocaleString()}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Habits;
