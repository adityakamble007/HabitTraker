"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);


ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function AnalyticsPage() {
  const { user } = useUser();
  const [habits, setHabits] = useState([]);
  const [topHabits, setTopHabits] = useState([]);
  const [weeklyData, setWeeklyData] = useState({ thisWeek: 0, lastWeek: 0 });
  const [consistency, setConsistency] = useState([]);
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!user) return;

    axios
      .get(`${backendURL}/habits/${user.id}`)
      .then((res) => {
        const fetchedHabits = res.data;
        setHabits(fetchedHabits);

        // Weekly comparison
        const today = dayjs();
        const startOfThisWeek = today.startOf("week");
        const startOfLastWeek = startOfThisWeek.subtract(7, "day");
        const endOfLastWeek = startOfThisWeek.subtract(1, "day");

        let thisWeek = 0;
        let lastWeek = 0;

        for (const habit of fetchedHabits) {
          for (const dateStr of habit.completedDates || []) {
            const date = dayjs(dateStr);
            if (date.isSameOrAfter(startOfThisWeek)) thisWeek++;
            else if (date.isBetween(startOfLastWeek, endOfLastWeek, null, "[]")) lastWeek++;
          }
        }

        setWeeklyData({ thisWeek, lastWeek });

        // Top 3 habits
        const sorted = [...fetchedHabits].sort(
          (a, b) => (b.completedDates?.length || 0) - (a.completedDates?.length || 0)
        );
        setTopHabits(sorted.slice(0, 3));

        // Consistency score
        const consistencyData = fetchedHabits.map((habit) => {
          const start = dayjs(habit.createdAt);
          const totalDays = today.diff(start, "day") + 1;
          const completed = habit.completedDates?.length || 0;
          const percentage = Math.round((completed / totalDays) * 100);
          return { title: habit.title, percentage };
        });

        setConsistency(consistencyData);
      })
      .catch((err) => console.error(err));
  }, [user]);

  if (!user) return <div>Loading...</div>;

  const totalHabits = habits.length;
  const totalCompletions = habits.reduce(
    (sum, habit) => sum + (habit.completedDates?.length || 0),
    0
  );

  const labels = habits.map((habit) => habit.title);
  const completions = habits.map((habit) => habit.completedDates?.length || 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl">{totalHabits}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Completions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl">{totalCompletions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📅 Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This Week: <strong>{weeklyData.thisWeek}</strong></p>
                <p>Last Week: <strong>{weeklyData.lastWeek}</strong></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔥 Top 3 Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topHabits.map((habit, idx) => (
                    <li key={idx}>
                      <strong>{habit.title}</strong> — {habit.completedDates?.length || 0} completions
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>🧠 Consistency Score</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {consistency.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.title}</strong>: {item.percentage}%
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 gap-8 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Habit Completions</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={{
                    labels,
                    datasets: [
                      {
                        label: "Completions",
                        data: completions,
                        backgroundColor: "rgba(59, 130, 246, 0.7)",
                        borderRadius: 8,
                        barThickness: 30,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    animation: {
                      duration: 1200,
                      easing: "easeOutQuart",
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "#1f2937",
                        titleColor: "#f9fafb",
                        bodyColor: "#f9fafb",
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        cornerRadius: 6,
                      },
                    },
                    scales: {
                      y: {
                        ticks: {
                          beginAtZero: true,
                          stepSize: 1,
                          font: { size: 14 },
                          color: "#6b7280",
                        },
                        grid: { color: "#e5e7eb" },
                      },
                      x: {
                        ticks: {
                          font: { size: 13, weight: "bold" },
                          color: "#374151",
                        },
                        grid: { display: false },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Habit Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Line
                  data={{
                    labels,
                    datasets: [
                      {
                        label: "Completed Days",
                        data: completions,
                        borderColor: "rgba(34, 197, 94, 0.9)",
                        backgroundColor: "rgba(34, 197, 94, 0.2)",
                        pointBackgroundColor: "rgba(34, 197, 94, 1)",
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    animation: {
                      duration: 1200,
                      easing: "easeOutCirc",
                    },
                    plugins: {
                      tooltip: {
                        backgroundColor: "#1f2937",
                        titleColor: "#f9fafb",
                        bodyColor: "#f9fafb",
                        padding: 10,
                        cornerRadius: 6,
                      },
                      legend: { display: false },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: "#374151",
                          font: { size: 13, weight: "bold" },
                        },
                        grid: { display: false },
                      },
                      y: {
                        ticks: {
                          color: "#6b7280",
                          font: { size: 14 },
                          stepSize: 1,
                        },
                        grid: { color: "#e5e7eb" },
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsPage;
