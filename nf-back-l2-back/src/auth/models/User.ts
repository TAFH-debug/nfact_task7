import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  password: string;
  online: boolean;
  typing: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String},
  password: { type: String, required: true },
  online: { type: Boolean, default: false, required: true },
  typing: { type: Boolean, default: false, required: true }
});

export default mongoose.model<IUser>('User', UserSchema);
