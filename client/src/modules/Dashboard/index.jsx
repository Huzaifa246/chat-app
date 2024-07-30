import React, { useEffect } from 'react'
import Avator from "../../assets/avator.svg"
import phone from "../../assets/phone.svg"
import send from "../../assets/send.svg"
import plus from "../../assets/plus.svg"
import InputComp from './../../components/Input/index';
import { useState } from 'react'
const Dashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversation, setConversation] = useState([])

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
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
                            {!conversation?.length > 0 ? (
                                conversation.map(({ conversationId, data }) => (
                                    <div key={conversationId} className='flex items-center py-4 border-b border-b-gray-300'>
                                        <div className='flex cursor-pointer'>
                                            <img src={Avator} alt="Profile" width={20} height={40} />
                                            <div className='ml-3'>
                                                <h3 className='text-lg font-semibold'>{data.fullName}</h3>
                                                <p className='text-sm font-light text-gray-400'>{data.email}</p>
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
                <div className='w-[50%] h-screen bg-white flex flex-col items-center'>
                    <div className="w-[75%] bg-secondary h-[80px] my-10 rounded-full flex items-center px-10 shadow-lg">
                        <div className='cursor-pointer'>
                            <img src={Avator} alt="Profile" width={30} height={50} />
                        </div>
                        <div className='ml-5 mr-auto'>
                            <h3 className='font-semibold text-lg'>Huzaifa</h3>
                            <p className='text-sm font-light text-gray-400'>online</p>
                        </div>
                        <div className='cursor-pointer'>
                            <img src={phone} alt="call" height={20} width={20} />
                        </div>
                    </div>
                    <div className='h-[75%] w-full overflow-scroll border-b shadow-sm'>
                        <div className='p-10'>
                            <div>
                                <div className='bg-secondary max-w-[42%] rounded-b-xl rounded-tr-xl p-4 mt-5'>
                                    <p className='text-white'>Lorem ipsum dolor sit amet consectetur adipisicing elit. </p>
                                </div>
                                <div className='bg-primary max-w-[42%] rounded-b-xl rounded-tl-xl p-4 mt-5 ml-auto'>
                                    <p className='text-white'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime quos adipisci, quis voluptatibus totam!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='p-10 w-[90%] flex'>
                        <InputComp placeholder='Type your message' className='w-full shadow-md bg-secondary bg-light focus:ring-0 outline-none' />
                        <img src={send} alt="send" width={25} className='cursor-pointer ml-4' />
                        <img src={plus} alt="plus" width={25} className='cursor-pointer ml-2' />
                    </div>
                </div>
                <div className='w-[25%] h-screen bg-light'></div>
            </div>
        </>
    )
}

export default Dashboard