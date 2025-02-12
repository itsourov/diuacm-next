"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, RefreshCcw, Clock, User, Info } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateCodeforcesResults } from "./actions/codeforces";
import { toast } from "sonner";

interface CodeforcesResultsDialogProps {
    eventId: bigint;
    contestId: string;
    currentUser?: string;
    userId?: string; // Add userId prop
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
        <div className="grid gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {currentUser && (
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-primary" />
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

export function CodeforcesResultsDialog({ eventId, contestId, currentUser, userId }: CodeforcesResultsDialogProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [isUpdatingAll, setIsUpdatingAll] = useState<boolean>(false);
    const [isUpdatingSelf, setIsUpdatingSelf] = useState<boolean>(false);

    const handleUpdateResults = async (updateSelf: boolean = false) => {
        if (isUpdatingAll || isUpdatingSelf) return;
        if (updateSelf && !userId) {
            toast.error("Authentication Required", {
                description: "Please log in to update your results.",
            });
            return;
        }

        try {
            const setLoading = updateSelf ? setIsUpdatingSelf : setIsUpdatingAll;
            setLoading(true);

            const result = await updateCodeforcesResults(
                eventId,
                contestId,
                updateSelf ? userId : undefined
            );

            if (result.success) {
                toast.success("Results Updated", {
                    description: `Contest results have been successfully updated for ${updateSelf ? 'you' : 'all participants'}.`,
                });
                setOpen(false);
            } else {
                toast.error("Update Failed", {
                    description: result.error || "Failed to update results.",
                });
            }
        } catch (error) {
            toast.error("Update Error", {
                description: error instanceof Error ? error.message : "An unexpected error occurred",
            });
        } finally {
            const setLoading = updateSelf ? setIsUpdatingSelf : setIsUpdatingAll;
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (isUpdatingAll || isUpdatingSelf) return;
            setOpen(newOpen);
        }}>
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
                    Update Contest Results
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl border-2 border-blue-100/20 dark:border-blue-500/20
                max-h-[95vh] overflow-hidden flex flex-col">
                <div className="p-4 sm:p-8 space-y-6 overflow-y-auto">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-3xl font-bold tracking-tight">
                            Update Codeforces Results
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            Synchronize your contest results from the Codeforces platform
                        </DialogDescription>
                    </DialogHeader>

                    <StatusInfo currentUser={currentUser} />

                    <Card className="border-2 border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10">
                        <CardHeader className="pb-2">
                            <div className="flex items-start gap-4">
                                <Info className="h-5 w-5 text-blue-600 mt-1" />
                                <div className="space-y-1">
                                    <CardTitle>Bulk Update Process</CardTitle>
                                    <CardDescription className="text-blue-600/90 dark:text-blue-400">
                                        All participant results will be updated at once
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Alert className="bg-card border-2 border-primary/20">
                        <AlertDescription>
                            <p className="font-semibold mb-3">Updates will include:</p>
                            <ul className="list-disc ml-4 space-y-2 text-sm text-muted-foreground">
                                <li className="hover:text-primary transition-colors">
                                    Problems solved during contest time
                                </li>
                                <li className="hover:text-primary transition-colors">
                                    Problems solved after contest (upsolving)
                                </li>
                                <li className="hover:text-primary transition-colors">
                                    Contest participation status
                                </li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <Card className="border-2 border-blue-500/20">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">
                                This will update contest results for all participants with
                                Codeforces handles. The process should be quick as Codeforces
                                allows fetching data for multiple users at once.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                <div className="p-4 sm:p-6 mt-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => void handleUpdateResults(true)}
                            disabled={isUpdatingAll || isUpdatingSelf || !userId}
                            variant="outline"
                            className="flex-1 h-12 text-base font-medium rounded-xl transition-all
                                hover:bg-secondary"
                        >
                            {isUpdatingSelf ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Updating Your Stats...
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="mr-2 h-5 w-5" />
                                    Update Self Stats
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={() => void handleUpdateResults(false)}
                            disabled={isUpdatingAll || isUpdatingSelf}
                            className="flex-1 h-12 text-base font-medium rounded-xl text-white dark:text-white
                                bg-gradient-to-r from-blue-600 to-purple-600
                                hover:from-blue-700 hover:to-purple-700
                                disabled:from-gray-600 disabled:to-gray-600
                                transition-all duration-300"
                        >
                            {isUpdatingAll ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Updating All Stats...
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="mr-2 h-5 w-5" />
                                    Update All Stats
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
