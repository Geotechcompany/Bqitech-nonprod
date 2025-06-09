import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  excerpt: { 
    type: String, 
    required: [true, 'Excerpt is required'],
    trim: true,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  content: { 
    type: String, 
    required: [true, 'Content is required']
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Featured image is required'],
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v)
      },
      message: 'Image URL must be a valid URL'
    }
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    trim: true
  },
  readTime: { 
    type: String, 
    required: [true, 'Read time is required'],
    trim: true
  },
  published: { 
    type: Boolean, 
    default: false,
    index: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: [100, 'Slug cannot be more than 100 characters'],
    index: true
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Author is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})

// Create slug from title before saving
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
  next();
});

// Add text index for search
blogPostSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text' 
});

// Add compound index for published posts by date
blogPostSchema.index({ 
  published: 1, 
  createdAt: -1 
});

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema) 