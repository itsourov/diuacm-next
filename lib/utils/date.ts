import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";

export function getEventStatus(startDate: Date, endDate: Date) {
  const now = new Date();
  
  if (isBefore(now, startDate)) {
    return "upcoming";
  }
  
  if (isAfter(now, endDate)) {
    return "ended";
  }
  
  return "running";
}

export function getEventStatusConfig(status: "upcoming" | "running" | "ended") {
  const configs = {
    upcoming: {
      label: "Upcoming",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    running: {
      label: "Running",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    ended: {
      label: "Ended",
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
    },
  };

  return configs[status];
}

export function formatEventDate(date: Date) {
  return format(date, "MMMM d, yyyy 'at' HH:mm");
}

export function formatEventDuration(startDate: Date, endDate: Date) {
  const durationInMinutes = 
    Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
}

export function formatTimeDistance(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true });
}