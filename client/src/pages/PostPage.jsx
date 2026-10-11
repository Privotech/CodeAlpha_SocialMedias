import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Avatar } from '../components/Avatar.jsx';
import { PostCard } from '../components/PostCard.jsx';

export function PostPage({ user }) {
  const { id } = useParams(),
    [post, setPost] = useState(null),
    [comments, setComments] = useState([]),
    [err, setErr] = useState("");
  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then(({ data }) => {
        setPost(data.post);
        setComments(data.comments);
      })
      .catch((e) => setErr(e.response?.data?.message || "Post not found"));
  }, [id]);
  return (
    <div className="content-wrap narrow">
      <Link to="/feed" className="back-link">
        ← Back to your feed
      </Link>
      {err && <div className="error-box">{err}</div>}
      {post && <PostCard post={post} user={user} />}
      {comments.map((c) => (
        <div className="comment-row" key={c._id}>
          <Avatar user={c.author} size="sm" />
          <p>
            <b>{c.author?.displayName}</b> {c.content}
          </p>
        </div>
      ))}
    </div>
  );
}

