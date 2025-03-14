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
const DocumentGroupSchema = new mongoose.Schema({
    name: String, // 문서 그룹 이름
    docs: [{ name: String, path: String, size: String }], // 문서 목록
    createdAt: { type: Date, default: Date.now },
});

const DocumentGroup = mongoose.model("DocumentGroup", DocumentGroupSchema);

// 📂 문서 그룹 가져오기
app.get("/api/document-groups", async (req, res) => {
    try {
        const groups = await DocumentGroup.find().sort({ createdAt: -1 });
        res.json({ success: true, data: groups });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 📂 문서 그룹 생성 + 문서 추가
app.post("/api/document-groups", async (req, res) => {
    try {
        const { name, docs } = req.body;
        const newGroup = new DocumentGroup({ name, docs: docs || [] });
        await newGroup.save();
        res.status(201).json({ success: true, data: newGroup });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// 📂 문서 그룹 수정 (이름 & 파일 추가/삭제)
app.put("/api/document-groups/:id", async (req, res) => {
    try {
        const { name, docs } = req.body;
        const group = await DocumentGroup.findByIdAndUpdate(
            req.params.id,
            { name, docs },
            { new: true }
        );
        res.json({ success: true, data: group });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ❌ 문서 그룹 삭제
app.delete("/api/document-groups/:id", async (req, res) => {
    try {
        await DocumentGroup.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
const FileSchema = new mongoose.Schema({
    name: String,
    path: String, // ✅ 파일 경로를 저장 (Buffer 제거)
    contentType: String,
    size: String,
    createdAt: { type: Date, default: Date.now },
});

const File = mongoose.model("File", FileSchema);

app.get("/api/files/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res
                .status(404)
                .json({ success: false, error: "파일을 찾을 수 없습니다." });
        }

        // ✅ 로컬 파일 경로 설정
        const filePath = path.join(__dirname, file.path);
        res.sendFile(filePath); // ✅ 파일을 직접 클라이언트에 전송
    } catch (err) {
        console.error("❌ 파일 가져오기 실패:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📂 `uploads` 디렉토리 없으면 생성
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer 설정 (파일을 `uploads/` 폴더에 저장)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, error: "파일이 없습니다." });
        }

        const originalFileName = Buffer.from(
            req.file.originalname,
            "latin1"
        ).toString("utf8");

        console.log("📂 업로드된 파일:", originalFileName);

        // ✅ 파일 정보를 MongoDB에 저장
        const fileData = new File({
            name: originalFileName, // ✅ UTF-8로 변환된 파일명 저장
            path: `/uploads/${req.file.filename}`, // ✅ 서버에 저장된 파일 경로
            contentType: req.file.mimetype,
            size: (req.file.size / 1024).toFixed(2) + " KB",
        });

        const savedFile = await fileData.save();
        console.log("✅ 파일 저장 완료:", savedFile);

        res.status(201).json({ success: true, file: savedFile });
    } catch (err) {
        console.error("❌ 파일 업로드 실패:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 📂 정적 파일 제공 (업로드된 파일 접근 가능하도록 설정)
app.use("/uploads", express.static(uploadDir));

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
