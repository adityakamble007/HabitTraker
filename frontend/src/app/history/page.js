"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

function HistoryPage() {
  const { user } = useUser();
  const [completedHabits, setCompletedHabits] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (user) {
      axios
        .get(`${backendURL}/habits/${user.id}`)
        .then((res) => {
          const completed = res.data
            .filter((habit) => habit.completedDates?.length > 0)
            .map((habit) => ({
              ...habit,
              completedDates: habit.completedDates.sort((a, b) => new Date(b) - new Date(a)),
            }))
            .sort((a, b) => new Date(b.completedDates[0]) - new Date(a.completedDates[0]));
          setCompletedHabits(completed);
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const handleDelete = (habitId) => {
    setDeletingId(habitId);
    axios
      .delete(`${backendURL}/habits/${habitId}`)
      .then(() => {
        setCompletedHabits((prev) => prev.filter((habit) => habit._id !== habitId));
      })
      .catch((err) => console.error(err))
      .finally(() => setDeletingId(null));
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Completed Habit History</h1>

      {completedHabits.length === 0 ? (
        <p className="text-gray-500">No completed habits found.</p>
      ) : (
        completedHabits.map((habit) => (
          <Card
            key={habit._id}
            className={`mb-4 transition-all duration-300 ease-in-out ${
              deletingId === habit._id ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <CardHeader className="flex justify-between items-start">
              <CardTitle>{habit.title}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(habit._id)}
                disabled={deletingId === habit._id}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">Completed on:</p>
              <div className="space-y-1">
                {habit.completedDates.map((date, idx) => (
                  <div key={idx}>
                    <Separator />
                    <p className="py-1 text-sm text-muted-foreground">
                      {dayjs(date).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default HistoryPage;
