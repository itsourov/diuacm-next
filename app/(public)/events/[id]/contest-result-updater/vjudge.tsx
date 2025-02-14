"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,

} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCcw, Save, Key, ChevronRight, Clock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { validateVjudgeSession, updateVjudgeResults } from "./actions/vjudge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VjudgeResultsDialogProps {
    eventId: bigint;
    contestId: string;
    currentUser?: string;
}

const STORAGE_KEY = "vjudge_sessionId";

function getStoredSession() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEY);
    }
    return null;
}

function setStoredSession(value: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, value);
    }
}

function removeStoredSession() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
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

export function VjudgeResultsDialog({ eventId, contestId, currentUser }: VjudgeResultsDialogProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string>("");
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [validatedUsername, setValidatedUsername] = useState<string | null>(null);
    const [showSessionInput, setShowSessionInput] = useState<boolean>(false);
    const [isUpdatingWithAuth, setIsUpdatingWithAuth] = useState<boolean>(false);
    const [isUpdatingWithoutAuth, setIsUpdatingWithoutAuth] = useState<boolean>(false);

    const handleValidateSession = useCallback(async (idToValidate: string, silent = false) => {
        if (!idToValidate) return;

        try {
            setIsValidating(true);
            const result = await validateVjudgeSession(idToValidate);

            if (result.success && result.username) {
                setValidatedUsername(result.username);
                setSessionId(idToValidate);
                setStoredSession(idToValidate);
                setShowSessionInput(false);

                if (!silent) {
                    toast.success("Session Validated", {
                        description: `Successfully validated for user: ${result.username}`,
                    });
                }
            } else {
                setValidatedUsername(null);
                removeStoredSession();

                if (!silent) {
                    toast.error("Invalid Session ID", {
                        description: result.error || "Please check your session ID and try again.",
                    });
                }
            }
        } catch (error) {
            setValidatedUsername(null);
            if (!silent) {
                toast.error("Validation Failed", {
                    description: "Failed to validate session. " + error,
                });
            }
        } finally {
            setIsValidating(false);
        }
    }, []);

    const handleUpdateResults = useCallback(async (withAuth: boolean) => {
        try {
            if (withAuth) {
                setIsUpdatingWithAuth(true);
            } else {
                setIsUpdatingWithoutAuth(true);
            }

            const result = await updateVjudgeResults({
                eventId,
                contestId,
                sessionId: withAuth ? sessionId : undefined,
            });

            if (result.success) {
                toast.success("Results Updated", {
                    description: "Contest results have been successfully updated.",
                });
                setOpen(false);
            } else {
                if (result.error === "AUTH_REQUIRED") {
                    toast.error("Authentication Required", {
                        description: "This contest requires authentication. Please provide your Vjudge session ID.",
                    });
                    setShowSessionInput(true);
                } else {
                    toast.error("Update Failed", {
                        description: result.error || "Failed to update results1.",
                    });
                }
            }
        } catch (error) {
            toast.error("Update Error", {
                description: error instanceof Error ? error.message : "An unexpected error occurred",
            });
        } finally {
            setIsUpdatingWithAuth(false);
            setIsUpdatingWithoutAuth(false);
        }
    }, [contestId, eventId, sessionId, setOpen]);

    useEffect(() => {
        if (open && !showSessionInput) {
            const saved = getStoredSession();
            if (saved) {
                setSessionId(saved);
                void handleValidateSession(saved, true);
            }
        }
    }, [open, showSessionInput, handleValidateSession]);

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
                    Update Contest Results
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] p-0 rounded-2xl border-2 border-blue-100/20 dark:border-blue-500/20
                max-h-[95vh] overflow-hidden flex flex-col">
                <div className="p-4 sm:p-8 space-y-6 overflow-y-auto">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-3xl font-bold tracking-tight">
                            Update Vjudge Results
                        </DialogTitle>
                        <DialogDescription className="text-base text-muted-foreground">
                            Synchronize your contest results from the Vjudge platform
                        </DialogDescription>
                    </DialogHeader>

                    <StatusInfo currentUser={currentUser} />

                    {validatedUsername && !showSessionInput ? (
                        <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-900/10">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <Key className="h-5 w-5 text-green-600" />
                                            Session Active
                                        </CardTitle>
                                        <CardDescription className="text-green-600 dark:text-green-400">
                                            Successfully authenticated with Vjudge
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSessionInput(true)}
                                        className="hover:bg-green-100 dark:hover:bg-green-900/30"
                                    >
                                        Change
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Logged in as {validatedUsername}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="sessionId" className="text-lg font-medium">
                                        Vjudge Session ID
                                    </Label>
                                    {getStoredSession() && !validatedUsername && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:text-primary-foreground"
                                            onClick={() => {
                                                const saved = getStoredSession();
                                                if (saved) {
                                                    setSessionId(saved);
                                                    void handleValidateSession(saved);
                                                }
                                            }}
                                        >
                                            Use Saved Session
                                        </Button>
                                    )}
                                </div>

                                <Alert className="bg-card border-2 border-primary/20">
                                    <AlertDescription>
                                        <p className="font-semibold mb-3">How to get your session ID:</p>
                                        <ol className="list-decimal ml-4 space-y-2 text-sm text-muted-foreground">
                                            <li className="hover:text-primary transition-colors">Log in to Vjudge in your browser</li>
                                            <li className="hover:text-primary transition-colors">Open DevTools (F12)</li>
                                            <li className="hover:text-primary transition-colors">Go to Application → Cookies → vjudge.net</li>
                                            <li className="hover:text-primary transition-colors">Find &apos;JSESSIONID&apos; (starts with username)</li>
                                        </ol>
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input
                                            id="sessionId"
                                            value={sessionId}
                                            onChange={(e) => setSessionId(e.target.value)}
                                            placeholder="username|XXXXXXXXXXXXXXXXXXXXX"
                                            className="font-mono text-sm focus:ring-2 focus:ring-primary/20 pr-20"
                                            aria-label="Vjudge Session ID"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                                            {sessionId.length} chars
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => void handleValidateSession(sessionId)}
                                        disabled={!sessionId || isValidating}
                                        className="w-full h-10 transition-all"
                                        variant="secondary"
                                    >
                                        {isValidating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Validating Session...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Validate Session
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                <div className="p-4 sm:p-6 mt-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant={validatedUsername ? "outline" : "secondary"}
                            onClick={() => void handleUpdateResults(false)}
                            disabled={isUpdatingWithAuth || isUpdatingWithoutAuth}
                            className={cn(
                                "flex-1 h-12 text-base font-medium rounded-xl transition-all",
                                validatedUsername && "hover:bg-secondary"
                            )}
                        >
                            {isUpdatingWithoutAuth ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <RefreshCcw className="mr-2 h-5 w-5" />
                            )}
                            {isUpdatingWithoutAuth ? "Updating..." : "Update Without Auth"}
                        </Button>

                        <Button
                            onClick={() => void handleUpdateResults(true)}
                            disabled={isUpdatingWithAuth || isUpdatingWithoutAuth || !validatedUsername}
                            className="flex-1 h-12 text-base font-medium rounded-xl text-white dark:text-white
                                bg-gradient-to-r from-blue-600 to-purple-600
                                hover:from-blue-700 hover:to-purple-700
                                disabled:from-gray-600 disabled:to-gray-600
                                transition-all duration-300"
                        >
                            {isUpdatingWithAuth ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <RefreshCcw className="mr-2 h-5 w-5" />
                                    Update With Auth
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}