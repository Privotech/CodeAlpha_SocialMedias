import { Check, CheckCheck } from 'lucide-react';
export function MessageBubble({message,own,read}) { return <div className={`message-line ${own?'own':''}`}><div className="message-bubble"><p>{message.content}</p><span>{new Date(message.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}{own&&(read?<CheckCheck size={13}/>:<Check size={13}/>)}</span></div></div> }
