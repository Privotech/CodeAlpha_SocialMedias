import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, LoaderCircle, MessageCircle, MoreHorizontal, Plus, Search, Send } from 'lucide-react';
import { api, socketUrl } from '../lib/api.js';
import { Avatar } from '../components/Avatar.jsx';
import { ConversationRow } from '../components/ConversationRow.jsx';
import { MessageBubble } from '../components/MessageBubble.jsx';

export function Messages({ user }) {
  const { conversationId } = useParams(), navigate = useNavigate();
  const currentUserId = String(user.id || user._id || '');
  const [conversations,setConversations]=useState([]),[messages,setMessages]=useState([]),[people,setPeople]=useState([]),[query,setQuery]=useState(''),[draft,setDraft]=useState(''),[loading,setLoading]=useState(true),[sending,setSending]=useState(false),[error,setError]=useState('');
  const bottom=useRef(null), active=conversations.find(c=>String(c._id)===conversationId), token=localStorage.getItem('ch_token');
  const refresh=()=>api.get('/messages/conversations').then(({data})=>setConversations(data.conversations)).catch(()=>setError('Could not load your inbox.'));
  useEffect(()=>{refresh().finally(()=>setLoading(false));},[]);
  useEffect(()=>{if(query.trim().length<2){setPeople([]);return}const timer=setTimeout(()=>api.get('/users/search',{params:{q:query}}).then(({data})=>setPeople(data.users.filter(person=>String(person.id || person._id)!==currentUserId))).catch(()=>{}),250);return()=>clearTimeout(timer)},[query,currentUserId]);
  useEffect(()=>{if(!conversationId){setMessages([]);return}let live=true;setMessages([]);setError('');api.get(`/messages/conversations/${conversationId}/messages`).then(({data})=>{if(live)setMessages(data.messages)}).catch(e=>{if(live)setError(e.response?.data?.message||'Could not load this conversation.')});api.put(`/messages/conversations/${conversationId}/read`).then(()=>refresh()).catch(()=>{});return()=>{live=false}},[conversationId]);
  useEffect(()=>{const socket=io(socketUrl,{auth:{token},transports:['websocket','polling']});socket.on('message:new',({conversationId:id,message})=>{refresh();if(id===conversationId){setMessages(prev=>prev.some(m=>m._id===message._id)?prev:[...prev,message]);api.put('/messages/conversations/'+id+'/read').then(()=>refresh()).catch(()=>{});}});socket.on('message:read',({conversationId:id,readerId})=>{if(id===conversationId&&String(readerId)!==currentUserId)setMessages(prev=>prev.map(m=>String(m.sender?._id)===currentUserId?{...m,readBy:[...(m.readBy||[]),readerId]}:m))});return()=>socket.disconnect()},[conversationId,currentUserId]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:'smooth'})},[messages]);
  const filtered=useMemo(()=>conversations.filter(c=>`${c.other?.displayName||''} ${c.other?.username||''}`.toLowerCase().includes(query.toLowerCase())),[conversations,query]);
  async function start(person){try{const {data}=await api.post('/messages/conversations',{userId:person.id || person._id});setQuery('');setPeople([]);await refresh();navigate(`/messages/${data.conversation._id}`)}catch(e){setError(e.response?.data?.message||'Could not start this conversation.')}}
  async function send(e){e.preventDefault();const content=draft.trim();if(!content||!conversationId||sending)return;setSending(true);setError('');try{const {data}=await api.post(`/messages/conversations/${conversationId}/messages`,{content});setMessages(prev=>prev.some(m=>m._id===data.message._id)?prev:[...prev,data.message]);setDraft('');refresh()}catch(e){setError(e.response?.data?.message||'Message could not be sent.')}finally{setSending(false)}}
  return <div className="messenger-page"><section className={`inbox-panel ${conversationId?'inbox-hidden-mobile':''}`}>
    <div className="inbox-heading"><div><span className="eyebrow">YOUR PEOPLE</span><h1>Messages</h1></div><button className="messenger-icon-button" aria-label="New message" onClick={()=>document.querySelector('.message-search')?.focus()}><Plus size={19}/></button></div>
    <label className="message-search-wrap"><Search size={16}/><input className="message-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people or chats"/></label>
    {people.length>0&&<div className="message-people-results"><small>START A CONVERSATION</small>{people.map(person=><button key={person._id} onClick={()=>start(person)}><Avatar user={person}/><span><b>{person.displayName}</b><small>@{person.username}</small></span><Plus size={15}/></button>)}</div>}
    <div className="conversation-list">{loading?<div className="loading"><LoaderCircle className="spin"/>Loading inbox</div>:filtered.length?filtered.map(item=><ConversationRow key={item._id} item={item} currentUserId={currentUserId} active={item._id===conversationId} onClick={()=>navigate(`/messages/${item._id}`)}/>):<div className="inbox-empty"><MessageCircle size={25}/><b>{query?'No chats found':'Your inbox is quiet'}</b><span>{query?'Search for a person above to start a chat.':'Search for someone above and say hello.'}</span></div>}</div>
  </section>
  <section className={`chat-panel ${!conversationId?'chat-hidden-mobile':''}`}>
    {active?<><header className="chat-header"><button className="messenger-icon-button chat-back" onClick={()=>navigate('/messages')} aria-label="Back to inbox"><ArrowLeft size={19}/></button><Avatar user={active.other}/><span className="chat-person"><b>{active.other?.displayName}</b><small>@{active.other?.username}</small></span><button className="messenger-icon-button" aria-label="Conversation options"><MoreHorizontal size={20}/></button></header>
      <div className="chat-history">{messages.length===0&&!error&&<div className="chat-start"><Avatar user={active.other} size="lg"/><b>{active.other?.displayName}</b><span>Start a conversation with @{active.other?.username}</span></div>}{messages.map(message=><MessageBubble key={message._id} message={message} own={String(message.sender?._id)===currentUserId} read={message.readBy?.some(id=>String(id)===String(active.other?._id))}/>)}<div ref={bottom}/></div>
      {error&&<div className="message-error">{error}</div>}<form className="message-composer" onSubmit={send}><input value={draft} onChange={e=>setDraft(e.target.value)} maxLength={4000} placeholder={`Message ${active.other?.displayName||'your friend'}…`} aria-label="Write a message"/><button disabled={!draft.trim()||sending} aria-label="Send message">{sending?<LoaderCircle size={17} className="spin"/>:<Send size={17}/>}</button></form>
    </>:<div className="chat-welcome"><div><span className="welcome-icon"><MessageCircle size={27}/></span><h2>Your conversations, all in one place.</h2><p>Choose a chat or search for someone new to start talking.</p></div></div>}
  </section></div>
}
