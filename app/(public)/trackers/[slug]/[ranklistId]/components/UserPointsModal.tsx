'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { getUserSolveStats } from '../actions';
import { SolveStatWithEvent } from '../types';
import { DateTime } from '@/lib/utils/datetime';
import Link from 'next/link';
import { X, Calendar } from 'lucide-react';
import Image from 'next/image';

interface UserPointsModalProps {
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    maxCfRating: number | null;
    codeforcesHandle: string | null;
  };
  eventRankLists: {
    event: {
      id: bigint;
      title: string;
      startingAt: Date;
    };
    weight: number;
  }[];
  onClose: () => void;
}

export default function UserPointsModal({
  user,
  eventRankLists,
  onClose
}: UserPointsModalProps) {
  const [solveStats, setSolveStats] = useState<SolveStatWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolveStats = async () => {
      setLoading(true);
      const eventIds = eventRankLists.map(erl => erl.event.id);
      const response = await getUserSolveStats(user.id, eventIds);
      
      if (response.error) {
        setError(response.error);
      } else if (response.solveStats) {
        setSolveStats(response.solveStats);
      }
      
      setLoading(false);
    };

    fetchSolveStats();
  }, [user.id, eventRankLists]);

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl 
                                     bg-white dark:bg-gray-800 shadow-xl transition-all">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src={user.image || '/images/default-avatar.png'}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </h3>
                        <Link 
                          href={`/users/${user.username}`}
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 
                                   dark:hover:text-blue-400"
                        >
                          @{user.username}
                        </Link>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  ) : (
                    <div className="relative overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-6 py-3 text-gray-900 dark:text-white">Event</th>
                            <th className="px-6 py-3 text-center text-gray-900 dark:text-white">Weight</th>
                            <th className="px-6 py-3 text-center text-gray-900 dark:text-white">Solves</th>
                            <th className="px-6 py-3 text-center text-gray-900 dark:text-white">Upsolves</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {solveStats.map((stat) => {
                            const eventRankList = eventRankLists.find(
                              erl => erl.event.id === stat.eventId
                            );
                            
                            if (!eventRankList) return null;

                            return (
                              <tr key={stat.eventId.toString()} 
                                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4">
                                  <Link
                                    href={`/events/${stat.eventId}`}
                                    className="group"
                                  >
                                    <div className="font-medium text-gray-900 dark:text-white
                                                  group-hover:text-blue-500 dark:group-hover:text-blue-400">
                                      {stat.event.title}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {DateTime.formatDisplay(stat.event.startingAt, { format: 'utc' })}
                                    </div>
                                  </Link>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                    {eventRankList.weight}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">
                                  {stat.solveCount}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {stat.upsolveCount > 0 ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                      +{stat.upsolveCount}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500">
                                      0
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}