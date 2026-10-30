import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  authorId: { type: String, required: true, index: true },
  authorName: { type: String, required: true },
  text: { type: String, required: true, maxlength: 1000 },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
});

postSchema.index({ authorId: 1, createdAt: -1, _id: -1 }); //Indexing in descending order (-1) allows 
                                                            // MongoDB to retrieve posts from newest to oldest directly from the index tree.
                                                            // id decreasing is for tiebreaker
export default mongoose.model('Post', postSchema);
