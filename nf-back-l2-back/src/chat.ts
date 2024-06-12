import {Server, Socket} from "socket.io";
import MessageSchema from "./auth/models/Message";
import UserSchema from "./auth/models/User";
import Message from "./auth/models/Message";

type Message = {
    author: string,
    content: string
}

export class Chat {
    io: Server;

    constructor(io: Server) {
        io.use(async (socket, next) => {
            const username = socket.handshake.auth.username;
            const password = socket.handshake.auth.password;

            (socket as any).user = {
                username: username,
                password: password,
                online: true,
                typing: false
            }
            next();
        });

        io.on("connect", this.addConnection.bind(this));
        io.on("disconnect", this.destroyConnection.bind(this));

        this.io = io;
    }

    async onType(socket: Socket) {
        await UserSchema.findOneAndUpdate({ username: (socket as any).user.username }, { typing: true });
        const users = (await UserSchema.find().exec()).map((user) => ({
            username: user.username,
            online: user.online,
            typing: user.typing
        }));
        this.io.emit("users", users);
    }

    async onNottype(socket: Socket) {
        await UserSchema.findOneAndUpdate({ username: (socket as any).user.username }, { typing: false });
        const users = (await UserSchema.find().exec()).map((user) => ({
            username: user.username,
            online: user.online,
            typing: user.typing
        }));
        this.io.emit("users", users);
    }

    async onMessage(data: Message) {
        await new MessageSchema(data).save();

        const messages = await MessageSchema.find().sort({
            "createdAt": "asc"
        }).exec();
        this.io.emit("messages", messages);
    }

    async destroyConnection(socket: Socket) {
        await new MessageSchema({ author: "System", content: `User ${(socket as any).user.username} disconnected.`}).save()
        await UserSchema.findOneAndUpdate({ username: (socket as any).user.username }, { online: false })

        const messages = await MessageSchema.find().sort({
            "createdAt": "asc"
        }).exec();
        const users = (await UserSchema.find().exec()).map((user) => ({
            username: user.username,
            online: user.online
        }));

        this.io.emit("messages", messages);
        this.io.emit("users", users);
    }

    async addConnection(socket: Socket) {
        socket.on("message", (data) => this.onMessage.bind(this)(data));
        socket.on("disconnect", () => this.destroyConnection.bind(this)(socket));
        socket.on("type", () => this.onType.bind(this)(socket));
        socket.on("nottype", () => this.onNottype.bind(this)(socket));

        const user = (await UserSchema.findOne({ username: (socket as any).user.username }).exec())
        if (user === null) {
            await new UserSchema((socket as any).user).save();
        }
        else if (user.password !== (socket as any).user.password) {
            socket.disconnect();
        }

        await UserSchema.findOneAndUpdate({ username: (socket as any).user.username }, { online: true });
        await new MessageSchema({ author: "System", content: `User ${(socket as any).user.username} online.`}).save()

        const users = (await UserSchema.find().exec()).map((user) => ({
            username: user.username,
            online: user.online
        }));
        const messages = await MessageSchema.find().sort({
            "createdAt": "asc"
        }).exec();

        this.io.emit("users", users);
        this.io.emit("messages", messages);
    }
}