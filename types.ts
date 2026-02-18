
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
  aims: Aims[];
}

export interface ProgramLogic {
  goal: string;
  needs: Needs[];
}

export type StepType = 'GOAL' | 'NEEDS' | 'AIMS' | 'DETAILS' | 'REVIEW';
