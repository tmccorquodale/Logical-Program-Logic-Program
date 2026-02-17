
export interface Aim {
  id: string;
  description: string;
  activities: string[];
  outputs: string[];
  shortTermImpacts: string[];
  longTermImpacts: string[];
}

export interface Need {
  id: string;
  description: string;
  aims: Aim[];
}

export interface ProgramLogic {
  goal: string;
  needs: Need[];
}

export type StepType = 'GOAL' | 'NEEDS' | 'AIMS' | 'DETAILS' | 'REVIEW';
