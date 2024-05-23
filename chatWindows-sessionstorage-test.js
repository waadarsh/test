<ListGroup>
                        {messages.map(msg => (
                            <ListGroupItem key={msg.id} className={`mb-1 px-1 py-2 d-flex ${msg.sender === 'user' ? 'justify-content-end bg-light' : 'justify-content-start bg-secondary text-white'}`}>
                                {msg.sender === 'ai' ? (
                                    <img src={nissanLogo} alt="Nissan Logo" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
                                ) : (
                                    <img src={userAvatar} alt="User Avatar" style={{ width: '30px', height: '30px', marginLeft: '10px' }} />
                                )}
                                <span className="align-self-center">{msg.text}</span>
                            </ListGroupItem>
                        ))}
                        <div ref={messagesEndRef} />
                    </ListGroup>
