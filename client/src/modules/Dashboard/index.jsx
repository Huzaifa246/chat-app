import React, { useEffect } from 'react'
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

    console.log('getMessages', getMessages)

    useEffect(() => {
        setSocket(io('http://localhost:8080'))
    }, [])

    useEffect(() => {
        socket?.emit('addUser', user?._id)
        socket?.on('getUsers', users => {
            console.log('user socket', users)
        })

        socket?.on('getMessage', data => {
            setGetMessages(prev =>({
                ...prev,
                getMessages: [...prev.getMessages, {user : data?.user, message: data?.message}]
            }))
        })
    }, [socket])

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
    const sendMessage = async (e) => {
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
        setMessage(respData)
    }

    return (
        <>
            <div className='w-screen flex'>
                <div className='w-[25%] h-screen'>
                    <div className='flex items-center my-6 mx-10'>
                        <div className='border border-primary p-[1px] rounded-full'>
                            <img src={Avator} alt="Profile" width={50} height={70} />
                        </div>
                        <div className='ml-4'>
                            <h3 className='text-2xl'> {user?.fullName} </h3>
                            <p className='text-xl font-light'>
                                My Account
                            </p>
                        </div>
                    </div>
                    <hr />
                    <div className='mx-10 mt-10'>
                        <div className='text-primary text-lg'>
                            Messages
                        </div>
                        <div>
                            {conversation?.length > 0 ? (
                                conversation.map(({ conversationId, data }) => (
                                    <div key={conversationId} className='flex items-center py-4 border-b border-b-gray-300'>
                                        <div className='flex cursor-pointer' onClick={() => fetchMessages(conversationId, user)}>
                                            <img src={Avator} alt="Profile" width={20} height={40} />
                                            <div className='ml-3'>
                                                <h3 className='text-lg font-semibold'>{data?.fullName}</h3>
                                                <p className='text-sm font-light text-gray-400'>{data?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='flex items-center justify-center h-[400px]'>
                                    <p className='text-center text-lg font-semibold'>No Data Found</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                {/* Messages section */}
                <div className='w-[50%] h-screen bg-white flex flex-col items-center'>
                    {
                        getMessages?.receiver?.fullName &&
                        <div className="w-[75%] bg-secondary h-[80px] my-10 rounded-full flex items-center px-10 shadow-lg">
                            <div className='cursor-pointer'>
                                <img src={Avator} alt="Profile" width={30} height={50} />
                            </div>
                            <div className='ml-5 mr-auto'>
                                <h3 className='font-semibold text-lg'>{getMessages?.receiver?.fullName}</h3>
                                <p className='text-sm font-light text-gray-400'>{getMessages?.receiver?.email}</p>
                            </div>
                            <div className='cursor-pointer'>
                                <img src={phone} alt="call" height={20} width={20} />
                            </div>
                        </div>
                    }
                    <div className='h-[75%] w-full overflow-scroll border-b shadow-sm'>
                        <div className='p-10'>
                            {
                                getMessages?.messages?.length > 0 ?
                                    getMessages?.messages.map(({ message, user: { id } = {} }) => (
                                        <div key={id} className='flex'>
                                            <div className={`max-w-[42%] rounded-b-xl p-4 
                                                ${id === user?._id ? 'bg-primary rounded-tr-xl ml-auto' : 'bg-secondary'}`}>
                                                <p className='text-white'>{message}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className='flex items-center justify-center h-[400px]'>
                                            <p className='text-center text-lg font-semibold'>No Messages Or No Conversation Selected</p>
                                        </div>
                                    )
                            }
                        </div>
                    </div>
                    {getMessages?.receiver?.fullName &&
                        <div className='p-10 w-[90%] flex'>
                            <InputComp placeholder='Type your message'
                                value={message} onChange={(e) => setMessage(e.target.value)}
                                className='w-full shadow-md bg-secondary bg-light focus:ring-0 outline-none' />
                            <img src={send} alt="send" width={25}
                                className={`cursor-pointer ml-4 ${!message ? 'pointer-events-none' : 'text-green-500'}`}
                                onClick={() => sendMessage()} />
                            <img src={plus} alt="plus" width={25} className={`cursor-pointer ml-2 ${!message ? 'pointer-events-none' : 'text-green-500'}`} />
                        </div>
                    }
                </div>
                <div className='w-[25%] h-screen bg-light'>
                    <div className='text-primary text-lg text-center py-2'>
                        People
                    </div>
                    <div className='px-3'>
                        {users?.length > 0 ? (
                            users.map(({ conversationId, user }) => (
                                <div key={conversationId} className='flex items-center py-4 border-b border-b-gray-300'>
                                    <div className='flex cursor-pointer' onClick={() => fetchMessages('new', user)}>
                                        <img src={Avator} alt="Profile" width={20} height={40} />
                                        <div className='ml-3'>
                                            <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                                            <p className='text-sm font-light text-gray-400'>{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='flex items-center justify-center h-[400px]'>
                                <p className='text-center text-lg font-semibold'>No Data Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard