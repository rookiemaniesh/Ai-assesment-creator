import mongoose, { Document } from 'mongoose';
/**
 * Teacher / school profile — used for login and scoping assignments & papers.
 */
export interface IProfile extends Document {
    username: string;
    schoolName: string;
    schoolAddress: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Profile: mongoose.Model<IProfile, {}, {}, {}, mongoose.Document<unknown, {}, IProfile, {}, mongoose.DefaultSchemaOptions> & IProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProfile>;
//# sourceMappingURL=Profile.d.ts.map