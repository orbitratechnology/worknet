import { PROBLEMS } from '@/constants/problems';

/** Curated home-screen problems — full list remains in Explore. */
export const FEATURED_PROBLEM_IDS = [
  'p6', // Leaking taps
  'p5', // Blocked drains
  'p3', // Power points
  'p4', // Wiring
  'p17', // AC repair
  'p22', // Car breakdown
  'p11', // WiFi
  'p10', // Deep cleaning
] as const;

export const EMERGENCY_PROBLEM_IDS = ['p32', 'p33', 'p4', 'p6'] as const;

export const FEATURED_PROBLEMS = PROBLEMS.filter((p) =>
  (FEATURED_PROBLEM_IDS as readonly string[]).includes(p.id),
);

export const EMERGENCY_PROBLEMS = PROBLEMS.filter((p) =>
  (EMERGENCY_PROBLEM_IDS as readonly string[]).includes(p.id),
);
