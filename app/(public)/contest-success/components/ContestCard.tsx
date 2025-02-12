"use client";

import { Contest } from "../types/contests";
import { Award, ExternalLink, Users, MapPin, Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ImageGallery from "./ImageGallery";

interface ContestCardProps {
  contest: Contest;
}

export default function ContestCard({ contest }: ContestCardProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Contest Header */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {contest.title}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                {new Date(contest.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                {contest.venue}
              </div>
            </div>
          </div>
          <a
            href={contest.ranklistLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
              bg-blue-50 dark:bg-blue-900/20 
              text-blue-600 dark:text-blue-400
              hover:bg-blue-100 dark:hover:bg-blue-900/30
              transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Ranklist</span>
          </a>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="p-8">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Users className="w-5 h-5" />
          Participating Teams ({contest.teams.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contest.teams.map((team, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800
                       hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    {team.name}
                  </h5>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Rank: {team.rank}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {team.members.map((member, memberIndex) => (
                  <div
                    key={memberIndex}
                    className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.studentId}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Images Section */}
      {contest.images.length > 0 && (
        <div className="p-8 border-t border-gray-100 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contest.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden cursor-pointer
                         ring-1 ring-gray-200 dark:ring-gray-700
                         hover:ring-blue-300 dark:hover:ring-blue-700
                         transition-all duration-200"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setShowGallery(true);
                }}
              >
                <Image
                  src={image}
                  alt={`${contest.title} photo ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <ImageGallery
        images={contest.images}
        open={showGallery}
        onClose={() => setShowGallery(false)}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
}