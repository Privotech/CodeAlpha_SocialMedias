import { Avatar } from './Avatar.jsx';
export function ConversationRow({item,active,onClick,currentUserId}) {
  const last=item.lastMessage;
  const own=last?.sender?._id && String(last.sender._id)===String(currentUserId);
  return <button className={`conversation-row ${active?'selected':''}`} onClick={onClick}><Avatar user={item.other}/><span className="conversation-copy"><span className="conversation-title"><b>{item.other?.displayName||'Unknown'}</b><small>{last?new Date(last.createdAt).toLocaleDateString([], {month:'short',day:'numeric'}):''}</small></span><span className="conversation-preview">{last?`${own?'You: ':''}${last.content}`:'Start a conversation'}</span></span>{item.unreadCount>0&&<i className="unread-badge">{item.unreadCount>9?'9+':item.unreadCount}</i>}</button>;
}
