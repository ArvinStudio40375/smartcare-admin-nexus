import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Send, Users, Clock, User, MessageCircle, Wifi } from 'lucide-react';

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
}

const LiveChat: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom);
    }
  }, [selectedRoom]);

  const loadChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('room_id, content, created_at, sender_type, is_read')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by room and get latest message for each room
      const roomMap = new Map<string, ChatRoom>();
      
      data?.forEach((message) => {
        if (!roomMap.has(message.room_id)) {
          roomMap.set(message.room_id, {
            room_id: message.room_id,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: message.sender_type !== 'admin' && !message.is_read ? 1 : 0,
            sender_type: message.sender_type
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
          sender_id: 'admin',
          sender_type: 'admin',
          content: newMessage.trim(),
          is_read: false
        });

      if (error) throw error;

      setNewMessage('');
      loadMessages(selectedRoom);
      loadChatRooms();
      toast.success('Pesan berhasil dikirim');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan');
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

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Live Chat
          </h2>
          <p className="text-gray-600">Komunikasi real-time dengan member dan partner</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border">
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Online</span>
          </div>
          {totalUnreadMessages > 0 && (
            <div className="flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full shadow-sm border border-red-200">
              <MessageCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                {totalUnreadMessages} Pesan Baru
              </span>
            </div>
          )}
          <Button 
            onClick={loadChatRooms} 
            variant="outline"
            className="border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              Refresh
            </div>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Rooms List */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold">Ruang Chat</div>
                <div className="text-cyan-100 text-sm font-normal">{chatRooms.length} Percakapan</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[480px] overflow-y-auto">
              {chatRooms.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Tidak ada percakapan</h3>
                    <p className="text-sm text-gray-500">Belum ada pesan masuk</p>
                  </div>
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.room_id}
                    className={`group p-4 border-b cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 ${
                      selectedRoom === room.room_id ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-l-cyan-500' : ''
                    }`}
                    onClick={() => setSelectedRoom(room.room_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">{room.room_id}</p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                room.sender_type === 'member' 
                                  ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }`}
                            >
                              {room.sender_type === 'member' ? 'Member' : 'Partner'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{room.last_message}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-400">
                              {new Date(room.last_message_time).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                      {room.unread_count > 0 && (
                        <Badge className="bg-red-500 text-white animate-pulse">
                          {room.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold">
                  {selectedRoom ? `Chat: ${selectedRoom}` : 'Pilih ruang chat'}
                </div>
                <div className="text-blue-100 text-sm font-normal">
                  {selectedRoom ? `${messages.length} pesan` : 'Belum ada percakapan dipilih'}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedRoom ? (
              <div className="flex flex-col h-[480px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada pesan dalam percakapan ini</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                            message.sender_type === 'admin'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="w-3 h-3 opacity-60" />
                            <p className="text-xs opacity-75">
                              {new Date(message.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-t">
                  <div className="flex gap-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ketik pesan..."
                      className="flex-1 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-full px-4"
                      disabled={sendingMessage}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={sendingMessage || !newMessage.trim()}
                      className="h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[480px] text-gray-500">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Pilih ruang chat</h3>
                    <p className="text-gray-500">Klik salah satu percakapan untuk memulai chat</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveChat;
