import Modal from "react-modal";

export default function LoginModal({ show, setShow, setPassword, setUsername }: {
    show: boolean,
    setShow: (a: boolean) => void,
    setPassword: (a: string) => void,
    setUsername: (a: string) => void,
}) {

    const customStyles = {
        content: {
            borderRadius: "10px",
            height: "40%",
            width: "30%",
            margin: "auto"
        }
    }

    const handleSubmit = () => {
        setShow(false);
    }

    return (
        <Modal style={customStyles} isOpen={show}>
            <h1 className="font-bold text-black text-3xl">Register or login</h1>
            <div className="my-2 flex rounded-lg bg-white flex-col justify-center items-center p-3">
                <div className="flex items-center flex-col w-full">
                    <label className="w-full text-sm font-medium text-gray-900">Username</label>
                    <input className="m-2 flex h-10 w-full rounded-md border text-black px-3 py-4 text-xl
                                ring-offset-background placeholder:text-muted-foreground
                                focus-visible:outline-none focus:border-black"
                           onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div className="my-2 flex items-center flex-col w-full text-black">
                    <label className="w-full text-sm font-medium text-gray-900">Password</label>
                    <input className="m-2 flex h-10 w-full rounded-md border px-3 py-4 text-xl
                                ring-offset-background placeholder:text-muted-foreground
                                focus-visible:outline-none focus:border-black"
                           onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <input className="flex w-full rounded-lg bg-black text-gray-300 p-2
                        text-sm font-medium cursor-pointer hover:bg-gray-800" type="submit" value="Submit"
                       onClick={handleSubmit}/>
            </div>
        </Modal>
    )
}