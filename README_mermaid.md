## Socket flowchart

### Real-time user pinging

Senario: every user connected pings every five seconds

```mermaid
sequenceDiagram
  participant Client
  participant Server
  participant Database

  Client->>Server: Connected
  Server->>Client: Current user count

  loop Every five seconds
    Client->>Server: ping with 'online'
    Server->>Server: Check if user's info exists at server cache
    Server-->>Database: Get user info
    Database-->>Server: Add user info at server cache
    Server-->>Client: Send match invitations (if any)
    Server-->>Client: Send accepted match invitation (if any)
  end

```

### Starting matches with stranger mode

Senario: user A (on client A) starts a match with stranger mode and user B (on client B) is invited

```mermaid
sequenceDiagram
  participant Client A
  participant Client B
  participant Server
  participant Database

  Client A->>Server: Stranger mode
  Server->>Database: Save match info
  Server->>Server: Find an available user online (assuming client B)
  Server->>Server: Add invitation at server cache
  Server->>Client A: Found someone, please wait...
  Server->>Client B: Invitation

  Note right of Client A: Rejected / timeout
  Client B->>Server: Reject match invitation
  Server->>Client A: Match rejected
  Server->>Server: Update invitation at server cache

  Note right of Client A: Accepted
  Client B->>Server: Accept match invitation & join match
  Server->>Server: Update invitation at server cache
  Server->>Client A: Start match with stranger mode
  Client A->>Server: Join match
  Server->>Database: Update match info

```

### In a match

Senario: user A (on client A) is in a match with user B (on client B) when nobody exits the match

```mermaid
sequenceDiagram
  participant Client A
  participant Client B
  participant Server
  participant Database
  participant Child Process

  Note right of Client A: First user joins
  Client A->>Server: Join match
  Server->>Database: Get match status
  Database->>Server: Match status = -1
  Server->>Client A: Wait for opponent
  Server->>Server: Update user status at server cache

  Note right of Client A: Both user join
  Client B->>Server: Join match
  Server->>Database: Update match status
  Database->>Server: Match status = 0
  Server->>Client A: Match starts: show question & start the timer
  Server->>Server: Update user & match status at server cache

  Note right of Client A: Run code
  loop When A runs code
    Client A->>Server: Code & test cases
    Server->>Child Process: Spawn a child process
    Child Process->>Child Process: Run code 
    Child Process->>Server: Code execution result, error or out of memory message
    Server->>Client A: Show result in terminal
    Server->>Client B: Show result in opponent's terminal
  end


  Note right of Client A: Submit
  Client A->>Client A: Confirm?
  Client A->>Server: Submit code
  Server->>Child Process: Spawn a child process
  Child Process->>Child Process: Run code
  Child Process->>Server: Code execution result, error or out of memory message
  Server->>Server: Rate the code
  Server->>Database: Insert match detail
  Server->>Server: Update match info at server cache
  Server->>Client A: Wait for opponent to submit
  Server->>Client B: Waiting for you to submit
  Client B->>Client B: Confirm?
  Client B->>Server: Submit code
  Server->>Child Process: Spawn a child process
  Child Process->>Child Process: Run code
  Child Process->>Server: Code execution result, error or out of memory message
  Server->>Server: Rate the code
  Server->>Database: Insert match detail
  Server->>Database: Insert match result
  Server->>Server: Update match info at server cache<br>Match status = 1
  Server->>Client A: Message of match end & redirect to match result page
  Server->>Client B: Message of match end & redirect to match result page
```

Senario: user A (on client A) is in a match with user B (on client B) when A exits the match in the middle of the match

```mermaid
sequenceDiagram
  participant Client A
  participant Client B
  participant Server
  participant Database

  Note right of Client A: Exit
  Client A->>Client A: Confirm?
  Client A->>Server: Exit
  Server->>Database: Insert match detail
  Server->>Server: Update match info at server cache
  Server->>Client A: Redirect
  Server->>Client B: Opponent left but you can still get points if you finish
```

Senario: user A (on client A) attemps to join a match that has ended

```mermaid
sequenceDiagram
  participant Client A
  participant Client B
  participant Server
  participant Database

  Note right of Client A: Match ends
  Client A->>Server: Join match
  Server->>Database: Get match status
  Database->>Server: Match status = 1
  Server->>Client A: Reject user & redirect
```