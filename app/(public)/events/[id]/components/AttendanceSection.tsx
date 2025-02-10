"use client";

import {useState} from "react";
import {Event} from "@prisma/client";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useToast} from "@/hooks/use-toast";
import {giveAttendance} from "../actions";
import UserAvatar from "@/components/UserAvatar";
import {DateTime} from "@/lib/utils/datetime";
import {Check, Clock, X} from "lucide-react";
import {cn} from "@/lib/utils";

interface AttendanceSectionProps {
    event: Event & {
        eventUsers: Array<{
            user: {
                id: string;
                name: string;
                username: string;
                image: string | null;
            };
        }>;
    };
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
    const {toast} = useToast();

    const now = DateTime.getCurrentUTCTime();
    const startTime = new Date(event.startingAt);
    const endTime = new Date(event.endingAt);

    // Calculate attendance window
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
                icon: X,
                className: "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
            };
        }

        if (hasAttendance) {
            return {
                message: "You have successfully given attendance",
                icon: Check,
                className: "text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
            };
        }

        if (!currentUser) {
            return {
                message: "Sign in to give attendance",
                icon: X,
                className: "text-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
            };
        }

        if (now < attendanceStartTime) {
            const timeUntil = DateTime.formatDisplay(attendanceStartTime);
            return {
                message: `Attendance will open at ${timeUntil}`,
                icon: Clock,
                className: "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
            };
        }

        if (now > attendanceEndTime) {
            return {
                message: "Attendance window has expired",
                icon: X,
                className: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
            };
        }

        return {
            message: "You can give attendance now",
            icon: Check,
            className: "text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
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
                    title: "Success",
                    description: "Attendance recorded successfully!",
                    className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
                });
                window.location.reload();
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Something went wrong",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to record attendance",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!event.openForAttendance) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-0 bg-white dark:bg-gray-800/50">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        Attendance
                    </h3>

                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-lg mb-6",
                        status.className
                    )}>
                        <status.icon className="w-5 h-5 flex-shrink-0"/>
                        <p className="text-sm font-medium">{status.message}</p>
                    </div>

                    {canGiveAttendance && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter event password"
                                    className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                {loading ? "Submitting..." : "Give Attendance"}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                            Attendance Window
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Starts</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {DateTime.formatDisplay(attendanceStartTime)}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Ends</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {DateTime.formatDisplay(attendanceEndTime)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700/50">
                    <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Attendees ({event.eventUsers.length})
                        </h4>
                        <div className="space-y-4">
                            {event.eventUsers.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No attendees yet
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {event.eventUsers.map(({user}) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                        >
                                            <UserAvatar user={user} className="w-8 h-8"/>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    @{user.username}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}