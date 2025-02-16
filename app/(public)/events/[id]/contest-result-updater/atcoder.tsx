"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RefreshCcw, Loader2, Clock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { AtcoderUpdateEvent, ProcessedUserResult } from "./types/atcoder";

interface AtcoderResultsDialogProps {
    eventId: bigint;
    contestId: string;
    currentUser?: string;
}

export function AtcoderResultsDialog({
    eventId,
    contestId,
    currentUser
}: AtcoderResultsDialogProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [results, setResults] = useState<ProcessedUserResult[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll but allow manual scrolling
    useEffect(() => {
        if (scrollRef.current) {
            const scrollElement = scrollRef.current;
            // Only auto-scroll if user is already at bottom
            const isAtBottom = scrollElement.scrollHeight - scrollElement.scrollTop === scrollElement.clientHeight;
            if (isAtBottom) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [results]);

    const handleUpdate = useCallback(async () => {
        setIsUpdating(true);
        setResults([]);

        try {
            const eventSource = new EventSource(
                `/api/events/${eventId}/atcoder-update?contestId=${encodeURIComponent(contestId)}`
            );

            eventSource.onmessage = (event) => {
                const data: AtcoderUpdateEvent = JSON.parse(event.data);

                switch (data.type) {
                    case 'progress':
                        setResults(prev => [...prev, ...data.userResults]);
                        break;
                    case 'complete':
                        eventSource.close();
                        setIsUpdating(false);
                        router.refresh();
                        toast.success("Results Updated", {
                            description: "Contest results have been successfully updated."
                        });
                        break;
                    case 'error':
                        toast.error("Update Failed", {
                            description: data.error
                        });
                        eventSource.close();
                        setIsUpdating(false);
                        break;
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                setIsUpdating(false);
                toast.error("Connection Error", {
                    description: "Failed to connect to update stream"
                });
            };

        } catch (error) {
            setIsUpdating(false);
            toast.error("Update Failed", {
                description: error instanceof Error ? error.message : String(error)
            });
        }
    }, [eventId, contestId, router]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl
                        bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                        dark:from-blue-500/20 dark:to-purple-500/20
                        backdrop-blur-xl shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20
                        border border-blue-100/20 dark:border-blue-500/20
                        text-blue-600 dark:text-blue-400 font-medium
                        hover:from-blue-500/20 hover:to-purple-500/20
                        dark:hover:from-blue-500/30 dark:hover:to-purple-500/30
                        transition-all duration-300"
                >
                    <RefreshCcw className="h-5 w-5" />
                    Update AtCoder Results
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl 
                bg-gradient-to-br from-white to-blue-50 dark:from-gray-950 dark:to-blue-950/20
                border-2 border-blue-100/20 dark:border-blue-500/20
                max-h-[90vh] overflow-hidden flex flex-col
                backdrop-blur-xl shadow-xl">
                <div className="p-6 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Update AtCoder Results
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Synchronize your contest results from AtCoder platform
                        </DialogDescription>
                    </DialogHeader>

                    <StatusInfo currentUser={currentUser} />

                    <Alert className="bg-blue-50/50 dark:bg-blue-950/50 border-blue-100/20 dark:border-blue-500/20">
                        <AlertDescription>
                            Fetching results from AtCoder API. Results will update in real-time as they are processed.
                        </AlertDescription>
                    </Alert>
                </div>

                <div 
                    ref={scrollRef}
                    className="flex-1 px-6 overflow-y-auto min-h-0"
                >
                    <div className="space-y-4 pr-4 pb-6">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 
                                    border border-blue-100/20 dark:border-blue-500/20
                                    backdrop-blur-sm transition-all duration-200
                                    hover:bg-white/80 dark:hover:bg-gray-900/80"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-medium text-blue-700 dark:text-blue-300">
                                            {result.username}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            AtCoder: {result.atcoderHandle || "Not set"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Solved: {result.solveCount}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Upsolved: {result.upsolveCount}
                                        </p>
                                    </div>
                                </div>
                                {result.error && (
                                    <p className="text-sm text-destructive mt-2">
                                        Error: {result.error}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-blue-100/20 dark:border-blue-500/20">
                    <Button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="w-full h-12 text-base font-medium rounded-xl
                            bg-gradient-to-r from-blue-600 to-purple-600
                            hover:from-blue-700 hover:to-purple-700
                            text-white dark:text-white
                            disabled:from-gray-600 disabled:to-gray-600
                            transition-all duration-300"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Updating Results...
                            </>
                        ) : (
                            <>
                                <RefreshCcw className="mr-2 h-5 w-5" />
                                Start Update
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StatusInfo({ currentUser }: { currentUser?: string }) {
    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const formatted = now.toISOString()
                .replace('T', ' ')
                .replace(/\.\d{3}Z$/, '');
            setCurrentTime(formatted);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid gap-4 p-4 rounded-lg
            bg-gradient-to-r from-red-50/50 to-orange-50/50 
            dark:from-red-950/50 dark:to-orange-950/50
            border border-red-100/20 dark:border-red-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {currentUser && (
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-red-600" />
                        <span className="font-medium">{currentUser}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{currentTime} UTC</span>
                </div>
            </div>
        </div>
    );
}
