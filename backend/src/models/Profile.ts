import mongoose, { Document, Schema } from 'mongoose';

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

const ProfileSchema = new Schema<IProfile>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [64, 'Username cannot exceed 64 characters'],
      match: [/^[a-z0-9._-]+$/, 'Username may only contain letters, numbers, dot, underscore, hyphen'],
    },
    schoolName: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [200, 'School name cannot exceed 200 characters'],
    },
    schoolAddress: {
      type: String,
      required: [true, 'School address is required'],
      trim: true,
      maxlength: [500, 'School address cannot exceed 500 characters'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

ProfileSchema.index({ username: 1 });

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
