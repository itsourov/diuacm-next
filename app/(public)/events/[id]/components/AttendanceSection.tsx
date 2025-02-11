"use client";

import { useState } from "react";
import { Event } from "@prisma/client";
import { Check, Lock, Timer, X, Users, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { giveAttendance } from "../actions";
import UserAvatar from "@/components/UserAvatar";
import { DateTime } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils";

type EventWithUsers = Event & {
    eventUsers: Array<{
        user: {
            id: string;
            name: string;
            username: string;
            image: string | null;
        };
    }>;
};

interface AttendanceSectionProps {
    event: EventWithUsers;
    hasAttendance: boolean;
    currentUser: { id: string } | null;
}

export default function AttendanceSection({
    event,
    hasAttendance,
    currentUser,
}: AttendanceSectionProps) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Calculate attendance window (15 minutes before start to 15 minutes after end)
    const now = DateTime.getCurrentUTCTime();
    const startTime = new Date(event.startingAt);
    const endTime = new Date(event.endingAt);
    const attendanceStartTime = new Date(startTime);
    const attendanceEndTime = new Date(endTime);
    attendanceStartTime.setMinutes(attendanceStartTime.getMinutes() - 15);
    attendanceEndTime.setMinutes(attendanceEndTime.getMinutes() + 15);

    const isWithinAttendanceWindow = now >= attendanceStartTime && now <= attendanceEndTime;
    const canGiveAttendance = event.openForAttendance && isWithinAttendanceWindow && !hasAttendance && currentUser;

    const getAttendanceStatus = () => {
        if (!event.openForAttendance) {
            return {
                message: "Attendance is not open for this event",
                icon: Lock,
                className: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            };
        }

        if (hasAttendance) {
            return {
                message: "You have successfully given attendance",
                icon: Check,
                className: "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100"
            };
        }

        if (!currentUser) {
            return {
                message: "Sign in to give attendance",
                icon: Lock,
                className: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
            };
        }

        if (now < attendanceStartTime) {
            return {
                message: `Attendance opens at ${DateTime.formatDisplay(attendanceStartTime, {
                    format: 'local',
                    includeTimezone: true
                })}`,
                icon: Timer,
                className: "bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
            };
        }

        if (now > attendanceEndTime) {
            return {
                message: "Attendance window has expired",
                icon: X,
                className: "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100"
            };
        }

        return {
            message: "You can give attendance now",
            icon: Check,
            className: "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100"
        };
    };

    const status = getAttendanceStatus();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canGiveAttendance) return;

        setLoading(true);
        try {
            const result = await giveAttendance(event.id.toString(), password);
            if (result.success) {
                toast({
                    title: "Success!",
                    description: "Your attendance has been recorded.",
                    className: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
                });

            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record attendance. " + error,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Attendance Status Card */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Users className="w-8 h-8 text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Attendance
                        </h2>
                    </div>

                    <div className={cn(
                        "rounded-xl p-6 mb-8",
                        status.className
                    )}>
                        <div className="flex items-center gap-3">
                            <status.icon className="w-6 h-6" />
                            <p className="text-lg font-medium">
                                {status.message}
                            </p>
                        </div>
                    </div>

                    {canGiveAttendance && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Event Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter the event password"
                                        className="pl-12 h-12 text-lg bg-gray-50 dark:bg-gray-900"
                                        required
                                    />
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? "Recording Attendance..." : "Give Attendance"}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Attendees List */}
                <div className="border-t border-gray-100 dark:border-gray-700">
                    <div className="p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Attendees ({event.eventUsers.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {event.eventUsers.map(({ user }) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-900"
                                >
                                    <UserAvatar user={user} className="w-10 h-10" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}