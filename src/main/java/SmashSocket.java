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
    private static final int MAX_BATTLE_PLAYERS = 4;
    private static final int MAX_RANKED_ROOM_PLAYERS = 20;
    private static final int MAX_LOBBY_PLAYERS = 30;
    private static final String DEFAULT_ROOM = "default";
    private static final String RANKED_ROOM_ID = "__ranked_room__";
    private static final int MAX_ROOM_ID_LENGTH = 32;

    // 合言葉(roomId) -> 部屋状態
    private static final Map<String, Room> rooms = new ConcurrentHashMap<>();

    private static class Room {
        final String id;
        final int maxPlayers;
        // Session -> 役割番号(1..maxPlayers)
        final Map<Session, Integer> players = new ConcurrentHashMap<>();

        Room(String id, int maxPlayers) {
            this.id = id;
            this.maxPlayers = maxPlayers;
        }

        synchronized int allocateRole() {
            for (int role = 1; role <= maxPlayers; role++) {
                if (!players.containsValue(role)) {
                    return role;
                }
            }
            return -1;
        }

        String buildRoomJson() {
            StringBuilder sb = new StringBuilder();
            sb.append("{\"type\":\"room\",\"room\":\"")
              .append(escapeJson(id))
              .append("\",\"maxPlayers\":").append(maxPlayers)
              .append(",\"roles\":[");
            boolean first = true;
            for (int role = 1; role <= maxPlayers; role++) {
                if (players.containsValue(role)) {
                    if (!first) sb.append(",");
                    sb.append(role);
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
        int capacity = getRoomCapacity(roomId);
        Room room = rooms.computeIfAbsent(roomId, id -> new Room(id, capacity));

        int role;
        synchronized (room) {
            role = room.allocateRole();
            if (role == -1) {
                cleanupRoomIfEmpty(room);
                safeSend(session, "{\"type\":\"full\",\"room\":\"" + escapeJson(roomId)
                        + "\",\"maxPlayers\":" + room.maxPlayers + "}");
                try {
                    session.close();
                } catch (IOException ignored) {}
                return;
            }
            room.players.put(session, role);
            session.getUserProperties().put("roomId", roomId);
        }

        safeSend(session, "{\"type\":\"role\",\"role\":" + role + ",\"room\":\""
                + escapeJson(roomId) + "\",\"maxPlayers\":" + room.maxPlayers + "}");
        broadcastRoom(room);
    }

    private int getRoomCapacity(String roomId) {
        if (DEFAULT_ROOM.equals(roomId)) {
            return MAX_LOBBY_PLAYERS;
        }
        if (RANKED_ROOM_ID.equals(roomId)) {
            return MAX_RANKED_ROOM_PLAYERS;
        }
        return MAX_BATTLE_PLAYERS;
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

        for (Session session : room.players.keySet()) {
            if (session != null && session.isOpen() && !session.equals(sender)) {
                safeSend(session, message);
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

    private void broadcast(Room room, String message) {
        for (Session session : room.players.keySet()) {
            if (session != null && session.isOpen()) {
                safeSend(session, message);
            }
        }
    }

    private void safeSend(Session session, String message) {
        if (session == null || !session.isOpen()) return;
        synchronized (session) {
            try {
                session.getBasicRemote().sendText(message);
            } catch (Exception ignored) {}
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

    private static String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
