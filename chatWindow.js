// /components/ChatWindow.js
import { useState, useEffect, useRef } from 'react';
import { Container, TextField, Button, List, ListItem, ListItemText, Paper, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

function ChatWindow({ userData }) {
    const [input, setInput] = useState('');
    // const [messages, setMessages] = useState([
    //     { id: Date.now(), text: `Hello ${userData?.name || 'Guest'}!`, sender: 'ai' } // Default greeting message
    // ]);
    const [messages, setMessages] = useState(() => {
        // Retrieve messages from sessionStorage or start with a default message
        const savedMessages = sessionStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [{ id: Date.now(), text: `Hello ${userData?.name || 'Guest'}!`, sender: 'ai' }];
    });
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Save messages to sessionStorage when they change
        sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(messages => [...messages, userMessage]);

        try {
            const response = await axios.post('/api/chat', { input });
            const aiMessage = { id: Date.now(), text: response.data.message, sender: 'ai' };
            setMessages(messages => [...messages, aiMessage]);
            } catch (error) {
            console.error('Error sending message:', error);
            setMessages(messages => [...messages, { id: Date.now(), text: 'Error getting response from the server.', sender: 'ai' }]);
        }

        setInput('');
        setIsLoading(false);
    };

    return (
        <Container maxWidth="lg" sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', mt: 2 }}>
        <Paper sx={{
            flexGrow: 1, 
            overflow: 'auto', 
            my: 2, 
            p: 2, 
          backgroundColor: '#fff' // Ensuring the background is white for better contrast
        }}>
            <List>
                {messages.map(msg => (
                    <ListItem key={msg.id} sx={{
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#fce4ec',
                        borderRadius: '10px',
                        mb: 1,
                        px: 1,
                        py: 0.5,
                        color: 'black'  // Ensuring text is black
                    }}>
                        <ListItemText primary={msg.text} primaryTypographyProps={{ style: { color: 'black' } }} />
                    </ListItem>
                ))}
                <div ref={messagesEndRef} />
            </List>
        </Paper>
        <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                margin="normal"
                sx={{ 
                    background: 'white', // Ensures the input field background is white
                    color: 'black' // Text color
                }}
                InputProps={{
                    style: { color: 'black' } // Changes input text color to black
                }}
            />
            <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={isLoading} sx={{ whiteSpace: 'nowrap' }}>
                {isLoading ? <CircularProgress size={24} /> : 'Send'}
            </Button>
        </Box>
    </Container>
);
}

export default ChatWindow;
