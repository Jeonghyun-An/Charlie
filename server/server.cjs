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
    .then(() => console.log("✅ MongoDB 연결 성공"))
    .catch((err) => console.error("❌ MongoDB 연결 실패:", err));

// ✅ 문서 기반 채팅을 위한 스키마 수정
const MessageSchema = new mongoose.Schema({
    text: String,
    sender: { type: String, enum: ["user", "bot"] },
    createdAt: { type: Date, default: Date.now },
    docs: [{ name: String, path: String, size: String }],
});

// 채팅방 스키마
const ChatroomSchema = new mongoose.Schema({
    title: String,
    chats: [MessageSchema],
    isCustomDocs: { type: Boolean, default: false }, // 🔹 문서 기반 채팅 여부
    docs: [{ name: String, path: String, size: String }], // 🔹 문서 저장 필드
    createdAt: { type: Date, default: Date.now },
});

const Chatroom = mongoose.model("Chatroom", ChatroomSchema);

// ✅ 시스템 기본 문서 목록 (서버에서 제공하는 문서)

const systemDocs = [
    {
        name: "KB라이프 무배당 소액암진단특약W(갱신형) 약관.pdf",
        path: "/document/KB라이프 무배당 소액암진단특약W(갱신형) 약관.pdf",
        size: "823KB",
    },
    {
        name: "무배당 KB 생활비지급 암보험 갱신형.pdf",
        path: "/document/무배당 KB 생활비지급 암보험 갱신형.pdf",
        size: "505KB",
    },
    {
        name: "한화생명 간편가입 e시그니처암보험 무배당_2133-A01_상품요약서_20240101~          _1.pdf",
        path: "/document/한화생명 간편가입 e시그니처암보험 무배당_2133-A01_상품요약서_20240101~          _1.pdf",
        size: "734KB",
    },
];

// ✅ 시스템 문서 API
app.get("/api/system-docs", async (req, res) => {
    try {
        res.json({ success: true, data: systemDocs });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ 모든 채팅방 조회
app.get("/api/chatrooms", async (req, res) => {
    try {
        const rooms = await Chatroom.find().sort({ createdAt: -1 });
        res.json({ success: true, data: rooms });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ 특정 채팅방 조회
app.get("/api/chatrooms/:id", async (req, res) => {
    try {
        const room = await Chatroom.findById(req.params.id);
        if (!room) {
            return res
                .status(404)
                .json({ success: false, error: "채팅방을 찾을 수 없습니다." });
        }
        res.json({ success: true, data: room });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ 채팅방 생성 API
app.post("/api/chatrooms", async (req, res) => {
    try {
        const { title, docs } = req.body;
        const isCustomDocs = docs && docs.length > 0;

        const newRoom = new Chatroom({
            title,
            chats: [],
            isCustomDocs,
            docs: isCustomDocs ? docs : [],
        });

        await newRoom.save();
        res.status(201).json({ success: true, data: newRoom });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ✅ 채팅 메시지 전송 API
app.post("/api/chatrooms/:id/chats", async (req, res) => {
    try {
        const { text, sender } = req.body;
        const room = await Chatroom.findById(req.params.id);
        if (!room) {
            return res
                .status(404)
                .json({ success: false, error: "채팅방을 찾을 수 없습니다." });
        }

        let docsForMessage = [];
        if (room.isCustomDocs) {
            // 🔹 업로드된 문서가 있을 경우 → 해당 문서만 사용
            docsForMessage = room.docs;
        } else {
            // 🔹 업로드된 문서가 없을 경우 → 기본 문서 사용
            docsForMessage = systemDocs;
        }

        const message = { text, sender, docs: docsForMessage };
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
    console.log(`🚀 서버가 ${PORT} 포트에서 실행 중입니다.`);
});
