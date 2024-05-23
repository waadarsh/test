import React, { useState, useEffect, useRef } from 'react';
import { Container, Input, Button, ListGroup, ListGroupItem, Card, CardBody, Spinner, Row, Col } from 'reactstrap';
import axios from 'axios';

const initializeSessionStorage = () => {
    if (!sessionStorage.getItem('chatMessages')) {
        const defaultMessages = [{ id: Date.now(), text: 'Hello Guest!', sender: 'ai' }];
        sessionStorage.setItem('chatMessages', JSON.stringify(defaultMessages));
    }
};

// Initialize session storage before component mounts
initializeSessionStorage();

function ChatWindow({ userData }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState(() => {
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
        <Container fluid className="d-flex flex-column vh-100 mt-2">
            <Card className="flex-grow-1 my-2 p-2 overflow-auto bg-white">
                <CardBody>
                    <ListGroup>
                        {messages.map(msg => (
                            <ListGroupItem key={msg.id} className={`mb-1 px-1 py-2 ${msg.sender === 'user' ? 'text-right bg-light' : 'text-left bg-secondary text-white'}`}>
                                {msg.text}
                            </ListGroupItem>
                        ))}
                        <div ref={messagesEndRef} />
                    </ListGroup>
                </CardBody>
            </Card>
            <Row className="align-items-center">
                <Col>
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="bg-white text-dark"
                    />
                </Col>
                <Col xs="auto">
                    <Button color="primary" onClick={handleSendMessage} disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Send'}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default ChatWindow;
