import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Clear,
  Help,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  loading?: boolean;
}

const predefinedQuestions = [
  "Show me the top 5 products by sales value",
  "What products need restocking urgently?",
  "What is our current production status?",
  "Show me recent inventory activity",
  "What are our best-selling products this month?",
  "Generate a 3-day production plan",
];

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your FilFlo AI warehouse assistant. I can help you with inventory management, sales analysis, production planning, and much more. What would you like to know?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      loading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Use environment variable for the API URL, fallback to local for development
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await axios.post(`${apiUrl}/api/brain/query`, {
        query: message,
        userId: 'demo-user',
      });

      // Remove loading message and add AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        
        const responseData = response.data;
        let aiResponseText = "I'm having trouble understanding the server's response. Please try again.";

        // Defensively find the correct response string, no matter how the object is structured.
        if (typeof responseData?.data?.formatted_response === 'string') {
          aiResponseText = responseData.data.formatted_response;
        } else if (typeof responseData?.formatted_response === 'string') {
          aiResponseText = responseData.formatted_response;
        } else if (typeof responseData?.response === 'string') {
          aiResponseText = responseData.response;
        }

        return [
          ...filtered,
          {
            id: Date.now().toString(),
            content: aiResponseText,
            sender: 'ai',
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            content: 'I apologize, but I\'m having trouble connecting to the warehouse system. Please try again in a moment.',
            sender: 'ai',
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentMessage);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your FilFlo AI warehouse assistant. I can help you with inventory management, sales analysis, production planning, and much more. What would you like to know?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: '16px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            maxWidth: '70%',
            flexDirection: isUser ? 'row-reverse' : 'row',
            gap: 1,
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: isUser 
                ? 'linear-gradient(45deg, #667eea, #764ba2)'
                : 'linear-gradient(45deg, #4facfe, #00f2fe)',
            }}
          >
            {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
          </Avatar>
          
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: isUser 
                ? 'linear-gradient(45deg, #667eea, #764ba2)'
                : 'rgba(255, 255, 255, 0.95)',
              color: isUser ? 'white' : '#2c3e50',
              maxWidth: '100%',
              wordBreak: 'break-word',
            }}
          >
            {message.loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Thinking...</Typography>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
                fontSize: '0.7rem',
              }}
            >
              {message.timestamp.toLocaleTimeString()}
            </Typography>
          </Paper>
        </Box>
      </motion.div>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                  AI Warehouse Assistant
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                  Ask me anything about your warehouse operations, inventory, or sales data
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={clearChat} sx={{ color: '#667eea' }}>
                  <Clear />
                </IconButton>
                <IconButton sx={{ color: '#667eea' }}>
                  <Help />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Questions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {predefinedQuestions.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  onClick={() => sendMessage(question)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat Messages */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', mb: 3 }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              maxHeight: '60vh',
              pr: 1,
            }}
          >
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Box>
        </CardContent>
      </Card>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your warehouse operations..."
                disabled={isLoading}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                endIcon={<Send />}
                onClick={() => sendMessage(currentMessage)}
                disabled={isLoading || !currentMessage.trim()}
                sx={{
                  minWidth: 120,
                  height: 56,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Send'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default ChatInterface; 