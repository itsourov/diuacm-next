"use client";

import { Semester } from "../types/contests";
import ContestCard from "./ContestCard";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface SemesterSectionProps {
  semester: Semester;
}

export default function SemesterSection({ semester }: SemesterSectionProps) {
  return (
    <section className="relative">
      {/* Semester Header */}
      <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl py-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 dark:bg-purple-400/10">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {semester.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{semester.period}</p>
          </div>
        </div>
      </div>

      {/* Contests Grid */}
      <div className="mt-8">
        {semester.contests.map((contest, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <ContestCard contest={contest} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}