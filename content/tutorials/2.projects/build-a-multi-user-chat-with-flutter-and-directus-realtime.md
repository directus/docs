---
id: 418e29e7-1a2f-44a3-82ad-99dc118cccd0
slug: build-a-multi-user-chat-with-flutter-and-directus-realtime
title: Build a Multi-User Chat with Flutter and Directus Realtime
technologies:
  - flutter
authors:
  - name: Mahmoud Tarek
    title: Flutter Developer at DATA C
description: Learn how to send and receive realtime connection messages in a Flutter application.
---

In this guide, you will build a multi-user real-time chat application with Directus’ WebSockets and Flutter.


## Before You Start

### Enable Websockets in Directus

If you are using [self-hosting Directus](https://directus.io/docs/self-hosting/), websockets are disabled by default, you will need to enable websockets in your `directus` config file.

To enable websockets, update your `docker-compose.yml` config file to include the following:

```yaml
environment:
  WEBSOCKETS_ENABLED: true
  WEBSOCKETS_HEARTBEAT_ENABLED: true
```

### Set Up Your Directus Project

Create a `chat_messages` collection in your Directus instance with: 
- `content` (Text),
- `sender` (M2O relationship to directus_users),
- `receiver` (M2O relationship to directus_users),
- `timestamp` (DateTime)


### Edit Public Policy
To enable access, go to  **Settings** -> **Access Policies** -> **Public**, and under Permissions, add `messages` with full access for `create` and `read`.

### Set Up Your Flutter Project

Start by adding these dependencies to your `pubspec.yaml`

```
dependencies:
  flutter:
    sdk: flutter

  web_socket_channel: ^2.4.0
  provider: ^6.0.5
  intl: ^0.18.1
  dio: ^5.8.0+1
```

## Create Message Model

The message model is the foundation of our chat application. 
It represents individual chat messages with all necessary metadata for display and interaction. 
We include fields for both sender and receiver IDs to support direct messaging between users.

```
class ChatMessage {
  final bool isMe;
  final String id;
  final String content;
  final String senderId;
  final String receiverId;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.isMe,
    required this.content,
    required this.senderId,
    required this.timestamp,
    required this.receiverId,
  });

  factory ChatMessage.fromJson(
      Map<String, dynamic> json, String currentUserId) {
    return ChatMessage(
      id: json['id'],
      content: json['content'],
      senderId: json['sender'],
      receiverId: json['receiver'],
      isMe: json['sender'] == currentUserId,
      timestamp: DateTime.parse(json['timestamp']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'content': content,
      'sender': senderId,
      'receiver': receiverId,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
```

## Establish WebSocket Services

The WebSocket service is responsible for maintaining a real-time connection with the Directus server.
It handles authentication, message subscription, sending messages, and reconnection logic.

```
class ChatController with ChangeNotifier {
  WebSocketChannel? _channel;
  String? _currentChatUserId;
  String? _accessToken;
  String? _userId;

  final List<ChatMessage> _messages = [];

  List<ChatMessage> get messages => List.unmodifiable(_messages);

  bool _isConnected = false;

  bool get isConnected => _isConnected;

  // Connect to WebSocket with authentication
  Future<void> connect({
    required String userId,
    required String accessToken,
    required String chatWithUserId,
  }) async {
    _userId = userId;
    _accessToken = accessToken;
    _currentChatUserId = chatWithUserId;

    // Connect to your Directus websocket endpoint
    _channel = WebSocketChannel.connect(
      Uri.parse('wss://$KDirectusApiUrl/websocket'),
    );

    // Set up listeners
    _setupListeners();

    // Send authentication message
    _authenticate();
  }

  void _setupListeners() {
    _channel?.stream.listen((message) {
      final data = jsonDecode(message);

      if (data['type'] == 'auth' && data['status'] == 'ok') {
        _isConnected = true;
        notifyListeners();

        // Subscribe to the messages collection
        _subscribeToMessages();
      } else if (data['type'] == 'subscription') {
        switch (data['event']) {
          case 'create':
            _handleNewMessage(data['data']);
            break;
        }
      } else if (data['type'] == 'ping') {
        // Reply with pong to keep connection alive
        _channel?.sink.add(json.encode({'type': 'pong'}));
      }
    }, onDone: () {
      _isConnected = false;
      notifyListeners();
    }, onError: (error) {
      if (kDebugMode) {
        print('WebSocket error: $error');
      }
      _isConnected = false;
      notifyListeners();
    });
  }

  void _authenticate() {
    final authJson = json.encode({
      "type": "auth",
      "access_token": _accessToken,
    });

    _channel?.sink.add(authJson);
  }

  void _subscribeToMessages() {
    // Subscribe to message creation events
    final subscribeJson = json.encode(
      {
        "type": "subscribe",
        "event": "create",
        "collection": "chat_messages",
        "filter": {
          "_or": [
            {
              "_and": [
                {
                  "sender": {"_eq": _userId}
                },
                {
                  "receiver": {"_eq": _currentChatUserId}
                }
              ]
            },
            {
              "_and": [
                {
                  "sender": {"_eq": _currentChatUserId}
                },
                {
                  "receiver": {"_eq": _userId}
                }
              ]
            }
          ]
        }
      },
    );

    _channel?.sink.add(subscribeJson);
  }

  void _handleNewMessage(Map<String, dynamic> data) {
    final newMessage = ChatMessage.fromJson(data, _userId!);

    // Only add messages related to the current chat
    if ((newMessage.senderId == _userId &&
        newMessage.receiverId == _currentChatUserId) ||
        (newMessage.senderId == _currentChatUserId &&
            newMessage.receiverId == _userId)) {
      _messages.add(newMessage);
      notifyListeners();
    }
  }

  // Send a new message
  Future<void> sendMessage(String content) async {
    if (!_isConnected || _userId == null) return;

    // Create a unique ID for the message
    final messageId = DateTime
        .now()
        .millisecondsSinceEpoch
        .toString();

    // Create the message object
    final message = ChatMessage(
      isMe: true,
      id: messageId,
      content: content,
      senderId: _userId!,
      timestamp: DateTime.now(),
      receiverId: _currentChatUserId!,
    );

    // Add to local messages immediately for UI responsiveness
    _messages.add(message);
    notifyListeners();

    // Send via POST Request to Directus API
    // This would typically be in a separate service, but keeping it simple
    // Implement your Directus API call here
  }

  // Load historical messages
  Future<void> loadMessages() async {
    // Implement API call to fetch historical messages
    // For example via GET Request to your Directus API
  }

  // Cleanup
  @override
  void dispose() {
    _channel?.sink.close();
    super.dispose();
  }
}
```

Notice how we filter the subscription to only include messages between the current user and their chat partner.
This reduces network traffic and improves performance by ensuring we only process relevant messages.

## Create Ui Components

### Create Message Bubble Widget

The message bubble widget displays individual chat messages with appropriate styling based on whether the message was sent or received.

```
class MessageBubble extends StatelessWidget {
  final ChatMessage message;

  const MessageBubble({
    super.key,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    final timeFormat = DateFormat('h:mm a');
    final isMe = message.isMe;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Align(
        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color:
                isMe ? Theme.of(context).colorScheme.primary : Colors.grey[300],
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message.content,
                style: TextStyle(
                  color: isMe ? Colors.white : Colors.black,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                timeFormat.format(message.timestamp),
                style: TextStyle(
                  color: isMe ? Colors.white70 : Colors.black54,
                  fontSize: 12,
                ),
                textAlign: TextAlign.right,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### Create Chat Input Widget

The chat input widget provides a text field and send button for composing new messages.

```
class ChatInput extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSendPressed;

  const ChatInput({
    super.key,
    required this.controller,
    required this.onSendPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'Type a message',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
              minLines: 1,
              maxLines: 4,
              textCapitalization: TextCapitalization.sentences,
              onSubmitted: (_) => onSendPressed(),
            ),
          ),
          const SizedBox(width: 8),
          FloatingActionButton(
            onPressed: onSendPressed,
            mini: true,
            child: const Icon(Icons.send),
          ),
        ],
      ),
    );
  }
}
```

## Implement Full Chat Screen

The chat screen brings everything together, displaying messages and handling user interactions.

```
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initChat();
    });
  }

  Future<void> _initChat() async {
    setState(() => _isLoading = true);

    // In a real app, these would come from your authentication service
    // For demo purposes, we'll use dummy values
    const String dummyToken = 'your-directus-auth-token';
    const String dummyReceiverId = 'receiver-user-id';
    const String dummyUserId = 'current-user-id';

    // Connect WebSocket service
    final chatService = Provider.of<ChatController>(context, listen: false);
    await chatService.connect(
      userId:dummyUserId,
      accessToken:dummyToken,
      chatWithUserId:dummyReceiverId,
    );
    await chatService.loadMessages();

    setState(() => _isLoading = false);
    _scrollToBottom();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    final chatService = Provider.of<ChatController>(context, listen: false);
    chatService.sendMessage(_messageController.text.trim());

    _messageController.clear();
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat Page'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          Consumer<ChatController>(
            builder: (context, chatService, _) {
              return Container(
                width: 12,
                height: 12,
                margin: const EdgeInsets.only(right: 16),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: chatService.isConnected ? Colors.green : Colors.red,
                ),
              );
            },
          )
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Consumer<ChatController>(
              builder: (context, chatService, _) {
                final messages = chatService.messages;
                if (_isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (messages.isEmpty) {
                  return const Center(
                    child: Text(
                      'No messages yet. Send your first message!',
                    ),
                  );
                }

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    return MessageBubble(message: message);
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: ChatInput(
              controller: _messageController,
              onSendPressed: _sendMessage,
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
```

## The App in Action

- Connected Chat Screen with Message Composition
  
  <img width="540" height="1069" alt="image" src="https://github.com/user-attachments/assets/45dfbb05-6cb5-48c7-82d9-303f60321b4c" />
  
- Real-Time Conversation

  <img width="540" height="1069" alt="image" src="https://github.com/user-attachments/assets/d188fbd4-e274-494a-88aa-a3c3f1744626" />


## Best Practices & Optimization Tips

1. Filter Messages by Sender and Receiver
     - Use Directus filters to only retrieve messages relevant to the current conversation
     - This improves performance and reduces data transfer

2. Maintain Connection State
     - Use the connection indicator to show users when they're connected
     - Implement auto-reconnection for dropped connections
 
3. Optimize Message Loading
     - Use pagination to load messages in batches
     - Cache messages locally for offline viewing

4. Handle Message Delivery
     - Update UI optimistically before server confirmation
     - Implement queue for messages sent while offline

5. Manage Resources
     - Close WebSocket connections when leaving the chat screen
     - Implement proper error handling for WebSocket failures

