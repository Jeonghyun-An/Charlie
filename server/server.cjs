// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const uri =
    "mongodb+srv://jeonghyun:testtest@charlie.dv7cy.mongodb.net/?retryWrites=true&w=majority&appName=Charlie";

// 미들웨어 설정
app.use(express.json());
app.use(cors());

// MongoDB 연결
mongoose
    .connect(uri)
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.error("MongoDB 연결 실패:", err));

// 데이터 모델 (채팅방 및 채팅 메시지)
// 채팅 메시지 스키마
const MessageSchema = new mongoose.Schema({
    text: String,
    sender: { type: String, enum: ["user", "bot"] },
    createdAt: { type: Date, default: Date.now },
    docs: [String],
});

// 채팅방 스키마
const ChatroomSchema = new mongoose.Schema({
    title: String,
    chats: [MessageSchema],
    createdAt: { type: Date, default: Date.now },
});

const Chatroom = mongoose.model("Chatroom", ChatroomSchema);

// API 엔드포인트 작성

// 모든 채팅방 가져오기
app.get("/api/chatrooms", async (req, res) => {
    try {
        const rooms = await Chatroom.find().sort({ createdAt: -1 });
        res.json({ success: true, data: rooms });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 특정 채팅방 가져오기
app.get("/api/chatrooms/:id", async (req, res) => {
    try {
        const room = await Chatroom.findById(req.params.id);
        res.json({ success: true, data: room });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 채팅방 생성하기
app.post("/api/chatrooms", async (req, res) => {
    try {
        const { title } = req.body;
        const newRoom = new Chatroom({ title, chats: [] });
        await newRoom.save();
        res.status(201).json({ success: true, data: newRoom });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 채팅 메시지 추가하기 (채팅방에 메시지 전송)
app.post("/api/chatrooms/:id/chats", async (req, res) => {
    try {
        const { text, sender, docs } = req.body; // docs는 옵션
        const room = await Chatroom.findById(req.params.id);
        if (!room)
            return res
                .status(404)
                .json({ success: false, error: "채팅방을 찾을 수 없습니다." });

        const message = { text, sender, docs: docs || [] };
        room.chats.push(message);
        await room.save();
        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 채팅방 제목 수정 (업데이트)
app.put("/api/chatrooms/:id", async (req, res) => {
    try {
        const { title } = req.body;
        const room = await Chatroom.findByIdAndUpdate(
            req.params.id,
            { title },
            { new: true }
        );
        if (!room) {
            return res
                .status(404)
                .json({ success: false, error: "채팅방을 찾을 수 없습니다." });
        }
        res.json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 채팅방 삭제
app.delete("/api/chatrooms/:id", async (req, res) => {
    try {
        const room = await Chatroom.findByIdAndDelete(req.params.id);
        if (!room) {
            return res
                .status(404)
                .json({ success: false, error: "채팅방을 찾을 수 없습니다." });
        }
        res.json({ success: true, data: room });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 작동 중입니다.`);
});
