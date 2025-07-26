
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Send, Users, Clock, User, MessageCircle, Wifi, Search, Phone, Video, MoreHorizontal, Smile, Paperclip, Mic } from 'lucide-react';

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatRoom {
  room_id: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  sender_type: string;
  user_name?: string;
  user_avatar?: string;
  is_online?: boolean;
}

const LiveChat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedRoomData, setSelectedRoomData] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate a consistent admin UUID (you can also store this in your database)
  const ADMIN_UUID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
      const roomData = chatRooms.find(room => room.room_id === selectedRoom);
      setSelectedRoomData(roomData || null);
    }
  }, [selectedRoom, chatRooms]);

  const loadChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('room_id, content, created_at, sender_type, sender_id, is_read')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by room and get latest message for each room
      const roomMap = new Map<string, ChatRoom>();
      
      data?.forEach((message) => {
        if (!roomMap.has(message.room_id)) {
          const userName = message.sender_type === 'member' 
            ? `Member ${message.sender_id.substring(0, 8)}` 
            : message.sender_type === 'partner'
            ? `Partner ${message.sender_id.substring(0, 8)}`
            : 'Admin';
            
          roomMap.set(message.room_id, {
            room_id: message.room_id,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: message.sender_type !== 'admin' && !message.is_read ? 1 : 0,
            sender_type: message.sender_type,
            user_name: userName,
            user_avatar: message.sender_type === 'admin' 
              ? `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`
              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender_id}`,
            is_online: Math.random() > 0.5 // Simulasi status online
          });
        } else {
          const room = roomMap.get(message.room_id)!;
          if (message.sender_type !== 'admin' && !message.is_read) {
            room.unread_count += 1;
          }
        }
      });

      setChatRooms(Array.from(roomMap.values()));
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast.error('Gagal memuat ruang chat');
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('room_id', roomId)
        .neq('sender_type', 'admin');
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Gagal memuat pesan');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: selectedRoom,
          sender_id: ADMIN_UUID,
          sender_type: 'admin',
          content: newMessage.trim(),
          message_type: 'text',
          is_read: false
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      setNewMessage('');
      loadMessages(selectedRoom);
      loadChatRooms();
      toast.success('Pesan berhasil dikirim');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan: ' + (error as any).message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const totalUnreadMessages = chatRooms.reduce((sum, room) => sum + room.unread_count, 0);

  const filteredRooms = chatRooms.filter(room => 
    room.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.last_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.room_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] bg-gray-100 rounded-3xl overflow-hidden">
      <div className="flex h-full">
        {/* Chat Sidebar */}
        <div className="w-1/3 bg-white border-r flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Chat</h2>
                <p className="text-blue-100 text-sm">{chatRooms.length} percakapan</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Online</span>
                </div>
                {totalUnreadMessages > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {totalUnreadMessages}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Cari percakapan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Tidak ada percakapan</h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada pesan masuk'}
                  </p>
                </div>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.room_id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                    selectedRoom === room.room_id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRoom(room.room_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={room.user_avatar} alt={room.user_name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {room.user_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {room.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{room.user_name}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              room.sender_type === 'member' 
                                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                : room.sender_type === 'partner'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-purple-100 text-purple-800 border-purple-200'
                            }`}
                          >
                            {room.sender_type === 'member' ? 'Member' : room.sender_type === 'partner' ? 'Partner' : 'Admin'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(room.last_message_time).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {room.unread_count > 0 && (
                            <Badge className="bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                              {room.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">{room.last_message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header - Facebook Messenger Style */}
              <div className="p-4 bg-white border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedRoomData?.user_avatar} alt={selectedRoomData?.user_name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {selectedRoomData?.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRoomData?.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedRoomData?.user_name}</h3>
                    <p className="text-sm text-green-600">
                      {selectedRoomData?.is_online ? 'Online' : 'Terakhir dilihat 5 menit lalu'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Video className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Messages - Facebook Messenger Style */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Mulai percakapan</p>
                      <p className="text-sm">Kirim pesan pertama Anda</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-xs ${message.sender_type === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {message.sender_type !== 'admin' && (
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={selectedRoomData?.user_avatar} alt={selectedRoomData?.user_name} />
                            <AvatarFallback className="text-xs bg-gray-200">
                              {selectedRoomData?.user_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`px-4 py-2 rounded-2xl ${
                          message.sender_type === 'admin'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-200 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                      
                      {/* Show timestamp on hover or for last message */}
                      {(index === messages.length - 1 || messages[index + 1]?.sender_type !== message.sender_type) && (
                        <div className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'} mt-1`}>
                          <span className="text-xs text-gray-400 px-4">
                            {new Date(message.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Message Input - Facebook Messenger Style */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ketik pesan..."
                      className="h-10 rounded-full border-gray-300 focus:border-blue-500 pr-20"
                      disabled={sendingMessage}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full">
                        <Smile className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  
                  {newMessage.trim() ? (
                    <Button 
                      onClick={sendMessage} 
                      disabled={sendingMessage}
                      size="sm"
                      className="rounded-full bg-blue-500 hover:bg-blue-600 w-10 h-10 p-0"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0">
                      <Mic className="w-4 h-4 text-blue-600" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex items-center justify-center h-full text-gray-500 bg-white">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="w-12 h-12 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Pilih percakapan</h3>
                  <p className="text-gray-500">Klik salah satu chat di sebelah kiri untuk memulai</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
