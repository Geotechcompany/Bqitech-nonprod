import mongoose, { Schema, Document } from 'mongoose'

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId
  token: string
  type: string
  expires: Date
  createdAt?: Date
}

const TokenSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  token: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'] 
  },
  expires: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: { expires: '1h' } // Auto-delete after 1 hour
  }
})

export const Token = mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema) 