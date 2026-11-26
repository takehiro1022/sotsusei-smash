import java.io.IOException;
import java.util.List;
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
    private static final String DEFAULT_ROOM = "default";
    private static final int MAX_ROOM_ID_LENGTH = 32;

    // 合言葉(roomId) -> 部屋状態
    private static final Map<String, Room> rooms = new ConcurrentHashMap<>();

    private static class Room {
        final String id;
        // Session -> 役割(1..4)
        final Map<Session, Integer> players = new ConcurrentHashMap<>();

        Room(String id) {
            this.id = id;
        }

        synchronized int allocateRole() {
            for (int r = 1; r <= MAX_PLAYERS; r++) {
                if (!players.containsValue(r)) {
                    return r;
                }
            }
            return -1;
        }

        String buildRoomJson() {
            StringBuilder sb = new StringBuilder();
            sb.append("{\"type\":\"room\",\"room\":\"")
              .append(escapeJson(id))
              .append("\",\"roles\":[");
            boolean first = true;
            for (int r = 1; r <= MAX_PLAYERS; r++) {
                if (players.containsValue(r)) {
                    if (!first) sb.append(",");
                    sb.append(r);
                    first = false;
                }
            }
            sb.append("]}");
            return sb.toString();
        }
    }

    @OnOpen
    public void onOpen(Session session) throws IOException {
        String roomId = extractRoomId(session);
        Room room = rooms.computeIfAbsent(roomId, Room::new);

        int role;
        synchronized (room) {
            role = room.allocateRole();
            if (role == -1) {
                cleanupRoomIfEmpty(room);
                safeSend(session, "{\"type\":\"full\",\"room\":\"" + escapeJson(roomId) + "\"}");
                try {
                    session.close();
                } catch (IOException ignored) {}
                return;
            }
            room.players.put(session, role);
            session.getUserProperties().put("roomId", roomId);
        }

        safeSend(session, "{\"type\":\"role\",\"role\":" + role + ",\"room\":\"" + escapeJson(roomId) + "\"}");
        broadcastRoom(room);
    }

    @OnMessage
    public void onMessage(String message, Session sender) {
        if (message == null || sender == null) {
            return;
        }
        Room room = getRoom(sender);
        if (room == null || !room.players.containsKey(sender)) {
            return;
        }

        // 同じ合言葉の部屋にいる送信元以外の相手セッションへ順次転送
        for (Session s : room.players.keySet()) {
            if (s != null && s.isOpen() && !s.equals(sender)) {
                safeSend(s, message);
            }
        }
    }

    @OnClose
    public void onClose(Session session) {
        if (session == null) return;

        Room room = getRoom(session);
        if (room == null) return;

        Integer leftRole = room.players.remove(session);
        session.getUserProperties().remove("roomId");

        if (leftRole != null) {
            broadcast(room, "{\"type\":\"leave\",\"role\":" + leftRole + "}");
            broadcastRoom(room);
        }
        cleanupRoomIfEmpty(room);
    }

    @OnError
    public void onError(Session session, Throwable error) {
        if (session != null) {
            onClose(session);
        }
    }

    private Room getRoom(Session session) {
        Object roomIdObj = session.getUserProperties().get("roomId");
        if (roomIdObj instanceof String roomId) {
            return rooms.get(roomId);
        }
        return null;
    }

    private void cleanupRoomIfEmpty(Room room) {
        synchronized (room) {
            if (room.players.isEmpty()) {
                rooms.remove(room.id, room);
            }
        }
    }

    private void broadcastRoom(Room room) {
        broadcast(room, room.buildRoomJson());
    }

    private void broadcast(Room room, String msg) {
        for (Session s : room.players.keySet()) {
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

    private String extractRoomId(Session session) {
        Map<String, List<String>> params = session.getRequestParameterMap();
        if (params == null) return DEFAULT_ROOM;
        List<String> values = params.get("room");
        if (values == null || values.isEmpty()) return DEFAULT_ROOM;

        String raw = values.get(0);
        if (raw == null) return DEFAULT_ROOM;

        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return DEFAULT_ROOM;

        if (trimmed.length() > MAX_ROOM_ID_LENGTH) {
            trimmed = trimmed.substring(0, MAX_ROOM_ID_LENGTH);
        }
        return trimmed;
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
