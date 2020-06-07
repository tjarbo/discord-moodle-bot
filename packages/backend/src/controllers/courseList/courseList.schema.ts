import { Schema, model, Model, Document } from 'mongoose';
import { IAssignment } from '../moodle/interfaces/assignment.interface';

export interface ICourseListSchema extends Document {
    [_id: string]: any;
    courseId: number;
    name: string;
    isActive: boolean;

}

const courseListSchema = new Schema({
    courseId: {type: Number},
    name: {type: String},
    isActive: {type: Boolean}
});

export const CourseList: Model<ICourseListSchema> = model('CourseList', courseListSchema);
