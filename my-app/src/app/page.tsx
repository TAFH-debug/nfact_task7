"use client"
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import LoginModal from "@/app/modal";
import Typing from "@/app/Typing";

const URL = "http://localhost:3000";

type Credentials = {
    username: string,
    password: string,
    message: string
}

function SendIcon(props: { className: string }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}

type Message = {
    content: string,
    author: string
}

type User = {
    username: string,
    online: boolean,
    typing: boolean
}

export default function Page() {
    const [state, setState] = useState<Credentials>({
        username: "",
        password: "",
        message: ""
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [show, setShow] = useState(true);
    const [type, setType] = useState(false);

    const socket = useRef<Socket | null>(null);

    useEffect(() => {
        socket.current = io(URL, { autoConnect: false });

        socket.current.on("connect", () => {
            console.log("connected");
        });

        socket.current.on("users", (users) => {
            console.log(users);
            setUsers((_) => users);
        });

        socket.current.on("messages", (messages) => {
            console.log(messages);
            setMessages(messages);
        });

        socket.current.on("disconnect", () => {
            console.log("disconnected");
        });

        const wsCurrent = socket.current;

        return () => {
            wsCurrent.close();
        };
    }, []);

    const sendLogin = () => {
        setShow(false);
        socket.current!.auth = { username: state.username, password: state.password };
        socket.current!.connect();
    }

    const sendMessage = () => {
        setState(state => ({...state, message: ""}));
        socket.current!.emit("message", { content: state.message, author: state.username });
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setState({...state, message: e.target.value})
        if (!type) {
            setType(true);
            socket.current!.emit("type");
            setTimeout(() => {
                socket.current!.emit("nottype")
                setType(false);
            }, 2000);
        }
    }

    return (
        <main className="bg-white min-h-screen w-full items-center justify-center">
            <LoginModal
                setShow={(a) => sendLogin()}
                show={show}
                setPassword={(a) => setState({...state, password: a})}
                setUsername={(a) => setState({...state, username: a})}
            />
            <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
                <h1 className="text-lg font-bold">Chat with Friends</h1>
            </header>
            <div className="flex h-screen w-full justify-center items-center">
                <div className="flex flex-col h-3/5 w-full md:w-2/5 text-black bg-gray-500 rounded-lg m-10">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {
                            messages.map((message, index) => (
                                    message.author === "System" ? <div key={index} className="w-full text-center m-2 text-blue-300">
                                            {message.content}
                                    </div> :
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="bg-gray-200 rounded-lg p-3 max-w-[70%]">
                                            <h1 className="text-xl font-bold my-2">{message.author}</h1>
                                            <p className="text-sm">{message.content}</p>
                                        </div>
                                    </div>
                                )
                            )
                        }
                    </div>
                    <div className="bg-gray-100 p-4 flex items-center gap-2">
                        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
                            <input
                                value={state.message}
                                placeholder="Type your message..."
                                className="appearance-none flex-1 w-5/6 rounded-lg outline-none text-2xl text-black p-2"
                                onChange={onChange}
                            />
                            <button className="aspect-square h-full m-3" onClick={sendMessage}>
                                <SendIcon className="w-full h-full"/>
                            </button>
                        </form>
                    </div>
                </div>
                <div className="flex flex-col w-1/4 text-black">
                    <h1 className="font-bold">Users:</h1>
                    {
                        users.map((user, index) => {
                            return <div key={index} className="flex w-full items-center rounded-lg my-2 p-5 bg-gray-300">
                                {user.username}
                                <span
                                    className={"w-3 h-3 rounded-full m-2 " + (user.online ? "bg-green-500" : "bg-gray-500")}></span>
                                {
                                    user.typing ? <Typing /> : <></>
                                }
                            </div>
                        })
                    }
                </div>
            </div>
        </main>
    )
}