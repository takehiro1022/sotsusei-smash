import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

@ServerEndpoint("/smash-ws")
public class SmashSocket {
    private static final int MAX_PLAYERS = 4;
    // Session -> 役割(1..4)
    private static final Map<Session, Integer> players = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) throws IOException {
        int role = allocateRole();
        if (role == -1) {
            safeSend(session, "{\"type\":\"full\"}");
            try {
                session.close();
            } catch (IOException ignored) {}
            return;
        }

        players.put(session, role);
        safeSend(session, "{\"type\":\"role\",\"role\":" + role + "}");
        broadcastRoom();
    }

    @OnMessage
    public void onMessage(String message, Session sender) {
        if (message == null || !players.containsKey(sender)) {
            return;
        }
        // 送信元以外の相手セッションへ順次転送
        for (Session s : players.keySet()) {
            if (s != null && s.isOpen() && !s.equals(sender)) {
                safeSend(s, message);
            }
        }
    }

    @OnClose
    public void onClose(Session session) {
        Integer leftRole = players.remove(session);
        if (leftRole != null) {
            broadcast("{\"type\":\"leave\",\"role\":" + leftRole + "}");
            broadcastRoom();
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        if (session != null) {
            onClose(session);
        }
    }

    private synchronized int allocateRole() {
        for (int r = 1; r <= MAX_PLAYERS; r++) {
            if (!players.containsValue(r)) {
                return r;
            }
        }
        return -1;
    }

    private void broadcastRoom() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"type\":\"room\",\"roles\":[");
        boolean first = true;
        for (int r = 1; r <= MAX_PLAYERS; r++) {
            if (players.containsValue(r)) {
                if (!first) sb.append(",");
                sb.append(r);
                first = false;
            }
        }
        sb.append("]}");
        broadcast(sb.toString());
    }

    private void broadcast(String msg) {
        for (Session s : players.keySet()) {
            if (s != null && s.isOpen()) {
                safeSend(s, msg);
            }
        }
    }

    private void safeSend(Session session, String msg) {
        if (session == null || !session.isOpen()) return;
        synchronized (session) {
            try {
                session.getBasicRemote().sendText(msg);
            } catch (Exception ignored) {
                // 送信中競合や切断時の例外で他クライアントへの配信を止めない
            }
        }
    }
}