import { useEffect, useState } from 'react';
import { Bookmark, LoaderCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { PostCard } from '../components/PostCard.jsx';
export function SavedPosts({ user }) {
  const [posts,setPosts]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{api.get('/bookmarks').then(({data})=>setPosts(data.posts)).catch(e=>setError(e.response?.data?.message||'Could not load saved posts')).finally(()=>setLoading(false))},[]);
  return <div className="content-wrap feed-wrap">
    <div className="page-heading"><div><span className="eyebrow">KEPT CLOSE</span><h1>Saved posts<span className="heading-dot">.</span></h1><p>Things you wanted to come back to.</p></div><Bookmark size={22} color="#6b7d5c"/></div>
    {error&&<div className="error-box">{error}</div>}
    {loading?<div className="loading"><LoaderCircle className="spin"/>Loading saved posts…</div>:posts.length?posts.map(post=><PostCard key={post._id} post={post} user={user} onUnsave={id=>setPosts(items=>items.filter(item=>item._id!==id))}/>):<div className="empty"><div><Bookmark/></div><h3>No saved posts yet.</h3><p>Use Save on a post to keep it here.</p></div>}
  </div>;
}
