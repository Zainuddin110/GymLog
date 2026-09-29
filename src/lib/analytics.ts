import { db } from './db';
import { LifetimeStats, SplitType } from '../types/gym';

export async function calculateLifetimeStats(): Promise<LifetimeStats> {
  try {
    const workouts = await db.workouts.toArray();
    const sets = await db.workout_sets.toArray();

    if (workouts.length === 0) {
      return {
        totalWorkouts: 0,
        weeklyStreak: 0,
        totalVolumeKg: 0,
        totalVolumeLbs: 0,
        favoriteSplit: null
      };
    }

    // 1. Total Volume
    let totalVolumeKg = 0;
    sets.forEach(s => {
      if (s.is_completed && s.weight && s.reps) {
        totalVolumeKg += Number(s.weight) * Number(s.reps);
      }
    });
    const totalVolumeLbs = totalVolumeKg * 2.20462;

    // 2. Favorite Split
    const splitCounts: Record<string, number> = {};
    workouts.forEach(w => {
      splitCounts[w.split_type] = (splitCounts[w.split_type] || 0) + 1;
    });

    let favoriteSplit: SplitType | null = null;
    let maxSplitCount = 0;
    Object.entries(splitCounts).forEach(([split, count]) => {
      if (count > maxSplitCount) {
        maxSplitCount = count;
        favoriteSplit = split as SplitType;
      }
    });

    // 3. Weekly Streak calculation
    // Collect unique calendar weeks (YYYY-WW) where at least 1 workout was logged
    const workoutWeeks = new Set<string>();
    workouts.forEach(w => {
      if (w.started_at) {
        const d = new Date(w.started_at);
        const year = d.getFullYear();
        // Compute ISO week number
        const startOfYear = new Date(year, 0, 1);
        const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        workoutWeeks.add(`${year}-W${week}`);
      }
    });

    // Count consecutive weeks back from current week
    const now = new Date();
    const currYear = now.getFullYear();
    const currDays = Math.floor((now.getTime() - new Date(currYear, 0, 1).getTime()) / (24 * 60 * 60 * 1000));
    const currWeekNum = Math.ceil((currDays + new Date(currYear, 0, 1).getDay() + 1) / 7);

    let streak = 0;
    let checkWeek = currWeekNum;
    let checkYear = currYear;

    // Check if logged this week or last week
    const hasCurrentWeek = workoutWeeks.has(`${checkYear}-W${checkWeek}`);
    if (!hasCurrentWeek) {
      checkWeek--;
      if (checkWeek <= 0) {
        checkYear--;
        checkWeek = 52;
      }
    }

    while (workoutWeeks.has(`${checkYear}-W${checkWeek}`)) {
      streak++;
      checkWeek--;
      if (checkWeek <= 0) {
        checkYear--;
        checkWeek = 52;
      }
    }

    return {
      totalWorkouts: workouts.length,
      weeklyStreak: streak,
      totalVolumeKg: Math.round(totalVolumeKg),
      totalVolumeLbs: Math.round(totalVolumeLbs),
      favoriteSplit
    };
  } catch (err) {
    console.error('Error calculating lifetime stats:', err);
    return {
      totalWorkouts: 0,
      weeklyStreak: 0,
      totalVolumeKg: 0,
      totalVolumeLbs: 0,
      favoriteSplit: null
    };
  }
}

