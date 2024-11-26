export type WorkStatus = 
  | 'idle'
  | 'generating'
  | 'answering'
  | 'grading'
  | 'tuning'
  | 'evaluating';

export interface WorkStatusResponse {
  status: WorkStatus;
  status_name: string;
} 