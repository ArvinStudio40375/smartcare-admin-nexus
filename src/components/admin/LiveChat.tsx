
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Send, Users, Clock } from 'lucide-react';

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

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Chat</h2>
        <Button onClick={loadChatRooms} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Chat Rooms List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Ruang Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {chatRooms.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada percakapan
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.room_id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedRoom === room.room_id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedRoom(room.room_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{room.room_id}</p>
                          <Badge variant="outline" className="text-xs">
                            {room.sender_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {room.last_message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(room.last_message_time).toLocaleString('id-ID')}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <Badge className="bg-red-500 text-white">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {selectedRoom ? `Chat: ${selectedRoom}` : 'Pilih ruang chat'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRoom ? (
              <div className="space-y-4">
                {/* Messages */}
                <div className="h-64 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.sender_type === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.created_at).toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={loading || !newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Pilih ruang chat untuk memulai percakapan</p>
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
