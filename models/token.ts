import mongoose from "mongoose"

export interface IToken extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  token: string
  type: string
  expires: Date
}

const TokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
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

export const Token = mongoose.models.Token as mongoose.Model<IToken> || 
  mongoose.model<IToken>("Token", TokenSchema) 