import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/useSocket'; // ✅ Only this import
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, messages, sendMessage, getMessageHistory } = useSocket();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef(null);

  // Load all users for chat
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/users/chat/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Users fetched successfully:', data.data?.length || 0);
      setAllUsers(data.data || data.users || data);
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load message history when a user is selected
  useEffect(() => {
    if (selectedUser && user && !hasLoadedHistory) {
      console.log('🔄 Loading message history for:', selectedUser.name);
      getMessageHistory(selectedUser._id);
      setHasLoadedHistory(true);
    }
  }, [selectedUser, user, hasLoadedHistory, getMessageHistory]);

  // Reset hasLoadedHistory when selectedUser changes
  useEffect(() => {
    setHasLoadedHistory(false);
  }, [selectedUser]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      console.log('💬 Sending message:', newMessage);
      sendMessage(selectedUser._id, newMessage.trim());
      setNewMessage('');
    }
  };

  const getDisplayName = (chatUser) => {
    return chatUser.name || chatUser.username || 'Unknown User';
  };

  const getProfilePic = (chatUser) => {
    if (chatUser.profilePic && chatUser.profilePic.trim() !== '') {
      return `http://localhost:5000/${chatUser.profilePic}`;
    }
    return '/default-avatar.png';
  };

  // Filter messages for the selected conversation
  const conversationMessages = messages.filter(msg => 
    msg.sender && msg.receiver && 
    ((msg.sender._id === user._id && msg.receiver._id === selectedUser?._id) ||
     (msg.sender._id === selectedUser?._id && msg.receiver._id === user._id))
  );

  console.log('💬 Conversation messages:', conversationMessages.length);
  console.log('👥 All messages:', messages.length);

  return (
    <div className="container-fluid">
      <div className="row" style={{ height: '85vh' }}>
        {/* Users List */}
        <div className="col-md-4 border-end">
          <div className="d-flex flex-column h-100">
            <div className="p-3 border-bottom bg-light">
              <h4 className="mb-0">Chat</h4>
              <small className="text-muted">Online: {onlineUsers.length}</small>
              {loading && <div className="spinner-border spinner-border-sm ms-2" role="status"></div>}
            </div>
            <div className="flex-grow-1 overflow-auto">
              {allUsers.length === 0 && !loading ? (
                <div className="text-center p-4 text-muted">
                  <i className="bi bi-people display-4"></i>
                  <p>No users found</p>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchUsers}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                allUsers.map(chatUser => (
                  <div
                    key={chatUser._id}
                    className={`p-3 border-bottom ${
                      selectedUser?._id === chatUser._id ? 'bg-primary text-white' : 'bg-white'
                    }`}
                    onClick={() => setSelectedUser(chatUser)}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={getProfilePic(chatUser)}
                        alt={getDisplayName(chatUser)}
                        className="rounded-circle me-3"
                        style={{ 
                          width: '45px', 
                          height: '45px', 
                          objectFit: 'cover',
                          border: onlineUsers.some(onlineUser => onlineUser._id === chatUser._id) 
                            ? '2px solid #28a745' 
                            : '2px solid #6c757d'
                        }}
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{getDisplayName(chatUser)}</h6>
                          {onlineUsers.some(onlineUser => onlineUser._id === chatUser._id) ? (
                            <span className="badge bg-success">Online</span>
                          ) : (
                            <small className={selectedUser?._id === chatUser._id ? 'text-white-50' : 'text-muted'}>
                              Offline
                            </small>
                          )}
                        </div>
                        <small className={selectedUser?._id === chatUser._id ? 'text-white-50' : 'text-muted'}>
                          {chatUser.role}
                          {chatUser.className && ` • ${chatUser.className}`}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-md-8">
          <div className="d-flex flex-column h-100">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-bottom bg-light">
                  <div className="d-flex align-items-center">
                    <img
                      src={getProfilePic(selectedUser)}
                      alt={getDisplayName(selectedUser)}
                      className="rounded-circle me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <h5 className="mb-0">{getDisplayName(selectedUser)}</h5>
                      <small className="text-muted">
                        {onlineUsers.some(onlineUser => onlineUser._id === selectedUser._id)
                          ? 'Online'
                          : `Last seen: ${new Date(selectedUser.lastSeen).toLocaleTimeString()}`
                        }
                      </small>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
                  {conversationMessages.length === 0 ? (
                    <div className="text-center text-muted mt-5">
                      <i className="bi bi-chat-quote display-1"></i>
                      <p>No messages yet. Start a conversation!</p>
                      <small>Send a message to begin chatting with {getDisplayName(selectedUser)}</small>
                    </div>
                  ) : (
                    conversationMessages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`d-flex mb-3 ${
                          message.sender._id === user._id ? 'justify-content-end' : 'justify-content-start'
                        }`}
                      >
                        <div
                          className={`rounded p-3 ${
                            message.sender._id === user._id 
                              ? 'bg-primary text-white' 
                              : 'bg-white border'
                          }`}
                          style={{ maxWidth: '70%' }}
                        >
                          {message.sender._id !== user._id && (
                            <div className="d-flex align-items-center mb-2">
                              <img
                                src={getProfilePic(message.sender)}
                                alt={getDisplayName(message.sender)}
                                className="rounded-circle me-2"
                                style={{ width: '25px', height: '25px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = '/default-avatar.png';
                                }}
                              />
                              <small className="text-muted fw-bold">
                                {getDisplayName(message.sender)}
                              </small>
                            </div>
                          )}
                          <p className="mb-1">{message.message}</p>
                          <small className={
                            message.sender._id === user._id ? 'text-white-50' : 'text-muted'
                          }>
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-top bg-white">
                  <form onSubmit={handleSendMessage}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Message ${getDisplayName(selectedUser)}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ borderRadius: '25px' }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary ms-2"
                        disabled={!newMessage.trim()}
                        style={{ borderRadius: '25px' }}
                      >
                        <i className="bi bi-send-fill"></i> Send
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                <div className="text-center">
                  <i className="bi bi-chat-dots display-1"></i>
                  <h4>Select a user to start chatting</h4>
                  <p>Choose someone from the list to begin your conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;