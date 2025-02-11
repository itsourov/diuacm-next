'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CustomTabsProps extends React.ComponentProps<typeof Tabs> {
  tabs: { value: string; label: string }[];
  className?: string;
}

export function CustomTabs({ tabs, className, ...props }: CustomTabsProps) {
  return (
    <Tabs {...props}>
      <TabsList 
        className={cn(
          "w-full bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 rounded-xl",
          "flex items-center justify-start gap-1",
          className
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-lg",
              "data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20",
              "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
              "transition-all duration-200"
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {props.children}
    </Tabs>
  );
}