import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "scan checkout reminders",
  { hours: 1 },
  internal.notifications.scanCheckoutReminders,
  {}
);

export default crons;
