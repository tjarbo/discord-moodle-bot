import { IAssignment } from './assignment.interface';

export interface ICourse {
  id: number;
  fullname: string;
  shortname: string;
  timemodified: number;
  assignments: IAssignment[];
}
