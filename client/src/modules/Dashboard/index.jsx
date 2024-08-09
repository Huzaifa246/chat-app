import React, { useEffect, useRef } from 'react'
import Avator from "../../assets/avator.svg"
import phone from "../../assets/phone.svg"
import send from "../../assets/send.svg"
import plus from "../../assets/plus.svg"
import InputComp from './../../components/Input/index';
import { useState } from 'react'
import { io } from 'socket.io-client';

const Dashboard = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversation, setConversation] = useState([])
    const [getMessages, setGetMessages] = useState({})
    const [message, setMessage] = useState([])
    const [users, setUsers] = useState([])

    const [socket, setSocket] = useState(null)
    const messageRef = useRef(null)

    useEffect(() => {
        setSocket(io('http://localhost:8080'))
    }, [])

    useEffect(() => {
        socket?.emit('addUser', user?._id)
        socket?.on('getUsers', users => {
            console.log('user socket', users)
        })

        socket?.on('getMessage', data => {
            setGetMessages(prev => ({
                ...prev,
                messages: [...(prev.messages || []), { user: data?.user, message: data?.message }]
            }));
        })
    }, [socket])

    useEffect(() => {
        messageRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }, [getMessages?.messages])

    useEffect(() => {
        const fetchConversations = async () => {
            const response = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?._id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
            const respData = await response.json()
            setConversation(respData)
        }
        fetchConversations()
    }, [])
    useEffect(() => {
        const fetchUsersData = async () => {
            const response = await fetch(`http://localhost:8000/api/users/${user?._id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
            const responseData = await response.json()
            setUsers(responseData)
        }
        fetchUsersData()
    }, [])
    const fetchMessages = async (conversationId, receiver) => {
        const response = await fetch(`http://localhost:8000/api/message/${conversationId}?senderId=${user?._id}&&receiverId=${receiver?.receiverId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        const respData = await response.json()
        setGetMessages({ messages: respData, receiver, conversationId })
    }

    const sendMessage = async () => {
        setMessage('')
        socket.emit('sendMessage', {
            conversationId: getMessages?.conversationId,
            senderId: user?._id,
            message,
            receiverId: getMessages?.receiver?.receiverId
        })

        const response = await fetch('http://localhost:8000/api/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: getMessages?.conversationId,
                senderId: user?._id,
                message,
                receiverId: getMessages?.receiver?.receiverId
            }),
        })
        const respData = await response.json()
        console.log(respData, "respData msg")
        setMessage(respData)
    }

    return (
        <>
            <div className='w-screen flex flex-col md:flex-row'>
                <div className='col-12 col-md-3 col-lg-3 h-auto md:h-screen'>
                    <div className='flex items-center my-6 mx-4 md:mx-10'>
                        <div className='border border-primary p-[1px] rounded-full'>
                            <img src={Avator} alt="Profile" className='w-12 h-12 md:w-14 md:h-14' />
                        </div>
                        <div className='ml-4'>
                            <h3 className='text-xl md:text-2xl'> {user?.fullName} </h3>
                            <p className='text-sm md:text-xl font-light'>
                                My Account
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className='mx-4 md:mx-10 mt-4 md:mt-10'>
                        <div className='text-primary text-base md:text-lg'>
                            Messages
                        </div>
                        <div>
                            {conversation?.length > 0 ? (
                                conversation.map(({ conversationId, data }) => (
                                    <div key={conversationId} className='flex items-center py-2 md:py-4 border-b border-b-gray-300'>
                                        <div className='flex cursor-pointer' onClick={() => fetchMessages(conversationId, user)}>
                                            <img src={Avator} alt="Profile" className='w-8 h-8 md:w-10 md:h-10' />
                                            <div className='ml-3'>
                                                <h3 className='text-base md:text-lg font-semibold'>{data?.fullName}</h3>
                                                <p className='text-xs md:text-sm font-light text-gray-400'>{data?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='flex items-center justify-center h-[200px] md:h-[400px]'>
                                    <p className='text-center text-sm md:text-lg font-semibold'>No Data Found</p>
                                </div>
                            )}
    
                        </div>
                    </div>
                </div>
                {/* Messages section */}
                <div className='col-12 col-md-6 col-lg-6 md:h-screen bg-white flex flex-col items-center'>
                    {
                        getMessages?.receiver?.fullName &&
                        <div className="w-full md:w-[75%] bg-secondaryColor h-[60px] md:h-[80px] my-4 md:my-10 rounded-full flex items-center px-4 md:px-10 shadow-lg">
                            <div className='cursor-pointer'>
                                <img src={Avator} alt="Profile" className='w-8 h-8 md:w-10 md:h-10' />
                            </div>
                            <div className='ml-4 md:ml-5 mr-auto'>
                                <h3 className='text-base md:text-lg font-semibold'>{getMessages?.receiver?.fullName}</h3>
                                <p className='text-xs md:text-sm font-light text-gray-400'>{getMessages?.receiver?.email}</p>
                            </div>
                            <div className='cursor-pointer'>
                                <img src={phone} alt="call" className='w-4 h-4 md:w-5 md:h-5' />
                            </div>
                        </div>
                    }
                    <div className='h-[60vh] md:h-[75%] w-full overflow-scroll border-b shadow-sm'>
                        <div className='p-4 md:p-10'>
                            {
                                getMessages?.messages?.length > 0 ?
                                    getMessages?.messages?.map(({ message, user: { id } = {} }) => (
                                        <div key={id} className='flex'>
                                            <div className={`max-w-[75%] md:max-w-[42%] rounded-b-xl p-2 md:p-4 
                                                ${id === user?._id ? 'bg-primary rounded-tr-xl ml-auto' : 'bg-secondary'}`}>
                                                <div className='text-white' ref={messageRef} >{message}</div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className='flex items-center justify-center h-[200px] md:h-[400px]'>
                                            <p className='text-center text-sm md:text-lg font-semibold'>No Messages Or No Conversation Selected</p>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                    {getMessages?.receiver?.fullName &&
                        <div className='p-4 md:p-10 w-[90%] flex'>
                            <InputComp placeholder='Type your message'
                                value={message} onChange={(e) => setMessage(e.target.value)}
                                className='w-full shadow-md bg-secondary bg-light focus:ring-0 outline-none' />
                            <img src={send} alt="send" className={`cursor-pointer ml-2 md:ml-4 ${!message ? 'pointer-events-none' : 'text-green-500'}`} width={20} height={20} onClick={() => sendMessage()} />
                            <img src={plus} alt="plus" className={`cursor-pointer ml-1 md:ml-2 ${!message ? 'pointer-events-none' : 'text-green-500'}`} width={20} height={20} />
                        </div>
                    }
                </div>
                <div className='col-12 col-md-3 col-lg-3 h-auto md:h-screen bg-light'>
                    <div className='text-primary text-base md:text-lg text-center py-2'>
                        People
                    </div>
                    <div className='px-3'>
                        {users?.length > 0 ? (
                            users.map(({ conversationId, user }) => (
                                <div key={conversationId} className='flex items-center py-2 md:py-4 border-b border-b-gray-300'>
                                    <div className='flex cursor-pointer' onClick={() => fetchMessages('new', user)}>
                                        <img src={Avator} alt="Profile" className='w-8 h-8 md:w-10 md:h-10' />
                                        <div className='ml-3'>
                                            <h3 className='text-base md:text-lg font-semibold'>{user?.fullName}</h3>
                                            <p className='text-xs md:text-sm font-light text-gray-400'>{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='flex items-center justify-center h-[200px] md:h-[400px]'>
                                <p className='text-center text-sm md:text-lg font-semibold'>No Data Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
    
}

export default Dashboard